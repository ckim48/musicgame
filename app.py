from flask import Flask, render_template, url_for, request, redirect,flash,session,jsonify
import sqlite3
from datetime import datetime, timedelta
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
from textblob import TextBlob
app = Flask(__name__)
app.secret_key = 'codingisfun'
session = {}
app.permanent_session_lifetime = timedelta(seconds=7200)
sample_data = {
    'dates': ['2023-09-25', '2023-09-26', '2023-09-27', '2023-09-28', '2023-09-29'],
    'scores': [10, 15, 20, 18, 25]
}
stop_words = set(stopwords.words('english'))

@app.route('/', methods=['GET'])
def index():
    if 'username' in session:
        username = session['username']
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()
        cursor.execute("SELECT score FROM Users WHERE username = ?", (username,))
        current_score = cursor.fetchone()

        return render_template('index.html',username=username, isLogin = True,current_score=current_score[0])
    else:
        return render_template('index.html', isLogin = False,current_score=0)
@app.route('/about', methods=['GET'])
def about():
    
    if 'username' in session:
        username = session['username']
        return render_template('about.html', isLogin = True,username=username)
    else:
        return render_template('about.html', isLogin = False)
@app.route('/mypage', methods=['GET'])
def mypage():
    username = session['username']
    if 'username' not in session:
        return redirect(url_for('login'))
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

        return render_template('mypage.html',isLogin = True,score=score,email=email,username=username,age=age,country=country)
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
        username = request.form.get('username').lower().strip()
        password = request.form.get('password').lower().strip()
        username = username.replace(" ", "")

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

    cursor.execute("INSERT INTO Users (username, password, age, country, email,score) VALUES (?, ?, ?, ?, ?,?)",
                   (username, password, age, country, email,0))

    conn.commit()
    conn.close()
def is_username_exists(username):
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Users WHERE username = ?', (username,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        age = request.form.get('age')
        country = request.form.get('country')
        email = request.form.get('email')

        if is_username_exists(username):
            flash('Username already exists. Please choose a different username.', 'error')
        else:
            conn = sqlite3.connect('static/assets/data/database.db')
            cursor = conn.cursor()
            cursor.execute('INSERT INTO Users(username, password, age, country, email,score) VALUES (?, ?, ?, ?, ?,?)',
                           (username, password, age, country, email,0))
            conn.commit()
            conn.close()
            # flash('Registration successful. You can now log in.', 'success')
            return redirect(url_for('login'))

    return render_template('register.html', title='Register')
@app.route("/dashboard",methods=['Get',"POST"])
def dashboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    if 'username' in session:
        isLogin = True
    else:
        isLogin = False

    username = session['username']  # Assuming you have a way to get the username
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()
    username = session['username']
    cursor.execute("SELECT sentiment, COUNT(*) FROM Sentiments GROUP BY sentiment")
    sentiment_counts = cursor.fetchall()
    cursor.execute("SELECT sentiment, COUNT(*) FROM Sentiments2 GROUP BY sentiment")
    sentiment_counts2 = cursor.fetchall()
    cursor.execute("SELECT sentiment, COUNT(*) FROM Sentiments3 GROUP BY sentiment")
    sentiment_counts3 = cursor.fetchall()

    cursor.execute("SELECT context FROM Sentiments")
    data = cursor.fetchall()

    # Tokenize and process the text
    words = []
    for row in data:
        text = row[0]
        tokens = word_tokenize(text)
        words.extend([word.lower() for word in tokens if word.isalpha() and word.lower() not in stop_words])

    # Get the top 10 most frequent words
    word_count = Counter(words)
    top_words = word_count.most_common(10)


    cursor.execute("SELECT context FROM Sentiments2")
    data2 = cursor.fetchall()

    # Tokenize and process the text
    words = []
    for row in data2:
        text = row[0]
        tokens = word_tokenize(text)
        words.extend([word.lower() for word in tokens if word.isalpha() and word.lower() not in stop_words])

    # Get the top 10 most frequent words
    word_count = Counter(words)
    top_words2 = word_count.most_common(10)


    cursor.execute("SELECT context FROM Sentiments3")
    data3 = cursor.fetchall()

    # Tokenize and process the text
    words = []
    for row in data3:
        text = row[0]
        tokens = word_tokenize(text)
        words.extend([word.lower() for word in tokens if word.isalpha() and word.lower() not in stop_words])

    # Get the top 10 most frequent words
    word_count = Counter(words)
    top_words3 = word_count.most_common(10)
    conn.close()
    username = session['username']
    return render_template('dashboard.html',username=username,top_words3=top_words3, sentiment_counts3=sentiment_counts3,top_words2=top_words2, sentiment_counts2=sentiment_counts2,top_words=top_words,sentiment_counts=sentiment_counts,isLogin=isLogin)



@app.route('/scoreboard', methods=['GET', 'POST'])
def scoreboard():
    if 'username' not in session:
        return redirect(url_for('login'))
    username = session['username']  # Assuming you have a way to get the username
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()
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
    cursor.execute('SELECT username, score FROM Users ORDER BY score DESC LIMIT 5')
    leaderboard_data = cursor.fetchall()

    cursor.execute("SELECT sentiment, COUNT(*) FROM Sentiments GROUP BY sentiment")
    sentiment_counts = cursor.fetchall()
    cursor.execute("SELECT context FROM Sentiments")
    data = cursor.fetchall()

    # Tokenize and process the text
    words = []
    for row in data:
        text = row[0]
        tokens = word_tokenize(text)
        words.extend([word.lower() for word in tokens if word.isalpha() and word.lower() not in stop_words])

    # Get the top 10 most frequent words
    word_count = Counter(words)
    top_words = word_count.most_common(10)
    conn.close()


    if 'username' in session:
        isLogin = True
    else:
        isLogin = False
    username = session['username']
    return render_template('scoreboard.html',isLogin=isLogin, leaderboard_data=leaderboard_data,score=score,email=email,username=username,age=age,country=country)

@app.route('/update_score', methods=['POST'])
def update_score():

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
    today_date = datetime.today()

    formatted_date = today_date.strftime('%Y/%m/%d')
    lev = 1
    game1 = request.form.get('game1')
    game2 = request.form.get('game2')
    game3 = request.form.get('game3')
    if game1 == True:
        lev = 1
    elif game2 == True:
        lev = 2
    elif game3 == True:
        lev = 3

    cursor.execute("Insert INTO Scores Values(?,?,?,?)", (formatted_date , 1, username,lev))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'score': new_score})

    # except Exception as e:
    #     conn.rollback()  # Roll back the transaction if an error occurs
    #     return f'Error: {str(e)}', 500
    #
    # finally:
    #     # Close the cursor and connection
    #     cursor.close()
    #     conn.close()



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

    return render_template('scoreboard.html', sentiment_counts=sentiment_counts)



@app.route('/sentiment-analysis', methods=['POST'])
def sentiment_analysis():
    data = request.get_json()
    text = data.get('text')

    if text:
        analysis = TextBlob(text)
        sentiment_score = analysis.sentiment.polarity

        # Determine sentiment based on polarity score
        if sentiment_score > 0:
            sentiment = 'positive'
        elif sentiment_score < 0:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Sentiments (sentiment,context) VALUES (?, ?)",
                           (sentiment, text))
        conn.commit()
        conn.close()
        # Return the sentiment result as JSON
        return jsonify({'sentiment': sentiment})

    return jsonify({'error': 'Invalid request'})

@app.route('/get_scores2', methods=['GET', 'POST'])
def get_scores_chart():
    username = session.get('username')
    if username is None:
        return "User not logged in", 401

    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

    query = """
            SELECT Date, Level, SUM(getScore) as total_score
            FROM Scores
            WHERE username = ? AND Date >= ?
            GROUP BY Date, Level
            ORDER BY Date, Level
            """

    cursor.execute(query, (username, thirty_days_ago))
    rows = cursor.fetchall()

    conn.close()

    result = []
    # Convert the data to a list of dictionaries
    for row in rows:
        level = row[1]  # Level value is in row[1]
        if level == 1:
            level_name = 'recognition'
        elif level == 2:
            level_name = 'Interval'
        else:
            level_name = 'Pitch & Interval'
        result.append({'date': row[0], 'level': level_name, 'total_score': row[2]})
    print(result)
    return jsonify(result)



if __name__ == '__main__':
    app.run(debug=True,port=8000)
