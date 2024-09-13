import { persistent } from '@furudean/svelte-persistent-store';
import { gridSize, totalHP, shipsCount } from './constants';
import { DEBUG } from '$lib/Env';

export const GameState = {
	Pending: 'Pending',
	Positioning: 'Positioning',
	Positioned: 'Positioned',
	InGame: 'InGame',
	Lobby: 'Lobby',
	Over: 'Over'
};

const defaultGameState = {
	gameState: GameState.Pending,
	myTurn: false,
	turn: 0,
	hp: totalHP,
	/** @type {any[]} */ myShips: [],
	myBoard: Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 0)),
	/** @type {number[][]} */ mySalts: Array.from({ length: gridSize }, () => []),
	/** @type {string|null} */ matchID: null,
	opponentJoined: false,
	/** @type {any[][]} */ opponentBoard: Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null)),
	/** @type {string[][]} */ opponentCommitments: Array.from({ length: gridSize }, () => [])
};

const { subscribe, update, set } = persistent({
	start_value: defaultGameState,
	key: 'gameState',
	storage_type: 'localStorage'
});

export const gameState = {
	subscribe: subscribe,
	newGame: () =>
		update((state) => {
			if (state.gameState == GameState.Pending || state.gameState == GameState.Over)
				state.gameState = GameState.Positioning;

			return state;
		}),
	openLobby: () =>
		update((state) => {
			if (state.gameState == GameState.Pending || state.gameState == GameState.Over) {
				state.gameState = GameState.Lobby;
				state.matchID = null;
			}

			return state;
		}),
	joinMatch: (/** @type {string|null} */ matchID) =>
		update((state) => {
			if (state.matchID != null) {
				console.warn('cannot join another match, already in a match');
				return state;
			}

			if (state.gameState != GameState.Lobby) {
				console.warn('you are not in lobby');
				return state;
			}

			state.matchID = matchID;
			state.turn = 1;
			state.opponentJoined = true;
			state.gameState = GameState.Positioning;

			return state;
		}),
	positionShip: (
		/** @type {number} */ shipId,
		/** @type {number} */ x,
		/** @type {number} */ y,
		/** @type {boolean} */ isHorizontal
	) =>
		update((state) => {
			state.myShips[shipId] = { x, y, isHorizontal };

			let sum = 0;
			state.myBoard.forEach((row)=> {
				sum += row.reduce((total, val) => total + val);
			});

			// verify mySHips none are null
			if (state.gameState == GameState.Positioning && state.myShips.length == shipsCount && sum == totalHP) {
				state.gameState = GameState.Positioned;
			}

			return state;
		}),
	resetShipsPosition: () =>
		update((state) => {
			if (state.gameState == GameState.Positioned) {
				state.gameState = GameState.Positioning;
			}

			state.myShips = [];

			return state;
		}),
	lockShips: () =>
		update((state) => {
			if (state.gameState == GameState.Positioned) {
				state.gameState = GameState.InGame;
			}

			return state;
		}),
	endMatch: () =>
		update((state) => {
			if (state.gameState == GameState.InGame) {
				state.gameState = GameState.Over;
			}

			return state;
		}),
	decreaseHp: () =>
		update((state) => {
			state.hp--;
			return state;
		}),
	newTurn: () =>
		update((state) => {
			state.turn++;
			state.myTurn = true;
			return state;
		}),
	finishTurn: () =>
		update((state) => {
			state.myTurn = false;
			return state;
		}),

	generateSalt: (/** @type {number} */ x, /** @type {number} */ y) =>
		update((state) => {
			state.mySalts[x-1][y-1] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
			return state;
		}),

	// TODO: Merge with positionShip?
	signalShip: (/** @type {number} */ x, /** @type {number} */ y) =>
		update((state) => {
			state.myBoard[x-1][y-1] = 1;
			return state;
		}),
	opponentJoin: () =>
		update((state) => {
			state.opponentJoined = true;
			return state;
		}),
	recordOpponentCommitment: (/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ value) =>
		update((state) => {
			if (DEBUG) console.log('recordOpponentCommitment ' + x + ',' + y)
			state.opponentCommitments[x-1][y-1] = value;
			return state;
		}),
	recordOpponentResult: (/** @type {number} */ x, /** @type {number} */ y, /** @type {any} */ value) =>
		update((state) => {
			state.opponentBoard[x-1][y-1] = value;
			return state;
		}),
	reset: () => set(defaultGameState)
};
