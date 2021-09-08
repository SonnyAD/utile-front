<script>
	import CopyToClipboard from 'svelte-copy-to-clipboard';
	import { notifier } from '../lib/notiications';

	import Fa from 'svelte-fa/src/fa.svelte';
	import { faSync } from '@fortawesome/free-solid-svg-icons';

	import Button from '../lib/Button.svelte';

	function receiveDispatch(e) {
		openIPDetails(e.detail.text);
	}

	function openIPDetails(ip) {
		let win = window.open('https://utile.space/ip/?ip=' + ip, '_blank');
		win.focus();
	}

	let domain;
	let type;
	let currentDomain;
	let resolution;
	let inputField = null;

	const roll = async (type, domain) => {
		const res = await fetch('https://utile.space/api/dns/' + type + '/' + domain, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		inputField.value = '';
		currentDomain = domain;
		return await res.json();
	};

	function resolve() {
		currentDomain = domain;
		domain = '';
		resolution = roll(type, currentDomain);
	}

	const onKeyPress = (e) => {
		if (e.charCode === 13) {
			currentDomain = domain;
			domain = '';
			resolution = roll(type, currentDomain);
		}
	};

	const copied = () => {
		notifier.success('IP copied to clipboard!');
	};
</script>

<h2 style="margin-top: 0">DNS Resolver</h2>

<form on:submit|preventDefault={resolve}>
	<input
		bind:value={domain}
		bind:this={inputField}
		on:keypress={onKeyPress}
		type="text"
		name="domain"
		placeholder="Domain"
	/>
	<select name="type" bind:value={type}>
		<option value="">DNS</option>
		<option value="aaaa">AAAA</option>
		<option value="caa">CAA</option>
		<option value="cname">CNAME</option>
		<option value="dmarc">DMARC</option>
		<option value="mx">MX</option>
		<option value="ns">NS</option>
		<option value="txt">TXT</option>
	</select>
	<button disabled={!domain} type="submit" class="utile-button">Resolve</button>
</form>
{#if resolution}
	<table class="styled-table">
		<thead>
			<tr>
				<th><strong>{currentDomain}</strong></th>
				<th style="text-align: right"
					><button on:click={() => (resolution = roll(currentDomain))}
						><Fa icon={faSync} primaryColor="#a02c2c" /></button
					></th
				>
			</tr>
		</thead>
		<tbody>
			{#await resolution}
				<tr><td colspan="2">...</td></tr>
			{:then data}
				{#if 'addresses' in data}
					{#each data.addresses as address}
						<tr>
							<td>
								{address}
							</td>
							<td style="text-align: right;">
								<Button
									toggle="false"
									text="Details"
									sendDispatch={address}
									on:message={receiveDispatch}
								/>
								<CopyToClipboard text={address} on:copy={copied} on:fail={() => {}} let:copy>
									<button on:click={copy}>Copy</button>
								</CopyToClipboard>
							</td>
						</tr>
					{/each}
				{:else if 'hosts' in data}
					{#each data.hosts as host}
						<tr>
							<td>
								{host}
							</td>
							<td style="text-align: right;">
								<CopyToClipboard text={host} on:copy={copied} on:fail={() => {}} let:copy>
									<button on:click={copy}>Copy</button>
								</CopyToClipboard>
							</td>
						</tr>
					{/each}
				{:else if 'records' in data}
					{#each data.records as record}
						<tr>
							<td>
								{record.host}
								{record.pref}
							</td>
							<td style="text-align: right;">
								<CopyToClipboard text={record.host} on:copy={copied} on:fail={() => {}} let:copy>
									<button on:click={copy}>Copy</button>
								</CopyToClipboard>
							</td>
						</tr>
					{/each}
				{:else if 'values' in data}
					{#each data.values as value}
						<tr>
							<td>
								{value}
							</td>
							<td style="text-align: right;">
								<CopyToClipboard text={value} on:copy={copied} on:fail={() => {}} let:copy>
									<button on:click={copy}>Copy</button>
								</CopyToClipboard>
							</td>
						</tr>
					{/each}
				{:else if 'value' in data}
					<tr>
						<td>
							{data.value}
						</td>
						<td style="text-align: right;">
							<CopyToClipboard text={data.value} on:copy={copied} on:fail={() => {}} let:copy>
								<button on:click={copy}>Copy</button>
							</CopyToClipboard>
						</td>
					</tr>
				{:else}
					<tr><td><em>No record found</em></td></tr>
				{/if}
			{:catch error}
				<tr><td><em>No record found</em></td></tr>
			{/await}
		</tbody><tbody />
	</table>
{/if}

<style>
	.utile-button,
	.utile-button:active {
		background-color: #c83737;
		color: white;
	}
	.utile-button:hover {
		background-color: #a02c2c;
		color: white;
		cursor: pointer;
	}

	.styled-table {
		border-collapse: collapse;
		border-radius: 6px 6px 0px 0px;
		margin: 25px 50px;
		font-size: 0.9em;
		font-family: sans-serif;
		min-width: 400px;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	.styled-table thead tr {
		background-color: #c83737;
		color: #ffffff;
		text-align: left;
	}

	.styled-table th,
	.styled-table td {
		padding: 12px 15px;
		vertical-align: middle;
	}

	.styled-table th button,
	.styled-table td button {
		margin: auto;
	}

	.styled-table tbody tr {
		border-bottom: 1px solid #dddddd;
	}

	.styled-table tbody tr:nth-of-type(even) {
		background-color: #f3f3f3;
	}

	.styled-table tbody tr button {
		background-color: #dcdcdc;
	}

	.styled-table tbody button:hover {
		background-color: #e2e2e2;
	}

	.styled-table tbody tr:last-of-type {
		border-bottom: 2px solid #c83737;
	}
</style>
