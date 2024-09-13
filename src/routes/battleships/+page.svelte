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

	/**
	 * @type {number}
	 */
	let canvasWidth;

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
		let res;
		try {
			res = await fetch(API_URL + '/battleships/stats', {
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			});

			return res.json();
		} catch {
			return res;
		}
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
				const horizontal = isHorizontal(e.target);

				if (horizontal) {
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

				const cell = pointToGridCell({
					x: e.target.left + (horizontal ? 0 : -cellSize),
					y: e.target.top
				});

				if (cell) {
					snapshotShipsPosition();
					// @ts-ignore
					gameState.positionShip(e.target.customID, cell.x, cell.y, horizontal);
				}
			},
			'mouse:dblclick': function (/** @type {{ pointer: any; }} */ e) {
				if (
					$gameState.gameState != GameState.Positioning &&
					$gameState.gameState != GameState.Positioned
				)
					return;

				for (var i = 0; i < ships.length; i++) {
					if (ships[i].containsPoint(e.pointer)) {
						toggleShip(ships[i], cellSize);
						myCanvas.renderAll();

						const horizontal = isHorizontal(ships[i]);
						const cell = pointToGridCell({
							x: ships[i].left + (horizontal ? 0 : -cellSize),
							y: ships[i].top
						});

						if (cell) {
							snapshotShipsPosition();
							gameState.positionShip(ships[i].customID, cell.x, cell.y, horizontal);
						}

						break;
					}
				}
			}
		});

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

					if ($gameState.myShips[i]) {
						dropShip(
							i,
							$gameState.myShips[i].x,
							$gameState.myShips[i].y,
							$gameState.myShips[i].isHorizontal
						);
					} else if ($gameState.gameState == GameState.Positioning) {
						dropShip(i);
					}
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
			const command = matches[1].toString();
			const commitment = matches[3];
			const cell = stringToCell(matches[5]);

			if (command == 'shot') {
				// @ts-ignore
				receiveShot(cell);
				// @ts-ignore
				if ($gameState.myBoard[cell.x - 1][cell.y - 1] == 0) {
					websocket.send('miss ' + matches[5]);
					// @ts-ignore
				} else if ($gameState.myBoard[cell.x - 1][cell.y - 1] == 1) {
					websocket.send('hit ' + matches[5]);
					gameState.decreaseHp();

					if ($gameState.hp == 0) {
						websocket.send('lose');
						gameState.endMatch();
						notifier.danger('You lose. RIP Commander!', 10000);
					}
				}
			} else if (command == 'gaveup') {
				notifier.success(
					'You won the battle, Commander. The opponent is retreating! Congratulations',
					10000
				);
				gameState.endMatch();
			} else if (command == 'lose') {
				notifier.success(
					'You won the battle, Commander. The opponent has been annihilated! Congratulations',
					10000
				);
				gameState.endMatch();
			} else if (command == 'receive' && !$settings.opponentMuted) {
				notifier.info('Opponent sent you: ' + matches[7].toString(), 5000);
			} else if (command == 'joined') {
				notifier.danger('An opponent joined you! Good luck, commander.', 5000);
				gameState.opponentJoin();
			} else if (command == 'youjoined') {
				notifier.danger('You joined a mighty opponent!', 5000);
				gameState.joinMatch();
			} else if (command == 'turn') {
				if (DEBUG) console.log('YOUR TURN!!');
				gameState.newTurn();
				opponentGridCursor.opacity = 0.5;
			} else if (command == 'battlestart') {
				if (DEBUG) console.log($gameState.opponentCommitments);
			} else if (command == 'commit') {
				// @ts-ignore
				gameState.recordOpponentCommitment(cell.x, cell.y, commitment);
				// @ts-ignore
				if (DEBUG) console.log(`opponentCommitments[${cell.x - 1}][${cell.y - 1}] = ${commitment}`);
			} else if (command == 'prove') {
				// @ts-ignore
				const proof = getProof(cell);
				websocket.send('proof ' + proof + ' ' + matches[5]);
			} else if (command == 'proof') {
				// @ts-ignore
				await verifyProof(cell, commitment);
			} else if (command == 'miss') {
				// @ts-ignore
				fabric.loadSVGFromURL(
					'/miss.svg',
					function (/** @type {any} */ objects, /** @type {any} */ options) {
						// @ts-ignore
						var obj = fabric.util.groupSVGElements(objects, options);
						obj.set('width', cellSize);
						obj.set('height', cellSize);

						// @ts-ignore
						obj.left = cell.x * cellSize;
						// @ts-ignore
						obj.top = cell.y * cellSize;

						obj.selectable = false;
						obj.evented = false;

						// @ts-ignore
						opponentCanvas.remove($gameState.opponentBoard[cell.x - 1][cell.y - 1]);
						opponentCanvas.add(obj);
						// @ts-ignore
						gameState.recordOpponentResult(cell.x, cell.y, obj);
					}
				);
				websocket.send('prove ' + matches[5]);
			} else if (command == 'hit') {
				// @ts-ignore
				fabric.loadSVGFromURL(
					'/hit.svg',
					function (/** @type {any} */ objects, /** @type {any} */ options) {
						// @ts-ignore
						var obj = fabric.util.groupSVGElements(objects, options);
						obj.set('width', cellSize);
						obj.set('height', cellSize);

						// @ts-ignore
						obj.left = cell.x * cellSize;
						// @ts-ignore
						obj.top = cell.y * cellSize;

						obj.selectable = false;
						obj.evented = false;

						// @ts-ignore
						opponentCanvas.remove($gameState.opponentBoard[cell.x - 1][cell.y - 1]);
						opponentCanvas.add(obj);
						// @ts-ignore
						gameState.recordOpponentResult(cell.x, cell.y, obj);
					}
				);
				websocket.send('prove ' + matches[5]);
			}
		}
	}

	/**
	 * @param {string} str
	 * @returns {{x: number, y: number}|null}
	 */
	function stringToCell(str) {
		if (!str) return null;

		const s = str.split(',');
		if (s.length != 2) return null;

		return { x: parseInt(s[0]), y: parseInt(s[1]) };
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

		let canvasHeight = ((canvasWidth - 10) * 600) / 800;

		canvas.setDimensions({ width: canvasWidth - 10, height: canvasHeight });
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
		for (let i = 0; i < ships.length; i++) {
			dropShip(i);
		}
	}

	/**
	 * @param {number} i
	 * @param {number | undefined} [x]
	 * @param {number | undefined} [y]
	 * @param {boolean | undefined} [isHorizontal]
	 */
	function dropShip(i, x, y, isHorizontal) {
		if (ships[i]) {
			if (x) ships[i].left = (x + (isHorizontal ? 0 : 1)) * cellSize;
			else ships[i].left = (gridSize + 1) * cellSize;
			if (y) ships[i].top = y * cellSize;
			else ships[i].top = (i + 1) * cellSize;

			if (isHorizontal !== undefined && !isHorizontal) ships[i].angle = 90;

			ships[i].customID = i;
			ships[i].perPixelTargetFind = true;
			ships[i].hasControls = ships[i].hasBorders = false;
		}

		myCanvas.add(ships[i]);
	}

	function snapshotShipsPosition() {
		for (var s = 0; s < ships.length; s++) {
			const ship = ships[s];
			const cell = pointToGridCell({
				x: ship.left + (isHorizontal(ship) ? 0 : -cellSize),
				y: ship.top
			});
			const width = shipIdToWidth(ship.customID);

			if (width && cell && testRectInsideGrid(ship, gridSize, cellSize)) {
				for (let i = 0; i < width; i++) {
					if (isHorizontal(ship)) gameState.signalShip(cell.x + i, cell.y);
					else gameState.signalShip(cell.x, cell.y + i);
				}
			}
		}
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

	/*function matchedAgainstAI() {
		notifier.info('No opponent found. So we are matching you against our strongest AI!', 5000);
	}*/

	async function lockPositions() {
		gameState.lockShips();

		for (var i = 0; i < ships.length; i++) {
			ships[i].selectable = ships[i].evented = false;
			ships[i].setCoords();
		}
		myCanvas.renderAll();

		opponentCanvas.on({
			'mouse:down': function (/** @type {{ pointer: { x: number; y: number; }; }} */ e) {
				if ($gameState.gameState != GameState.InGame || !$gameState.myTurn) return;

				let cell = pointToGridCell(e.pointer);

				if (cell && $gameState.opponentBoard[cell.x - 1][cell.y - 1] == null) {
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
							gameState.recordOpponentResult(cell.x, cell.y, obj);
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
				const commit = await generateCommitment(
					$gameState.myBoard[x - 1][y - 1],
					$gameState.mySalts[x - 1][y - 1]
				);
				websocket.send('commit ' + commit + ' ' + x.toString() + ',' + y.toString());
			}
		}
	}

	/**
	 * @param {{ x: any; y: any; }} cell
	 */
	function getProof(cell) {
		return (
			$gameState.myBoard[cell.x - 1][cell.y - 1].toString() +
			$gameState.mySalts[cell.x - 1][cell.y - 1].toString()
		);
	}

	/**
	 * @param {{ x: any; y: any; }} cell
	 * @param {string} proof
	 */
	async function verifyProof(cell, proof) {
		// @ts-ignore
		const computedCommit = await generateCommitment(proof.at(0), proof.substring(1));

		console.log(cell);
		console.log(
			'CHECK: ' +
				cell +
				' ' +
				proof.at(0) +
				' ' +
				proof.substring(1) +
				' ' +
				computedCommit +
				', ' +
				$gameState.opponentCommitments[cell.x - 1][cell.y - 1]
		);

		if (computedCommit != $gameState.opponentCommitments[cell.x - 1][cell.y - 1]) {
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
			ships[i].angle = 0;
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

<Header
	bind:clientWidth={canvasWidth}
	title="Battleships"
	subtitle="Battleships game with zero knowledge proof"
/>

<p>&nbsp;</p>

<div id="buttons" class="w3-bar w3-blue-grey" style="font-size: small;">
	{#if !connected}
		<button
			class="w3-bar-item w3-button w3-mobile w3-text-white"
			style="background-color: #c83737ff;"
		>
			<Moon size="15" color="#ffffff" unit="px" duration="1s" />
			Connecting to server ...
		</button>
	{:else}
		<div class="w3-dropdown-hover w3-mobile w3-right" style="margin: auto 0;">
			<button class="w3-button w3-mobile w3-khaki">🔍 Stats</button>
			<div class="w3-dropdown-content w3-dark-yellow">
				<p style="padding: 0 1rem;">
					<small
						><em>
							{#await stats}
								Online Players: ...
							{:then data}
								Online Players: {data.onlinePlayers}
							{:catch}
								Online Players: ...
							{/await}
						</em></small
					>
				</p>
				<p style="padding: 0 1rem;">
					<small
						><em>
							{#await stats}
								Pending Matches: ...
							{:then data}
								Pending Matches: {data.pendingMatches}
							{:catch}
								Pending Matches: ...
							{/await}
						</em></small
					>
				</p>
				<p style="padding: 0 1rem;">
					<small
						><em>
							{#await stats}
								Ongoing Matches: ...
							{:then data}
								Ongoing Matches: {data.ongoingMatches}
							{:catch}
								Ongoing Matches: ...
							{/await}
						</em></small
					>
				</p>
				<p style="padding: 0 1rem;">
					<small
						><em>
							{#await stats}
								Finished Matches: ...
							{:then data}
								Finished Matches: {data.finishedMatches}
							{:catch}
								Finished Matches: ...
							{/await}
						</em></small
					>
				</p>
				<p style="padding: 0 1rem;">
					<small
						><em>
							{#await stats}
								Total Matches: ...
							{:then data}
								Total Matches: {data.totalMatches}
							{:catch}
								Total Matches: ...
							{/await}
						</em></small
					>
				</p>
			</div>
		</div>

		{#if $gameState.gameState == GameState.Pending || $gameState.gameState == GameState.Over}
			<button class="w3-bar-item w3-button w3-mobile w3-green" on:click={startNewGame}
				>🎮 Start New Game</button
			>
			<button class="w3-bar-item w3-button w3-mobile w3-green-alt" on:click={joinGame}
				>🚪 Join Game</button
			>
		{/if}

		{#if $gameState.gameState == GameState.InGame || $gameState.gameState == GameState.Positioning || $gameState.gameState == GameState.Positioned}
			<button class="w3-bar-item w3-button w3-mobile w3-theme" on:click={giveUp}>🏳️ Give Up</button>
		{/if}

		{#if $gameState.gameState == GameState.InGame}
			<p class="w3-bar-item w3-mobile w3-center" style="margin: auto;">
				<small><em>Turn number:</em></small>
				{$gameState.turn}
			</p>
		{/if}
	{/if}
</div>

<div class="w3-container w3-border" style="display: flex; flex-direction: column; padding: 0;">
	<div>
		<div class="w3-bar w3-dark-grey">
			<span class="w3-bar-item w3-mobile"><strong>Opponent's board</strong></span>

			{#if $gameState.gameState == GameState.InGame || $gameState.gameState == GameState.Positioning || $gameState.gameState == GameState.Positioned}
				<button
					class="w3-bar-item w3-button w3-mobile w3-text-white w3-right"
					style="background-color: rgb(82 177 65);"
				>
					{#if !$gameState.opponentJoined}
						<div style="display: inline-block;">
							<Moon size="15" color="#ffffff" unit="px" duration="1s" />
						</div>
						Waiting for an opponent...
					{:else}
						🟢 Opponent online.
					{/if}
				</button>
			{/if}

			{#if ($gameState.gameState == GameState.InGame || $gameState.gameState == GameState.Positioning || $gameState.gameState == GameState.Positioned) && $gameState.opponentJoined}
				<button
					class="w3-bar-item w3-button w3-mobile w3-green w3-right"
					on:click={() => settings.muteOpponent(!$settings.opponentMuted)}
					>{#if $settings.opponentMuted}🔊 Unm{:else}🤐 M{/if}ute Opponent</button
				>
				<div class="w3-dropdown-hover w3-mobile w3-right" style="margin: auto 0;">
					<button class="w3-button w3-mobile w3-yellow">😀 Send Emoji</button>
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
			{/if}
		</div>
		<canvas style="margin: auto;" id="opponent"></canvas>
	</div>
	<div class="w3-bar">
		<div class="w3-bar w3-dark-grey">
			<span class="w3-bar-item w3-mobile"><strong>My board</strong></span>
			{#if $gameState.gameState == GameState.Positioning || $gameState.gameState == GameState.Positioned}
				<button class="w3-bar-item w3-button w3-mobile w3-blue w3-right" on:click={resetPositions}
					>↩️ Reset Positions</button
				>
				{#if $gameState.gameState == GameState.Positioned && $gameState.opponentJoined}
					<button
						class="w3-bar-item w3-button w3-mobile w3-red-light w3-right"
						on:click={lockPositions}>🔒 Lock Positions</button
					>
				{:else}
					<button class="w3-bar-item w3-button w3-mobile w3-red-light w3-disabled w3-right"
						>🔒 Lock Positions</button
					>
				{/if}
			{/if}
		</div>
		<canvas style="margin: auto;" id="mine"></canvas>
	</div>
</div>

<style>
	:global(#buttons .wrapper) {
		display: inline-flex;
	}
</style>
