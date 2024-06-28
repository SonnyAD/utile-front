<script>
	import Header from '$lib/components/Header.svelte';
	import { notifier } from '$lib/notifications';
	import { copy } from 'svelte-copy';
	import { onMount } from 'svelte';

	let output = '';

	let lorem = [];
	lorem.push(
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vestibulum sed arcu non odio euismod lacinia at quis risus. Etiam sit amet nisl purus in mollis nunc sed. Consequat id porta nibh venenatis. A diam maecenas sed enim ut sem viverra aliquet. Sapien et ligula ullamcorper malesuada proin. Tristique magna sit amet purus gravida. Erat nam at lectus urna duis convallis convallis tellus id. Quis varius quam quisque id diam vel. Vel pharetra vel turpis nunc eget lorem dolor sed viverra. A scelerisque purus semper eget. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur.'
	);
	lorem.push(
		'Gravida quis blandit turpis cursus in. Bibendum enim facilisis gravida neque. Libero enim sed faucibus turpis. Tempor commodo ullamcorper a lacus. Mi quis hendrerit dolor magna eget est lorem. Nulla malesuada pellentesque elit eget. Turpis massa tincidunt dui ut ornare lectus sit amet est. Aliquet eget sit amet tellus cras adipiscing enim eu turpis. Dolor magna eget est lorem ipsum dolor sit. Velit egestas dui id ornare arcu odio. Lorem sed risus ultricies tristique nulla aliquet enim tortor at. Facilisi cras fermentum odio eu feugiat. Viverra mauris in aliquam sem fringilla ut morbi tincidunt. Porttitor leo a diam sollicitudin tempor id eu nisl. Morbi tristique senectus et netus et malesuada fames ac turpis. Duis at tellus at urna condimentum mattis. Porta lorem mollis aliquam ut porttitor. Fusce id velit ut tortor pretium viverra suspendisse potenti nullam. Risus quis varius quam quisque id diam vel. Est placerat in egestas erat imperdiet sed euismod.'
	);
	lorem.push(
		'Viverra vitae congue eu consequat ac felis. Lacus vel facilisis volutpat est velit. Ac turpis egestas maecenas pharetra. Leo in vitae turpis massa sed elementum tempus. Turpis tincidunt id aliquet risus feugiat in ante. Tincidunt vitae semper quis lectus nulla at volutpat diam. Interdum posuere lorem ipsum dolor. Risus pretium quam vulputate dignissim suspendisse in est ante in. Augue interdum velit euismod in pellentesque massa placerat. Ac feugiat sed lectus vestibulum mattis ullamcorper velit. Adipiscing elit pellentesque habitant morbi tristique senectus. Tellus at urna condimentum mattis. Massa vitae tortor condimentum lacinia quis. Iaculis nunc sed augue lacus. Velit dignissim sodales ut eu sem integer vitae. Et ultrices neque ornare aenean euismod elementum nisi quis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Turpis massa sed elementum tempus. Ante in nibh mauris cursus mattis molestie. Morbi tristique senectus et netus et.'
	);
	lorem.push(
		'Donec ac odio tempor orci dapibus ultrices. Sed ullamcorper morbi tincidunt ornare massa. Arcu non sodales neque sodales ut etiam sit. Nulla porttitor massa id neque aliquam vestibulum morbi blandit cursus. Morbi tincidunt ornare massa eget egestas purus viverra accumsan in. Morbi non arcu risus quis varius. Scelerisque varius morbi enim nunc faucibus a. Nulla malesuada pellentesque elit eget gravida cum. Morbi quis commodo odio aenean. Amet mauris commodo quis imperdiet massa tincidunt nunc. Varius quam quisque id diam vel quam elementum pulvinar. Purus gravida quis blandit turpis cursus in. Sed blandit libero volutpat sed cras ornare arcu. Scelerisque felis imperdiet proin fermentum leo. Elementum tempus egestas sed sed risus pretium. Scelerisque in dictum non consectetur a.'
	);
	lorem.push(
		'Tristique magna sit amet purus gravida. Pharetra pharetra massa massa ultricies mi quis hendrerit. Sit amet cursus sit amet dictum. Malesuada nunc vel risus commodo viverra maecenas accumsan. Morbi tempus iaculis urna id. Nisl condimentum id venenatis a condimentum vitae. Faucibus interdum posuere lorem ipsum. Id semper risus in hendrerit gravida rutrum quisque non. In fermentum et sollicitudin ac orci phasellus egestas tellus. Ac tincidunt vitae semper quis lectus.'
	);
	lorem.push(
		'Enim sit amet venenatis urna cursus eget nunc scelerisque. Tortor dignissim convallis aenean et tortor. Consectetur adipiscing elit duis tristique. Leo vel orci porta non. Elementum facilisis leo vel fringilla est ullamcorper eget. Maecenas pharetra convallis posuere morbi leo urna molestie at elementum. Auctor urna nunc id cursus. Varius sit amet mattis vulputate enim nulla aliquet porttitor lacus. Morbi tristique senectus et netus. Molestie ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Mattis enim ut tellus elementum sagittis vitae et. Urna cursus eget nunc scelerisque viverra. Montes nascetur ridiculus mus mauris vitae. Pretium nibh ipsum consequat nisl vel pretium. Elit at imperdiet dui accumsan sit.'
	);
	lorem.push(
		'In massa tempor nec feugiat. Donec adipiscing tristique risus nec. Sit amet nisl suscipit adipiscing bibendum est ultricies. Potenti nullam ac tortor vitae. Quis risus sed vulputate odio ut enim blandit volutpat maecenas. Pulvinar sapien et ligula ullamcorper malesuada proin libero. Sit amet mauris commodo quis imperdiet massa tincidunt. Sodales ut etiam sit amet nisl purus in. Sollicitudin ac orci phasellus egestas. Ultricies integer quis auctor elit sed vulputate mi sit. Nec dui nunc mattis enim ut tellus elementum sagittis. Enim ut sem viverra aliquet eget sit amet tellus. Consequat nisl vel pretium lectus quam id leo. Ultrices vitae auctor eu augue ut.'
	);
	lorem.push(
		'Faucibus interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Amet venenatis urna cursus eget nunc scelerisque. Sagittis purus sit amet volutpat. Est ullamcorper eget nulla facilisi etiam dignissim. Non pulvinar neque laoreet suspendisse interdum consectetur. Amet est placerat in egestas erat. Nisl rhoncus mattis rhoncus urna. Velit ut tortor pretium viverra suspendisse potenti nullam ac tortor. Ac orci phasellus egestas tellus rutrum tellus pellentesque eu. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Id porta nibh venenatis cras sed. Sit amet purus gravida quis blandit turpis cursus in. Id neque aliquam vestibulum morbi blandit. Tortor aliquam nulla facilisi cras. Erat velit scelerisque in dictum.'
	);
	lorem.push(
		'Morbi tincidunt augue interdum velit euismod. Velit aliquet sagittis id consectetur purus ut. Senectus et netus et malesuada fames ac. Venenatis a condimentum vitae sapien pellentesque habitant morbi tristique senectus. Nulla posuere sollicitudin aliquam ultrices sagittis orci a. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. Euismod quis viverra nibh cras pulvinar mattis nunc. Amet mattis vulputate enim nulla aliquet porttitor. Fringilla urna porttitor rhoncus dolor. Faucibus in ornare quam viverra orci sagittis eu. Enim nulla aliquet porttitor lacus luctus accumsan tortor posuere ac. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non. Posuere urna nec tincidunt praesent. Semper quis lectus nulla at.'
	);
	lorem.push(
		'Mauris a diam maecenas sed. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Ipsum dolor sit amet consectetur adipiscing. Semper auctor neque vitae tempus quam. Id interdum velit laoreet id donec ultrices tincidunt arcu non. Nibh tortor id aliquet lectus proin. Facilisis mauris sit amet massa vitae. Tempor commodo ullamcorper a lacus vestibulum sed. Fusce ut placerat orci nulla pellentesque dignissim enim sit. Nunc faucibus a pellentesque sit amet. Quis imperdiet massa tincidunt nunc pulvinar sapien et. Bibendum at varius vel pharetra vel turpis nunc eget. Faucibus ornare suspendisse sed nisi lacus sed viverra. Est ullamcorper eget nulla facilisi etiam dignissim. Hac habitasse platea dictumst vestibulum rhoncus. In pellentesque massa placerat duis. Vitae tortor condimentum lacinia quis vel eros. Id faucibus nisl tincidunt eget nullam non. Posuere morbi leo urna molestie. Phasellus faucibus scelerisque eleifend donec pretium vulputate.'
	);
	lorem.push(
		'Volutpat lacus laoreet non curabitur gravida arcu ac. Magna eget est lorem ipsum dolor sit. Egestas erat imperdiet sed euismod. Tincidunt nunc pulvinar sapien et ligula. Dictum sit amet justo donec. Est ante in nibh mauris. Amet commodo nulla facilisi nullam. Porta non pulvinar neque laoreet suspendisse interdum. Eget arcu dictum varius duis at consectetur. A pellentesque sit amet porttitor eget dolor morbi. Sit amet consectetur adipiscing elit ut aliquam purus.'
	);
	lorem.push(
		'Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Aliquam eleifend mi in nulla. Ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Tincidunt vitae semper quis lectus nulla at volutpat. Phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Iaculis eu non diam phasellus vestibulum lorem. Odio eu feugiat pretium nibh ipsum consequat nisl vel. At lectus urna duis convallis convallis tellus id interdum velit. Aliquet porttitor lacus luctus accumsan tortor posuere ac ut consequat. Eros in cursus turpis massa. Pulvinar elementum integer enim neque volutpat ac. Dapibus ultrices in iaculis nunc sed augue lacus viverra vitae. Eu nisl nunc mi ipsum faucibus vitae aliquet nec.'
	);
	lorem.push(
		'Mus mauris vitae ultricies leo integer malesuada. Ac placerat vestibulum lectus mauris. Vel elit scelerisque mauris pellentesque. At tempor commodo ullamcorper a lacus vestibulum sed. Hendrerit dolor magna eget est lorem ipsum dolor sit. Massa eget egestas purus viverra accumsan in. Sagittis orci a scelerisque purus semper eget. Tempor orci dapibus ultrices in iaculis nunc. At erat pellentesque adipiscing commodo elit at imperdiet dui accumsan. Aliquet sagittis id consectetur purus ut faucibus. Dolor morbi non arcu risus quis varius. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Ut tristique et egestas quis. Scelerisque felis imperdiet proin fermentum leo vel orci. Volutpat commodo sed egestas egestas. Consequat mauris nunc congue nisi vitae suscipit tellus mauris a. Libero enim sed faucibus turpis. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae.'
	);
	lorem.push(
		'Euismod quis viverra nibh cras pulvinar mattis nunc sed. Ultrices neque ornare aenean euismod elementum nisi. Viverra tellus in hac habitasse platea. Ante metus dictum at tempor. Arcu cursus vitae congue mauris rhoncus aenean vel. Ipsum consequat nisl vel pretium. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Sed euismod nisi porta lorem mollis aliquam. Scelerisque eleifend donec pretium vulputate sapien. Ut porttitor leo a diam sollicitudin tempor. Sed lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi. Erat imperdiet sed euismod nisi porta lorem mollis aliquam ut. Venenatis a condimentum vitae sapien pellentesque habitant morbi.'
	);
	lorem.push(
		'Eget mauris pharetra et ultrices. Diam maecenas sed enim ut sem. Consectetur libero id faucibus nisl tincidunt eget nullam non nisi. Odio eu feugiat pretium nibh. Ut consequat semper viverra nam libero justo laoreet sit amet. Sodales ut eu sem integer vitae. Cras fermentum odio eu feugiat pretium nibh. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant. Non odio euismod lacinia at. Sed pulvinar proin gravida hendrerit lectus a. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Nulla pharetra diam sit amet nisl suscipit. Quam elementum pulvinar etiam non quam lacus suspendisse. Est ante in nibh mauris cursus mattis molestie a. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Dolor sit amet consectetur adipiscing elit duis tristique. Felis eget nunc lobortis mattis aliquam faucibus purus.'
	);
	lorem.push(
		'Eget arcu dictum varius duis at consectetur lorem donec massa. In nulla posuere sollicitudin aliquam ultrices sagittis. Ornare massa eget egestas purus viverra accumsan in nisl. Cras sed felis eget velit aliquet sagittis id consectetur. Viverra mauris in aliquam sem fringilla. Ullamcorper velit sed ullamcorper morbi tincidunt ornare massa eget. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Proin libero nunc consequat interdum varius sit amet mattis. Ultrices vitae auctor eu augue ut. Fusce ut placerat orci nulla. Aliquam ut porttitor leo a diam. Imperdiet proin fermentum leo vel orci porta. Vestibulum lorem sed risus ultricies tristique nulla aliquet. Sed euismod nisi porta lorem mollis aliquam ut. Eu sem integer vitae justo eget.'
	);
	lorem.push(
		'Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Quis vel eros donec ac. Id cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Proin libero nunc consequat interdum varius sit. Purus viverra accumsan in nisl nisi scelerisque eu. Vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Libero volutpat sed cras ornare. Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui. Blandit massa enim nec dui nunc mattis enim ut. Vivamus at augue eget arcu dictum varius. Blandit cursus risus at ultrices mi. Porttitor lacus luctus accumsan tortor posuere. Adipiscing elit pellentesque habitant morbi tristique senectus. Vulputate dignissim suspendisse in est ante. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque viverra. Sodales ut eu sem integer vitae justo eget magna. Est ultricies integer quis auctor elit sed. Pretium quam vulputate dignissim suspendisse in est ante.'
	);
	lorem.push(
		'Consequat id porta nibh venenatis cras sed felis eget velit. Id porta nibh venenatis cras sed. Justo eget magna fermentum iaculis eu. Luctus venenatis lectus magna fringilla. Volutpat sed cras ornare arcu dui vivamus arcu. At auctor urna nunc id cursus metus aliquam eleifend mi. Est placerat in egestas erat imperdiet. Amet consectetur adipiscing elit ut aliquam. Commodo nulla facilisi nullam vehicula ipsum a arcu cursus. Sed blandit libero volutpat sed cras ornare arcu. Arcu felis bibendum ut tristique et. At tempor commodo ullamcorper a lacus vestibulum sed. Lacus suspendisse faucibus interdum posuere lorem. Ac auctor augue mauris augue neque gravida in fermentum et. Mattis vulputate enim nulla aliquet. Diam vulputate ut pharetra sit amet. Pretium nibh ipsum consequat nisl vel pretium lectus quam.'
	);
	lorem.push(
		'Urna neque viverra justo nec ultrices. Ipsum dolor sit amet consectetur. Fermentum posuere urna nec tincidunt praesent semper. Quam id leo in vitae turpis massa sed elementum. Cras pulvinar mattis nunc sed blandit libero volutpat sed cras. Sit amet mattis vulputate enim nulla aliquet porttitor lacus luctus. Massa sapien faucibus et molestie ac. Donec et odio pellentesque diam volutpat. Ac turpis egestas sed tempus urna. Pretium lectus quam id leo in vitae turpis. Pharetra magna ac placerat vestibulum. Pretium quam vulputate dignissim suspendisse in est ante in.'
	);
	lorem.push(
		'Habitant morbi tristique senectus et netus et. Interdum velit laoreet id donec. Nibh sit amet commodo nulla facilisi nullam. Est placerat in egestas erat imperdiet sed euismod nisi porta. Mus mauris vitae ultricies leo integer malesuada nunc. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Blandit turpis cursus in hac habitasse. Lacus luctus accumsan tortor posuere. Ac turpis egestas sed tempus urna. Natoque penatibus et magnis dis parturient. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Nunc eget lorem dolor sed viverra ipsum nunc aliquet bibendum.'
	);

	function generateLoremIpsum() {
		let n = Math.floor(Math.random() * lorem.length);
		output = lorem[n];
	}

	const copied = () => {
		notifier.success('Password copied to clipboard!');
	};

	onMount(() => {
		generateLoremIpsum();
	});
</script>

<Header
	title="Lorem Ipsum"
	subtitle="Use this page to generate lorem ipsum strings and paragraphs."
/>

<p>
	<button class="w3-button w3-ripple w3-theme w3-round" on:click={generateLoremIpsum}
		>Generate</button
	>
	<button class="w3-button w3-round grey" use:copy={output} on:svelte-copy={() => copied()}
		>Copy</button
	>
</p>

{#if output}
	<p>{output}</p>
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
