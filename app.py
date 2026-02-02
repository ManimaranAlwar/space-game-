from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Direct Data Access: Questions stored in a list of dictionaries
# Perfect for kids under 13!
QUIZ_DATA = [
    {
        "q": "What is 5 + 5?",
        "options": ["10", "15", "20"],
        "correct": 0,
        "hint": "Count all your fingers!"
    },
    {
        "q": "Which shape has 3 sides?",
        "options": ["Square", "Triangle", "Circle"],
        "correct": 1,
        "hint": "Think of a slice of pizza."
    },
    {
        "q": "What color is a banana?",
        "options": ["Red", "Yellow", "Blue"],
        "correct": 1,
        "hint": "It is the same color as the sun."
    },
    {
        "q": "Which animal says 'Moo'?",
        "options": ["Dog", "Sheep", "Cow"],
        "correct": 2,
        "hint": "This animal gives us milk."
    },
    {
        "q": "How many legs does a spider have?",
        "options": ["4", "6", "8"],
        "correct": 2,
        "hint": "It is more than a dog has."
    },
    {
        "q": "What is 10 minus 2?",
        "options": ["7", "8", "9"],
        "correct": 1,
        "hint": "Count backwards twice from ten."
    },
    {
        "q": "What comes after the number 9?",
        "options": ["8", "10", "11"],
        "correct": 1,
        "hint": "It is the first two-digit number."
    }
]

# Simple in-memory leaderboard (Resets when you restart the app)
leaderboard_data = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/questions')
def get_questions():
    # Returns the list directly from memory
    return jsonify(QUIZ_DATA)

@app.route('/api/leaderboard', methods=['GET', 'POST'])
def handle_leaderboard():
    if request.method == 'POST':
        data = request.json
        if data and 'score' in data:
            leaderboard_data.append({'score': data['score']})
            # Sort and keep only top 5
            leaderboard_data.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({'status': 'saved'})
    
    return jsonify(leaderboard_data[:5])

if __name__ == '__main__':
    app.run(debug=True)