// game-board.component.ts
import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  board: any;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadBoard();
  }

  loadBoard(): void {
    this.gameService.getBoard().subscribe(data => {
      this.board = data;
    });
  }

  makeMove(column: number): void {
    this.gameService.makeMove(column).subscribe(() => {
      this.loadBoard();
    });
  }
}