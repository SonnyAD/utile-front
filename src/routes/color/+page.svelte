<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { copy } from 'svelte-copy';

	import ColorPicker, { A11yVariant } from 'svelte-awesome-color-picker';
	// @ts-ignore
	import { RgbaColor, HsvaColor } from 'svelte-awesome-color-picker';

	// default theme color
	let hex = '#c83737';
	/**
	 * @type {RgbaColor}
	 */
	let rgb;
	/**
	 * @type {HsvaColor}
	 */
	let hsv;

	const copied = () => {
		notifier.success('String copied to clipboard!');
	};
</script>

<Header title="Color Picker" subtitle="Pick a color and accessibility evalutation" />

<ColorPicker
	components={A11yVariant}
	bind:hex
	bind:rgb
	bind:hsv
	isAlpha
	a11yColors={[
		{ textHex: '#FFF', reverse: true, placeholder: 'background' },
		{ textHex: '#FFF', bgHex: '#FF0000', reverse: true, placeholder: 'background' },
		{ bgHex: '#FFF', placeholder: 'title', size: 'large' },
		{ bgHex: '#7F7F7F', placeholder: 'button' }
	]}
	isDialog={false}
/>

<p>
	<button class="w3-button w3-round grey" use:copy={hex} on:svelte-copy={() => copied()}
		>Copy Hex</button
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
