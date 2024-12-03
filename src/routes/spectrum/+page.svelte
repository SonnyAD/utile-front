<script>
	// @ts-nocheck

	import Header from '$lib/components/Header.svelte';

	import { startWebsocket } from '$lib/spectrum/websocket';
	import { getPlayerId } from '$lib/battleships/playerId';
	import { onMount } from 'svelte';
	import { fabric } from 'fabric';

	const palette = ['ffe680', 'ff9955', 'ff5555', 'aade87', 'aaeeff', 'c6afe9'];

	/**
	 * @type {number}
	 */
	let canvasWidth;

	/**
	 * @type {any}
	 */
	let myCanvas;

	/**
	 * @type {Promise<any>}
	 */
	//let stats;

	/**
	 * @type {number}
	 */
	const updateTick = 125;

	/**
	 * @type {WebSocket}
	 */
	let websocket;
	//let connected = false;
	/**
	 * @type {string}
	 */
	let userId;
	/**
	 * @type {string}
	 */
	let nickname;
	let initialized = false;

	/**
	 * @type {{ left: any; top: any; }}
	 */
	let myPellet;
	let moving = false;
	const cells = [];
	const others = {};

	let claim = '';

	onMount(() => {
		websocket = startWebsocket(signIn, parseCommand, connectionLost);

		// Prepare Both Canvas
		myCanvas = drawCanvas('spectrum');

		myCanvas.on({
			'object:moving': function () {
				// /** @type {{ target: { width?: any; angle: any; left?: any; top?: any; }; }} */ e
				moving = true;
				//websocket.send(`update ${userId} ${e.target.left},${e.target.top}`);
			},
			'object:modified': function () {
				// /** @type {{ target: { left?: any; width?: any; top?: any; setCoords?: any; angle?: number; }; }} */ e
				moving = false;
			}
		});

		// @ts-ignore
		fabric.loadSVGFromURL(
			'/spectrum.svg',
			function (/** @type {any} */ objects, /** @type {any} */ options) {
				// @ts-ignore
				const svg = fabric.util.groupSVGElements(objects, options);

				let g = new fabric.Group([], {
					width: 800,
					height: 600
				});

				svg.scaleToHeight(g.height);

				g.addWithUpdate(svg);

				g.left = 36;
				g.top = 10;

				g.selectable = false;
				g.evented = false;

				const svgObjects = svg.getObjects();

				for (let i = 2; i <= 10; i++) {
					cells.push(svgObjects[i]);

					if (svgObjects[i].id == 'notReplied') {
						console.log(svgObjects[i].path);
					}
				}

				myCanvas.add(g);
				myCanvas.sendToBack(g);
			}
		);
	});

	function initPellet() {
		console.log('Initalizing Your Pellet');
		var options = {
			top: 230,
			left: 330
		};
		// @ts-ignore
		options.radius = 10;

		userId = palette[fabric.util.getRandomInt(0, 6)];
		let circle = new fabric.Circle({
			...options,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true
		});
		circle.hasBorders = circle.hasControls = false;
		myCanvas.add(circle);
		myPellet = circle;

		myCanvas.on({
			'object:moving': function ({ target }) {
				if (target != myPellet) return;

				for (let i = 0; i < cells.length; i++) {
					const cell = cells[i];
					const points = [];

					for (let index = 0; index < cell.path.length - 2; index++) {
						let pathPoint = cell.path[index];

						let p = [
							pathPoint[pathPoint.length - 2] * cell.scaleX - 18,
							pathPoint[pathPoint.length - 1] * cell.scaleY - 55
						];
						points.push(p);
					}

					if (cell.id == 'notReplied') {
						console.log(points);
					}

					if (pointInPolygon(points, [myPellet.left, myPellet.top])) {
						cell.set({ fill: 'blue' });
						console.log(cell);
					} else {
						if (cell.id == 'notReplied' || cell.id == 'indifferent') {
							cell.set({ fill: '#cccccc' });
						} else {
							cell.set({ fill: 'black' });
						}
					}
				}
			}
		});

		setInterval(updateMyPellet, updateTick);
		//animate();
	}

	/**
	 * Performs the even-odd-rule Algorithm (a raycasting algorithm) to find out whether a point is in a given polygon.
	 * This runs in O(n) where n is the number of edges of the polygon.
	 *
	 * @param {Array} polygon an array representation of the polygon where polygon[i][0] is the x Value of the i-th point and polygon[i][1] is the y Value.
	 * @param {Array} point   an array representation of the point where point[0] is its x Value and point[1] is its y Value
	 * @return {boolean} whether the point is in the polygon (not on the edge, just turn < into <= and > into >= for that)
	 */
	const pointInPolygon = function (polygon, point) {
		//A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
		let odd = false;
		//For each edge (In this case for each point of the polygon and the previous one)
		for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
			//If a line from the point into infinity crosses this edge
			if (
				polygon[i][1] > point[1] !== polygon[j][1] > point[1] && // One point needs to be above, one below our y coordinate
				// ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
				point[0] <
					((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1])) /
						(polygon[j][1] - polygon[i][1]) +
						polygon[i][0]
			) {
				// Invert odd
				odd = !odd;
			}
			j = i;
		}
		//If the number of crossings was odd, the point is in the polygon
		return odd;
	};

	/**
	 * @param {string} userId
	 */
	function initOtherPellet(userId) {
		console.log('Initalizing Other Pellet: ' + userId);
		var options = {
			top: 230,
			left: 330
		};
		// @ts-ignore
		options.radius = 10;

		let circle = new fabric.Circle({
			...options,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true,
			selectable: false,
			evented: false,
			hasControls: false,
			hasBorders: false
		});
		myCanvas.add(circle);
		return circle;
	}

	/**
	 * @param {string} otherUserId
	 * @param {{ x: number; y: number; } | null} coords
	 */
	function updatePellet(otherUserId, coords) {
		// New user
		if (!others[otherUserId]) {
			others[otherUserId] = { pellet: initOtherPellet(otherUserId), targets: [coords] };
		} else {
			// known user
			others[otherUserId].targets.push(coords);

			// Only keep 5 points max
			if (others[otherUserId].targets.length >= 5)
				others[otherUserId].targets = others[otherUserId].targets.slice(1, 6);
		}

		if (others[otherUserId].cancel) {
			others[otherUserId].cancel();
		}

		//others[otherUserId].target = coords;

		const cancel = animatePellet(otherUserId, coords);
		others[otherUserId].cancel = () => {
			cancel.cancelX();
			cancel.cancelY();
		};
	}

	function updateClaim(event) {
		if (websocket) {
			const data = new FormData(event.currentTarget);
			console.log(data);
			websocket.send('claim ' + data.get('claim'));
		}
	}

	function receivedClaim(c) {
		console.log(c);
		claim = c;
	}

	function animatePellet(userId, target) {
		return {
			cancelX: fabric.util.animate({
				startValue: others[userId].pellet.left,
				endValue: target.x,
				duration: updateTick,
				onChange: function (value) {
					others[userId].pellet.left = value;
					myCanvas.renderAll();
				},
				onComplete: function () {
					others[userId].pellet.setCoords();
				}
				//easing: fabric.util.ease.easeOutExpo,
			}),
			cancelY: fabric.util.animate({
				startValue: others[userId].pellet.top,
				endValue: target.y,
				duration: updateTick,
				onChange: function (value) {
					others[userId].pellet.top = value;
				},
				onComplete: function () {
					others[userId].pellet.setCoords();
				}
				//easing: fabric.util.ease.easeOutExpo,
			})
		};
	}

	/*function animate() {
		for (let key in others) {
			let obj = others[key].pellet;
			let center = obj.getCenterPoint();
			let target = new fabric.Point(others[key].target.x, others[key].target.y)
			let l = center.lerp(target, 0.5);
			obj.left = l.x;
			obj.top = l.y; 
		}
		myCanvas.renderAll();
		fabric.util.requestAnimFrame(animate);
  	}*/

	function updateMyPellet() {
		if (moving)
			websocket.send(`update ${userId} ${Math.round(myPellet.left)},${Math.round(myPellet.top)}`);
	}

	/**
	 * @type {string | number | NodeJS.Timeout | undefined}
	 */
	//let clear;
	$: {
		/*clearInterval(clear);
		clear = setInterval(() => {
			//stats = getStats();
		}, 5000);*/
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
		canvas.backgroundColor = 'white';

		let canvasHeight = (canvasWidth * 600) / 800;

		canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

		return canvas;
	}

	function signIn() {
		websocket.send('signin ' + getPlayerId());
		//connected = true;
	}

	/**
	 * @param {string} line
	 */
	function parseCommand(line) {
		const re = new RegExp(/^(ack|update|claim)(\s+([0-9a-f]*))?(\s+([0-9]+,[0-9]+))?(\s(.+))?$/gu);
		const matches = [...line.matchAll(re)][0];

		if (matches) {
			const command = matches[1].toString();
			const otherUserId = matches[3];
			let coords = null;

			if (matches[5]) {
				const s = matches[5].toString().split(',');
				coords = { x: parseInt(s[0]), y: parseInt(s[1]) };
			}

			if (command == 'ack') {
				if (!initialized) initialized = true;
				else initPellet();
			} else if (command == 'update') {
				if (otherUserId != userId) updatePellet(otherUserId, coords);
			} else if (command == 'claim') {
				if (otherUserId != userId) receivedClaim(matches[7]);
			}
		}
	}

	function connectionLost() {}

	function setUsername() {
		websocket.send('nickname ' + nickname);
		document.getElementById('join-modal').style.display = 'none';
	}
</script>

<Header
	bind:clientWidth={canvasWidth}
	title="Spectrum"
	subtitle="Online tool to help you run spectrum online with a party of 2 to 6 people"
/>

<div class="w3-container w3-margin" style="font-family: monospace;">
	<div class="w3-bar">
		<button
			onclick="document.getElementById('join-modal').style.display='block'"
			class="w3-bar-item w3-button w3-green">Join Spectrum</button
		>

		<button
			onclick="document.getElementById('create-modal').style.display='block'"
			class="w3-bar-item w3-button w3-red w3-right">Create Spectrum</button
		>
	</div>

	<div id="join-modal" class="w3-modal">
		<div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
			<div class="w3-center">
				<br />
				<span
					onclick="document.getElementById('join-modal').style.display='none'"
					class="w3-button w3-xlarge w3-hover-red w3-display-topright"
					title="Close Modal">&times;</span
				>
			</div>

			<form class="w3-container" on:submit|preventDefault={setUsername}>
				<div class="w3-section">
					<label for="nickname"><b>Nickname</b></label>
					<input
						class="w3-input w3-border w3-margin-bottom"
						type="text"
						placeholder="Please enter a nickname (don't use your real name)"
						bind:value={nickname}
						id="nickname"
						style="width: 100%;"
						required
					/>
					<button class="w3-button w3-block w3-green w3-section w3-padding" type="submit"
						>Join Spectrum</button
					>
				</div>
			</form>

			<div class="w3-container w3-border-top w3-padding-16 w3-light-grey">
				<button
					onclick="document.getElementById('join-modal').style.display='none'"
					type="button"
					class="w3-button w3-red">Cancel</button
				>
			</div>
		</div>
	</div>

	<div id="create-modal" class="w3-modal">
		<div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
			<div class="w3-center">
				<br />
				<span
					onclick="document.getElementById('create-modal').style.display='none'"
					class="w3-button w3-xlarge w3-hover-red w3-display-topright"
					title="Close Modal">&times;</span
				>
			</div>

			<form class="w3-container">
				<div class="w3-section">
					<label for="claim"><b>Initial claim</b></label>
					<input
						class="w3-input w3-border w3-margin-bottom"
						type="text"
						placeholder="Please enter the initial claim"
						id="claim"
						style="width: 100%;"
						required
					/>
					<button
						class="w3-button w3-block w3-green w3-section w3-disabled w3-padding"
						type="submit">Not Available Yet</button
					>
				</div>
			</form>

			<div class="w3-container w3-border-top w3-padding-16 w3-light-grey">
				<button
					onclick="document.getElementById('create-modal').style.display='none'"
					type="button"
					class="w3-button w3-red">Cancel</button
				>
			</div>
		</div>
	</div>
</div>

<div class="w3-card">
	<header class="w3-container" style="padding: 0; font-family: monospace;">
		<form method="POST" on:submit|preventDefault={updateClaim}>
			<label for="claim" class="w3-col w3-padding" style="width: 10%; font-weight: bold"
				>Claim:</label
			>
			<input
				name="claim"
				class="w3-col w3-input"
				style="width: 80%"
				type="text"
				bind:value={claim}
			/>
			<button class="w3-col w3-btn" style="width: 10%; padding-left: 0; padding-right: 0;"
				>Update</button
			>
		</form>
	</header>

	<div class="w3-container w3-border" style="display: flex; flex-direction: column; padding: 0;">
		<canvas style="margin: auto;" id="spectrum"></canvas>
	</div>

	<footer class="w3-container"></footer>
</div>

<style>
	header {
		width: 100%;
	}

	input {
		width: max-content;
	}
</style>
