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
        self.game.make_play(0)

        self.assertTrue(self.game.playing)
        self.assertEqual(self.game.board[0][0], 1)

    def test_make_play_out_of_bounds(self):
        with self.assertRaises(ValueError):
            self.game.make_play(7)

    def test_make_play_column_full(self):
        for _ in range(6):
            self.game.make_play(0)
        with self.assertRaises(ValueError):
            self.game.make_play(0)

    def test_horizontal_win(self):
        for col in range(3):
            self.game.make_play(col)
            self.game.current_player = 1  # Force player 1's turn
        self.game.make_play(3)
        self.assertWin()

    def test_vertical_win(self):
        for _ in range(3):
            self.game.make_play(0)
            self.game.current_player = 1  # Force player 1's turn
        self.game.make_play(0)
        self.assertWin()

    def assertWin(self):
        data = self.game.to_json()
        self.assertEqual(data['message'], "Player 1 wins!")
        self.assertEqual(data['playing'], 0)

    def test_diagonal_win_bottom_right(self):
        for i in range(3):
            self.game.make_play(i)
            self.game.current_player = 1  # Force player 1's turn
        self.game.make_play(3)


    def test_diagonal_win_bottom_left(self):
        for i in range(3):
            self.game.make_play(3 - i)
            self.game.current_player = 1  # Force player 1's turn
        self.game.make_play(0)
        self.assertWin()


if __name__ == '__main__':
    unittest.main()