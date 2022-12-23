<script lang="ts">
  import { EllipsisVertical, WarningSharp, CaretForward} from 'svelte-ionicons';
	import Card from './Card.svelte';
	import { PoolListingState, type Pool } from './types';
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
</script>

<div class="flex flex-col p-4">
  <div class="flex gap-4 items-center">
    <div class="relative">
      <img  class="flex-none h-8 w-auto sm:h-12" src={pool.parameters.image} alt="{pool.parameters.name}" />
      {#if pool.parameters.name && !pool.nodePublicKey}
        <div class="absolute -bottom-[2px] -right-[13px] tooltip tooltip-right tooltip-warning" data-tip="This pool is not linked to a block producer, and its yield is zero">
          <WarningSharp class="text-warning" size=24 />
        </div>
      {/if}
    </div>
    <div class="flex flex-wrap items-center flex-1">
      <a href="/pools/{pool.address}" class="flex-1 font-semibold">{pool.parameters.name}</a>
      <div class="flex-none">
        <span class="badge badge-secondary text-xs text-neutral tooltip" data-tip="This pool contributes {(pool.sponsorsPercentage() / 1000).toFixed(2)}% of its profit (an estimated apy of {(pool.sponsorsApy * 100).toFixed(2)}%) to the community sponsorship contract"><CaretForward class="inline" size="12px" />{(pool.sponsorsApy * 100).toFixed(2)}%</span>
        <span class="text-xs ml-3">APY:</span> {(pool.apy * 100).toFixed(2)}%
      </div>
    </div>
    {#if owned}
      <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">
          <li><a on:click={() => (editAction(pool.address))}>Edit pool</a></li>
          {#if !pool.nodePublicKey}
            <li><a on:click={() => (linkAction(pool.address))}>Link to block producer</a></li>
          {:else}
            <li><a on:click={() => (linkAction(pool.address))}>Change block producer</a></li>
          {/if}
          <li><a on:click={() => (removeAction(pool.address))}>Remove pool from list</a></li>
          <li><a on:click={() => (statsAction(pool.address))}>Show pool stats</a></li>
        </ul>
      </div>
    {/if}
    {#if !owned && administered}
      <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">
          <li><a on:click={() => (statsAction(pool.address))}>Show pool stats</a></li>
          <li><a on:click={() => (delistAction(pool.address))}>Remove pool</a></li>
          {#if listingState == PoolListingState.Submitted}
            <li><a on:click={() => (approveAction(pool.address))}>Approve pool</a></li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
  {#if owned && listingState == PoolListingState.Eligible}
  <div class="flex justify-center items-center mt-2 gap-3">
    Your Pool may be eligible for listing on Fogata.
    <button class="btn btn-sm btn-accent" on:click={() => (submitAction(pool.address))}>Submit now</button>
  </div>
  {/if}
  {#if owned && listingState == PoolListingState.Submitted}
  <div class="flex justify-center items-center mt-2 gap-3">
    Your pool has been submitted and is awaiting approval.
  </div>
  {/if}
  {#if owned && listingState == PoolListingState.Ineligible}
  <div class="flex justify-center items-center mt-2 gap-3">
    Your pool is not eligible for listing on Fogata.
  </div>
  {/if}
</div>

<style></style>
