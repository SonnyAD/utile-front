<script>
	import { API_URL } from '$lib/Env.js';
	import { onMount } from 'svelte';

    const loadLinks = async () => {
		const res = await fetch(API_URL + '/links', {
			method: 'GET',
			headers: {
					Accept: 'application/json'
			}        
        });

		return await res.json();
	};

	let links;

	onMount(() => {
		links = loadLinks();
	});
</script>

<table style="table-layout: fixed; width: 100%">
	<thead>
		<tr>
			<th>URL</th>
			<th>Description</th>
			<th>Tags</th>
		</tr>
	</thead>
	<tbody>
		{#if links}
			{#await links}
				...
			{:then data} 
				{#each data.links as link}
					<tr>
						<td><a href={link.url} title={link.description} target="_blank" rel="noopener">{link.url}</a></td>
						<td><em>{link.description}</em></td>
						<td><small>{link.tags.join(', ')}</small></td>
					</tr>
				{/each}
			{/await}
		{/if}
	</tbody>
	<tfoot>
		<tr>
			<td colspan="3" style="text-align: center;"><button>Load More</button></td>
		</tr>
	</tfoot>
</table>

<style>
	tr>td:first-child, tr>th:first-child  {
		width: 40%;
	}
	tr>td:nth-child(2), tr>th:nth-child(2)  {
		width: 45%;
	}
	tr>td:nth-child(3), tr>th:nth-child(3)  {
		width: 15%;
	}
</style>
