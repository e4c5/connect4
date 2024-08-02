import json
import msgpack
import connect4_pb2
import avro.schema
import avro.io
import io


class SerializationStrategy:
    def serialize(self, game_state):
        """Intended to be overridden by subclasses."""
        pass


class AvroSerializationStrategy(SerializationStrategy):
    schema_str = """
    {
        "type": "record",
        "name": "Connect4State",
        "fields": [
            {"name": "board", "type": {"type": "array", "items": "int"}},
            {"name": "playing", "type": "boolean"},
            {"name": "winner", "type": ["null", "int"], "default": null},
            {"name": "message", "type": ["null", "string"], "default": null}
        ]
    }
    """
    schema = avro.schema.parse(schema_str)

    def serialize(self, game_state):
        writer = avro.io.DatumWriter(self.schema)
        bytes_writer = io.BytesIO()
        encoder = avro.io.BinaryEncoder(bytes_writer)
        writer.write(game_state, encoder)
        return bytes_writer.getvalue()


class JsonSerializationStrategy(SerializationStrategy):
    def serialize(self, game_state):
        return json.dumps(game_state)


class MessagePackSerializationStrategy(SerializationStrategy):
    def serialize(self, game_state):
        return msgpack.packb(game_state)


class ProtobufSerializationStrategy(SerializationStrategy):
    def serialize(self, game_state):
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