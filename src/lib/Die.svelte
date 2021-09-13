<script>
	import { notifier } from '$lib/notifications';
	import { API_URL } from '$lib/Env.js';

	const roll = async (faces) => {
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
	let die;
</script>

<td>
	{#if die}
		{#await die}
			...
		{:then data}
			{data}
		{:catch error}
			Failed
		{/await}
	{:else}
		&nbsp;
	{/if}
</td>

<td>
	<button on:click={() => (die = roll(faces))}>Roll</button>
</td>

<style>
	td {
		text-align: center;
	}
</style>