<script>
	import { API_URL } from '$lib/Env.js';

    const links = fetch(API_URL + '/links', {
        method: 'GET',
        headers: {
				Accept: 'application/json'
			}        
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
        {#await links}
            ...
        {:then data} 
            {#each data.links as link}
                <tr>
                    <td><a href={link.url} title={link.description}>{link.url}</a></td>
                    <td>{link.description}</td>
                    <td>{link.tags.join(', ')}</td>
                </tr>
            {/each}
        {/await}
	</tbody>
	<tfoot>
		<tr>
			<td colspan="3" style="text-align: center;"><button>Load More</button></td>
		</tr>
	</tfoot>
</table>

<style>
	
</style>
