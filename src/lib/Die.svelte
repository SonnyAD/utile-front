<script>
	import { notifier } from '../lib/notiications';

	const roll = async (faces) => {
		const res = await fetch('https://utile.space/api/d' + faces, {
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

<button on:click={() => (die = roll(faces))}
	>Roll
	{#if die}
		<span>
			{#await die}
				: ...
			{:then data}
				: {data}
			{:catch error}
				: Failed
			{/await}
		</span>
	{/if}
</button>
