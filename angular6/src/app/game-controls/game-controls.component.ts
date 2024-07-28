import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent implements OnInit {
  constructor(private gameService: GameService) {}

  ngOnInit() {
  }

  startGame(): void {
    this.gameService.loadBoard();
  }
}