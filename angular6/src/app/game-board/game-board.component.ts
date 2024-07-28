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
    this.gameService.boardLoaded$.subscribe(data => {
      this.board = data.board;
    });
  }
}
