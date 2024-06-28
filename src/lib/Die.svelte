<script>
	import { notifier } from '$lib/notifications';
	import { API_URL } from '$lib/Env.js';

	async function roll(/** @type {string} */ faces) {
		const res = await fetch(API_URL + '/d' + faces, {
			method: 'GET'
		});

		let result = await res.text();

		navigator.clipboard.writeText(result).then(
			() => notifier.success('Result copied to clipboard!'),
			() => {}
		);

		return result;
	};

	export let faces;
	/**
	 * @type {Promise<string>}
	 */
	let die;
</script>

<div class="w3-col w3-third w3-center">
	{#if die}
		{#await die}
			...
		{:then data}
			{data}
		{:catch error}
			Failed: {error.message}
		{/await}
	{:else}
		&nbsp;
	{/if}
</div>

<div class="w3-col w3-third w3-center">
	<button class="w3-btn w3-ripple w3-theme w3-round" on:click={() => (die = roll(faces))}
		>Roll</button
	>
</div>

<style>
</style>
