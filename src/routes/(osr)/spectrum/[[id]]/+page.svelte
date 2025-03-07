<script>
	// @ts-nocheck
	/* eslint svelte/no-at-html-tags: "off" */

	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import Fa from 'svelte-fa';
	import {
		faRotateLeft,
		faCirclePlus,
		faStop,
		faCopy,
		faPersonWalkingArrowRight,
		faPerson,
		faExclamation,
		faPalette,
		faPaperPlane
	} from '@fortawesome/free-solid-svg-icons';

	import { startWebsocket } from '$lib/spectrum/websocket';
	import { getPlayerId } from '$lib/battleships/playerId';
	import { onMount } from 'svelte';
	import { fabric } from 'fabric';
	import { copy } from 'svelte-copy';

	import { page } from '$app/stores';
	import { PUBLIC_URL } from '$lib/Env';

	const palette = {
		aeaeae: 'Gris  ', // Neutral gray
		cd5334: 'Brun  ', // Burnt orange
		ff5555: 'Rouge ', // Bright red
		ff9955: 'Orange', // Vibrant orange
		ffe680: 'Jaune ', // Soft yellow
		aade87: 'Vert  ', // Light green
		aaeeff: 'Bleu  ', // Light cyan
		'4b0082': 'Indigo', // Indigo
		c6afe9: 'Violet', // Soft lavender
		d473d4: 'Mauve ' // Muted mauve
	};

	export let spectrumId;

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
	const updateTick = 100;

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
	let listenning = true;

	/**
	 * @type {{ left: any; top: any; }}
	 */
	let myPellet;
	let moving = false;
	const cells = [];
	const others = {};

	let claim = '';
	let scale;

	$: {
		scale = canvasWidth / 800;
	}

	onMount(() => {
		window.setAdminModeOn = () => {
			websocket.send(`joinspectrum ${spectrumId} ${nickname}`);
			adminModeOn = true;
		};

		spectrumId = $page.params.id;
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

				let canvasHeight = (canvasWidth * 600) / 800;
				let g = new fabric.Group([], {
					width: canvasWidth,
					height: canvasHeight
				});

				svg.scaleToWidth(g.width);

				g.addWithUpdate(svg);

				g.top = 15;

				g.selectable = false;
				g.evented = false;

				const svgObjects = svg.getObjects();

				for (let i = 0; i <= 8; i++) {
					cells.push(svgObjects[i]);
				}

				myCanvas.add(g);
				myCanvas.sendToBack(g);
			}
		);

		// We're joining a spectrum
		if (spectrumId) {
			toggleJoinModal();
		}
	});

	function initPellet() {
		console.log('Initalizing Your Pellet');
		var options = {
			top: 0,
			left: 0
		};

		// @ts-ignore
		options.radius = 12;

		// only if not assigned, then random
		if (!userId)
			userId = Object.keys(palette)[fabric.util.getRandomInt(0, Object.keys(palette).length - 1)];

		let circle = new fabric.Circle({
			...options,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true,
			hasBorders: false,
			hasContext: false
		});

		let text = new fabric.Text(nickname, {
			fontFamily: 'monospace',
			left: circle.left + circle.radius + 20,
			top: circle.top - circle.radius - 11,
			fontSize: 14,
			color: '#f9f9f9',
			hasBorders: false,
			hasContext: false,
			opacity: 0.5
		});

		let rect = new fabric.Rect({
			left: circle.left + circle.radius + 13,
			top: circle.top - circle.radius - 18,
			width: text.width + 10,
			height: text.height + 10,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true,
			hasBorders: false,
			hasContext: false,
			opacity: 0.5
		});

		let g = new fabric.Group([circle, rect, text], {
			top: 230,
			left: 330,
			hasBorders: false,
			hasControls: false
		});

		g.on({
			mouseover: () => {
				rect.set({ opacity: 1 });
				text.set({ opacity: 1 });
				myCanvas.renderAll();
			},
			mouseout: () => {
				rect.set({ opacity: 0.5 });
				text.set({ opacity: 0.5 });
				myCanvas.renderAll();
			}
		});

		myCanvas.add(g);
		myPellet = g;

		myCanvas.on({
			'object:moving': function ({ target }) {
				if (target != myPellet) return;

				for (let i = 0; i < cells.length; i++) {
					const cell = cells[i];
					const points = [];

					for (let index = 0; index < cell.path.length - 2; index++) {
						let pathPoint = cell.path[index];

						let p = [
							pathPoint[pathPoint.length - 2] * cell.scaleX * scale - 40,
							pathPoint[pathPoint.length - 1] * cell.scaleY * scale - 80
						];
						points.push(p);
					}

					/*if (cell.id == 'neutral') {
						console.log(points);
					}*/

					if (pointInPolygon(points, [myPellet.left, myPellet.top])) {
						cell.set({ fill: '#10b1b1' });
						//console.log(cell);
					} else {
						if (cell.id == 'notReplied' || cell.id == 'indifferent') {
							cell.set({ fill: '#ccc' });
						} else {
							cell.set({ fill: '#000002' });
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
	function initOtherPellet(userId, nickname) {
		console.log('Initalizing Other Pellet: ' + userId);
		var options = {
			top: 0,
			left: 0
		};
		// @ts-ignore
		options.radius = 12;

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

		let text = new fabric.Text(nickname, {
			fontFamily: 'monospace',
			left: circle.left + circle.radius + 20,
			top: circle.top - circle.radius - 11,
			fontSize: 14,
			color: '#f9f9f9',
			evented: false,
			hasBorders: false,
			hasContext: false
		});

		let rect = new fabric.Rect({
			left: circle.left + circle.radius + 13,
			top: circle.top - circle.radius - 18,
			width: text.width + 10,
			height: text.height + 10,
			fill: `#${userId}`,
			stroke: '#f9f9f9',
			strokeWidth: 3,
			strokeUniform: true,
			evented: false,
			hasBorders: false,
			hasContext: false
		});

		let g = new fabric.Group([circle, rect, text], {
			top: 230,
			left: 330,
			evented: false,
			hasBorders: false,
			hasControls: false
		});

		myCanvas.add(g);
		return g;
	}

	/**
	 * @param {string} otherUserId
	 * @param {{ x: number; y: number; } | null} coords
	 */
	function updatePellet(otherUserId, coords, otherNickname) {
		// New user
		if (!others[otherUserId]) {
			others[otherUserId] = {
				pellet:
					!isNaN(coords.x) && !isNaN(coords.y) ? initOtherPellet(otherUserId, otherNickname) : null,
				targets: [coords],
				nickname: otherNickname
			};
		} else if (!isNaN(coords.x) && !isNaN(coords.y)) {
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

		if (!isNaN(coords.x) && !isNaN(coords.y)) {
			const cancel = animatePellet(otherUserId, coords);
			others[otherUserId].cancel = () => {
				cancel.cancelX();
				cancel.cancelY();
			};
		}
	}

	function deletePellet(otherUserId, keepUser = false) {
		if (others[otherUserId].cancel) {
			others[otherUserId].cancel();
		}

		if (others[otherUserId].pellet) {
			myCanvas.remove(others[otherUserId].pellet);
			myCanvas.renderAll();
		}

		if (!keepUser) {
			delete others[otherUserId];
		}
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

	function updateMyPellet(force = false) {
		if (moving || force)
			websocket.send(
				`update ${userId} ${Math.round(myPellet.left)},${Math.round(myPellet.top)} ${nickname}`
			);
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
		if (!listenning) return;

		const re = new RegExp(
			/^(ack|nack|update|claim|spectrum|newposition|userleft|madeadmin)(\s+([0-9a-f]*))?(\s+([0-9]+,[0-9]+))?(\s+(.+))?$/gu
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
				if (!initialized) initialized = true;
				else initPellet();
			} else if (command == 'nack') {
				notifier.danger('Désolé, erreur reçue: ' + matches[7]);
			} else if (command == 'update') {
				if (otherUserId != userId) updatePellet(otherUserId, coords, matches[7]);
			} else if (command == 'userleft') {
				if (otherUserId != userId) deletePellet(otherUserId);
			} else if (command == 'madeadmin') {
				if (otherUserId != userId) deletePellet(otherUserId, true);
				else {
					adminModeOn = true;
					myCanvas.remove(myPellet);
					myCanvas.renderAll();
					myPellet = null;
				}
			} else if (command == 'newposition') {
				if (myPellet) {
					myPellet.left = coords.x;
					myPellet.top = coords.y;
					myPellet.setCoords();
					myCanvas.renderAll();
					updateMyPellet(true);
				}
				moving = false;
			} else if (command == 'claim') {
				if (otherUserId != userId) receivedClaim(matches[7]);
			} else if (command == 'spectrum') {
				showJoinModal = false;
				userId = matches[3];
				const s = matches[7].toString().split(' ');
				nickname = s[1];
				if (s[2] == 'true') {
					adminModeOn = true;
				}
				joinedSpectrum(s[0]);
			}
		}
	}

	function connectionLost() {}

	function resetPositions() {
		websocket.send('resetpositions');
	}

	let initialClaim;
	function createSpectrum() {
		listenning = true;
		claim = initialClaim;
		initialClaim = '';
		websocket.send(`startspectrum ${nickname} ${userId}`);
		document.getElementById('create-modal').style.display = 'none';
		adminModeOn = true;
		websocket.send(`claim ${claim}`);
	}

	function joinSpectrum() {
		listenning = true;
		websocket.send(`joinspectrum ${spectrumId} ${nickname} ${userId}`);
	}

	let adminModeOn = false;
	function joinedSpectrum(id) {
		spectrumId = id;
		console.log(`spectrumId = ${id}`);

		if (!adminModeOn) {
			initPellet();
		}
	}

	function makeAdmin(id) {
		if (!adminModeOn) return;

		websocket.send(`makeadmin ${id}`);
	}

	let showJoinModal = false;
	let showSpectrumId = false;
	function toggleJoinModal() {
		showJoinModal = !showJoinModal;
	}
	function toggleShowSpectrumId() {
		showSpectrumId = !showSpectrumId;
	}

	let showCreateModal = false;
	function toggleCreateModal() {
		showCreateModal = !showCreateModal;
	}

	function leaveSpectrum() {
		listenning = false;
		websocket.send(`leavespectrum ${spectrumId}`);
		spectrumId = undefined;
		adminModeOn = false;
		myCanvas.remove(myPellet);
		for (const key in others) {
			if (others[key].pellet) myCanvas.remove(others[key].pellet);
			delete others[key];
		}
		myCanvas.renderAll();
	}

	const copied = () => {
		notifier.success('Lien du Spectrum copié!');
	};

	let showParticipants = true;

	/*
		OSR Color: 
		indigo #10b1b1 
		jaune #ffc517
		blanc #fffdfc
		black #000002
		olive #25291C
	*/
</script>

<!-- EN/US
<Header
	bind:clientWidth={canvasWidth}
	title="Spectrum"
	subtitle="Online tool to help you run spectrum online with a party of 2 to 6 people"
/>
-->

<Header
	title="Spectrum"
	subtitle="Plate-forme de spectrum en ligne de 2 à 6 participants"
	logo="/logo-osr.png"
/>

<br />

<div class="w3-container w3-margin" style="font-family: monospace;">
	{#if !spectrumId}
		<div class="w3-bar">
			<button on:click={toggleCreateModal} class="w3-bar-item w3-button osr-yellow w3-round w3-left"
				>Créer un Spectrum</button
			>
			<button
				on:click={toggleJoinModal}
				class="w3-margin-left w3-bar-item w3-button osr-green w3-round w3-left"
				>Rejoindre un Spectrum</button
			>
		</div>
	{:else}
		<div class="w3-bar">
			<span class="w3-bar-item w3-left">
				Spectrum en cours &mdash; identifiant=<b>{showSpectrumId ? spectrumId : 'OSR-****'}</b
				><button
					class={showSpectrumId ? 'forbidden' : ''}
					style="background: none; border: none; outline: none; box-shadow: none;"
					on:click={toggleShowSpectrumId}>👁️</button
				>
			</span>

			<button
				class="w3-button w3-bar-item w3-round osr-green"
				use:copy={PUBLIC_URL + '/spectrum/' + spectrumId}
				on:svelte-copy={() => copied()}
			>
				<Fa icon={faCopy} /> Copier Lien
			</button>

			<button on:click={leaveSpectrum} class="w3-bar-item w3-round w3-button osr-yellow w3-right"
				><Fa icon={faPersonWalkingArrowRight} /> Quitter le Spectrum</button
			>
		</div>
	{/if}

	{#if showJoinModal}
		<div id="join-modal" class="w3-modal" style="display: block;">
			<div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
				<div class="w3-center">
					<br />
					<button
						on:click={toggleJoinModal}
						class="w3-button w3-xlarge w3-hover-red w3-display-topright"
						title="Close Modal"
						>&times;
					</button>
				</div>

				<form class="w3-container" on:submit|preventDefault={joinSpectrum}>
					<div class="w3-section">
						<label for="spectrumId"><b>Identifiant du Spectrum</b></label>
						<input
							class="w3-input w3-border w3-margin-bottom"
							type="text"
							placeholder="Veuillez entrer l'identifiant du spectrum que vous voulez rejoindre"
							id="spectrumId"
							bind:value={spectrumId}
							style="width: 100%;"
							required
						/>
						<hr />
						<label for="nickname1"><b>Pseudo</b></label>
						<input
							class="w3-input w3-border w3-margin-bottom"
							type="text"
							placeholder="Veuillez entrer un pseudo (n'utilisez pas votre nom réel)"
							bind:value={nickname}
							id="nickname1"
							style="width: 100%;"
							required
						/>
						<hr />
						<p><b>Choisissez une couleur</b></p>
						<div class="w3-container" style="display: flex; flex-wrap: wrap;">
							{#each Object.entries(palette) as [colorHex, colorName]}
								<div style="margin: 6px">
									<label class="form-control w3-monospace">
										<input
											class="w3-radio"
											type="radio"
											name="color"
											value={colorHex}
											bind:group={userId}
											style="background-color: #{colorHex} !important;"
										/>
										{@html colorName.replace(/ /g, '&nbsp;')}
									</label>
								</div>
							{/each}
						</div>
						<button class="w3-button w3-block osr-green w3-section w3-padding" type="submit"
							>Rejoindre le Spectrum</button
						>
					</div>
				</form>

				<div class="w3-container w3-border-top w3-padding-16 w3-light-grey">
					<button on:click={toggleJoinModal} type="button" class="w3-button osr-yellow"
						>Annuler</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if showCreateModal}
		<div id="create-modal" class="w3-modal" style="display: block;">
			<div class="w3-modal-content w3-card-4 w3-animate-zoom" style="max-width:600px">
				<div class="w3-center">
					<br />
					<button
						on:click={toggleCreateModal}
						class="w3-button w3-xlarge w3-hover-red w3-display-topright"
						title="Close Modal">&times;</button
					>
				</div>

				<form class="w3-container" on:submit|preventDefault={createSpectrum}>
					<div class="w3-section">
						<label for="nickname2"><b>Pseudo</b></label>
						<input
							class="w3-input w3-border w3-margin-bottom"
							type="text"
							placeholder="Veuillez entrer un pseudo (n'utilisez pas votre nom réel)"
							bind:value={nickname}
							id="nickname2"
							style="width: 100%;"
							required
						/>
						<hr />
						<label for="claim"><b>Claim initial</b></label>
						<input
							class="w3-input w3-border w3-margin-bottom"
							type="text"
							placeholder="Veuillez entrer le claim"
							id="claim"
							style="width: 100%;"
							bind:value={initialClaim}
							required
						/>
						<hr />
						<p><b>Choisissez une couleur</b></p>
						<div class="w3-container" style="display: flex; flex-wrap: wrap;">
							{#each Object.entries(palette) as [colorHex, colorName]}
								<div style="margin: 6px">
									<label class="form-control w3-monospace">
										<input
											class="w3-radio"
											type="radio"
											name="color"
											value={colorHex}
											bind:group={userId}
											style="background-color: #{colorHex} !important;"
										/>
										{@html colorName.replace(/ /g, '&nbsp;')}
									</label>
								</div>
							{/each}
						</div>
						<button class="w3-button w3-block osr-green w3-section w3-padding" type="submit"
							>Créer un Spectrum</button
						>
					</div>
				</form>

				<div class="w3-container w3-border-top w3-padding-16 w3-light-grey">
					<button on:click={toggleCreateModal} type="button" class="w3-button osr-yellow"
						>Annuler</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>

<div class="w3-row">
	<div class="w3-twothird">
		<div class="w3-card w3-content" bind:clientWidth={canvasWidth}>
			<header class="w3-container" style="padding: 0; font-family: monospace;">
				<form method="POST" on:submit|preventDefault={updateClaim}>
					<label for="claim" class="w3-col w3-padding" style="width: 10%; font-weight: bold"
						>Claim:</label
					>
					<input
						name="claim"
						class="w3-col w3-input w3-border-0"
						style="width: {adminModeOn ? '80' : '90'}%; z-index: 100;"
						type="text"
						readonly={!adminModeOn}
						bind:value={claim}
					/>
					{#if adminModeOn}
						<button class="w3-col w3-button" style="width: 10%; padding-left: 0; padding-right: 0;"
							><Fa icon={faPaperPlane} /> Update</button
						>
					{/if}
				</form>
			</header>

			<div
				class="w3-container w3-border-top"
				style="display: flex; flex-direction: column; padding: 0;"
			>
				<canvas style="margin: auto;" id="spectrum"></canvas>
			</div>

			<footer class="w3-bar" class:w3-padding={adminModeOn}>
				{#if adminModeOn}
					<button
						class="w3-bar-item w3-mobile w3-button w3-black w3-text-white w3-round-large w3-monospace w3-margin-right"
						on:click={resetPositions}
					>
						<Fa icon={faRotateLeft} /> Reset les Positions</button
					>

					<button
						class="w3-bar-item w3-mobile w3-button w3-black w3-text-white w3-round-large w3-monospace w3-margin-right"
						on:click={initPellet}><Fa icon={faCirclePlus} /> Créer mon Palet</button
					>

					<button
						class="w3-bar-item w3-mobile w3-button w3-black w3-text-white w3-round-large w3-monospace w3-disabled"
						><Fa icon={faStop} /> Clôturer le Spectrum</button
					>
				{/if}
			</footer>
		</div>
	</div>

	{#if spectrumId}
		<div class="w3-container w3-third w3-responsive w3-monospace">
			<table class="w3-table-all w3-striped w3-bordered">
				<tbody>
					<tr>
						<th class="w3-center"><Fa icon={faPalette} /> </th>
						<th><Fa icon={faPerson} /> Participant</th>
						{#if adminModeOn}
							<th><Fa icon={faExclamation} /> Actions</th>
						{/if}
					</tr>
					<tr>
						<td>
							<div style="background: #{userId}; clip-path: circle(10px);">&nbsp;</div>
						</td>
						<td>
							<span class="w3-small"><b>{nickname}{adminModeOn ? '*' : ''}</b> (Vous-même)</span>
						</td>
						{#if adminModeOn}
							<td> &nbsp; </td>
						{/if}
					</tr>
					{#each Object.entries(others) as [colorHex, other]}
						<tr>
							<td>
								<div style="background: #{colorHex}; clip-path: circle(10px);">&nbsp;</div>
							</td>
							<td>
								<span class="w3-small"><b>{other.nickname}</b></span>
							</td>
							{#if adminModeOn}
								<td>
									<button class="w3-button w3-small w3-right w3-disabled"
										>Retirer du spectrum &times;</button
									>
									<button
										class="w3-button w3-small w3-right"
										on:click={() => {
											makeAdmin(colorHex);
										}}>Rendre admin</button
									>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>

<style>
	header {
		width: 100%;
	}

	input {
		width: max-content;
	}

	table {
		table-layout: fixed;
		box-shadow:
			0 2px 5px 0 rgba(0, 0, 0, 0.16),
			0 2px 10px 0 rgba(0, 0, 0, 0.12);
	}

	.osr-green {
		background-color: #10b1b1;
	}

	.osr-yellow {
		background-color: #ffc517;
	}

	.osr-olive {
		background-color: #25291c;
	}

	.form-control {
		font-family: system-ui, sans-serif;
		font-size: 1rem;
		line-height: 1.5rem;
		vertical-align: text-bottom;
		display: grid;
		grid-template-columns: 1.5rem auto;
		gap: 0.5rem;
	}

	input[type='radio'] {
		/* Add if not using autoprefixer */
		-webkit-appearance: none;
		/* Remove most all native input styles */
		appearance: none;
		/* For iOS < 15 */
		background-color: greenyellow;
		/* Not removed via appearance */
		margin: 0;

		font: inherit;

		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		transform: translateY(-0.075em);

		display: grid;

		place-content: center;
	}

	input[type='radio']::before {
		content: '';
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 50%;
		transform: scale(0);
		transition: 120ms transform ease-in-out;
		box-shadow: inset 1rem 1rem rgb(244, 244, 244);
		/* Windows High Contrast Mode */
		/*background-color: CanvasText;*/
	}

	input[type='radio']:checked::before {
		transform: scale(1);
	}

	.forbidden::after {
		content: '🚫';
		position: relative;
		left: -1rem;
		top: 0;
	}
</style>
