<svelte:options accessors={true}/>
<script lang="ts">
	import { Pool, TransactionAllowance } from '$lib/types';
	import { balanceDisplayFormat, balanceTooltipFormat, poolWrite, warningToast } from '$lib/utils';
	import { user, wallet, env } from '$lib/stores';
	import BalanceInput from './BalanceInput.svelte';
	import { WarningOutline } from 'svelte-ionicons';
	import type { Writable } from 'svelte/store';

  export const show = () => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = true;
  }
  export let pools: Writable<Pool[]> | null = null;
  export let address: string = "";
  export let minimumAmount = BigInt(500000000);
  let pool = new Pool();
  let instanceId = Math.random().toString(36).substring(2);
  let operation = "add";
  let addAmount = BigInt(0);
  let removeAmount = BigInt(0);
  
  // refresh our pool whenever pools changes
  $: pool = $pools?.find(x => x.address == address) || new Pool();

  const addReservedKoin = async (): Promise<any> => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = false; // close modal
    if (addAmount > $wallet.balances.koin) {
      warningToast("Insufficient Koin balance", "Enter a number less than or equal to "+balanceTooltipFormat($wallet.balances.koin)+".");
      return;
    }
    const params = {
      account: $user.address,
      koin_amount: addAmount.toString(),
    }
    poolWrite(pool.address, "add_reserved_koin", params, "reserved Koin deposit", [new TransactionAllowance().forToken($env.koin_address, pool.address, addAmount)]);
  }
  const removeReservedKoin = async (): Promise<any> => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = false; // close modal
    if (addAmount > $wallet.balances.koin) {
      warningToast("Insufficient Koin balance", "Enter a number less than or equal to "+balanceDisplayFormat(BigInt(pool.userReservedKoin))+".");
      return;
    }
    const params = {
      account: $user.address,
      koin_amount: removeAmount.toString(),
    }
    poolWrite(pool.address, "remove_reserved_koin", params, "reserved Koin withdrawal");
  }

</script>


<!-- Put this part before </body> tag -->
<input type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative flex flex-col gap-4">
  
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>

    <h3 class="text-lg font-bold">Manage reserved Koin</h3>
    <p class="pt-4">Fogata pools require a small reserved Koin balance to operate.  It should be at least {balanceDisplayFormat(minimumAmount)}. The current total is {balanceDisplayFormat(BigInt(pool.reservedKoin))}.
    <h2><span class="font-semibold">Your reserved Koin:</span><span class="ml-2 font-semibold">{balanceDisplayFormat(BigInt(pool.userReservedKoin))}</span></h2>

    {#if pool.reservedKoin < minimumAmount}
      <div class="text-xs bg-warning text-warning-content p-3 flex gap-3 rounded-xl items-center">
        <WarningOutline class="flex-shrink-0" size="24" />
        <div>Total reserved Koin balance is below the recommended amount.  Block production may fail.</div>
      </div>
    {/if}

    <div class="join mt-6">
      <input type="radio" bind:group={operation} name="options" aria-label="Add" class="join-item btn btn-info" value="add" checked />
      <input type="radio" bind:group={operation} name="options" aria-label="Remove" value="remove" class="join-item btn btn-info" />
    </div>

    {#if operation == "add"}
      <div class="form-control w-full">
        <label class="label"><span class="label-text">Enter amount of Koin to add</span></label>
        <div class="flex items-center">
          <BalanceInput bind:value={addAmount}></BalanceInput>
          <button on:click={addReservedKoin} disabled={addAmount <= BigInt(0)} class="btn btn-primary ml-2">Add</button>
        </div>
      </div>
    {/if}
    {#if operation == "remove"}
      <div class="form-control w-full">
        <label class="label"><span class="label-text">Enter amount of Koin to remove</span></label>
        <div class="flex items-center">
          <BalanceInput bind:value={removeAmount}></BalanceInput>
          <button on:click={removeReservedKoin} disabled={removeAmount <= BigInt(0)} class="btn btn-primary ml-2">Remove</button>
        </div>
      </div>
    {/if}

  </div>
</div>


<style></style>
