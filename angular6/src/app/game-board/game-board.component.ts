import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  board: number[][] | null = null;
  playing: number = 0;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.boardLoaded$.subscribe(data => {
      if(data) {
        this.board = data.board;
        this.playing = data.playing;
      }
    });
  }

  makeMove(column: number): void {
    if (!this.playing) {
      console.error("game over");
      return;
    }
    this.gameService.makeMove(column).subscribe(
      data => {
        this.board = data.board;
        this.playing = data.playing;
        if (!data.playing) {
          this.gameService.setGameStatus(data.message);
        }
      },
      error => {
        console.error('Error making move:', error);
      }
    );
  }
}
