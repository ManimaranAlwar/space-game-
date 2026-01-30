from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# This ensures the database is created in your project folder
db_path = os.path.join(os.path.dirname(__file__), 'astra_v3.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200))
    options = db.Column(db.String(200)) 
    correct_idx = db.Column(db.Integer)
    hint = db.Column(db.String(200)) # The JS needs this!

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    qs = Question.query.all()
    # CRITICAL UPDATE: Added 'hint' to the returned JSON
    return jsonify([{
        'q': q.text, 
        'options': q.options.split(','),
        'correct': q.correct_idx, 
        'hint': q.hint 
    } for q in qs])

@app.route('/api/leaderboard', methods=['GET', 'POST'])
def handle_leaderboard():
    if request.method == 'POST':
        data = request.json
        if data and 'score' in data:
            new_score = Leaderboard(score=data['score'])
            db.session.add(new_score)
            db.session.commit()
        return jsonify({'status': 'saved'})
    
    # Returns top 5 scores
    top_scores = Leaderboard.query.order_by(Leaderboard.score.desc()).limit(5).all()
    return jsonify([{'score': s.score} for s in top_scores])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed the database if empty
        if Question.query.count() == 0:
            sample_qs = [
                Question(text="20 x 5?", options="80,100,120", correct_idx=1, hint="Think of a century (100)."),
                Question(text="Root of 81?", options="7,8,9", correct_idx=2, hint="What is 9 times 9?"),
                Question(text="15 + 15 + 15?", options="30,45,60", correct_idx=1, hint="It is 3 times 15.")
            ]
            db.session.bulk_save_objects(sample_qs)
            db.session.commit()
    app.run(debug=True)