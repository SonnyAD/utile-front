<script>
	import Header from '$lib/components/Header.svelte';
    import { notifier } from '$lib/notifications';
    import CopyToClipboard from 'svelte-copy-to-clipboard';

    let output = "";

    // generate n paragraph of lorem ipsum
    function generateLoremIpsum() {
        let loremIpsum = "";
        for (let i = 0; i < 20; i++) {
            loremIpsum += `<p>${loremIpsumGenerator.generateParagraphs(1)}</p>`;
        }
        return loremIpsum;
    }  

    const copied = () => {
		notifier.success('Password copied to clipboard!');
	};
</script>

<Header title="Lorem Ipsum" subtitle="Use this page to generate lorem ipsum strings and paragraphs." />

{#if output}
    <p>{output}</p>
{:else}
    <p>&nbsp;</p>
{/if}

<p>
    <CopyToClipboard text={output} on:copy={copied} on:fail={() => {}} let:copy>
        <button class="w3-button w3-round grey" on:click={copy}>Copy</button>
    </CopyToClipboard>

    <button class="w3-button w3-ripple w3-theme w3-round" on:click="{generateLoremIpsum}">Generate</button></p>

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}

</style>