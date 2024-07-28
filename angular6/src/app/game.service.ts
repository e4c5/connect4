import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/'; // Adjust the URL as needed
  private boardLoadedSource = new BehaviorSubject<any>(null);
  boardLoaded$ = this.boardLoadedSource.asObservable();

  private gameStatusSource = new BehaviorSubject<string | null>(null);
  gameStatus$ = this.gameStatusSource.asObservable();

  constructor(private http: HttpClient) {}

  getBoard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/start/`, { withCredentials: true });
  }

  loadBoard(): void {
    this.getBoard().subscribe(data => {
      this.boardLoadedSource.next(data);
    });
  }

  makeMove(column: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/move/`, { column }, { withCredentials: true });
  }

  setGameStatus(status: string): void {
    this.gameStatusSource.next(status);
  }
}