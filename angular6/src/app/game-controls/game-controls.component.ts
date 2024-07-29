import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

/**
 * Component responsible for managing game controls and displaying game status.
 */
@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent implements OnInit {
  /**
   * Holds the current status of the game.
   * It can be null, "Game Over", or a custom message.
   */
  gameStatus: string | null = null;

  /**
   * Injects the GameService to interact with the game's state.
   * @param gameService - The service that provides game-related operations.
   */
  constructor(private gameService: GameService) {}

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties.
   * Subscribes to observables from the GameService to update the game status.
   */
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

  /**
   * Starts a new game by calling the loadBoard method of the GameService.
   * Resets the gameStatus to null.
   */
  startGame(): void {
    this.gameService.loadBoard();
    this.gameStatus = null;
  }

  /**
   * Resigns the game by setting the gameStatus to indicate that the player has left the game.
   */
  resignGame(): void {
    this.gameStatus = 'Game resigned. Player has left the game.';
  }
}
