import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Service responsible for managing game-related operations.
 * Provides methods to interact with the game backend and manage game state.
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {
  /**
   * The base URL for the game API.
   * Adjust the URL as needed.
   */
  private apiUrl = 'http://localhost:5000/';

  /**
   * BehaviorSubject to hold the state of the game board.
   * Emits the current state of the game board.
   */
  private boardLoadedSource = new BehaviorSubject<any>(null);
  boardLoaded$ = this.boardLoadedSource.asObservable();

  /**
   * BehaviorSubject to hold the current game status.
   * Emits the current status of the game.
   */
  private gameStatusSource = new BehaviorSubject<string | null>(null);
  gameStatus$ = this.gameStatusSource.asObservable();

  /**
   * Injects the HttpClient to make HTTP requests to the game backend.
   * @param http - The HttpClient used to make HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Retrieves the game board from the backend.
   * @returns An Observable that emits the game board data.
   */
  getBoard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/start/`, { withCredentials: true });
  }

  /**
   * Loads the game board by making an HTTP request to the backend.
   * Updates the boardLoadedSource with the retrieved data.
   */
  loadBoard(): void {
    this.getBoard().subscribe(data => {
      this.boardLoadedSource.next(data);
    });
  }

  /**
   * Makes a move in the game by sending the selected column to the backend.
   * @param column - The column where the move is made.
   * @returns An Observable that emits the result of the move.
   */
  makeMove(column: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/move/`, { column }, { withCredentials: true });
  }

  /**
   * Sets the current game status.
   * @param status - The new status of the game.
   */
  setGameStatus(status: string): void {
    this.gameStatusSource.next(status);
  }
}
