from flask import Flask, render_template, url_for, request, redirect,flash,session
import sqlite3

app = Flask(__name__)
app.secret_key = 'codingisfun'
session = {}
@app.route('/', methods=['GET'])
def index():
    if 'username' in session:
        return render_template('index.html', isLogin = True)
    else:
        return render_template('index.html', isLogin = False)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == "test" and password == "1234":
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

@app.route('/register', methods=['GET', 'POST'])
def register():
    return render_template('register.html', title='Register')
@app.route('/scoreboard', methods=['GET', 'POST'])
def scoreboard():
    username = session['username']  # Assuming you have a way to get the username
    conn = sqlite3.connect('static/assets/data/database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT score FROM User WHERE username = ?", (username,))
    current_score = cursor.fetchone()

    if current_score is None:
        return 'User not found', 404

    # Increment the current score by 1
    new_score = current_score[0] + 1
    return render_template('scoreboard.html', title='Scoreboard',score = current_score[0])

@app.route('/update_score', methods=['POST'])
def update_score():
    try:
        # Get the username from the request
        username = session['username']  # Assuming you have a way to get the username
        conn = sqlite3.connect('static/assets/data/database.db')
        cursor = conn.cursor()

        cursor.execute("SELECT score FROM User WHERE username = ?", (username,))
        current_score = cursor.fetchone()

        if current_score is None:
            return 'User not found', 404

        # Increment the current score by 1
        new_score = current_score[0] + 1

        # Update the score in the database for the given username
        cursor.execute("UPDATE User SET score = ? WHERE username = ?", (new_score, username))
        conn.commit()

        return f'Score updated to {new_score} for user {username}', 200

    except Exception as e:
        conn.rollback()  # Roll back the transaction if an error occurs
        return f'Error: {str(e)}', 500

    finally:
        # Close the cursor and connection
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)