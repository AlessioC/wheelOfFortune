import './style.css';
import { Game } from './Game.js';
import { Wheel } from './Wheel.js';
import { Board } from './Board.js';
import { Menu } from './Menu.js';

// Initialize Menu first (controls screen visibility)
const menu = new Menu();
menu.init();

// Initialize Game Components (but don't start yet)
const canvas = document.getElementById('wheel-canvas');
const wheel = new Wheel(canvas);

const boardElement = document.getElementById('puzzle-board');
const board = new Board(boardElement);

const game = new Game(wheel, board, menu);
game.init();

// Connect menu to game start
menu.onStartGame = (mode, players) => {
    wheel.init(); // Re-init wheel when game starts (for proper sizing)
    board.init();
    game.startGame(mode, players);
};
