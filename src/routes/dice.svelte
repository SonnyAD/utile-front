<script>
	import Die from '../lib/Die.svelte';

	let customDie = 50;
</script>

<h2>Dice</h2>

<div class="w3-container w3-responsive">
	<div class="w3-row w3-border-bottom w3-border-black w3-padding-small w3-large">
		<div class="w3-col w3-third w3-center"><strong>Die</strong></div>
		<div class="w3-col w3-third w3-center"><strong>Result</strong></div>
		<div class="w3-col w3-third w3-center">&nbsp;</div>
	</div>

	<div class="dice-row w3-row w3-padding-small">
		<div class="w3-col w3-third w3-center"><img src="d2.svg" alt="D2" /></div>
		<Die faces="2" />
	</div>
	<div class="dice-row w3-row w3-padding-small">
		<div class="w3-col w3-third w3-center"><img src="d6.svg" alt="D6" /></div>
		<Die faces="6" />
	</div>
	<div class="dice-row w3-row w3-padding-small">
		<div class="w3-col w3-third w3-center"><img src="d20.svg" alt="D20" /></div>
		<Die faces="20" />
	</div>
	<div class="dice-row w3-row w3-padding-small">
		<div class="w3-col w3-third w3-center"><img src="d100.svg" alt="D100" /></div>
		<Die faces="100" />
	</div>
	<div class="dice-row w3-row w3-padding-small">
		<div class="w3-col w3-third w3-center">
			Custom dice<br />
			<input type="range" step="1" min="2" max="100" bind:value={customDie} id="customDie" />
			<label for="customDie">{customDie}</label>
		</div>
		<Die faces={customDie} />
	</div>
	<div class="w3-row">
		<div class="w3-col w3-center">
			<small>You can click repeatedly on the buttons to roll again.</small>
		</div>
	</div>
</div>

<style>
	h2 {
		margin-top: 0;
	}

	.dice-row:nth-child(even) {
		line-height: 2em;
		vertical-align: middle;
		background-color: var(--nice-grey);
	}

	.dice-row {
		vertical-align: middle;
	}

	input[type='range'] {
		-webkit-appearance: none;
		border: none;
	}

	input[type='range']:focus {
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: #c83737;
		cursor: pointer;
		margin-top: -6px;
		-webkit-appearance: none;
	}

	input[type='range']::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #c83737;
		cursor: pointer;
		-webkit-appearance: none;
	}

	input[type='range']::-webkit-progress-value {
		background: #c83737;
	}

	input[type='range']::-webkit-slider-runnable-track {
		width: 100%;
		height: 4px;
		cursor: pointer;
		background: #f2f2f2;
		border-radius: 25px;
	}
</style>
