<script lang="ts">

  // TODO:
  // - More explanations of what things are and how they work. Some of this can be with tooltips
  // - 'How to run a node' needs to be implemented 
  // - Add vapor, vhp, and koinos logos to wallet displays

	import Header from '$lib/Header.svelte';
	import Card from '$lib/Card.svelte';
	import vaporLogo from '$lib/images/vapor-icon.svg?raw';
	import { approvedPools, connectedAddress, env, ownedPools, submittedPools, user } from '$lib/stores.js';
	import { onDestroy, onMount } from 'svelte';
	import PoolCreator from '$lib/PoolCreator.svelte';
	import { pobWrite, populateOwnedPools, updateStoredObjectFormats, updateUsers, loadFogataPools, poolsWrite, readPoolsOwner, userIsPoolsOwner } from '$lib/utils';
	import PoolListElement from '$lib/PoolListElement.svelte';
	import type { KoinosNode } from '$lib/types';
	import NodeElement from '$lib/NodeElement.svelte';
	import InputsModal from '$lib/InputsModal.svelte';
	import SelectModal from '$lib/SelectModal.svelte';

	let timer: NodeJS.Timer;
  let debounceTimer: NodeJS.Timer;
  let poolEditor: any = null;
  let nodeEditor: any = null;
  let poolAdder: any = null;
  let nodePicker: any = null;
  let confirmModal: any = null;
  let showSubmittedPools: boolean = false;

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
		debounceTimer = setTimeout(async () => {
      // console.log(event);
      populateOwnedPools();
      await loadFogataPools();
      load();
		}, 200);
  }

	onMount(async () => {
    updateStoredObjectFormats();
    populateOwnedPools();
    readPoolsOwner();
    await loadFogataPools();
    
		load();
		timer = setInterval(() => {
			load();
		}, 30000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {
		$approvedPools.forEach(pool => {
			pool.refresh().then(() => {
				$approvedPools = $approvedPools;
			});
		});
    if (showSubmittedPools) {
      $submittedPools.forEach(pool => {
			pool.refresh().then(() => {
				$submittedPools = $submittedPools;
			});
		});
    }
    $ownedPools.forEach(pool => {
			pool.refresh().then(() => {
				$ownedPools = $ownedPools;
			});
    });
	}
  function addPool(value: any) {
    if (!$user.ownedPools.includes(value.address)) {
      $user.ownedPools.push(value.address);
      $user.ownedPools = $user.ownedPools;
    }
  }
  function removePool(address: string) {
    confirmModal.title = "Really remove Pool?";
    confirmModal.positiveActionName = "Remove Pool";
    confirmModal.message = "This will not delete the pool contract, but you will no longer see it in your list.  You may add it again at any time using its address ("+address+").";
    confirmModal.buttonAction = () => {
      $user.ownedPools = $user.ownedPools.filter(item => item !== address);
    }
    confirmModal.show();
  }
  function submitPool(address: string) {
    confirmModal.title = "Submit pool for listing on Fogata?";
    confirmModal.positiveActionName = "Submit Pool";
    confirmModal.message = "Your node will be reviewed for efficacy and security. This transaction will consume mana.";
    confirmModal.buttonAction = () => {
      poolsWrite("submit_pool", {account: address}, "pool submission").then((transaction) => {
        console.log(transaction);
        transaction?.wait("byBlock", 30000).then(() => { loadFogataPools(); });
      });
    }
    confirmModal.show();
  }
  function delistPool(address: string) {
    confirmModal.title = "Remove pool from Fogata?";
    confirmModal.positiveActionName = "Remove Pool";
    confirmModal.message = "The pool will be removed for all Fogata users. Any depositors to this pool may be unable to withdraw. Pool address: "+address+".";
    confirmModal.buttonAction = () => {
      poolsWrite("remove_pool", {account: address}, "pool removal").then((transaction) => {
        transaction?.wait("byBlock", 30000).then(() => { loadFogataPools(); });
      });
    }
    confirmModal.show();
  }
  function approvePool(address: string) {
    confirmModal.title = "Approve pool for listing on Fogata?";
    confirmModal.positiveActionName = "Approve Pool";
    confirmModal.message = "Once the pool is approved, it will become visible on Fogata and is more likely to receive deposits.";
    confirmModal.buttonAction = () => {
      poolsWrite("approve_pool", {account: address}, "pool approval").then((transaction) => {
        transaction?.wait("byBlock", 30000).then(() => { loadFogataPools(); });
      });
    }
    confirmModal.show();
  }
  function showPoolStats(address: string) {
    const p = $submittedPools.find(x => x.address == address) || $approvedPools.find(x => x.address == address) ||  $ownedPools.find(x => x.address == address);
    confirmModal.title = "Pool information";
    confirmModal.positiveActionName = "Hide";
    confirmModal.showNegativeAction = false;
    confirmModal.message = "Address: "+address+"\n\n"+JSON.stringify(p?.parameters, null, 2);
    confirmModal.show();
  }
  function showNodeInstructions() {
    confirmModal.title = "How to run your own node";
    confirmModal.positiveActionName = "Done";
    confirmModal.showNegativeAction = false;
    confirmModal.message = "Official Koinos node documentation is at https://docs.koinos.io/quickstart/running-a-koinos-node.html";
    confirmModal.show();
  }
  function editPool(address: string) {
    const p = $ownedPools.find(x => x.address == address);
    poolEditor.address = p?.address;
    poolEditor.step = 0;
    poolEditor.mode = "edit";
    poolEditor.show(p?.parameters);
  }
  function addNode(value: KoinosNode) {
    if ($user.nodes.some(x => x.publicKey === value.publicKey)) {
      let n = $user.nodes.find(x => x.publicKey == value.publicKey) as KoinosNode;
      n.name = value.name;
      $user.nodes = $user.nodes;
    }
    else {
      $user.nodes.push(value);
    }
    $user.nodes = $user.nodes;
  }
  function editNode(publicKey: string) {
    const n = $user.nodes.find(x => x.publicKey == publicKey);
    nodeEditor.title = "Edit node";
    nodeEditor.positiveActionName = "Save";
    nodeEditor.show(n);
  }
  function removeNode(publicKey: string) {
    confirmModal.title = "Really remove Node?";
    confirmModal.positiveActionName = "Remove Node"
    confirmModal.message = "You will no longer see this node in your list.  You may add it again at any time using its public key ("+publicKey+").";
    confirmModal.buttonAction = () => {
      $user.nodes = $user.nodes.filter(node => {
        return node.publicKey !== publicKey;
      });
    }
    confirmModal.show();
  }
  function linkPoolWithNode(poolAddress: string) {
    let options:{name: string, value: string}[] = [];
    $user.nodes.forEach(node => {
      options.push({name: node.name, value: node.publicKey});
    });
    nodePicker.options = options;
    nodePicker.buttonAction = (nodePublicKey: string) => {
      pobWrite("register_public_key", {producer: poolAddress, public_key: nodePublicKey}, "linking").then((result) => {
        $user = $user;  // update ui
      });
    }
    nodePicker.show("");
  }
  
</script>

<svelte:head>
	<title>Fogata</title>
	<meta name="description" content="Koinos mining pools" />
</svelte:head>

<div class="px-4">

  <Header pool={null} />

  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20 pb-60">

    <Card>
      <div class="flex flex-col md:flex-row md:items-center gap-2">
        <span class="text-lg font-semibold">Join a mining pool</span>
        <div class="dropdown">
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <label tabindex="0" class="btn btn-outline h-6 px-3 min-h-0 rounded-full">
            How to pick
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
              <path d="M5 11l7 7 7 -7"></path>
            </svg>
          </label>
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <div tabindex="0" class="dropdown-content menu mt-2 p-6 shadow-xl bg-base-100 rounded-box w-screen max-w-[80vw] md:max-w-md">
            <h4 class="text-lg font-semibold">How to pick a pool, and why it matters</h4>
            <p class="mt-4">All fogata pools contribute to community development, so they’re all great choices.  Here are a few tips: </p>
            <div class="mt-4">
              <div class="flex mt-2"><div class="text-2xl">✅</div><div class="ml-3">Look for independant pools to promote decentralization.</div></div>
              <div class="flex mt-2"><div class="text-2xl">🗳️</div><div class="ml-3">Select a pool that will vote responsibly for governance decisions.  You can change your pool choice at any time.</div></div>
              <div class="flex mt-2"><div class="text-2xl"><span class="inline-block w-6">{@html vaporLogo}</span></div><div class="ml-3">Some pools contribute more to the community.  These are near the top of the list.  A portion of your mining rewards will be in <span class="inline-block w-4">{@html vaporLogo}</span> VAPOR, the governance token for the Sponsors contract.</div></div>
            </div>
          </div>
        </div>
      </div>
        
        <!-- <span class="ml-4 text-sm font-normal opacity-75">How to pick <InformationCircleSharp class="inline" size="16" /></span></div> -->

      <div class="rounded-xl bg-base-200 mt-2">
        {#each $approvedPools as pool, i}
          <PoolListElement administered={userIsPoolsOwner()} listingState={pool.listingState($approvedPools, $submittedPools)} delistAction={delistPool} statsAction={showPoolStats} pool={pool} />
          {#if i < ($approvedPools.length-1)}<div class="h-[1px] bg-base-300 mx-4"></div>{/if}
        {/each}
      </div>

      <button class="btn btn-sm btn-ghost btn-secondary opacity-50 mt-8 mr-auto" on:click={() => {showSubmittedPools = !showSubmittedPools; load();}}>
        {#if !showSubmittedPools}
          Show other submitted pools <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2 mb-1" viewBox="0 0 24 24"><path d="M5 11l7 7 7 -7"></path></svg>
        {:else}
          Hide other submitted pools <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2 mb-1" viewBox="0 0 24 24"><path d="M5 18l7 -7 7 7"></path></svg>
        {/if}
      </button>
      {#if showSubmittedPools}
        <div class="mt-8">
          <span class="text-lg font-semibold">Other pools:</span>
          <div class="my-4 alert alert-warning shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span class="">These pools have not been reviewed.  Do not interact with these pools unless you understand the risk or trust the pool.</span>
            </div>
          </div>
          
          <div class="rounded-xl bg-base-200 mt-2">
            {#each $submittedPools as pool, i}
              <PoolListElement administered={userIsPoolsOwner()} listingState={pool.listingState($approvedPools, $submittedPools)} delistAction={delistPool} approveAction={approvePool} statsAction={showPoolStats} pool={pool} />
              {#if i < ($submittedPools.length-1)}<div class="h-[1px] bg-base-300 mx-4"></div>{/if}
            {/each}
          </div>
        </div>
      {/if}
    </Card>


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
        <div class="rounded-xl bg-base-200 mt-2">
          {#each $user.nodes as node, i}
            <NodeElement node={node} editAction={editNode} removeAction={removeNode} />
            {#if i < ($user.nodes.length-1)}<div class="h-[1px] bg-base-300 mx-4"></div>{/if}
          {/each}
        </div> 
      {/if}
      <div class="mt-3 flex gap-3 flex-wrap">
        <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {showNodeInstructions()}}>How to run a node</button>
        <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {nodeEditor?.show()}}>Add node public key</button>
      </div>

      <!-- Pools section -->
      <div class="text-lg font-semibold mt-10">Your pools:</div>
      {#if $ownedPools.length == 0}
        <div class="mt-2">
          Once your node is running, deploy a mining pool on Koinos in just a few steps.  Your pool will be listed here on Fogata if it qualifies.
        </div>
        <div class="mt-3 flex gap-3 flex-wrap">
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolEditor.show()}}>Create pool</button>
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolAdder.show()}}>Add existing pool</button>
        </div>
      {:else}
        <div class="rounded-xl bg-base-200 mt-2">
          {#each $ownedPools as pool, i}
            <PoolListElement
              pool={pool}
              owned={true}
              listingState={pool.listingState($approvedPools, $submittedPools)}
              editAction={editPool}
              linkAction={linkPoolWithNode}
              removeAction={removePool}
              submitAction={submitPool}
              statsAction={showPoolStats}
            />
            {#if i < ($ownedPools.length-1)}<div class="h-[1px] bg-base-300 mx-4"></div>{/if}
          {/each}
        </div> 
        <div class="mt-3 flex gap-3 flex-wrap">
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolEditor.show()}}>Create another pool</button>
          <button class="btn btn-secondary text-secondary-content h-8 min-h-8" on:click={() => {poolAdder.show()}}>Add existing pool</button>
        </div>
      {/if}

    </Card>				

  </section>

</div>

<!-- hide before onMount because modal flashes when loaded with any latency -->
<!-- there’s a larger issue with some styles not being applied before first paint, but these modals are the most noticeable offender -->
{#if timer}
  <PoolCreator bind:this={poolEditor} contractWasmBase64={($env.testnet) ? data.contractWasmBase64Harbinger : data.contractWasmBase64}></PoolCreator>

  <InputsModal bind:this={nodeEditor}
    title="Add a node"
    message="Paste the public key from your node here.  If you’re using the command line, look in .koinos/block_producer/public.key"
    positiveActionName="Add Node"
    buttonAction={addNode}
    schemas={[
      {
        key: "publicKey",
        placeholder: "ArdeH...",
        label: "Public key"
      },
      {
        key: "name",
        placeholder: "Cloud node 2",
        label: "Node name"
      }
    ]}
  />
  <InputsModal bind:this={poolAdder}
    title="Add an exsiting Fogata pool"
    message="Paste the pool address here."
    positiveActionName="Add Pool"
    buttonAction={addPool}
    schemas={[
      {
        key: "address",
        placeholder: "zgdeH...",
        label: "Pool address"
      }
    ]}
  />

  <InputsModal bind:this={confirmModal} title="Are your sure?" message="" positiveActionName="Yes" />
  <SelectModal bind:this={nodePicker}
    title="Link your pool with a node"
    message="Linking to a node will allow Koinos to reward your pool for the node’s block production.  This operation will consume mana."
    label="Select your node"
    required={true}
    positiveActionName="Create link"
  />

{/if}

<style>
</style>
