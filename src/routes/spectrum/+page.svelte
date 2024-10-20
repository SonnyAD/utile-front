<script>
	import Header from '$lib/components/Header.svelte';

	import { onMount } from 'svelte';
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
	 * @type {Promise<any>}
	 */
	//let stats;

	/**
	 * @type {WebSocket}
	 */
	//let websocket;
	//let connected = false;

	onMount(() => {
		// Prepare Both Canvas
		myCanvas = drawCanvas('spectrum');

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

		for (var i = 15; i--; ) {
			var dim = fabric.util.getRandomInt(30, 60);
			var klass = ['Circle'][fabric.util.getRandomInt(0, 2)];
			var options = {
				top: fabric.util.getRandomInt(0, 600),
				left: fabric.util.getRandomInt(0, 600),
				fill: 'green'
			};
			if (klass === 'Circle') {
				// @ts-ignore
				options.radius = dim;
			} else {
				// @ts-ignore
				options.width = dim;
				// @ts-ignore
				options.height = dim;
			}
			let circle = new fabric.Circle({
				...options,
				stroke: 'blue',
				strokeWidth: 3,
				strokeUniform: true
			});
			myCanvas.add(circle);
		}
	});

	/**
	 * @type {string | number | NodeJS.Timeout | undefined}
	 */
	let clear;
	$: {
		clearInterval(clear);
		clear = setInterval(() => {
			//stats = getStats();
		}, 5000);
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
