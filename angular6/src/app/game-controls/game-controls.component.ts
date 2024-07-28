import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent implements OnInit {
  gameStatus: string | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.boardLoaded$.subscribe(data => {
      if (data && !data.playing) {
        this.gameStatus = "Game Over";
      }
    });

    this.gameService.gameStatus$.subscribe(status => {
      this.gameStatus = status;
    });
  }

  startGame(): void {
    this.gameService.loadBoard();
    this.gameStatus = null;
  }

  resignGame(): void {
    this.gameStatus = 'Game resigned. Player has left the game.';
  }
}
