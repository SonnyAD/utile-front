<script>
	import { useFocus } from "svelte-navigator";

	const registerFocus = useFocus();

    import CopyToClipboard from "svelte-copy-to-clipboard"
    import { notifier } from '@beyonk/svelte-notifications'


    import Fa from 'svelte-fa'
    import { faSync } from '@fortawesome/free-solid-svg-icons'

    let domain;
    let currentDomain;
    let resolution;
    let inputField = null;


    const roll = async (domain) => {
        const res = await fetch('https://utile.space/api/dns/'+domain, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },            
        });

        inputField.value = '';
        currentDomain = domain;
        return await res.json();
    };

    function resolve() {
        currentDomain = domain;
        resolution = roll(domain);
    }


    const onKeyPress = e => {
        if (e.charCode === 13) 
            resolution = roll(domain)
    };

    const copied = () => {
         notifier.success('IP copied to clipboard!');
    };
</script>



<h2 style="margin-top: 0">DNS Resolver</h2>

<input
    bind:value={domain}
    bind:this={inputField}
    on:keypress={onKeyPress}
    type="text"
    name="domain"
    placeholder="Domain"
    use:registerFocus
/>
<button on:click="{resolve}">Resolve</button>
{#if resolution}
    <table class="styled-table">
        <thead>
            <tr>
                <th><strong>{currentDomain}</strong></th>
                <th style="text-align: right"><button on:click="{() => resolution = roll(currentDomain)}"><Fa icon={faSync} primaryColor="#a02c2c" /></button></th>
            </tr>
        </thead>
        <tbody>
            {#await resolution}
                <tr><td>...</td></tr>
            {:then data}
                {#each data.addresses as address}
                    <tr>
                        <td>
                            {address} 
                        </td>
                        <td style="text-align: right;">                            
                            <CopyToClipboard text={address} on:copy={copied} on:fail={() => {}} let:copy>
                                <button on:click={copy}>Copy</button>
                            </CopyToClipboard>
                        </td>
                    </tr>
                {/each}                
            {:catch error}
                <tr><td><em>No record found</em></td></tr>
            {/await}
        <tbody>        
    </table>
{/if}


<style>
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

    .styled-table tbody button {
        background-color: #dcdcdc;
    }

    .styled-table tbody button:hover {
        background-color: #e2e2e2;
    }    

    .styled-table tbody tr:last-of-type {
        border-bottom: 2px solid #c83737;
    }
</style>