<script>
	import { API_URL } from '$lib/Env.js';
	import { onMount } from 'svelte';

    const loadLinks = async () => {
		const res = await fetch(API_URL + '/links?start='+ next, {
			method: 'GET',
			headers: {
					Accept: 'application/json'
			}        
        });

		return await res.json();
	};

	let links = [];
	let next = "";
	let newLinks;

	onMount(() => {
		loadMore();
	});

	const loadMore = async () => {
		newLinks = loadLinks()
		newLinks.then((data) => {
			links = links.concat(data.links);
			next = data.next;
		});
	};
</script>

<h2>Links</h2>

<table style="table-layout: fixed; width: 100%">
	<thead>
		<tr>
			<th>URL</th>
			<th>Description</th>
			<th>Tags</th>
		</tr>
	</thead>
	<tbody>
		{#if links && links.length > 0}
			{#each links as link}
				<tr>
					<td><a href={link.url} title={link.description} target="_blank" rel="noopener">{link.url}</a></td>
					<td><em>{link.description}</em></td>
					<td>
						{#each link.tags as tag}
							<small style="background: {tag.color}">{tag.name}</small><br>
						{/each}
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
	<tfoot>
		{#if next != "" && newLinks}
			{#await newLinks}
				<tr>
					<td colspan="3" style="text-align: center;">...</td>
				</tr>
			{:then data} 
				<tr>
					<td colspan="3" style="text-align: center;"><button on:click={loadMore}>Load More</button></td>
				</tr>
			{/await} 
		{/if}
	</tfoot>
</table>

<style>
	h2 {
		margin-top: 0;
	}

	small {
		background:var(--madder-lake);
		border-radius: 5px;
		padding: 2px 5px;
		color: white;
		font-size: smaller;
	}

	td {
		font-size: small;
	}

	tr {
		line-height: 3em;
		overflow: hidden;
	}

	tr:nth-child(even) {
		background-color: var(--nice-grey);
	}

	tr>td:first-child, tr>th:first-child  {
		width: 35%;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.5em;

	}
	tr>td:nth-child(2), tr>th:nth-child(2)  {
		width: 45%;
		line-height: 1.5em;
		overflow: hidden;
	}
	tr>td:nth-child(3), tr>th:nth-child(3)  {
		width: 20%;
		line-height: 1.5em;
	}
</style>
