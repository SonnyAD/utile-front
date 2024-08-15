<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { copy } from 'svelte-copy';
	import { API_URL } from '$lib/Env.js';

	/**
	 * @type {Promise<string>}
	 */
	let output;

	async function computePi() {
		return compute('pi');
	}

	async function computeTau() {
		return compute('tau');
	}

	/**
	 * @param {string} constantName
	 */
	async function compute(constantName) {
		const res = await fetch(API_URL + '/' + constantName, {
			method: 'GET'
		});

		return await res.text();
	}

	const copied = () => {
		notifier.success('Value copied to clipboard!');
	};
</script>

<Header
	title="Some mathematics stuff"
	subtitle="Some mathematics stuff, I liked to play with like Pi, Tau, ..."
/>

<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => (output = computePi())}
		>Compute &pi; 10K first decimals</button
	>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={() => (output = computeTau())}
		>Generate &tau; 10K first decimals</button
	>
</p>

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

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}
</style>
