import pickle
import os
from flask import Flask, session, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from connect import Connect4

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from environment variable
CORS(app, supports_credentials=True)

@app.route('/start/', methods=['GET', 'POST'])
def start_game():
    if request.method == 'POST':
        rows = request.json.get('rows', 6)
        cols = request.json.get('cols', 7)
        game_mode = request.json.get('game_mode', 'human_vs_ai')
    else:
        rows = 6
        cols = 7
        game_mode = 'human_vs_ai'
    game = Connect4(rows, cols)
    session['game'] = pickle.dumps(game)
    session['game_mode'] = game_mode
    return jsonify(game.to_json())

@app.route('/move/', methods=['POST'])
def make_play():
    if 'game' not in session:
        return jsonify({"error": "No game in progress"}), 400

    game = pickle.loads(session['game'])
    game_mode = session['game_mode']
    col = request.json['column']
    try:
        game.make_play(col)
        session['game'] = pickle.dumps(game)
        response = game.to_json()

        if game_mode == 'human_vs_ai' and game.playing:
            game.make_ai_move()
            session['game'] = pickle.dumps(game)
            response = game.to_json()

        return jsonify(response)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)