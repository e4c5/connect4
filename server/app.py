import pickle
import os
import avro
import msgpack
import io
from flask import Flask, session, request, jsonify, Response
from flask_cors import CORS
from dotenv import load_dotenv
from connect import Connect4
from decorators import JsonSerializationDecorator, ProtobufSerializationDecorator, \
    MessagePackSerializationDecorator, AvroSerializationDecorator
import pickle
import connect4_pb2

COLUMNS = 7

ROWS = 6

APPLICATION_X_AVRO = 'application/avro'
APPLICATION_X_MSGPACK = 'application/x-msgpack'
APPLICATION_X_PROTOBUF = 'application/x-protobuf'

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Load secret key from environment variable
CORS(app, supports_credentials=True)


def get_response_format():
    accept_header = request.headers.get('Accept', 'application/json')
    if APPLICATION_X_PROTOBUF in accept_header:
        return 'protobuf'
    elif APPLICATION_X_MSGPACK in accept_header:
        return 'messagepack'
    elif APPLICATION_X_AVRO in accept_header:
        return 'avro'
    return 'json'

@app.route('/start/', methods=['GET', 'POST'])
def start_game():
    if request.method == 'POST':
        rows = request.json.get('rows', ROWS)
        cols = request.json.get('cols', COLUMNS)
        game_mode = request.json.get('game_mode', 'human_vs_ai')
    else:
        rows = ROWS
        cols = COLUMNS
        game_mode = 'human_vs_ai'
    game = Connect4(rows, cols)
    session['game'] = pickle.dumps(game)
    session['game_mode'] = game_mode

    return get_serialized_response(game)


def create_error_response(message):
    response_format = get_response_format()
    error_message = {"message": message}
    if response_format == 'protobuf':
        error = connect4_pb2.Error()
        error.message = message
        return Response(error.SerializeToString(), status=400, content_type=APPLICATION_X_PROTOBUF)
    elif response_format == 'messagepack':
        return Response(msgpack.packb(error_message), status=400, content_type=APPLICATION_X_MSGPACK)
    elif response_format == 'avro':
        schema_str = """
        {
            "type": "record",
            "name": "Error",
            "fields": [
                {"name": "message", "type": "string"}
            ]
        }
        """
        schema = avro.schema.parse(schema_str)
        writer = avro.io.DatumWriter(schema)
        bytes_writer = io.BytesIO()
        encoder = avro.io.BinaryEncoder(bytes_writer)
        writer.write(error_message, encoder)
        return Response(bytes_writer.getvalue(), status=400, content_type=APPLICATION_X_AVRO)
    return jsonify({"error": message}), 400


def get_serialized_response(game):
    response_format = get_response_format()
    if response_format == 'protobuf':
        decorated_game = ProtobufSerializationDecorator(game)
        return Response(decorated_game.serialize(), content_type=APPLICATION_X_PROTOBUF)
    elif response_format == 'messagepack':
        decorated_game = MessagePackSerializationDecorator(game)
        return Response(decorated_game.serialize(), content_type=APPLICATION_X_MSGPACK)
    elif response_format == 'avro':
        decorated_game = AvroSerializationDecorator(game)
        return Response(decorated_game.serialize(), content_type=APPLICATION_X_AVRO)
    decorated_game = JsonSerializationDecorator(game)
    return Response(decorated_game.serialize(), content_type="application/json")



@app.route('/move/', methods=['POST'])
def make_play():
    if 'game' not in session:
        return create_error_response("No game in progress")

    game = pickle.loads(session['game'])
    col = request.json['column']
    try:
        game.make_play(col)
        session['game'] = pickle.dumps(game)
        response = get_serialized_response(game)

        if session['game_mode'] == 'human_vs_ai' and game.playing:
            game.make_ai_move()
            session['game'] = pickle.dumps(game)
            response = get_serialized_response(game)

        return response
    except ValueError as e:
        return create_error_response(str(e))

if __name__ == '__main__':
    app.run(debug=True)