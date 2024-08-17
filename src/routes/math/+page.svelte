<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { copy } from 'svelte-copy';
	import { API_URL } from '$lib/Env.js';
	import { onMount } from 'svelte';

	/**
	 * @type {Promise<string>}
	 */
	let output;

	let websocketOutput = '';

	/**
	 * @type {WebSocket}
	 */
	let conn;

	let previousConstant = '';
	let page = 0;

	onMount(() => {
		conn = new WebSocket('ws://localhost:3000/api/math/ws');

		conn.onclose = function (evt) {
			console.log('Websocket connection lost: ' + evt.reason);
		};

		conn.onmessage = function (evt) {
			websocketOutput += evt.data;
			output = new Promise((resolve) => {
				resolve(websocketOutput);
			});
		};
	});

	/**
	 * @param {string} constantName
	 */
	async function compute(constantName) {
		resetOutput();

		const res = await fetch(API_URL + '/math/' + constantName, {
			method: 'GET'
		});

		return await res.text();
	}

	function resetOutput() {
		output = new Promise((resolve) => resolve(''));
		websocketOutput = '';
		previousConstant = '';
	}

	/**
	 * @param {string} constantName
	 */
	function requestPage(constantName) {
		// Make sure websocket is on
		if (!conn) {
			return false;
		}

		// To swap between pi and tau
		if (previousConstant == '' || previousConstant != constantName) {
			resetOutput();
			previousConstant = constantName;
			page = 0;
		} else {
			page++;
		}

		// send page request, page size 1000
		conn.send(constantName + ' ' + page.toString() + ', 1000');
	}

	function nextPage() {
		requestPage(previousConstant);
	}

	// Lazy-loading logic
	let y = 0;
	let innerHeight = 0;
	let clientHeight = 0;

	$: {
		if (previousConstant != '') {
			const scrolledTo = y + innerHeight;
			const threshold = 30;
			const hasReachedBottom = clientHeight - threshold <= scrolledTo;
			if (hasReachedBottom) nextPage();
		}
	}

	const copied = () => {
		notifier.success('Value copied to clipboard!');
	};
</script>

<svelte:window bind:scrollY={y} bind:innerHeight />

<Header
	title="Some mathematics stuff"
	subtitle="Some mathematics stuff, I liked to play with like Pi, Tau, ..."
/>

<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => (output = compute('pi'))}
		>Compute &pi; 10K first decimals</button
	>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => (output = compute('tau'))}
		>Compute &tau; 10K first decimals</button
	>
</p>
<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => requestPage('pi')}
		>Lazy load &pi; 1M first decimals</button
	>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => requestPage('tau')}
		>Lazy load &tau; 1M first decimals</button
	>
</p>

<div bind:clientHeight>
	<p title="result" style="word-break: break-all;">
		{#if output}
			{#await output}
				...
			{:then data}
				<button class="w3-button w3-round grey" use:copy={data} on:svelte-copy={() => copied()}>
					Copy</button
				>
				<br /> <br />
				{data}
			{:catch error}
				Failed: {error.message}
			{/await}
		{:else}
			&nbsp;
		{/if}
	</p>
</div>

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}
</style>
