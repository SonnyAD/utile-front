<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { onMount } from 'svelte';
	import { copy } from 'svelte-copy';
	import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid';

	let output = '';

	function generateUUIDv1() {
		output = uuidv1();
	}

	function generateUUIDv4() {
		output = uuidv4();
	}

	function generateUUIDv7() {
		output = uuidv7();
	}

	const copied = () => {
		notifier.success('UUID copied to clipboard!');
	};

	onMount(() => {
		generateUUIDv4();
	});
</script>

<Header
	title="Generate UUIDs"
	subtitle="Use this page to generate UUIDs of the version you want."
/>

<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={generateUUIDv1}
		>Generate v1</button
	>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={generateUUIDv4}
		>Generate v4</button
	>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={generateUUIDv7}
		>Generate v7</button
	>
	<button class="w3-button w3-round grey" use:copy={output} on:svelte-copy={() => copied()}>
		Copy</button
	>
</p>

{#if output}
	<p>{output}</p>
{:else}
	<p>&nbsp;</p>
{/if}

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}
</style>
