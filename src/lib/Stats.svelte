<script>
	import { address, language, apy, pool } from '$lib/stores';
	import Card from '$lib/Card.svelte';
	import { page } from '$app/stores';
	import logo from '$lib/images/logo.svg';
	import github from '$lib/images/github.svg';
  import { SettingsSharp } from 'svelte-ionicons';
	import WalletView from './WalletView.svelte';
	import { Wallet } from './types';
</script>

    <Card>
      <h1 class=" text-5xl sm:text-6xl lg:text-[80px] mt-8 text-center font-semibold tooltip tooltip-secondary flex-none" data-tip="{($apy).toLocaleString($language, {minimumFractionDigits:8})}%">{$apy.toFixed(2)}%</h1>
      <h2 class="text-sm text-center max-w-2xl mt-4 mx-auto opacity-75 uppercase">Estimated pool APY</h2>

	  <div class="flex-1"></div>
	  <div class="flex justify-center">
        <WalletView wallet={$pool.wallet} title="Pool treasury:" />
      </div>
	</Card>

<style></style>
