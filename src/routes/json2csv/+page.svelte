<script>
	import Header from '$lib/components/Header.svelte';

	let input = '';
	let output;

	// function to convert JSON to CSV and keeping the labels
	function jsonToCSVWithLabels(objArray) {
		var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		var str = '';

		for (var index in array[0]) {
			str += index + ',';
		}
		str = str.slice(0, -1);
		str += '\r\n';

		for (var i = 0; i < array.length; i++) {
			var line = '';
			for (index in array[i]) {
				if (line != '') line += ',';

				line += array[i][index];
			}

			str += line + '\r\n';
		}
		return str;
	}

	$: {
		try {
			let result = jsonToCSVWithLabels(input);
			output = result;
		} catch (e) {
			// Do nothing
		}
	}
</script>

<Header title="JSON 2 CSV" subtitle="Convert a JSON array into CSV" />

<div class="w3-row">
	<div class="w3-col w3-half w3-padding">
		<label for="input">JSON</label>
		<textarea id="input" bind:value={input} class="w3-block" style="height: 100%" rows="15" />
	</div>

	<div class="w3-col w3-half w3-padding">
		<label for="output">CSV</label>
		<textarea
			id="output"
			bind:value={output}
			class="w3-block"
			style="height: 100%"
			rows="15"
			readonly
		/>
	</div>
</div>

<style>
</style>
