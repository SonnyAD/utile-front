<script>
	import { VERSION } from '$lib/Env.js';

	import { NotificationDisplay } from '$lib/notifications';
	import tippy from 'sveltejs-tippy';

	var links = [
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
		/*{
      'link': '/password',
      'label': '/password',
      'description': 'Generate random password',
      'title': 'Generate password'
    },*/
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

<NotificationDisplay {themes} />

<section>
	<header>
		<div style="float:left; margin-right: 10px;">
			<img alt="Logo" src="logo.svg" />
		</div>
		<h1 style="margin: 0">utile.space</h1>
		<p>Welcome to utile.space the Swiss Army Knife services.</p>
	</header>

	<aside>
		<nav>
			<div><a href="/" title="Home">/</a></div>

			{#each links as link}
				<div use:tippy={{ content: link.description, placement: 'left', theme: 'light-border' }}>
					{#if !link.newTarget}
						└─<a class="listitem" href={link.link} title={link.title}>{link.label}</a>
					{:else}
						└─<a class="listitem" href={link.link} title={link.title} target="_blank" rel="noopener"
							>{link.label}</a
						>
					{/if}
				</div>
			{/each}
		</nav>
	</aside>

	<article>
		<slot />
	</article>

	<footer>
		utile.space v{VERSION} &copy; 2021 All rights reserved. Website by
		<a href="https://sonny.alvesdi.as" title="Sonny Alves Dias">sonny.alvesdi.as</a>
	</footer>
</section>

<style>
	nav {
		text-align: left;
	}

	section {
		grid-template-columns: 1fr 20% 60% 20% 1fr;
		grid-template-rows: 200px auto 50px;
		display: grid;
		grid-column-gap: 0px;
	}

	header {
		grid-column: 2 / 5;
		grid-row: 1 / 2;
	}

	aside {
		grid-column: 2 / 3;
		grid-row: 2 / 3;
		max-height: 300px;
		overflow: auto;
	}

	article {
		border: none;
		grid-column: 3 / 5;
		grid-row: 2 / 3;
	}

	footer {
		grid-column: 2 / 5;
		grid-row: 3 / 4;
	}
</style>
