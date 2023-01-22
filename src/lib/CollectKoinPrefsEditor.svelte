<svelte:options accessors={true}/>
<script lang="ts">
	import { CollectKoinPreferences, Pool } from '$lib/types';
	import { errorToast, infoToast, koilibAbi, poolOperation, poolWrite, populateOwnedPools, removeToastWithId, successToast, uploadPoolContract, warningToast } from '$lib/utils';
	import { pool, user } from '$lib/stores';
	import BalanceInput from './BalanceInput.svelte';
	import { Exit } from 'svelte-ionicons';

  export let poolAddress = "";
  export let userAddress = "";
  export let collectKoinPreferences = new CollectKoinPreferences();
  let minimumBalanceIsValid = true;

  let collectStrategies = [
    { name: "Collect a percentage of earned Koin", value: "percent"},
    { name: "Collect everything above a set balance", value: "threshold"},
  ];
  let collectStrategy = collectKoinPreferences.percentage_koin > 0 ? "percent" : (collectKoinPreferences.all_after_virtual > 0 ? "threshold" : "");

  export const show = (initialParameters?: CollectKoinPreferences) => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = true;
    if (initialParameters != null) {
      collectKoinPreferences = initialParameters;
      collectStrategy = collectKoinPreferences.percentage_koin > 0 ? "percent" : (collectKoinPreferences.all_after_virtual > 0 ? "threshold" : "");
    }
    else {
      collectKoinPreferences = new CollectKoinPreferences();
    }
  }

  let instanceId = Math.random().toString(36).substring(2);

  const updateParams = async (): Promise<any> => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = false; // close modal
    const params = {
      account: userAddress,
      percentage_koin: collectStrategy == "percent" ? collectKoinPreferences.percentage_koin : 0,
      all_after_virtual: (collectStrategy == "threshold" ? collectKoinPreferences.all_after_virtual : BigInt(0)).toString(),
    }
    poolWrite(poolAddress, "set_collect_koin_preferences", params, "collection preference update");
  }

</script>


<!-- Put this part before </body> tag -->
<input type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative flex flex-col gap-4">
  
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">Pool profit collection preferences</h3>
    <p class="pt-4">Control how you receive distributions from the pool, or if all profits are burned to optimize returns.</p>

    <select bind:value={collectStrategy} class="select select-bordered w-full mt-6">
      <option selected value="">Collection turned off</option>
      {#each collectStrategies as collectStrategy}
        <option value="{collectStrategy.value}">{collectStrategy.name}</option>
      {/each}
    </select>

    {#if collectStrategy == "percent"}
      <div class="flex flex-wrap gap-4 items-center">
        <div class="font-semibold">{collectKoinPreferences.percentage_koin / 1000}% of earned Koin</div>
        <input bind:value={collectKoinPreferences.percentage_koin} id="collect-percentage-{instanceId}" type="range" min="0" max="100000" class="range range-sm mt-2" step="1000" />
        <div class="w-full flex justify-between text-xs px-2">
          <span>|</span> <span>|</span> <span>|</span> <span>|</span>
          <span>|</span> <span>|</span> <span>|</span> <span>|</span>
          <span>|</span> <span>|</span>
        </div>
      </div>
    {/if}
    {#if collectStrategy == "threshold"}
      <div class="mt-2 form-control w-full">
        <label class="label"><span class="label-text">Collect everything above this minimum balance (Koin + VHP)</span></label>
        <div class="flex items-center">
          <BalanceInput bind:value={collectKoinPreferences.all_after_virtual} bind:valid={minimumBalanceIsValid}></BalanceInput>
          <!-- <input bind:value={collectKoinPreferences.all_after_virtual} type="text" pattern="[0-9.]+" placeholder="0" class="input input-bordered input-primary min-w-[150px] flex-1 invalid:bg-red-100" /> -->
        </div>
      </div>
    {/if}

    {#if collectStrategy == ""}
      <div class="mt-2 form-control w-full">
        Collection is currently turned off.  All profits will be re-burned as VHP to optimize returns.
      </div>
    {/if}

    <div class="mt-6">
      <label for="modal-{instanceId}" class="btn btn-outline">Close</label>
      <button on:click={updateParams} disabled={collectStrategy == "threshold" && !minimumBalanceIsValid} class="btn btn-primary ml-2">Save</button>
    </div>

  </div>
</div>


<style></style>
