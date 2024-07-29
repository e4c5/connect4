import pickle
import os
from flask import Flask, session, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from connect import Connect4
from serializers import JsonSerializationStrategy, ProtobufSerializationStrategy
import connect4_pb2

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from environment variable
CORS(app, supports_credentials=True)


def get_response_format():
    accept_header = request.headers.get('Accept', 'application/json')
    if 'application/x-protobuf' in accept_header:
        return 'protobuf'
    return 'json'


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

    response_format = get_response_format()
    if response_format == 'protobuf':
        game.set_serialization_strategy(ProtobufSerializationStrategy())
        return Response(game.serialize(), content_type='application/x-protobuf')

    game.set_serialization_strategy(JsonSerializationStrategy())
    return jsonify(game.serialize())


def create_error_response(message):
    response_format = get_response_format()
    if response_format == 'protobuf':
        response = connect4_pb2.Error()
        response.message = message
        return response.SerializeToString(), 400, {'Content-Type': 'application/x-protobuf'}
    return jsonify({"error": message}), 400

@app.route('/move/', methods=['POST'])
def make_play():
    if 'game' not in session:
        return create_error_response("No game in progress")

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
        return create_error_response(str(e))

if __name__ == '__main__':
    app.run(debug=True)