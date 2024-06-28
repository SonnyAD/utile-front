<script>
	import { createEventDispatcher } from 'svelte';
	let active = false;
	export let text = '';
	export let toggle;
	export let sendDispatch;

	const dispatch = createEventDispatcher();

	/**
	 * @param {{ sendDispatch: any; }} e
	 */
	function handleDispatch(e) {
		dispatch('message', { text: e.sendDispatch });
	}

	function handleToggle() {
		active = !active;
	}
</script>

{#if toggle == 'true'}
	<button
		class:active
		class="w3-button w3-round"
		on:click={() => {
			handleToggle();
		}}>{text}</button
	>
{:else}
	<button
		class="w3-button w3-round"
		on:click={() => {
			handleDispatch({ sendDispatch });
		}}>{text}</button
	>
{/if}

<style>
	button,
	.active {
		background-color: #c83737;
		color: white;
	}
	button:hover {
		background-color: #a02c2c;
		color: white;
		cursor: pointer;
	}
</style>
