import unittest
from connect import Connect4


class TestConnect4(unittest.TestCase):
    def setUp(self):
        self.game = Connect4()

    def test_initialization(self):
        self.assertEqual(len(self.game.board), 6)
        self.assertEqual(len(self.game.board[0]), 7)
        self.assertEqual(self.game.current_player, 1)

    def test_make_valid_play(self):
        result = self.game.make_play(0, 0)
        self.assertEqual(result, "Move accepted")
        self.assertEqual(self.game.board[0][0], 1)

    def test_make_play_out_of_bounds(self):
        with self.assertRaises(ValueError):
            self.game.make_play(6, 0)

    def test_make_play_cell_occupied(self):
        self.game.make_play(0, 0)
        with self.assertRaises(ValueError):
            self.game.make_play(0, 0)

    def test_horizontal_win(self):
        for col in range(3):
            self.game.make_play(0, col)
            self.game.current_player = 1  # Force player 1's turn
        result = self.game.make_play(0, 3)
        self.assertEqual(result, "Player 1 wins!")

    def test_vertical_win(self):
        for row in range(3):
            self.game.make_play(row, 0)
            self.game.current_player = 1  # Force player 1's turn
        result = self.game.make_play(3, 0)
        self.assertEqual(result, "Player 1 wins!")

    def test_diagonal_win_bottom_right(self):
        for i in range(3):
            self.game.make_play(i, i)
            self.game.current_player = 1  # Force player 1's turn
        result = self.game.make_play(3, 3)
        self.assertEqual(result, "Player 1 wins!")

    def test_diagonal_win_bottom_left(self):
        for i in range(3):
            self.game.make_play(i, 3 - i)
            self.game.current_player = 1  # Force player 1's turn
        result = self.game.make_play(3, 0)
        self.assertEqual(result, "Player 1 wins!")

if __name__ == '__main__':
    unittest.main()