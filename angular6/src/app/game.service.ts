import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Connect4State } from './connect4_pb';
import * as avro from 'avro-js';
import * as msgpack from 'msgpack5';

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

  private getAcceptHeader(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const responseType = urlParams.get('responseType');
    if (responseType === 'protobuf') {
      return 'application/x-protobuf';
    } else if (responseType === 'avro') {
      return 'application/avro';
    } else if (responseType === 'msgpack') {
      return 'application/x-msgpack';
    }
    return 'application/json';
  }

  private parseResponse(response: any, responseType: string): any {
    if (responseType === 'application/x-protobuf') {
      const object = Connect4State.deserializeBinary(new Uint8Array(response)).toObject()
      // this should not be needed but protoc keeps giving the name as boardList
      object.board = object.boardList.map(row => row.colsList);
      delete object.boardList;
      return object

    } else if (responseType === 'application/avro') {
      const avroSchema = avro.parse({
        type: 'record',
        name: 'Connect4State',
        fields: [
          { name: 'board', type: { type: 'array', items: {type: "array", items: 'int'} } },
          { name: 'playing', type: 'boolean' },
          { name: 'winner', type: ['null', 'int'], default: null },
          { name: 'message', type: ['null', 'string'], default: null }
        ]
      });
      return avroSchema.fromBuffer(new Uint8Array(response));
    } else if (responseType === 'application/x-msgpack') {
      const msgpackDecoder = msgpack();
      return msgpackDecoder.decode(new Uint8Array(response));
    }
    

    return JSON.parse(new TextDecoder().decode(response));
  }

  /**
   * Retrieves the game board from the backend.
   * @returns An Observable that emits the game board data.
   */
  getBoard(): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': this.getAcceptHeader()
    });
    return this.http.get(`${this.apiUrl}/start/`, { headers, responseType: 'arraybuffer' , withCredentials: true}).pipe(
      map(response => this.parseResponse(response, headers.get('Accept')!))
    );
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
    const headers = new HttpHeaders({
      'Accept': this.getAcceptHeader()
    });
    return this.http.post(`${this.apiUrl}/move/`, { column },
      { headers, responseType: 'arraybuffer', withCredentials: true }).pipe(
      map(response => this.parseResponse(response, headers.get('Accept')!))
    );
  }

  /**
   * Sets the current game status.
   * @param status - The new status of the game.
   */
  setGameStatus(status: string): void {
    this.gameStatusSource.next(status);
  }
}
