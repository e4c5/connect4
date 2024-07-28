import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/'; // Adjust the URL as needed
  private boardLoadedSource = new Subject<any>();
  boardLoaded$ = this.boardLoadedSource.asObservable();

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
}