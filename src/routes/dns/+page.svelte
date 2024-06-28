<script>
	import { notifier } from '$lib/notifications';
	import { API_URL } from '$lib/Env.js';
	import Button from '$lib/Button.svelte';
	import Header from '$lib/components/Header.svelte';

	import { copy } from 'svelte-copy';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faSync } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';

	/**
	 * @param {{ detail: { text: string; }; }} e
	 */
	function receiveDispatch(e) {
		openIPDetails(e.detail.text);
	}

	/**
	 * @param {string} ip
	 */
	function openIPDetails(ip) {
		let win = window.open('https://utile.space/ip/?ip=' + ip, '_blank');
		win?.focus();
	}

	/**
	 * @type {string}
	 */
	let domain;
	/**
	 * @type {string}
	 */
	let type;
	/**
	 * @type {any}
	 */
	let currentDomain;
	/**
	 * @type {any}
	 */
	let currentType;
	/**
	 * @type {Promise<any>}
	 */
	let resolution;
	/**
	 * @type {HTMLInputElement | null}
	 */
	let inputField = null;

	onMount(() => {
		inputField?.focus();
	});

	const roll = async (/** @type {string} */ type, /** @type {string} */ domain) => {
		const res = await fetch(API_URL + '/dns/' + type + '/' + domain, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (inputField != null) inputField.value = '';
		currentDomain = domain;
		currentType = type;
		return await res.json();
	};

	function resolve() {
		currentDomain = domain;
		domain = '';
		resolution = roll(type, currentDomain);
	}

	function onchange() {
		if (inputField != null) inputField.placeholder = type != 'ptr' ? 'Domain' : 'IP';
	}

	const onKeyPress = (/** @type {{ charCode: number; }} */ e) => {
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

<Header
	title="DNS Resolver"
	subtitle="Use this page to resolve various type DNS of records: A, CNAME, MX, TXT, etc."
/>

<form on:submit|preventDefault={resolve} class="w3-container w3-row-padding">
	<div class="w3-col m5 l5">
		<input
			bind:value={domain}
			bind:this={inputField}
			on:keypress={onKeyPress}
			type="text"
			name="domain"
			placeholder="Domain"
			class="w3-input w3-round"
		/>
	</div>
	<div class="w3-col m5 l4">
		<select name="type" bind:value={type} on:change={onchange} class="w3-select w3-round">
			<option value="">DNS</option>
			<option value="aaaa">AAAA</option>
			<option value="caa">CAA</option>
			<option value="cname">CNAME</option>
			<option value="dmarc">DMARC</option>
			<option value="mx">MX</option>
			<option value="ns">NS</option>
			<option value="txt">TXT</option>
			<option value="ptr">PTR</option>
		</select>
	</div>
	<div class="w3-col m2 l3">
		<button disabled={!domain} type="submit" class="w3-button utile-button w3-round">Resolve</button
		>
	</div>
</form>
{#if resolution}
	<table class="styled-table w3-margin">
		<thead>
			<tr>
				<th><strong>{currentDomain}</strong></th>
				<th class="w3-right"
					><button
						class="w3-button w3-round w3-light-grey"
						on:click={() => (resolution = roll(currentType, currentDomain))}
						><Fa icon={faSync} primaryColor="#a02c2c" /></button
					></th
				>
			</tr>
		</thead>
		<tbody>
			{#await resolution}
				<tr><td colspan="2">...</td></tr>
			{:then data}
				{#if data.type == 'dns'}
					{#each data.resolution.addresses as address}
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
								<button
									class="w3-button w3-round"
									use:copy={address}
									on:svelte-copy={() => copied()}>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'aaaa'}
					{#each data.resolution.hosts as host}
						<tr>
							<td>
								{host}
							</td>
							<td style="text-align: right;">
								<button class="w3-button w3-round" use:copy={host} on:svelte-copy={() => copied()}
									>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'ns'}
					{#each data.resolution.hosts as host}
						<tr>
							<td>
								{host}
							</td>
							<td style="text-align: right;">
								<button class="w3-button w3-round" use:copy={host} on:svelte-copy={() => copied()}
									>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'mx'}
					{#each data.resolution.records as record}
						<tr>
							<td>
								{record.host}
								{record.pref}
							</td>
							<td style="text-align: right;">
								<button
									class="w3-button w3-round"
									use:copy={record.host}
									on:svelte-copy={() => copied()}>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'caa'}
					{#each data.resolution.records as record}
						<tr>
							<td>
								{record.flag}
								{record.tag}
								{record.value}
							</td>
							<td style="text-align: right;">
								<button
									class="w3-button w3-round"
									use:copy={record.value}
									on:svelte-copy={() => copied()}>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'txt'}
					{#each data.resolution.values as value}
						<tr>
							<td>
								{value}
							</td>
							<td style="text-align: right;">
								<button class="w3-button w3-round" use:copy={value} on:svelte-copy={() => copied()}
									>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'ptr'}
					{#each data.resolution.domains as domain}
						<tr>
							<td>
								{domain}
							</td>
							<td style="text-align: right;">
								<button class="w3-button w3-round" use:copy={domain} on:svelte-copy={() => copied()}
									>Copy</button
								>
							</td>
						</tr>
					{/each}
				{:else if data.type == 'cname'}
					<tr>
						<td>
							{data.resolution.value}
						</td>
						<td style="text-align: right;">
							<button
								class="w3-button w3-round"
								use:copy={data.resolution.value}
								on:svelte-copy={() => copied()}>Copy</button
							>
						</td>
					</tr>
				{:else if data.type == 'dmarc'}
					<tr>
						<td>
							{data.resolution.value}
						</td>
						<td style="text-align: right;">
							<button
								class="w3-button w3-round"
								use:copy={data.resolution.value}
								on:svelte-copy={() => copied()}>Copy</button
							>
						</td>
					</tr>
				{:else}
					<tr><td><em>No record found</em></td></tr>
				{/if}
			{:catch error}
				<tr><td><em>No record found ({error.message})</em></td></tr>
			{/await}
		</tbody>
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
