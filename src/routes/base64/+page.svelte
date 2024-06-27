<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import CopyToClipboard from 'svelte-copy-to-clipboard';

	let input = '';
	let output = '';

	// function to decode base64 strings
	function b64DecodeUnicode() {
		output = decodeURIComponent(
			atob(input)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);
	}

	// function to encode base64 strings
	function b64EncodeUnicode() {
		output = btoa(
			encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function (match, p1) {
				return String.fromCharCode('0x' + p1);
			})
		);
	}

	const copied = () => {
		notifier.success('Value copied to clipboard!');
	};
</script>

<Header title="Base64" subtitle="Encode/Decode information with base64" />

<textarea bind:value={input} class="w3-block" rows="5" />

<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={b64EncodeUnicode}>Encode</button>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={b64DecodeUnicode}>Decode</button>
</p>

{#if output}
	<h3>Result</h3>
	<blockquote>
		<p>{output}</p>
		<p>
			<CopyToClipboard text={output} on:copy={copied} on:fail={() => {}} let:copy>
				<button class="w3-button w3-round grey" on:click={copy}>Copy</button>
			</CopyToClipboard>
		</p>
	</blockquote>
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
