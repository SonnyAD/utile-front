<script>
	import { VERSION } from '$lib/Env.js';

	import { NotificationDisplay } from '$lib/notifications';
	import tippy from 'sveltejs-tippy';

	var links = [
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
			link: '/docs/',
			label: '/docs',
			description: 'API Documentation',
			title: 'API Documentation',
			newTarget: true
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
</script>

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
						└─<a class="listitem" href={link.link} title={link.title}>{link.label}</a>
					{:else}
						└─<a class="listitem" href={link.link} title={link.title} target="_blank" rel="external noopener"
							>{link.label}</a
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

<footer class="w3-container w3-margin-top w3-stretch" style="background: var(--madder-lake); color:white">
	<p>utile.space v{VERSION} &copy; 2021 All rights reserved. Website by
	<a href="https://sonny.alvesdi.as" title="Sonny Alves Dias">sonny.alvesdi.as</a></p>
</footer>

<style>

	section.w3-main {
		width: 100%;
	}

	footer {
		grid-row-start: 2;
		grid-row-end: 3;
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
