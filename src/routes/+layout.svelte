<script>
// @ts-nocheck

	import '../app.css';

	import { NotificationDisplay } from '$lib/notifications';
	import tippy from 'sveltejs-tippy';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

	var links = [
		{
			link: '/about',
			label: '/about',
			description: 'About this website',
			title: 'About this website'
		},
		{
			link: '/api',
			label: '/api',
			description: 'utile.space API',
			title: 'utile.space API'
		},
		{
			link: '/base64',
			label: '/base64',
			description: 'Encode/decode data in base64',
			title: 'Encrypt or decrypt base64'
		},
		{
			link: '/dice',
			label: '/d[2-100]',
			description: 'Roll dice between 2 and 100',
			title: 'Roll a dice'
		},
		{
			link: '/dns',
			label: '/dns',
			description: 'Resolve a domain name',
			title: 'Roll a dice'
		},
		{
			link: '/api/docs/',
			label: '/docs',
			description: 'API Documentation',
			title: 'API Documentation',
			newTarget: true
		},
		{
			link: '/int2english',
			label: '/int2english',
			description: 'Convert integers to English string',
			title: 'Convert integers to English string'
		},
		{
			link: '/ip/',
			label: '/ip',
			description: 'Get your IP',
			title: 'Get your IP',
			newTarget: true
		},
		{
			link: '/json',
			label: '/json',
			description: 'Get a Tree View of your JSON',
			title: 'Get a Tree View of your JSON'
		},
		{
			link: '/json2csv',
			label: '/json2csv',
			description: 'Convert JSON to CSV',
			title: 'Convert JSON to CSV'
		},
		{
			link: '/links/',
			label: '/links',
			description: 'Retrieve my useful links',
			title: 'Retrieve my useful links'
		},
		{
			link: '/lorem/',
			label: '/lorem',
			description: 'Generate a lorem ipsum paragraph',
			title: 'Generate lorem ipsum'
		},
		{
			link: '/password',
			label: '/password',
			description: 'Generate random password',
			title: 'Generate password'
		},
		{
			link: '/pdf/',
			label: '/pdf',
			description: 'Free PDF files I am resharing',
			title: 'Free PDF',
			newTarget: true
		},
		{
			link: '/timestamp/',
			label: '/timestamp',
			description: 'Convert timestamp to date and vice-vers',
			title: 'Convert timestamp'
		},
		{
			link: '/uuid',
			label: '/uuid',
			description: 'Generate UUIDs',
			title: 'Generate UUIDs'
		}
	];

	let themes = {
		// These are the defaults
		danger: '#b0615b',
		success: '#5bb065',
		warning: '#b08a5b',
		info: '#5b87b0',
		default: '#dddddd' // relates to simply '.show()'
	};

	let title = 'Home';

	/**
	 * @param {string} newTitle
	 */
	function updateTitle(newTitle) {
		title = newTitle;
	}
</script>

<svelte:head>
	<title>utile.space — {title}</title>
</svelte:head>

<section class="w3-main w3-row-padding w3-content w3-margin-top w3-margin-bottom">
	<aside class="w3-collapse w3-padding w3-quarter">
		<header class="w3-center">
			<img alt="Logo" src="logo.svg" />
			<div class="w3-large w3-monospace"><strong>utile.space</strong></div>
		</header>

		<nav class="w3-padding-large">
			<div><a href="/" title="Home">/</a></div>

			{#each links as link}
				<div use:tippy={{ content: link.description, placement: 'left', theme: 'light-border' }}>
					{#if !link.newTarget}
						└─<a
							class="listitem"
							href={link.link}
							title={link.title}
							on:click={() => updateTitle(link.title)}>{link.label}</a
						>
					{:else}
						└─<a
							class="listitem"
							href={link.link}
							title={link.title}
							target="_blank"
							rel="external noopener"
							>{link.label}<sup>&nbsp;<Fa icon={faArrowUpRightFromSquare} /></sup></a
						>
					{/if}
				</div>
			{/each}
		</nav>
	</aside>

	<article class="w3-threequarter">
		<slot />
	</article>

	<NotificationDisplay {themes} />
</section>

<style>
	section.w3-main {
		width: 100%;
	}

	nav {
		text-align: left;
		font-family: var(--mono) !important;
	}

	nav > div {
		display: list-item;
		list-style-type: none;
		font-size: medium;
		margin-bottom: 0px;
	}

	nav > div > a {
		text-decoration: none;
	}

	nav > div > a:hover {
		text-decoration: underline;
	}

	a:active {
		color: var(--madder-lake);
	}
</style>
