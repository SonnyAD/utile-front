<script>
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
	 * @type {WebSocket}
	 */
	let websocket;
	let connected = false;
	/**
	 * @type {string}
	 */
	let userId;

	/**
	 * @type {{ left: any; top: any; }}
	 */
	let myPellet;
	let moving = false;
	const others = {};

	onMount(() => {
		websocket = startWebsocket(signIn, parseCommand, connectionLost);

		// Prepare Both Canvas
		myCanvas = drawCanvas('spectrum');

		myCanvas.on({
			'object:moving': function (
				/** @type {{ target: { width?: any; angle: any; left?: any; top?: any; }; }} */ e
			) {
				moving = true;
				//websocket.send(`update ${userId} ${e.target.left},${e.target.top}`);
			},
			'object:modified': function (
				/** @type {{ target: { left?: any; width?: any; top?: any; setCoords?: any; angle?: number; }; }} */ e
			) {
				moving = false;
			}
		})

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

				myCanvas.add(g);
				myCanvas.sendToBack(g);
			}
		);
	});

	function initPellet() {
		console.log("Initalizing Your Pellet")
		var options = {
			top: 230,
			left: 330
		};
		// @ts-ignore
		options.radius = 10;

		userId = palette[fabric.util.getRandomInt(0, 6)]
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

		setInterval(updateMyPellet, 300);
		animate();
	}

	/**
	 * @param {string} userId
	 */
	function initOtherPellet(userId) {
		console.log("Initalizing Other Pellet")
		var options = {
			top: 230,
			left: 330
		};
		// @ts-ignore
		options.radius = 10;

		userId = palette[fabric.util.getRandomInt(0, 6)]
		let circle = new fabric.Circle({
			...options,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true,
			selectable: false,
			evented: false,
			hasControls: false,
			hasBorders: false,
		});
		myCanvas.add(circle);
		return circle;
	}

	/**
	 * @param {string} otherUserId
	 * @param {{ x: number; y: number; } | null} coords
	 */
	function updatePellet(otherUserId, coords) {
		if (!others[otherUserId])
			others[otherUserId] = { pellet: initOtherPellet(otherUserId), target: coords };

		others[otherUserId].target = coords;

		/*others[otherUserId].pellet.left = coords.x;
		others[otherUserId].pellet.top = coords.y;
		others[otherUserId].pellet.setCoords();
		myCanvas.renderAll();*/
		//smoothDamp(others[otherUserId].pellet);
	}

	function animate() {
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
  	}

	function updateMyPellet() {
		if (moving)
			websocket.send(`update ${userId} ${Math.round(myPellet.left)},${Math.round(myPellet.top)}`)
	}

	/**
	 * @type {string | number | NodeJS.Timeout | undefined}
	 */
	let clear;
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

		let canvasHeight = ((canvasWidth - 10) * 600) / 800;

		canvas.setDimensions({ width: canvasWidth - 10, height: canvasHeight });

		return canvas;
	}

	function signIn() {
		websocket.send('signin ' + getPlayerId());
		connected = true;
	}

	/**
	 * @param {string} line
	 */
	function parseCommand(line) {
		const re = new RegExp(
			/^(ack|update)(\s+([0-9a-f]*))?(\s+([0-9]+,[0-9]+))?$/gu
		);
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
				initPellet();
			} else if (command == 'update') {
				if (otherUserId != userId)
					updatePellet(otherUserId, coords);
			}
		}
	}

	function connectionLost() {}


</script>

<Header
	bind:clientWidth={canvasWidth}
	title="Spectrum"
	subtitle="Online tool to help you run spectrum online with a party of 2 to 6 people"
/>

<p>&nbsp;</p>

<div class="w3-container w3-border" style="display: flex; flex-direction: column; padding: 0;">
	<canvas style="margin: auto;" id="spectrum"></canvas>
</div>

<style>
</style>
