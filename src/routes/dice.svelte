<script>
	import Die from '../lib/Die.svelte';

	let customDie = 50;
</script>

<table style="table-layout: fixed; width: 100%">
	<thead>
		<tr>
			<th>Die</th>
			<th>Result</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><img src="d2.svg" alt="D2"/></td>
			<Die faces="2" />
		</tr>
		<tr>
			<td><img src="d6.svg" alt="D6"/></td>
			<Die faces="6" />
		</tr>
		<tr>
			<td><img src="d20.svg" alt="D20"/></td>
			<Die faces="20" />
		</tr>
		<tr>
			<td><img src="d100.svg" alt="D100"/></td>
			<Die faces="100" />
		</tr>
		<tr>
			<td>
				Custom dice<br/>
				<input type="range" step="1" min="2" max="100" bind:value="{customDie}" id="customDie"> <label for="customDie">{customDie}</label>
			</td>
			<Die faces="{customDie}" />
		</tr>
	</tbody>
	<tfoot>
		<tr>
			<td colspan="3" style="text-align: center;"
				><small>You can click repeatedly on the buttons to roll again.</small></td
			>
		</tr>
	</tfoot>
</table>

<style>
	small {
		font-size: small;
		font-style: italic;
		margin-left: 0.25rem;
	}

	td {
		text-align: center;
	}

	tr>th:first-child, tr>td:first-child {
		width: 33%;
	}

	input[type=range] {
		-webkit-appearance: none;
		border: none;
	}

	input[type=range]:focus {
		outline: none;
	}

	input[type=range]::-webkit-slider-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: #c83737;
		cursor: pointer;
		margin-top: -6px;
		-webkit-appearance: none;
	}

	input[type=range]::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #c83737;
		cursor: pointer;
		-webkit-appearance: none;
	}

	input[type=range]::-webkit-progress-value {
		background: #c83737;
	}

	input[type=range]::-webkit-slider-runnable-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		background: #f2f2f2;
		border-radius: 25px;
	}
</style>
