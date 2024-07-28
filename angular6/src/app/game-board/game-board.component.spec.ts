import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GameBoardComponent } from './game-board.component';
import { GameService } from '../game.service';

describe('GameBoardComponent', () => {
  let component: GameBoardComponent;
  let fixture: ComponentFixture<GameBoardComponent>;
  let gameServiceMock: any;

  beforeEach(async () => {
    gameServiceMock = {
      boardLoaded$: of({ board: [[0, 0], [0, 0]], playing: 1 }),
      makeMove: jasmine.createSpy('makeMove').and.returnValue(of({ board: [[1, 0], [0, 0]], playing: 1, status: 'playing' })),
      setGameStatus: jasmine.createSpy('setGameStatus')
    };

    await TestBed.configureTestingModule({
      declarations: [GameBoardComponent],
      providers: [
        { provide: GameService, useValue: gameServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize board and playing status on ngOnInit', () => {
    component.ngOnInit();
    expect(component.board).toEqual([[0, 0], [0, 0]]);
    expect(component.playing).toBe(1);
  });

  it('should make a move and update the board', () => {
    component.makeMove(0);
    expect(gameServiceMock.makeMove).toHaveBeenCalledWith(0);
    expect(component.board).toEqual([[1, 0], [0, 0]]);
    expect(component.playing).toBe(1);
  });

  it('should set game status when game is over', () => {
    gameServiceMock.makeMove.and.returnValue(of({ board: [[1, 0], [0, 0]], playing: 0, status: 'game over', message: 'Game Over' }));
    component.makeMove(0);
    expect(gameServiceMock.setGameStatus).toHaveBeenCalledWith('Game Over');
  });

  it('should handle error when making a move', () => {
    spyOn(console, 'error');
    gameServiceMock.makeMove.and.returnValue(throwError('Error making move'));
    component.makeMove(0);
    expect(console.error).toHaveBeenCalledWith('Error making move:', 'Error making move');
  });
});
