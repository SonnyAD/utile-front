<script>
	import { API_URL } from '$lib/Env';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';

	/**
	 * @type {any[]}
	 */
	let links = [];
	let next = '';
	let initialLoadDone = false;

	let searchTerm = '';
	let loadingMore = false;
	let searching = false;
	/**
	 * @type {HTMLInputElement}
	 */
	let inputField;

	onMount(async () => {
		inputField.focus();

		const res = await fetch(API_URL + '/links', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		const data = await res.json();

		links = data.links;
		next = data.next;
		initialLoadDone = true;
	});

	const loadMore = async () => {
		if (initialLoadDone == false) return;

		loadingMore = true;
		const res = await fetch(API_URL + '/links?start=' + next, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		const data = await res.json();

		links = links.concat(data.links);
		next = data.next;
	};

	const search = async (term) => {
		if (initialLoadDone == false) return;

		searching = true;
		links = [];
		const res = await fetch(API_URL + '/links?search=' + term, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		const data = await res.json();

		links = data.links;
		next = data.next;
		searching = false;
	};

	const onKeyPress = (e) => {
		// RETURN / ENTER
		if (e.charCode === 13) {
			search(searchTerm);
		}
	};

	const onKeyDown = (e) => {
		// ESCAPE
		if (e.keyCode === 27) {
			searchTerm = '';
		}
	};

	const onSubmit = () => {
		search(searchTerm);
	};
</script>

<svelte:window on:keydown={onKeyDown} />

<Header
	title="Links"
	subtitle="Find below a list of curated links for software engineers on various subject like DevOps, GameDev or others."
/>

<hr />

<div class="w3-container w3-section" on:keydown={onKeyPress}>
	<form class="w3-row" on:submit|preventDefault={onSubmit}>
		<div class="w3-col l10 m10 s10" style="padding-right: 4px">
			<input
				type="text"
				bind:value={searchTerm}
				bind:this={inputField}
				on:keypress={onKeyPress}
				class="w3-input w3-round"
			/>
		</div>
		<div class="w3-rest" style="padding-left: 4px">
			<input type="submit" value="Search" class="w3-button w3-ripple w3-theme w3-block w3-round" />
		</div>
	</form>
</div>

<div class="w3-container w3-responsive">
	<div class="w3-row w3-border-bottom w3-border-black w3-padding-small w3-large">
		<div class="w3-col l3 m12 s12"><strong>URL</strong></div>
		<div class="w3-col l7 m12 s12"><strong>Description</strong></div>
		<div class="w3-col l2 m12 s12"><strong>Tags</strong></div>
	</div>
	<div class="w3-row w3-margin-bottom" style="overflow-y: scroll; height: 75vh;">
		{#if searching}
			<div class="links-row w3-row w3-padding-small w3-border-bottom w3-hover-border-blue">
				<div class="w3-col l12 m12 s12"><em>Searching...</em></div>
			</div>
		{:else if links.length > 0}
			{#each links as link}
				<div class="links-row w3-row w3-padding-small w3-border-bottom w3-hover-border-blue">
					<div class="w3-col l3 m6 s12">
						<a href={link.url} title={link.description} target="_blank" rel="noopener"
							><strong>{link.url.replace(/https?:\/\//, '')}</strong></a
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
		{:else}
			<div class="links-row w3-row w3-padding-small w3-border-bottom w3-hover-border-blue">
				<div class="w3-col l12 m12 s12">
					<em>{!initialLoadDone ? 'Loading...' : 'No results.'}</em>
				</div>
			</div>
		{/if}
	</div>
	<div class="w3-row w3-light-grey">
		{#if next != ''}
			{#if loadingMore}
				<div class="w3-center">...</div>
			{:else}
				<div class="w3-center">
					<button on:click={loadMore} class="w3-btn w3-ripple w3-theme">Load More</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.links-row {
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
