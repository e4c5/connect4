import random

class Connect4:
    """
    A class to represent a Connect4 game.
    Attributes:
    -----------
    rows : int
        Number of rows in the game board.
    cols : int
        Number of columns in the game board.
    board : list
        2D list representing the game board.
    current_player : int
        The current player (1 or 2).
    playing : bool
        Flag to indicate if the game is currently being played.
    """

    def __init__(self, rows=6, cols=7):
        """
        Constructs all the necessary attributes for the Connect4 object.

        Parameters:
        -----------
        rows : int, optional
            Number of rows in the game board (default is 6).
        cols : int, optional
            Number of columns in the game board (default is 7).
        """
        self.rows = rows
        self.cols = cols
        self.board = [[0 for _ in range(cols)] for _ in range(rows)]
        self.current_player = 1
        self.playing = True
        self.winner = 0

    def make_play(self, col):
        """
        Makes a move in the specified column.

        Parameters:
        -----------
        col : int
            The column where the move is to be made.

        Returns:
        --------
        None

        Raises:
        -------
        ValueError
            If the move is out of bounds or the column is full.
        """
        if not (0 <= col < self.cols):
            raise ValueError("Move out of bounds")

        for row in range(self.rows - 1, -1, -1):
            if self.board[row][col] == 0:
                self.board[row][col] = self.current_player
                if self.check_winner(row, col):
                    self.playing = False
                    self.winner = self.current_player
                    return
                else:
                    self.current_player = 3 - self.current_player
                    return

        raise ValueError("Column is full")

    def is_filled(self):
        """
        Method to check that the board is filled.
        Since the board starts filling from the bottom all we need to do is to check that the top row is filled.
        :return:
        """
        return all(self.board[0])

    def make_ai_move(self):
        """
        Makes a move for the AI.

        Returns:
        --------
        None

        Raises:
        -------
        ValueError
            If no valid moves are available for the AI.
        """
        available_cols = [col for col in range(self.cols) if self.board[0][col] == 0]
        if not available_cols:
            raise ValueError("No valid moves available for AI")
        col = random.choice(available_cols)
        self.make_play(col)

    def check_winner(self, row, col):
        """
        Checks if the current player has won the game.

        Parameters:
        -----------
        row : int
            The row of the last move.
        col : int
            The column of the last move.

        Returns:
        --------
        bool
            True if the current player has won, False otherwise.
        """
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
        for r_step, c_step in directions:
            if (self.count_consecutive(row, col, r_step, c_step) +
                    self.count_consecutive(row, col, -r_step, -c_step) - 1 >= 4):
                return True
        return False

    def count_consecutive(self, row, col, r_step, c_step):
        """
        Counts consecutive pieces in a specified direction.

        Parameters:
        -----------
        row : int
            The starting row.
        col : int
            The starting column.
        r_step : int
            The row step direction.
        c_step : int
            The column step direction.

        Returns:
        --------
        int
            The count of consecutive pieces in the specified direction.
        """
        count = 0
        r, c = row, col
        while 0 <= r < self.rows and 0 <= c < self.cols and self.board[r][c] == self.current_player:
            count += 1
            r += r_step
            c += c_step
        return count

    def to_json(self):
        """
        Returns the game state as a JSON-compatible dictionary.

        Parameters:
        -----------
        message : str
            The message to include in the JSON.
        status : bool
            The status of the game (True if game over, False otherwise).

        Returns:
        --------
        dict
            A dictionary representing the game state.
        """
        data = {
            "board": self.board,
            "playing": self.playing
        }

        if self.winner:
            data["winner"] = self.winner
            data["message"] = f"Player {self.winner} wins!"
        elif not self.playing:
            data["message"] = "Game over"

        return data
