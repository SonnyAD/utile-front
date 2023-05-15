<script>
	import Header from '$lib/components/Header.svelte';
    import JSONTree from 'svelte-json-tree';

    let input = "";
    let json = undefined;

    function getTreeView(jsonString) {
        if (jsonString)
        {
            console.log("Received ", jsonString);
            try {
                json = JSON.parse(jsonString);
            } catch (e) {
                json = undefined;
            }
        }
    }

    $: {
        getTreeView(input);
    }
</script>

<Header title="JSON Tree View" subtitle="Get a tree view of your JSON" />

<div class="w3-row">

    <div class="w3-col w3-half w3-padding">
        <textarea bind:value={input} class="w3-block" style="height: 100%" rows="15"></textarea>
    </div>

    <div class="w3-col w3-half w3-padding">
        {#if json}
            <JSONTree value={json} defaultExpandedLevel={1} />
        {:else}
            &nbsp;
        {/if}
    </div>
</div>

<style>

</style>