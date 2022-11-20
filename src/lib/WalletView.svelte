<script lang="ts">
	import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat } from './utils';
	import type { Wallet } from "./types";


  export let wallet: Wallet;
  export let title: string;
  export let connected: boolean = true;
</script>

<div>
  <span class="text-sm font-semibold ml-1 bg-base-100 relative top-[14px] p-2">{title}</span>
  <div class="flex flex-col gap-0 mt-1 border border-base-300 dark:border-base-content dark:border-opacity-50 rounded-2xl p-3 min-w-[200px]">
    {#if connected}
      <h2 class="text-sm opacity-75 uppercase">Liquid Koin: <span class="tooltip" data-tip="{tFormat(wallet.balances.mana)} KOIN">{format(wallet.balances.mana)}</span></h2>
      <h2 class="text-sm opacity-75 uppercase">Total Koin: <span class="tooltip" data-tip="{tFormat(wallet.balances.koin)} KOIN">{format(wallet.balances.koin)}</span></h2>
      <h2 class="text-sm opacity-75 uppercase">VHP: <span class="tooltip" data-tip="{tFormat(wallet.balances.vhp)} VHP">{format(wallet.balances.vhp)}</span></h2>
    {:else}
      <h2 class="text-sm opacity-75 text-center my-6">Not connected</h2>
    {/if}
  </div>
</div>

<style></style>