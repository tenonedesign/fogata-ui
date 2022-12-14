<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Card from '$lib/Card.svelte';
	import { ownedPools, pools, user } from '$lib/stores.js';
	import PoolList from '$lib/PoolList.svelte';
	import { onDestroy, onMount } from 'svelte';
	import PoolCreator from '$lib/PoolCreator.svelte';
	import { populateOwnedPools, updateStoredObjects } from '$lib/utils';
	import PoolListElement from '$lib/PoolListElement.svelte';
	import { Pool } from '$lib/types';

	let timer: NodeJS.Timer;
  let poolEditor: any = null;

	// data from the load function in +page.ts
	export let data: any;

	onMount(async () => {
    updateStoredObjects();
    populateOwnedPools();
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
    $ownedPools.forEach(pool => {
			pool.refresh().then(() => {
				$ownedPools = $ownedPools;
			});
    });
	}

  function editPool(address: string) {
    const p = $ownedPools.find(x => x.address == address);
    poolEditor.poolParams = p?.parameters;
    poolEditor.address = p?.address;
    poolEditor.step = 0;
    poolEditor.show();
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
	  {#if $ownedPools.length > 0}
      <Card>
        <div class="text-lg font-semibold">Your mining pools</div>
        {#each $ownedPools as pool}
          <PoolListElement pool={pool} owned={true} editAction={editPool} />
        {/each}
        <div class="mt-8">
        </div>
        <div class="float mt-4">
          <PoolCreator contractWasmBase64={data.contractWasmBase64}>Add another pool</PoolCreator>
          <PoolCreator visibleButton={false} mode={"edit"} bind:this={poolEditor} contractWasmBase64={data.contractWasmBase64}>Edit pool</PoolCreator>
        </div>
      </Card>				
    {:else}
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
    {/if}
  </section>

</div>


<style>
</style>
