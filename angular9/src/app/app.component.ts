// src/app/app.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  board: number[][] = [];
  playing: boolean = true;
  gameOverMessage: string = '';

  constructor(private http: HttpClient) {}

  startGame() {
    this.http.get<{board: number[][], playing: boolean, message?: string}>('http://localhost:5000/start/', { withCredentials: true })
      .subscribe(response => {
        this.board = response.board;
        this.playing = response.playing;
        this.gameOverMessage = '';
        console.log('Start Game clicked', response);
      });
  }

  resignGame() {
    console.log('Resign Game clicked');
  }

  makeMove(column: number) {
    if (!this.playing) return;

    this.http.post<{board: number[][], playing: boolean, message?: string}>('http://localhost:5000/move/', { column }, { withCredentials: true })
      .subscribe(response => {
        this.board = response.board;
        this.playing = response.playing;
        if (!this.playing && response.message) {
          this.gameOverMessage = response.message;
        }
        console.log('Move made', response);
      });
  }
}
