<script>
	import { createEventDispatcher } from 'svelte';
	let active = false;
	export let text = '';
	export let toggle;
	export let sendDispatch;
	
	const dispatch = createEventDispatcher();
	
	function handleDispatch(e) {
		dispatch('message',
						 {text: e.sendDispatch}
						);}
	
	function handleToggle () {
		active = !active;
	}
	
</script>

<style>

	button, .active {background-color: #c83737; color: white;}
	button:hover {background-color: #a02c2c; color: white; cursor:pointer;}
	
</style>

{#if toggle == 'true'}
   <button class:active="{active}" on:click="{() => {handleToggle();}}">{text}</button>
{:else}
   <button on:click="{() => {handleDispatch({sendDispatch});}}">{text}</button>
{/if}
	