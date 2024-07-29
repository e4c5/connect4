import json
import msgpack
import connect4_pb2

class SerializationStrategy:
    def serialize(self, game_state):
        """Intended to be overridden by subclasses."""
        pass


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
            state.board.append(connect4_pb2.Connect4State.Row(row=row))

        state.playing = game_state['playing']
        if 'winner' in game_state:
            state.winner = game_state['winner']
        if 'message' in game_state:
            state.message = game_state['message']
        return state.SerializeToString()