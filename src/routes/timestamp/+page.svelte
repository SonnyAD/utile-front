<script>
	import Header from '$lib/components/Header.svelte';
    import { notifier } from '$lib/notifications';
    import CopyToClipboard from 'svelte-copy-to-clipboard';

    let input = "";
    let output = "";

    // function to convert timestamp to date
    function convertTimestamp() {
        let timestamp = input;
        let d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
            dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
            ampm = 'AM',
            time;
                
        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh == 0) {
            h = 12;
        }
        
        // ie: 2013-02-18, 8:35 AM	
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
            
        output = time;
    }

    // function to convert date to timestamp
    function convertDateToTimestamp() {
        let date = input;
        let d = new Date(date),
            timestamp = d.getTime() / 1000;
        
        output = timestamp;
    }

    const copied = () => {
		notifier.success('Copied to clipboard!');
	};
</script>

<Header title="Timestamp" subtitle="Convert timestamp to date and vice-versa" />

<textarea bind:value={input} class="w3-block" rows="5"></textarea>

<p>
    <button class="w3-button w3-ripple w3-theme w3-round" on:click="{convertTimestamp}">To Date</button>
    <button class="w3-button w3-ripple w3-theme w3-round" on:click="{convertDateToTimestamp}">To Timestamp</button>
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