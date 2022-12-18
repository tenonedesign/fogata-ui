<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Card from '$lib/Card.svelte';
	import { connectedAddress, ownedPools, pools, user } from '$lib/stores.js';
	import PoolList from '$lib/PoolList.svelte';
	import { onDestroy, onMount } from 'svelte';
	import PoolCreator from '$lib/PoolCreator.svelte';
	import { populateOwnedPools, updateStoredObjectFormats, updateUsers } from '$lib/utils';
	import PoolListElement from '$lib/PoolListElement.svelte';
	import { Pool, User } from '$lib/types';
	import NodeElement from '$lib/NodeElement.svelte';
	import { utils } from 'koilib';

	let timer: NodeJS.Timer;
  let debounceTimer: NodeJS.Timer;
  let poolEditor: any = null;
  let nodeEditor: any = null;

	// data from the load function in +page.ts
	export let data: any;

  // update stored users reference any time user is updated
  // $: console.log($user);
  $: updateUsers($user);
  $: debouncedChange($connectedAddress); // hack to reload when userChangedEvent changes
  $: debouncedChange($user.customRpc.url + $user.selectedRpcUrl);
  // $: console.log($user.customRpc + $user.selectedRpcUrl);

  // don’t react to event unless events have paused for more than 200ms
  function debouncedChange(event: any = null) {
    if (!timer) { return; } // not mounted yet
    
    clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
      // console.log(event);
      populateOwnedPools();
      load();
		}, 200);
  }

	onMount(async () => {
    updateStoredObjectFormats();
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
    poolEditor.mode = "edit";
    poolEditor.show();
  }
  function editNode(publicKey: string) {
    alert("not yet implemented");
  }
  function linkWithPool(publicKey: string) {
    alert("not yet implemented");
  }
  function linkWithNode(publicKey: string) {
    alert("not yet implemented");
  }
  function howTo() {
    alert("not yet implemented");
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


    <!-- Start your own pool -->
    <Card>

      <!-- Nodes section -->
      {#if $user.nodes.length == 0}
        <div class="text-lg font-semibold">Start your own mining pool</div>
        <div class="mt-4">
          If you run a node, you can easily turn it into a mining pool, which will help pay for the node.  The first step is to create and start your node, then enter its public key here.
        </div>
      {:else}
        <div class="text-lg font-semibold">Your nodes:</div>
        <div class="border border-primary-content rounded-xl">
          {#each $user.nodes as node}
            <NodeElement node={node} editAction={editNode} linkAction={linkWithPool} />
          {/each}
        </div> 
      {/if}
      <div class="mt-3 flex gap-3 flex-wrap">
        <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {howTo()}}>How to run a node</button>
        <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {nodeEditor?.show()}}>Add node public key</button>
      </div>

      <!-- Pools section -->
      <div class="text-lg font-semibold mt-10">Your pools:</div>
      {#if $ownedPools.length == 0}
        <div class="mt-2">
          Once your node is running, deploy a mining pool on Koinos in just a few steps.  Your pool will be listed here on Fogata if it qualifies.
        </div>
        <div class="mt-3">
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolEditor.show()}}>Create pool</button>
        </div>
      {:else}
        {#each $ownedPools as pool}
          <PoolListElement pool={pool} owned={true} editAction={editPool} linkAction={linkWithNode} />
        {/each}
        <div class="mt-3">
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolEditor.show()}}>Create another pool</button>
        </div>
      {/if}

    </Card>				

  </section>

</div>

<!-- hide before onMount because modal flashes when loaded with any latency -->
<!-- there’s a larger issue with some styles not being applied before first paint, but this modal is the most noticeable offender -->
{#if timer}
  <PoolCreator bind:this={poolEditor} contractWasmBase64={data.contractWasmBase64}></PoolCreator>
{/if}

<style>
</style>
