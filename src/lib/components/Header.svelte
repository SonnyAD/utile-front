<script>
	export let title;
	export let subtitle;
	export let clientWidth;
</script>

<h1 class="w3-xxlarge">{title}</h1>

<p bind:clientWidth>{subtitle}</p>

<style>
	h1 {
		font-family: monospace;
	}

	p {
		font-family: system-ui;
		font-weight: lighter;
	}
</style>
