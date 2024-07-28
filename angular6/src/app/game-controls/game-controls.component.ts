import { Component } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent {
  gameStatus: string | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.boardLoaded$.subscribe(data => {
      if(! data.playing ) {
        this.gameStatus = "Game Over";
      }
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
