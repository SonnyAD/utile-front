<script>
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { copy } from 'svelte-copy';

	let password = '';

	// generate a random password of length 20 with alphanumeric characters and special characters
	const generatePassword = () => {
		password = '';
		for (let i = 0; i < 20; i++) {
			password += String.fromCharCode(Math.floor(Math.random() * 94) + 33);
		}
		return password;
	};

	const copied = () => {
		notifier.success('Password copied to clipboard!', 1000);
	};

	onMount(() => {
		generatePassword();
	});
</script>

<Header
	title="Password Generator"
	subtitle="Use this page to generate password on client side (only)."
/>

{#if password}
	<p id="result">{password}</p>
{:else}
	<p>&nbsp;</p>
{/if}

<p>
	<button class="w3-button w3-round grey" use:copy={password} on:svelte-copy={() => copied()}
		>Copy</button
	>

	<button class="w3-button w3-ripple w3-theme w3-round" on:click={generatePassword}>Generate</button
	>
</p>

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}
</style>
