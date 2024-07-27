# app.py
from flask import Flask, session, request, jsonify
from connect import Connect4
import pickle
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from environment variable

@app.route('/start_game/', methods=['GET', 'POST'])
def start_game():
    if request.method == 'POST':
        rows = request.json.get('rows', 6)
        cols = request.json.get('cols', 7)
    else:
        rows = 6
        cols = 7
    game = Connect4(rows, cols)
    session['game'] = pickle.dumps(game)
    return jsonify({"message": "Game started", "rows": rows, "cols": cols})

@app.route('/make_play/', methods=['POST'])
def make_play():
    if 'game' not in session:
        return jsonify({"error": "No game in progress"}), 400

    game = pickle.loads(session['game'])
    row = request.json['row']
    col = request.json['col']
    try:
        result = game.make_play(row, col)
        session['game'] = pickle.dumps(game)
        return jsonify({"message": result, "board": game.board})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)