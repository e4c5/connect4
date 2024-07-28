import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  board: number[][] | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Do not load the board automatically
  }

  loadBoard(): void {
    this.gameService.getBoard().subscribe(data => {
      this.board = data.board;
    });
  }

  makeMove(column: number): void {
    this.gameService.makeMove(column).subscribe(response => {
      this.board = response.board;
    });
  }
}