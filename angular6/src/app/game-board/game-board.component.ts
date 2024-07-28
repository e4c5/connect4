import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

/**
 * Component representing the game board.
 * Manages the state of the game board and handles user interactions.
 */
@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  /**
   * The current state of the game board.
   * Initialized to null.
   */
  board: number[][] | null = null;

  /**
   * Indicates whether the game is currently active.
   * Initialized to 0.
   */
  playing: number = 0;

  /**
   * Constructor for GameBoardComponent.
   * @param gameService - The service used to interact with the backend server.
   */
  constructor(private gameService: GameService) {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Subscribes to the boardLoaded$ observable to update the board and playing properties.
   */
  ngOnInit(): void {
    this.gameService.boardLoaded$.subscribe(data => {
      if(data) {
        this.board = data.board;
        this.playing = data.playing;
      }
    });
  }

  /**
   * Handles the action of making a move in the game.
   * @param column - The column where the move is made.
   */
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
