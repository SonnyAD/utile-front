<script>
	import Header from '$lib/components/Header.svelte';
	import Fa from 'svelte-fa';
	import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
</script>

<Header title="utile.space API Usage License" subtitle="Free Usage with Rate Limitation" />

<p>
	Permission is hereby granted, free of charge, to any person using the API available at <br /><code
		>https://utile.space/api/</code
	> (the "API"), subject to the following conditions:
</p>
<ol>
	<li>
		<strong>Rate Limitation</strong>: The API usage is limited to one (1) request per second. Users
		needing a higher request rate may contact us at <a href="#mail">api (at) utile.space</a> to discuss
		and arrange for higher rate limits, subject to additional terms.
	</li>
	<li>
		<strong>Prohibited Use</strong>: Users may not use the API in a manner that adversely impacts
		the stability, performance, or availability of the API for other users.
	</li>
	<li>
		<strong>API Documentation</strong>: Comprehensive documentation for the API is available at
		<a
			href="https://utile.space/api/docs/"
			title="API Documentation"
			target="_blank"
			rel="external noopener"
			>https://utile.space/api/docs/<sup>&nbsp;<Fa icon={faArrowUpRightFromSquare} /></sup></a
		>.
	</li>
	<li>
		<strong>Disclaimer of Warranties</strong>: The API is provided "as is", without warranty of any
		kind, express or implied, including but not limited to the warranties of merchantability,
		fitness for a particular purpose, and noninfringement. In no event shall the authors or
		copyright holders be liable for any claim, damages, or other liability, whether in an action of
		contract, tort, or otherwise, arising from, out of, or in connection with the API or the use or
		other dealings in the API.
	</li>
	<li>
		<strong>Modifications</strong>: We reserve the right to modify the terms of this license at any
		time. Continued use of the API constitutes acceptance of the modified terms.
	</li>
</ol>
<p>
	For any inquiries, please contact us at <a href="#mail">api (at) utile.space</a>.
</p>
