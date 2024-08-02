import json
import msgpack
import connect4_pb2
import avro.schema
import avro.io
import io

class SerializationDecorator:
    def __init__(self, connect4):
        self._connect4 = connect4

    def get_game_state(self):
        return self._connect4.get_game_state()

class JsonSerializationDecorator(SerializationDecorator):
    def serialize(self):
        return json.dumps(self.get_game_state())

class ProtobufSerializationDecorator(SerializationDecorator):
    def serialize(self):
        game_state = self.get_game_state()
        state = connect4_pb2.Connect4State()
        for row in game_state['board']:
            new_row = connect4_pb2.Connect4State.Row()
            new_row.cols.extend(row)
            state.board.append(new_row)
        state.playing = game_state['playing']
        if 'winner' in game_state:
            state.winner = game_state['winner']
        if 'message' in game_state:
            state.message = game_state['message']
        return state.SerializeToString()

class MessagePackSerializationDecorator(SerializationDecorator):
    def serialize(self):
        return msgpack.packb(self.get_game_state())

class AvroSerializationDecorator(SerializationDecorator):
    def serialize(self):
        game_state = self.get_game_state()
        with open('connect4.avsc', 'r') as schema_file:
            schema = avro.schema.parse(schema_file.read())
        writer = avro.io.DatumWriter(schema)
        bytes_writer = io.BytesIO()
        encoder = avro.io.BinaryEncoder(bytes_writer)
        writer.write(game_state, encoder)
        return bytes_writer.getvalue()