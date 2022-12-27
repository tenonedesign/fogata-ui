<script lang="ts">
  import { EllipsisVertical, WarningSharp, CaretForward} from 'svelte-ionicons';
	import { PoolListingState, type Pool } from './types';
	import vaporLogo from '$lib/images/vapor-icon.svg?raw';
	import { intervalDisplayFormat } from './utils';
	import { fade, scale, slide } from 'svelte/transition';
  export let pool: Pool;
  export let owned: boolean = false;
  export let administered: boolean = false;
  export let editAction: any = () => {};
  export let linkAction: any = () => {};
  export let removeAction: any = () => {};
  export let submitAction: any = () => {};
  export let delistAction: any = () => {};
  export let approveAction: any = () => {};
  export let statsAction: any = () => {};
  export let listingState: PoolListingState = PoolListingState.Unknown;

  const descriptionMaxLength = 95;
  let showMore = false;

  function truncate( str: string, n: number, useWordBoundary: boolean ){
    if (str.length <= n) { return str; }
    const subString = str.slice(0, n-1); // the original check
    return (useWordBoundary 
      ? subString.slice(0, subString.lastIndexOf(" ")) 
      : subString) + "…";  // leave space for a 'more' button
  };
</script>

<div class="flex flex-col p-4">
  <div class="flex gap-4 items-center">
    <div class="relative w-12">
      <a href="/pools/{pool.address}" class="flex-1 font-semibold">
        <img  class="flex-none h-8 w-auto sm:h-12" src={pool.parameters.image} alt="{pool.parameters.name}" />
      </a>
      {#if pool.parameters.name && !pool.nodePublicKey}
        <div class="absolute -top-[8px] -right-[6px] tooltip tooltip-right tooltip-warning" data-tip="This pool is not linked to a block producer, and its yield is zero">
          <WarningSharp class="text-warning" size=24 />
        </div>
      {/if}
    </div>
    <div class="flex flex-wrap items-center flex-1">
      <div class="flex flex-col flex-1 mr-1">
        <a href="/pools/{pool.address}" class="font-semibold">{pool.parameters.name}</a>
          <div class="text-sm relative transition-all duration-200">
            {#if !showMore}
              {truncate(pool.parameters.description, descriptionMaxLength, true)}           
              {#if pool.parameters.description.length > descriptionMaxLength}
                <button class="btn btn-ghost btn-xs absolute -bottom-[2px] right-1" on:click={() => showMore = !showMore}>more</button>
              {/if}
            {:else}
              {truncate(pool.parameters.description, 2000, true)}        
              <button class="btn btn-ghost btn-xs absolute -bottom-[2px] right-1" on:click={() => showMore = !showMore}>less</button>
            {/if}
          </div>
      </div>
      <div class="flex-none flex items-center">
        <span class="badge badge-secondary text-xs text-neutral tooltip flex items-center" data-tip="Depositors receive {(pool.sponsorsPercentage() / 1000).toFixed(2)}% of their profit (about {(pool.sponsorsApy * 100).toFixed(2)}% APY) as VAPOR">
          <span class="inline-block w-3 mr-1">{@html vaporLogo}</span><CaretForward class="inline hidden" size="12px" />{(pool.sponsorsApy * 100).toFixed(2)}%
        </span>
        <span><span class="text-xs ml-3">APY:</span> <span class="tooltip tooltip-left" data-tip="Depositors should expect an APY of {(pool.apy * 100).toFixed(2)}% with KOIN reburned every {intervalDisplayFormat(pool.parameters.payment_period)}">{(pool.apy * 100).toFixed(2)}%</span></span>
      </div>
    </div>
    {#if owned}
      <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">
          <li><a on:click={() => editAction(pool.address)}>Edit pool</a></li>
          {#if !pool.nodePublicKey}
            <li><a on:click={() => linkAction(pool.address)}>Link to block producer</a></li>
          {:else}
            <li><a on:click={() => linkAction(pool.address)}>Change block producer</a></li>
          {/if}
          <li><a on:click={() => removeAction(pool.address)}>Remove pool from list</a></li>
          <li><a on:click={() => statsAction(pool.address)}>Show pool stats</a></li>
        </ul>
      </div>
    {/if}
    {#if !owned && administered}
      <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">
          <li><a on:click={() => statsAction(pool.address)}>Show pool stats</a></li>
          <li><a on:click={() => delistAction(pool.address)}>Remove pool</a></li>
          {#if listingState == PoolListingState.Submitted}
            <li><a on:click={() => approveAction(pool.address)}>Approve pool</a></li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
  {#if owned && listingState == PoolListingState.Eligible}
    <div class="flex justify-center items-center mt-2 gap-3">
      This Pool may be eligible for listing on Fogata.
      <button class="btn btn-sm btn-accent" on:click={() => submitAction(pool.address)}>Submit now</button>
    </div>
  {/if}
  {#if owned && listingState == PoolListingState.Submitted}
    <div class="flex justify-center items-center mt-2 gap-3">
      This pool has been submitted and is awaiting approval.
    </div>
  {/if}
  {#if owned && listingState == PoolListingState.Ineligible}
    <div class="flex justify-center items-center mt-2 gap-3">
      This pool is not eligible for listing on Fogata.
    </div>
  {/if}
</div>

<style></style>
