<script>
	import Die from '../lib/Die.svelte';
</script>

<table style="table-layout: fixed;">
	<thead>
		<tr>
			<th>Roll D2</th>
			<th>Roll D6</th>
			<th>Roll D20</th>
			<th>Roll D100</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><Die faces="2" /></td>
			<td><Die faces="6" /></td>
			<td><Die faces="20" /></td>
			<td><Die faces="100" /></td>
		</tr>
	</tbody>
	<tfoot>
		<tr>
			<td colspan="4" style="text-align: center;"
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
</style>
