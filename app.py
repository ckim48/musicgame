from flask import Flask, render_template, url_for, request, redirect,flash,session,jsonify
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'codingisfun'
session = {}
app.permanent_session_lifetime = timedelta(seconds=7200)
sample_data = {
    'dates': ['2023-09-25', '2023-09-26', '2023-09-27', '2023-09-28', '2023-09-29'],
    'scores': [10, 15, 20, 18, 25]
}
@app.route('/', methods=['GET'])
def index():
    if 'username' in session:
        username = session['username']
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()
        cursor.execute("SELECT score FROM Users WHERE username = ?", (username,))
        current_score = cursor.fetchone()

        return render_template('index.html', isLogin = True,current_score=current_score[0])
    else:
        return render_template('index.html', isLogin = False,current_score=0)
@app.route('/about', methods=['GET'])
def about():
    if 'username' in session:
        return render_template('about.html', isLogin = True)
    else:
        return render_template('about.html', isLogin = False)
@app.route('/mypage', methods=['GET'])
def mypage():
    if 'username' in session:
        username = session['username']  # Assuming you have a way to get the username
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()

        cursor.execute("SELECT score FROM Users WHERE username = ?", (username,))
        current_score = cursor.fetchone()
        score = current_score[0]
        cursor.execute("SELECT email FROM Users WHERE username = ?", (username,))
        email = cursor.fetchone()
        email = email[0]
        cursor.execute("SELECT country FROM Users WHERE username = ?", (username,))
        country = cursor.fetchone()
        country = country[0]
        cursor.execute("SELECT age FROM Users WHERE username = ?", (username,))
        age = cursor.fetchone()
        age = age[0]

        return render_template('mypage.html', isLogin = True,score=score,email=email,username=username,age=age,country=country)
    else:
        return render_template('index.html', isLogin = False)
def validate_login(username, password):
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    # Check if the provided username and password match a record in the database
    cursor.execute("SELECT * FROM Users WHERE username = ? AND password = ?", (username, password))
    user = cursor.fetchone()

    conn.close()
    return user

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Validate the login credentials
        user = validate_login(username, password)

        if user:
            session['username'] = username
            return redirect(url_for('index'))
        else:
            flash('Login Unsuccessful. Please check username and password', 'danger')
            return render_template('login.html', title='Login')

    else:
        return render_template('login.html', title='Login')
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))


def insert_user_data(username, password, age, country, email):
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    cursor.execute("INSERT INTO Users (username, password, age, country, email) VALUES (?, ?, ?, ?, ?)",
                   (username, password, age, country, email))

    conn.commit()
    conn.close()


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        age = request.form.get('age')
        country = request.form.get('country')
        email = request.form.get('email')

        insert_user_data(username, password, age, country, email)

        return redirect(url_for('login'))

    return render_template('register.html', title='Register')
@app.route('/scoreboard', methods=['GET', 'POST'])
def scoreboard():
    username = session['username']  # Assuming you have a way to get the username
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    cursor.execute('SELECT username, score FROM Users ORDER BY score DESC LIMIT 10')
    leaderboard_data = cursor.fetchall()
    conn.close()


    if 'username' in session:
        isLogin = True
    else:
        isLogin = False

    return render_template('scoreboard.html',isLogin=isLogin, leaderboard_data=leaderboard_data)

@app.route('/update_score', methods=['POST'])
def update_score():
    try:
        # Get the username from the request
        username = session['username']  # Assuming you have a way to get the username
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()

        cursor.execute("SELECT score FROM Users WHERE username = ?", (username,))
        current_score = cursor.fetchone()

        if current_score is None:
            return 'User not found', 404

        # Increment the current score by 1
        new_score = current_score[0] + 1
        get_score = 1

        # Update the score in the database for the given username
        cursor.execute("UPDATE Users SET score = ? WHERE username = ?", (new_score, username))
        today_date = datetime.date.today()

        formatted_date = today_date.strftime('%Y/%m/%d')
        cursor.execute("Insert INTO Scores Values(?,?,?)", (formatted_date , 1, username))
        conn.commit()

        return jsonify({'score': new_score})

    except Exception as e:
        conn.rollback()  # Roll back the transaction if an error occurs
        return f'Error: {str(e)}', 500

    finally:
        # Close the cursor and connection
        cursor.close()
        conn.close()



@app.route('/get_scores', methods=['GET', 'POST'])
def get_scores_for_username():
    username = session.get('username')
    if username is None:
        return "User not logged in", 401

    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

    query = """
            SELECT Date, SUM(getScore)
            FROM Scores
            WHERE username = ? AND Date >= ?
            GROUP BY Date
            ORDER BY Date
            """

    cursor.execute(query, (username, seven_days_ago))
    rows = cursor.fetchall()

    conn.close()

    # Convert the data to a list of dictionaries
    result = [{'date': row[0], 'total_score': row[1]} for row in rows]

    # Ensure there are entries for every date in the last 7 days and set score to 0 if not achieved
    end_date = datetime.now()
    start_date = end_date - timedelta(days=6)

    date_set = set(item['date'] for item in result)
    for single_date in (start_date + timedelta(n) for n in range(7)):
        formatted_date = single_date.strftime('%Y-%m-%d')
        if formatted_date not in date_set:
            result.append({'date': formatted_date, 'total_score': 0})

    # Sort the result by date
    result.sort(key=lambda x: x['date'])

    return jsonify(result)
def prepare_data_for_graph(scores):
    dates = [row[0] for row in scores]
    scores = [row[1] for row in scores]
    return dates, scores
if __name__ == '__main__':
    app.run(debug=True)