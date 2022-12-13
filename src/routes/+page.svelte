<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Card from '$lib/Card.svelte';
	import { pools } from '$lib/stores.js';
	import PoolList from '$lib/PoolList.svelte';
	import { onDestroy, onMount } from 'svelte';
	import PoolCreator from '$lib/PoolCreator.svelte';

	let timer: NodeJS.Timer;

	// data from the load function in +page.ts
	export let data: any;

	onMount(async () => {
		load();
		timer = setInterval(() => {
			load();
		}, 30000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {
		$pools.forEach(pool => {
			pool.refresh().then(() => {
				$pools = $pools;
			});
		});
	}
  
</script>

<svelte:head>
	<title>Fogata</title>
	<meta name="description" content="Koinos mining pools" />
</svelte:head>

<div class="px-4">

  <Header pool={null} />

  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20 pb-60">
  	<PoolList pools={$pools} title="Join a mining pool" />
	<Card>
		<div class="text-lg font-semibold">Start your own pool</div>
		<div class="mt-4">
			If you run a node, you can easily turn it into a mining pool.  The first step is to create and start your node, then copy its public key.
		</div>
		<div class="float mt-4">
			<button class="btn btn-secondary">Show me how</button>
		</div>
		<div class="mt-8">
			Once your node is running, deploy a mining pool on Koinos in just a few steps.  Your pool will be listed here on Fogata if it qualifies.
		</div>
		<div class="float mt-4">
			<!-- <button class="btn btn-secondary">Create pool</button> -->
			<PoolCreator contractWasmBase64={data.contractWasmBase64}>Create pool</PoolCreator>
		</div>
	</Card>
  </section>

</div>


<style>
</style>
