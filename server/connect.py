class Connect4:
    def __init__(self, rows=6, cols=7):
        self.rows = rows
        self.cols = cols
        self.board = [[0 for _ in range(cols)] for _ in range(rows)]
        self.current_player = 1

    def make_play(self, row, col):
        if not (0 <= row < self.rows and 0 <= col < self.cols):
            raise ValueError("Move out of bounds")
        if self.board[row][col] != 0:
            raise ValueError("Cell is already occupied")
        self.board[row][col] = self.current_player
        if self.check_winner(row, col):
            return f"Player {self.current_player} wins!"
        self.current_player = 3 - self.current_player  # Switch player
        return "Move accepted"

    def check_winner(self, row, col):
        directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
        for r_step, c_step in directions:
            if self.count_consecutive(row, col, r_step, c_step) + self.count_consecutive(row, col, -r_step, -c_step) - 1 >= 4:
                return True
        return False

    def count_consecutive(self, row, col, r_step, c_step):
        count = 0
        r, c = row, col
        while 0 <= r < self.rows and 0 <= c < self.cols and self.board[r][c] == self.current_player:
            count += 1
            r += r_step
            c += c_step
        return count
