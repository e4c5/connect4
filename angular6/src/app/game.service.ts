// game.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:5000/api'; // Adjust the URL as needed

  constructor(private http: HttpClient) {}

  getBoard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/board`);
  }

  makeMove(column: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/move`, { column });
  }
}