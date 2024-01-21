<script lang="ts">
  import { EllipsisVertical, WarningSharp, CaretForward} from 'svelte-ionicons';
	import { PoolListingState, type Pool } from './types';
	import vaporLogo from '$lib/images/vapor-icon.svg?raw';
	import { intervalDisplayFormat, balanceDisplayFormat } from './utils';
	import { fade, scale, slide } from 'svelte/transition';
	import { env } from './stores';
  export let pool: Pool;
  export let owned: boolean = false;
  export let administered: boolean = false;
  export let editAction: any = () => {};
  export let linkAction: any = () => {};
  export let removeAction: any = () => {};
  export let submitAction: any = () => {};
  export let manageReservedKoinAction: any = () => {};
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
  <div class="flex gap-2 sm:gap-3 items-start">
    <div class="relative w-12 pt-2">
      <a href="/pools/{pool.address}" class="flex-1 font-semibold flex justify-center items-center">
        <img  class="flex-none h-9 w-auto sm:h-12" src={pool.parameters?.image} alt="{pool.parameters?.name}" />
      </a>
      {#if pool.parameters?.name && !pool.nodePublicKey}
        <div class="absolute -top-[8px] -right-[6px] tooltip tooltip-right tooltip-warning before:w-48 before:content-[attr(data-tip)]" data-tip="This pool is not linked to a block producer, and its yield is zero">
          <WarningSharp class="text-warning" size=24 />
        </div>
      {/if}
      {#if pool.parameters?.name && pool.reservedKoin < $env.minimum_reserved_koin}
        <div class="absolute -top-[8px] -right-[6px] tooltip tooltip-right tooltip-warning before:w-48 before:content-[attr(data-tip)]" data-tip="This pool has a reserved Koin balance below {balanceDisplayFormat($env.minimum_reserved_koin)}.  Please add reserved Koin.">
          <WarningSharp class="text-warning" size=24 />
        </div>
      {/if}
    </div>
    <div class="flex flex-wrap items-start flex-1 gap-y-4">
      <div class="flex flex-col flex-1 mr-1">
        <a href="/pools/{pool.address}" class="font-semibold">{pool.parameters?.name}</a>
        <div class="text-sm relative transition-all duration-200">
          {#if !showMore}
            <a href="/pools/{pool.address}">{truncate(pool.parameters.description, descriptionMaxLength, true)}           </a>
            {#if pool.parameters?.description.length > descriptionMaxLength}
              <button class="btn btn-ghost btn-xs absolute -bottom-[2px] right-1" on:click={() => showMore = !showMore}>more</button>
            {/if}
          {:else}
          <a href="/pools/{pool.address}" class="whitespace-pre-wrap">{truncate(pool.parameters?.description, 2000, true)}        </a>
            <button class="btn btn-ghost btn-xs absolute -bottom-[2px] right-1" on:click={() => showMore = !showMore}>less</button>
          {/if}
        </div>
      </div>
      <div class="flex-none flex items-center flex-col gap-2 mt-[9px] pl-3">
        <span class="w-full badge badge-outline bg-base-100 border-none shadow text-xs tooltip tooltip-top sm:tooltip-left flex items-center" data-tip="Depositors should expect an APY of {(pool.apy * 100).toFixed(2)}% with KOIN reburned every {intervalDisplayFormat(pool.parameters.payment_period)}">
          <span class="text-xs text-[8px] font-semibold pr-1">APY:</span> <span>{(pool.apy * 100).toFixed(2)}%</span>
        </span>
        <span class="w-full badge badge-outline bg-base-100 border-none shadow text-xs tooltip tooltip-top sm:tooltip-left flex items-center" data-tip="Depositors receive {(pool.sponsorsPercentage() / 1000).toFixed(2)}% of their profit (about {(pool.sponsorsApy * 100).toFixed(2)}% APY) as VAPOR">
          <span class="inline-block w-3 mr-2">{@html vaporLogo}</span><CaretForward class="inline hidden" size="12px" />{(pool.sponsorsApy * 100).toFixed(2)}%
        </span>
        <!-- <button class="btn btn-xs btn-ghost w-full">View</button> -->
        <!-- <span class="badge badge-secondary text-xs text-neutral tooltip flex items-center" data-tip="Depositors receive {(pool.sponsorsPercentage() / 1000).toFixed(2)}% of their profit (about {(pool.sponsorsApy * 100).toFixed(2)}% APY) as VAPOR">
          <span class="inline-block w-3 mr-1">{@html vaporLogo}</span><CaretForward class="inline hidden" size="12px" />{(pool.sponsorsApy * 100).toFixed(2)}%
        </span>
        <span><span class="text-xs ml-3">APY:</span> <span class="tooltip tooltip-left before:whitespace-pre-wrap before:content-[attr(data-tip)]" data-tip="Depositors should expect an APY of {(pool.apy * 100).toFixed(2)}% with KOIN reburned every {intervalDisplayFormat(pool.parameters.payment_period)}. Total fee including Sponsors program: {(pool.beneficiariesPercentage() / 1000).toFixed(2)}%">{(pool.apy * 100).toFixed(2)}%</span></span> -->
      </div>
    </div>


    <div class="dropdown dropdown-end flex-none pt-2">
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">
        <li><a href="/pools/{pool.address}">Open pool</a></li>
        <li><a on:click={() => statsAction(pool.address)}>Show pool stats</a></li>
        <li><a target="_blank" rel="noopener" href="https://koiner.app/addresses/{pool.address}/rewards">Recent blocks</a></li>
        {#if owned}
          <li><a on:click={() => editAction(pool.address)}>Edit pool</a></li>
          {#if !pool.nodePublicKey}
            <li><a on:click={() => linkAction(pool.address)}>Link to block producer</a></li>
          {:else}
            <li><a on:click={() => linkAction(pool.address)}>Change block producer</a></li>
          {/if}
          <li><a on:click={() => removeAction(pool.address)}>Remove pool from list</a></li>
          <li><a on:click={() => manageReservedKoinAction(pool.address)}>Manage reserved Koin</a></li>
        {/if}
        {#if !owned && administered}
          <li><a on:click={() => delistAction(pool.address)}>Remove pool</a></li>
          {#if listingState == PoolListingState.Submitted}
            <li><a on:click={() => approveAction(pool.address)}>Approve pool</a></li>
          {/if}
        {/if}
      </ul>
    </div>
      <!-- <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-60">

        </ul>
      </div> -->
  </div>
  {#if owned && listingState == PoolListingState.Eligible}
    <div class="flex justify-center items-center mt-6 gap-3">
      This Pool may be eligible for listing on Fogata.
      <button class="btn btn-sm btn-accent" on:click={() => submitAction(pool.address)}>Submit now</button>
    </div>
  {/if}
  {#if owned && listingState == PoolListingState.Submitted}
    <div class="flex justify-center items-center mt-6 gap-3">
      This pool has been submitted and is awaiting approval.
    </div>
  {/if}
  {#if owned && listingState == PoolListingState.Ineligible}
    <div class="flex justify-center items-center mt-6 gap-3">
      This pool is not eligible for listing on Fogata. Make sure it is linked to a block producer.
    </div>
  {/if}
</div>

<style></style>
