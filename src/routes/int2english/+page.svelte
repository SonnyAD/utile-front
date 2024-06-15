<script>
	import Header from '$lib/components/Header.svelte';
    import { notifier } from '$lib/notifications';
    import CopyToClipboard from 'svelte-copy-to-clipboard';

    let input = "";
    let output = "";

    // function to decode base64 strings
    function int2english() {
        output = numberToWords(parseInt(input))
    }

    const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    function numberToWords(num) {
        if (num === 0) return "Zero";

        let word = "";
        let i = 0;

        while (num > 0) {
            if (num % 1000 !== 0) {
                word = helper(num % 1000) + thousands[i] + " " + word;
            }
            num = Math.floor(num / 1000);
            i++;
        }

        return word.trim();
    }
    
    function helper(num) {
        if (num === 0) {
            return "";
        } else if (num < 20) {
            return belowTwenty[num] + " ";
        } else if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" : "") + belowTwenty[num % 10] + " ";
        } else {
            return belowTwenty[Math.floor(num / 100)] + " Hundred " + helper(num % 100);
        }
    }

    const copied = () => {
		notifier.success('String copied to clipboard!');
	};
</script>

<Header title="Int2English" subtitle="Convert integers to English string" />

<textarea bind:value={input} class="w3-block" rows="5"></textarea>

<p>
    <button class="w3-button w3-ripple w3-theme w3-round" on:click="{int2english}">To English</button>
</p>

{#if output}
    <h3>Result</h3>
    <blockquote>
        <p>{output}</p>
        <p>
            <CopyToClipboard text={output} on:copy={copied} on:fail={() => {}} let:copy>
                <button class="w3-button w3-round grey" on:click={copy}>Copy</button>
            </CopyToClipboard>
        </p>
    </blockquote>
{:else}
    <p>&nbsp;</p>
{/if}

<style>
	button.grey {
		background-color: #dcdcdc;
	}

	button.grey:hover {
		background-color: #e2e2e2;
	}

</style>