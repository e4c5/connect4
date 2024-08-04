// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Connect4State } from './connect4_pb'; // Import the generated protobuf classes
import * as avro from 'avro-js'; // Import the avro-js library
import * as msgpack from 'msgpack5'; // Import the msgpack5 library

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  board: number[][] = [];
  playing: boolean = true;
  gameOverMessage: string = '';
  responseType: string = 'json';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.responseType = params['responseType'] || 'json';
    });
  }

  getHeaders() {
    let acceptType = 'application/json';
    if (this.responseType === 'protobuf') {
      acceptType = 'application/x-protobuf';
    } else if (this.responseType === 'avro') {
      acceptType = 'application/avro';
    } else if (this.responseType === 'msgpack') {
      acceptType = 'application/msgpack';
    }
    return new HttpHeaders({ 'Accept': acceptType });
  }

  parseProtobufResponse(response: ArrayBuffer): Connect4State {
    return Connect4State.deserializeBinary(new Uint8Array(response));
  }

  parseAvroResponse(response: ArrayBuffer): any {
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
  }

  parseMsgpackResponse(response: ArrayBuffer): any {
    const decoder = msgpack();
    const parsedResponse = decoder.decode(new Uint8Array(response));
    return parsedResponse;
  }
  startGame() {
    this.http.get('http://localhost:5000/start/', { headers: this.getHeaders(), responseType: 'arraybuffer', withCredentials: true })
      .subscribe(response => {
        let state;
        if (this.responseType === 'protobuf') {
          state = this.parseProtobufResponse(response);
        } else if (this.responseType === 'avro') {
          state = this.parseAvroResponse(response);
        } else if (this.responseType === 'msgpack') {
          state = this.parseMsgpackResponse(response);
        } else {
          state = JSON.parse(new TextDecoder().decode(response));
        }
        console.log('Game State:', state);
        this.board = state.board;
        this.playing = state.playing;
        this.gameOverMessage = state.message || '';
        console.log('Start Game clicked', response);
      });
  }

  makeMove(column: number) {
    if (!this.playing) return;

    this.http.post('http://localhost:5000/move/', { column }, { headers: this.getHeaders(), responseType: 'arraybuffer', withCredentials: true })
      .subscribe(response => {
        let state;
        if (this.responseType === 'protobuf') {
          state = this.parseProtobufResponse(response);
        } else if (this.responseType === 'avro') {
          state = this.parseAvroResponse(response);
        } else if (this.responseType === 'msgpack') {
          state = this.parseMsgpackResponse(response);
        } else {
          state = JSON.parse(new TextDecoder().decode(response));
        }
        console.log('Game State:', state);
        this.board = state.board;
        this.playing = state.playing;
        this.gameOverMessage = state.message || '';
        console.log('Move made', response);
      });
  }
  resignGame() {
    console.log('Resign Game clicked');
  }

}
