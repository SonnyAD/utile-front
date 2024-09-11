import { persistent } from '@furudean/svelte-persistent-store';
import { gridSize, totalHP, shipsCount } from './constants';

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
	myBoard: Array.from({ length: gridSize * gridSize }, () => 0),
	/** @type {number[]} */ mySalts: [],
	/** @type {string|null} */ matchID: null,
	opponentJoined: false,
	opponentBoard: Array.from({ length: gridSize * gridSize }, () => null),
	/** @type {string[]} */ opponentCommitments: []
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
	positionShip: (/** @type {number} */ shipId, /** @type {number} */ x, /** @type {number} */ y, /** @type {boolean} */ isHorizontal) =>
		update((state) => {
			state.myShips[shipId] = {x, y, isHorizontal};
			
			// verify mySHips none are null
			if (state.gameState == GameState.Positioning && state.myShips.length == shipsCount) {
				state.gameState = GameState.Positioned;
			}

			return state;
		}),
	resetShipsPosition: () =>
		update((state) => {
			if (state.gameState == GameState.Positioned) {
				state.gameState = GameState.Positioning;
			}

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
			const flatIndex = x - 1 + (y - 1) * gridSize;
			state.mySalts[flatIndex] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
			return state;
		}),
	signalShip: (/** @type {number} */ x, /** @type {number} */ y) =>
		update((state) => {
			const flatIndex = x - 1 + (y - 1) * gridSize;
			state.myBoard[flatIndex] = 1;
			return state;
		}),
	opponentJoin: () =>
		update((state) => {
			state.opponentJoined = true;
			return state;
		}),
	recordOpponentCommitment: (/** @type {number} */ key, /** @type {string} */ value) =>
		update((state) => {
			state.opponentCommitments[key] = value;
			return state;
		}),
	recordOpponentResult: (/** @type {number} */ key, /** @type {any} */ value) =>
		update((state) => {
			state.opponentBoard[key] = value;
			return state;
		}),
	reset: () => set(defaultGameState)
};
