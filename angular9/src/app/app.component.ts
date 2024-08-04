import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  board: number[][] = [];

  constructor(private http: HttpClient) {}

  startGame() {
    this.http.get<{board: number[][], playing: boolean}>('http://localhost:5000/start/', { withCredentials: true })
      .subscribe(response => {
        this.board = response.board;
        console.log('Start Game clicked', response);
      });
  }

  resignGame() {
    console.log('Resign Game clicked');
  }

  makeMove(column: number) {
    this.http.post<{board: number[][], playing: boolean}>('http://localhost:5000/move/', { column }, { withCredentials: true })
      .subscribe(response => {
        this.board = response.board;
        console.log('Move made', response);
      });
  }
}
