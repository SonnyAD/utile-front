<script>
	import { API_URL } from '$lib/Env.js';
	import { onMount } from 'svelte';

	const loadLinks = async () => {
		const res = await fetch(API_URL + '/links?start=' + next, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		return await res.json();
	};

	let links = [];
	let next = '';
	let newLinks;

	onMount(() => {
		loadMore();
	});

	const loadMore = async () => {
		newLinks = loadLinks();
		newLinks.then((data) => {
			links = links.concat(data.links);
			next = data.next;
		});
	};
</script>

<h2>Links</h2>

<div class="w3-container w3-responsive">
	<div class="w3-row w3-border-bottom w3-border-black w3-padding-small w3-large">
		<div class="w3-col l3 m12 s12"><strong>URL</strong></div>
		<div class="w3-col l7 m12 s12"><strong>Description</strong></div>
		<div class="w3-col l2 m12 s12"><strong>Tags</strong></div>
	</div>
	{#if links && links.length > 0}
		{#each links as link}
			<div class="links-row w3-row w3-padding-small">
				<div class="w3-col l3 m6 s12">
					<a href={link.url} title={link.description} target="_blank" rel="noopener"
						><strong>{link.url.replace(/https?:\/\//,'')}</strong></a
					>
				</div>
				<div class="w3-col l7 m6 s12"><em>{link.description}</em>&nbsp;</div>
				<div class="w3-col l2 m12 s12">
					{#each link.tags as tag}
						<small class="w3-tag w3-padding-small w3-{tag.color}" style="margin: 0 5px 5px 0;"
							>{tag.name}</small
						>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
	<div class="w3-row w3-light-grey">
		{#if next != '' && newLinks}
			{#await newLinks}
				<div class="w3-center">...</div>
			{:then data}
				<div class="w3-center">
					<button on:click={loadMore} class="w3-btn w3-red w3-ripple">Load More</button>
				</div>
			{/await}
		{/if}
	</div>
</div>

<style>
	h2 {
		margin-top: 0;
	}

	.w3-row:nth-child(even), .w3-row:last-child {
		background-color: var(--nice-grey);
	}

	.links-row {
		font-size: small;
	}

	.links-row > .w3-col:first-child {
		line-height: 1.5em;

		white-space: nowrap;
		text-overflow: ellipsis;
		display: block;
		overflow: hidden;
	}
	.links-row > .w3-col:nth-child(2) {
		line-height: 1.5em;
		height: 3em;

		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	@supports (-webkit-line-clamp: 2) {
		.links-row > .w3-col:nth-child(2) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: initial;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}
</style>
