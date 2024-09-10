<script>
	import Header from '$lib/components/Header.svelte';
	import { Moon } from 'svelte-loading-spinners';
	import { gridSize, cellSize } from '$lib/battleships/constants';
	import { API_URL, DEBUG } from '$lib/Env';
	import { startWebsocket } from '$lib/battleships/websocket';
	import { getPlayerId } from '$lib/battleships/playerId';
	import { settings } from '$lib/battleships/playerSettings';
	import { gameState, GameState } from '$lib/battleships/gameState';
	import { generateCommitment } from '$lib/sha256';
	import { clamp } from '$lib/mathutils';
	import { onMount } from 'svelte';
	import { notifier } from '$lib/notifications';
	import { fabric } from 'fabric';

	let shipId = 0;

	/**
	 * @type {any}
	 */
	let myCanvas;

	/**
	 * @type {any}
	 */
	let opponentCanvas;

	/**
	 * @type {any[]}
	 */
	let ships = [];

	/**
	 * @type {any}
	 */
	let gridCursor;

	/**
	 * @type {any}
	 */
	let opponentGridCursor;

	/**
	 * @type {Promise<any>}
	 */
	let stats;

	/**
	 * @type {WebSocket}
	 */
	let websocket;
	let connected = false;


	/**
	 * @param {{ left?: number; top?: number; set?: (arg0: string, arg1: boolean) => void; selectable?: boolean; evented?: boolean; _setOriginToCenter?: () => void; animate?: any; angle?: any; }} obj
	 */
	function animate(obj) {
		obj.animate(
			{ angle: 360 },
			{
				duration: 3000,
				onComplete: function () {
					obj.angle = 0;
					animate(obj);
				},
				onChange: opponentCanvas.renderAll.bind(opponentCanvas),
				easing: function (
					/** @type {number} */ t,
					/** @type {number} */ b,
					/** @type {number} */ c,
					/** @type {number} */ d
				) {
					return (2 * c * t) / d + b;
				}
			}
		);
	}

	async function getStats() {
		const res = await fetch(API_URL + '/battleships/stats', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		return res.json();
	}

	let assets = [
		{
			url: '/carrier.svg'
		},
		{
			url: '/battleship.svg'
		},
		{
			url: '/destroyer.svg'
		},
		{
			url: '/submarine.svg'
		},
		{
			url: '/patrol.svg'
		}
	];

	onMount(() => {
		// Prepare Both Canvas
		opponentCanvas = drawCanvas('opponent');
		myCanvas = drawCanvas('mine');

		// My Grid Cursor
		gridCursor = makeCursor(cellSize, '#32a797');
		myCanvas.add(gridCursor);

		// Load ships assets and nest them in a group to be able to scale them properly
		for (let i = 0; i < assets.length; i++) {
			// @ts-ignore
			fabric.loadSVGFromURL(
				assets[i].url,
				function (/** @type {any} */ objects, /** @type {any} */ options) {
					const svg = fabric.util.groupSVGElements(objects, options);

					let g = new fabric.Group([], {
						width: (svg.width / svg.height) * cellSize,
						height: cellSize
					});

					svg.scaleToWidth(g.width);

					g.addWithUpdate(svg);

					ships[i] = g;
					console.log('Loaded ' + assets[i].url);
				}
			);
		}

		// @ts-ignore
		fabric.loadSVGFromURL(
			'/red_radar_bg.svg',
			function (/** @type {any} */ objects, /** @type {any} */ options) {
				// @ts-ignore
				var obj = fabric.util.groupSVGElements(objects, options);
				obj.left = (gridSize + 1) * cellSize + 10;
				obj.top = cellSize;

				obj.selectable = false;
				obj.evented = false;

				opponentCanvas.add(obj);
			}
		);

		// @ts-ignore
		fabric.Image.fromURL(
			'/red_radar_fg.png',
			function (
				/** @type {{ left: number; top: number; set: (arg0: string, arg1: boolean) => void; selectable: boolean; evented: boolean; _setOriginToCenter: () => void; }} */ obj
			) {
				obj.left = (gridSize + 1) * cellSize + 10;
				obj.top = cellSize;
				obj.set('centeredRotation', true);
				obj.selectable = false;
				obj.evented = false;

				obj._setOriginToCenter();

				opponentCanvas.add(obj);
				animate(obj);
			}
		);

		opponentGridCursor = makeCursor(cellSize, '#32a797');
		opponentCanvas.add(opponentGridCursor);

		websocket = startWebsocket(signIn, parseCommand, connectionLost);

		stats = getStats();

		/*settings.subscribe((value) => console.log(value));
		gameState.subscribe((value) => console.log(value));*/
	});

	/**
	 * @type {string | number | NodeJS.Timeout | undefined}
	 */
	let clear;
	$: {
		clearInterval(clear);
		clear = setInterval(() => {
			stats = getStats();
		}, 5000);
	}

	async function signIn() {
		websocket.send('signin ' + getPlayerId());
		connected = true;
	}

	async function connectionLost() {
		connected = false;
	}

	/**
	 * @param {string} line
	 */
	async function parseCommand(line) {
		const re = new RegExp(
			/^(turn|shot|hit|miss|sink|prove|proof|gaveup|receive|joined|youjoined|commit|battlestart|lose)(\s+([0-9a-f-]*))?(\s+([0-9]+,[0-9]+))?(\s+(.))?$/gu
		);
		const matches = [...line.matchAll(re)][0];

		if (matches) {
			if (matches[1].toString() == 'shot') {
				const s = matches[5].split(',');
				const cell = { x: parseInt(s[0]), y: parseInt(s[1]) };
				const flatIndex = cell.x - 1 + (cell.y - 1) * gridSize;
				// @ts-ignore
				receiveShot(cell);
				// @ts-ignore
				if ($gameState.myBoard[flatIndex] == 0) {
					websocket.send('miss ' + matches[5]);
					// @ts-ignore
				} else if ($gameState.myBoard[flatIndex] == 1) {
					websocket.send('hit ' + matches[5]);
					// @ts-ignore
					gameState.signalShip(cell.x, cell.y);
					gameState.decreaseHp();

					if ($gameState.hp == 0) {
						websocket.send('lose');
						gameState.endMatch();
						notifier.danger('You lose. RIP Commander!', 10000);
					}
				}
			} else if (matches[1].toString() == 'gaveup') {
				notifier.success(
					'You won the battle, Commander. The opponent is retreating! Congratulations',
					10000
				);
				gameState.endMatch();
			} else if (matches[1].toString() == 'lose') {
				notifier.success(
					'You won the battle, Commander. The opponent has been annihilated! Congratulations',
					10000
				);
				gameState.endMatch();
			} else if (matches[1].toString() == 'receive' && !$settings.opponentMuted) {
				notifier.info('Opponent sent you: ' + matches[7].toString(), 5000);
			} else if (matches[1].toString() == 'joined') {
				notifier.danger('An opponent joined you! Good luck, commander.', 5000);
			} else if (matches[1].toString() == 'youjoined') {
				notifier.danger('You joined a mighty opponent!', 5000);
				gameState.joinMatch();
			} else if (matches[1].toString() == 'turn') {
				if (DEBUG) console.log('YOUR TURN!!');
				gameState.newTurn();
				opponentGridCursor.opacity = 0.5;
			} else if (matches[1].toString() == 'battlestart') {
				if (DEBUG) console.log($gameState.opponentCommitments);
			} else if (matches[1].toString() == 'commit') {
				const s = matches[5].split(',');
				const flatIndex = parseInt(s[0]);
				gameState.recordOpponentCommitment(flatIndex, matches[3])
				if (DEBUG) console.log(`opponentCommitments[${flatIndex}] = ${matches[3]}`);
			} else if (matches[1].toString() == 'prove') {
				const s = matches[5].split(',');
				const cell = { x: s[0], y: s[1] };
				const proof = getProof(cell);
				websocket.send('proof ' + proof + ' ' + matches[5]);
			} else if (matches[1].toString() == 'proof') {
				const s = matches[5].split(',');
				const cell = { x: s[0], y: s[1] };
				await verifyProof(cell, matches[3]);
			} else if (matches[1].toString() == 'miss') {
				// @ts-ignore
				fabric.loadSVGFromURL(
					'/miss.svg',
					function (/** @type {any} */ objects, /** @type {any} */ options) {
						// @ts-ignore
						var obj = fabric.util.groupSVGElements(objects, options);
						obj.set('width', cellSize);
						obj.set('height', cellSize);

						let s = matches[5].toString().split(',');
						const x = parseInt(s[0]);
						const y = parseInt(s[1]);
						obj.left = x * cellSize;
						obj.top = y * cellSize;

						obj.selectable = false;
						obj.evented = false;

						opponentCanvas.remove($gameState.opponentBoard[x - 1 + (y - 1) * gridSize]);
						opponentCanvas.add(obj);
						gameState.recordOpponentResult(x - 1 + (y - 1) * gridSize, obj);
					}
				);
				websocket.send('prove ' + matches[5]);
			} else if (matches[1].toString() == 'hit') {
				// @ts-ignore
				fabric.loadSVGFromURL(
					'/hit.svg',
					function (/** @type {any} */ objects, /** @type {any} */ options) {
						// @ts-ignore
						var obj = fabric.util.groupSVGElements(objects, options);
						obj.set('width', cellSize);
						obj.set('height', cellSize);

						let s = matches[5].toString().split(',');
						const x = parseInt(s[0]);
						const y = parseInt(s[1]);
						obj.left = x * cellSize;
						obj.top = y * cellSize;

						obj.selectable = false;
						obj.evented = false;

						opponentCanvas.remove($gameState.opponentBoard[x - 1 + (y - 1) * gridSize]);
						opponentCanvas.add(obj);
						gameState.recordOpponentResult(x - 1 + (y - 1) * gridSize, obj);
					}
				);
				websocket.send('prove ' + matches[5]);
			}
		}
	}

	/**
	 * @param {string} id
	 */
	function drawCanvas(id) {
		// @ts-ignore
		const canvas = new fabric.Canvas(id);
		canvas.hoverCursor = 'pointer';
		canvas.selection = false;
		canvas.targetFindTolerance = 2;
		makeGrid({ x: 0, y: 0 }, gridSize, cellSize, canvas);

		return canvas;
	}

	/**
	 * @param {{ x: any; y: any; }} coords
	 * @param {number} gridSize
	 * @param {number} cellSize
	 * @param {{ add: (arg0: any) => void; }} canvas
	 */
	function makeGrid(coords, gridSize, cellSize, canvas) {
		let lines = [];

		// Drawing vertical lines
		for (var x = 1; x <= gridSize + 1; x += 1) {
			lines.push(
				makeLine([
					coords.x + x * cellSize,
					coords.y + cellSize,
					coords.x + x * cellSize,
					coords.y + gridSize * cellSize + cellSize
				])
			);
		}

		// Drawing horizontal lines
		for (var y = 1; y <= gridSize + 1; y += 1) {
			lines.push(
				makeLine([
					coords.x + cellSize,
					coords.y + y * cellSize,
					coords.x + gridSize * cellSize + cellSize,
					coords.y + y * cellSize
				])
			);
		}

		// @ts-ignore
		canvas.add(...lines);

		// A - J
		const letters = 'ABCDEFGHIJ';
		for (var z = 0; z < gridSize; z += 1) {
			canvas.add(
				// @ts-ignore
				new fabric.Text(letters.charAt(z), {
					fontFamily: 'monospace',
					fontSize: 14,
					top: cellSize + coords.y + z * cellSize + cellSize / 2 - 7,
					left: coords.x + cellSize / 2,
					selectable: false,
					evented: false,
					hasControls: false,
					hasBorders: false
				})
			);
		}

		// 1 - 10
		for (var a = 1; a <= gridSize; a += 1) {
			canvas.add(
				// @ts-ignore
				new fabric.Text(a.toString(), {
					fontFamily: 'monospace',
					fontSize: 14,
					top: coords.y + cellSize / 2,
					left: cellSize + coords.x + (a - 1) * cellSize + cellSize / 2 - 5,
					selectable: false,
					evented: false,
					hasControls: false,
					hasBorders: false
				})
			);
		}
	}

	/**
	 * @param {{ angle: number; left: number; top: number; height: any; width: any; }} rect
	 * @param {number} gridSize
	 * @param {number} cellSize
	 */
	function testRectInsideGrid(rect, gridSize, cellSize) {
		if (rect.angle == 0)
			return (
				rect.left >= cellSize &&
				rect.top >= cellSize &&
				rect.top + rect.height <= (gridSize + 1) * cellSize &&
				rect.left + rect.width <= (gridSize + 1) * cellSize
			);
		else
			return (
				rect.left >= 2 * cellSize &&
				rect.top >= cellSize &&
				rect.left <= (gridSize + 1) * cellSize &&
				rect.top + rect.width <= (gridSize + 1) * cellSize
			);
	}

	/**
	 * @param {any[]} coords
	 */
	function makeLine(coords) {
		// @ts-ignore
		return new fabric.Line(coords, {
			fill: 'black',
			stroke: 'black',
			strokeWidth: 1,
			selectable: false,
			evented: false
		});
	}

	/**
	 * @param {number} cellSize
	 * @param {string} color
	 */
	function makeCursor(cellSize, color) {
		// @ts-ignore
		let cursor = new fabric.Rect({
			left: cellSize,
			top: cellSize,
			fill: color,
			width: cellSize,
			height: cellSize,
			evented: false,
			selectable: false,
			opacity: 0
		});
		cursor.perPixelTargetFind = true;
		cursor.hasControls = cursor.hasBorders = false;
		return cursor;
	}

	/**
	 * @param {{ angle: number; left: number; setCoords: () => void; }} ship
	 * @param {number} cellSize
	 */
	function toggleShip(ship, cellSize) {
		if (ship.angle == 0) {
			ship.left = ship.left + cellSize;
			ship.angle = 90;
		} else {
			ship.left = ship.left - cellSize;
			ship.angle = 0;
		}

		ship.setCoords();
	}

	function startNewGame() {
		websocket.send('startgame');
		gameState.newGame();
		dropShips();

		notifier.info(
			'We are looking for an opponent for you. In the meantime you can place your ships...',
			5000
		);
	}

	function dropShips() {
		myCanvas.on({
			'object:moving': function (
				/** @type {{ target: { width?: any; angle: any; left?: any; top?: any; }; }} */ e
			) {
				if (gridCursor.opacity == 0) {
					gridCursor.opacity = 0.5;
					gridCursor.set('width', e.target.width);
					gridCursor.angle = e.target.angle;
				}

				if (isHorizontal(e.target)) {
					gridCursor.left = clamp(
						Math.round(e.target.left / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize - e.target.width + cellSize
					);
					gridCursor.top = clamp(
						Math.round(e.target.top / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize
					);
				} else {
					gridCursor.left = clamp(
						Math.round(e.target.left / cellSize) * cellSize,
						2 * cellSize,
						cellSize * gridSize + cellSize
					);
					gridCursor.top = clamp(
						Math.round(e.target.top / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize - e.target.width + cellSize
					);
				}

				if (!testRectInsideGrid(gridCursor, gridSize, cellSize)) {
					gridCursor.set('fill', '#c7121f');
					console.log('outside');
				} else {
					gridCursor.set('fill', '#32a797');
					console.log('inside');
				}
			},
			'object:modified': function (
				/** @type {{ target: { left?: any; width?: any; top?: any; setCoords?: any; angle?: number; }; }} */ e
			) {
				gridCursor.opacity = 0;

				// @ts-ignore
				if (isHorizontal(e.target)) {
					e.target.left = clamp(
						Math.round(e.target.left / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize - e.target.width + cellSize
					);
					e.target.top = clamp(
						Math.round(e.target.top / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize
					);
				} else {
					e.target.left = clamp(
						Math.round(e.target.left / cellSize) * cellSize,
						2 * cellSize,
						cellSize * gridSize + cellSize
					);
					e.target.top = clamp(
						Math.round(e.target.top / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize - e.target.width + cellSize
					);
				}

				e.target.setCoords();

				if (snapshotShipsPosition() == 17) gameState.positionShip();
			},
			'mouse:dblclick': function (/** @type {{ pointer: any; }} */ e) {
				if ($gameState.gameState != GameState.Positioning) return;

				for (var i = 0; i < ships.length; i++) {
					if (ships[i].containsPoint(e.pointer)) {
						toggleShip(ships[i], cellSize);
						myCanvas.renderAll();

						if (snapshotShipsPosition() == 17) gameState.positionShip();
						break;
					}
				}
			}
		});

		for (let i = 0; i < ships.length; i++) {
			ships[i].left = (gridSize + 1) * cellSize;
			ships[i].top = (i + 1) * cellSize;
			ships[i].customID = shipId++;
			ships[i].perPixelTargetFind = true;
			ships[i].hasControls = ships[i].hasBorders = false;
		}

		myCanvas.add(...ships);
	}

	function snapshotShipsPosition() {
		Array.from({ length: gridSize * gridSize }, () => 0);

		let cellOccupied = 0;

		for (var s = 0; s < ships.length; s++) {
			const ship = ships[s];
			const cell = pointToGridCell({
				x: ship.left + (isHorizontal(ship) ? 0 : -cellSize),
				y: ship.top
			});
			const width = shipIdToWidth(ship.customID);

			if (width && cell && testRectInsideGrid(ship, gridSize, cellSize)) {
				if (isHorizontal(ship)) {
					for (let i = 0; i < width; i++) {
						gameState.signalShip(cell.x, cell.y);
						cellOccupied++;
					}
				} else {
					for (let i = 0; i < width; i++) {
						gameState.signalShip(cell.x, cell.y);
						cellOccupied++;
					}
				}
			}
		}

		return cellOccupied;
	}

	/**
	 * @param {Number} shipId
	 */
	function shipIdToWidth(shipId) {
		const map = new Map(Object.entries({ ship0: 5, ship1: 4, ship2: 3, ship3: 3, ship4: 2 }));
		return map.get('ship' + shipId.toString());
	}

	/**
	 * @param {{ angle: number; }} ship
	 */
	function isHorizontal(ship) {
		return ship.angle == 0;
	}

	function joinGame() {
		gameState.openLobby();
		gameState.joinMatch('random-id');

		websocket.send('join');

		dropShips();
	}

	async function lockPositions() {
		gameState.lockShips();

		for (var i = 0; i < ships.length; i++) {
			ships[i].selectable = ships[i].evented = false;
			ships[i].setCoords();
		}
		myCanvas.renderAll();

		notifier.info('No opponent found. So we are matching you against our strongest AI!', 5000);

		opponentCanvas.on({
			'mouse:down': function (/** @type {{ pointer: { x: number; y: number; }; }} */ e) {
				if ($gameState.gameState != GameState.InGame || !$gameState.myTurn) return;

				let cell = pointToGridCell(e.pointer);

				if (cell && $gameState.opponentBoard[cell.x - 1 + (cell.y - 1) * gridSize] == null) {
					// @ts-ignore
					fabric.loadSVGFromURL(
						'/pending.svg',
						function (/** @type {any} */ objects, /** @type {any} */ options) {
							// @ts-ignore
							var obj = fabric.util.groupSVGElements(objects, options);
							obj.set('width', cellSize);
							obj.set('height', cellSize);

							obj.left = cell.x * cellSize;
							obj.top = cell.y * cellSize;

							obj.selectable = false;
							obj.evented = false;

							opponentCanvas.add(obj);
							gameState.recordOpponentResult(cell.x - 1 + (cell.y - 1) * gridSize, obj);
						}
					);

					gameState.finishTurn();
					opponentGridCursor.opacity = 0;

					websocket.send('shoot ' + cell.x + ',' + cell.y);
				}
			},
			'mouse:move': function (/** @type {{ pointer: { x: number; y: number; }; }} */ e) {
				if ($gameState.myTurn) {
					opponentGridCursor.left = clamp(
						Math.floor(e.pointer.x / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize
					);
					opponentGridCursor.top = clamp(
						Math.floor(e.pointer.y / cellSize) * cellSize,
						cellSize,
						cellSize * gridSize
					);
					opponentGridCursor.setCoords();
					opponentCanvas.renderAll();
				}
			}
		});

		for (var x = 1; x <= 10; x++) {
			for (var y = 1; y <= 10; y++) {
				gameState.generateSalt(x, y);
				const flatIndex = x - 1 + (y - 1) * gridSize;
				const commit = await generateCommitment($gameState.myBoard[flatIndex], $gameState.mySalts[flatIndex]);
				websocket.send('commit ' + commit + ' ' + flatIndex + ',0');
			}
		}
	}

	/**
	 * @param {{ x: any; y: any; }} cell
	 */
	function getProof(cell) {
		const flatIndex = cell.x - 1 + (cell.y - 1) * gridSize;
		return $gameState.myBoard[flatIndex].toString() + $gameState.mySalts[flatIndex].toString();
	}

	/**
	 * @param {{ x: any; y: any; }} cell
	 * @param {string} proof
	 */
	async function verifyProof(cell, proof) {
		const flatIndex = parseInt(cell.x) - 1 + (parseInt(cell.y) - 1) * gridSize;
		// @ts-ignore
		const computedCommit = await generateCommitment(proof.at(0), proof.substring(1));

		console.log(cell);
		console.log(
			'CHECK: ' +
				flatIndex +
				' ' +
				proof.at(0) +
				' ' +
				proof.substring(1) +
				' ' +
				computedCommit +
				', ' +
				$gameState.opponentCommitments[flatIndex]
		);

		if (computedCommit != $gameState.opponentCommitments[flatIndex]) {
			console.log('CHEATER detected!');
		} else {
			console.log('All good');
		}
	}

	/**
	 * @param {{ x: number; y: number; }} point
	 */
	function pointToGridCell(point) {
		let xCell = Math.floor(point.x / cellSize);
		let yCell = Math.floor(point.y / cellSize);

		if (xCell <= 0 || xCell > gridSize || yCell <= 0 || yCell > gridSize) return null;

		return { x: xCell, y: yCell };
	}

	function resetPositions() {
		for (var i = 0; i < ships.length; i++) {
			ships[i].left = (gridSize + 1) * cellSize;
			ships[i].top = (parseInt(ships[i].customID) + 1) * cellSize;
			ships[i].setCoords();
		}
		myCanvas.renderAll();
		gameState.resetShipsPosition();
	}

	/**
	 * @param {number} emojiIndex
	 */
	function sendEmoji(emojiIndex) {
		const emojis = ['😜', '🫡', '😵', '🤯', '🫣', '🛟'];
		websocket.send('emoji ' + emojis[emojiIndex]);
	}

	function giveUp() {
		gameState.endMatch();
		gameState.reset();
		websocket.send('giveup');

		notifier.warning(
			"You lose the battle, commander. But at least you saved your men's life. The war is not over yet.",
			10000
		);
	}

	/**
	 * @param {{ x: number; y: number; }} cell
	 */
	function receiveShot(cell) {
		// @ts-ignore
		fabric.loadSVGFromURL(
			'/shot.svg',
			function (/** @type {any} */ objects, /** @type {any} */ options) {
				// @ts-ignore
				var obj = fabric.util.groupSVGElements(objects, options);
				obj.set('width', cellSize);
				obj.set('height', cellSize);

				obj.left = cell.x * cellSize;
				obj.top = cell.y * cellSize;

				obj.selectable = false;
				obj.evented = false;

				myCanvas.add(obj);
				myCanvas.renderAll();
			}
		);
	}
</script>

<Header title="Battleships" subtitle="Battleships game with zero knowledge proof" />

<div id="buttons" style="margin-left: 1rem; display: flex; flex-direction: row; gap: 1rem;">
	{#if !connected}
		<p>
			<button
				class="w3-button w3-ripple w3-round w3-text-white"
				style="background-color: #c83737ff;"
			>
				<Moon size="15" color="#ffffff" unit="px" duration="1s" />
				Connecting to server ...
			</button>
		</p>
	{:else}
		{#if $gameState.gameState == GameState.Pending || $gameState.gameState == GameState.Over}
			<p>
				<button class="w3-button w3-ripple w3-green w3-round" on:click={startNewGame}
					>🎮 Start New Game</button
				>
			</p>
			<p>
				<button class="w3-button w3-ripple w3-green-alt w3-round" on:click={joinGame}
					>🚪 Join Game</button
				>
			</p>
		{/if}

		{#if $gameState.gameState == GameState.Positioning || $gameState.gameState == GameState.Positioned}
			<p style="margin: auto 0;">
				{#if $gameState.gameState == GameState.Positioning}
				<button
					class="w3-button w3-ripple w3-red-light w3-round w3-disabled"
					>🔒 Lock Positions</button
				>
				{:else}
				<button
					class="w3-button w3-ripple w3-red-light w3-round"
					on:click={lockPositions}>🔒 Lock Positions</button
				>
				{/if}
			</p>
			<p style="margin: auto 0;">
				<button class="w3-button w3-ripple w3-blue w3-round" on:click={resetPositions}
					>↩️ Reset Positions</button
				>
			</p>
			<p style="margin: auto;">
				<button class="w3-button w3-ripple w3-theme w3-round" on:click={giveUp}>🏳️ Give Up</button>
			</p>			
		{/if}

		{#if $gameState.gameState == GameState.InGame}
			<p style="margin: auto;">
				<button
					class="w3-button w3-ripple w3-green w3-round"
					on:click={() => settings.muteOpponent(!$settings.opponentMuted)}
					>{#if $settings.opponentMuted}🔊 Unm{:else}🤐 M{/if}ute Opponent</button
				>
			</p>
			<div class="w3-dropdown-hover w3-mobile" style="margin: auto 0;">
				<button class="w3-button w3-ripple w3-yellow w3-round">😀 Send Emoji</button>
				<div class="w3-dropdown-content w3-dark-yellow">
					<button on:click={() => sendEmoji(0)} class="w3-bar-item w3-button w3-mobile w3-center"
						>😜</button
					>
					<button on:click={() => sendEmoji(1)} class="w3-bar-item w3-button w3-mobile w3-center"
						>🫡</button
					>
					<button on:click={() => sendEmoji(2)} class="w3-bar-item w3-button w3-mobile w3-center"
						>😵</button
					>
					<button on:click={() => sendEmoji(3)} class="w3-bar-item w3-button w3-mobile w3-center"
						>🤯</button
					>
					<button on:click={() => sendEmoji(4)} class="w3-bar-item w3-button w3-mobile w3-center"
						>🫣</button
					>
					<button on:click={() => sendEmoji(5)} class="w3-bar-item w3-button w3-mobile w3-center"
						>🛟</button
					>
				</div>
			</div>
			<p style="margin: auto;">
				<button class="w3-button w3-ripple w3-theme w3-round" on:click={giveUp}>🏳️ Give Up</button>
			</p>
			<p style="margin: auto 0;">
				<small><em>Turn number:</em></small>
				{$gameState.turn}
			</p>
		{/if}
		<p style="maring: auto 0;">
			<small
				><em>
					{#await stats}
						...
					{:then data}
						Online Players: {data.onlinePlayers} <br />
						Matches: {data.pendingMatches} (Pending), {data.ongoingMatches} (Ongoing), {data.finishedMatches}
						(Finished), {data.totalMatches} (Total)
					{:catch}
						...
					{/await}
				</em></small
			>
		</p>
	{/if}
</div>

<div style="display: flex; flex-direction: row; width: max-content;">
	<div>
		<div>
			<h2>Opponent's board</h2>
			<canvas id="opponent" width="800" height="600"></canvas>
		</div>
		<hr style="" />
		<div>
			<h2>My board</h2>
			<canvas id="mine" width="800" height="600"></canvas>
		</div>
	</div>
</div>

<style>
	hr {
		border: 1px solid var(--jet);
		border-radius: 1px;
		width: 85%;
		text-align: center;
		margin: auto;
	}

	:global(#buttons .wrapper) {
		display: inline-flex;
	}
</style>
