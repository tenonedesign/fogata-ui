<script>
	import { user, pool } from '$lib/stores';
	import Card from '$lib/Card.svelte';
	import { page } from '$app/stores';
	import logo from '$lib/images/logo.svg';
	import github from '$lib/images/github.svg';
  import { SettingsSharp } from 'svelte-ionicons';
	import WalletView from './WalletView.svelte';
	import { Wallet } from './types';
	import { poolWrite } from './utils';
  import { EllipsisVertical } from 'svelte-ionicons';


	async function payBeneficiaries() {
		poolWrite($pool.address, "pay_beneficiaries", {}, "beneficiaries payment request");
	}
	async function computePaymentTimeframe() {
		poolWrite($pool.address, "compute_payments_timeframe", {}, "payment computation");
	}

</script>

    <Card>
      <div class="dropdown dropdown-end flex-none absolute right-4 top-4">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-80">
          <li><a on:click={payBeneficiaries}>Pay beneficiaries</a></li>
          <li><a on:click={computePaymentTimeframe}>Compute payment timeframe</a></li>
        </ul>
      </div>

      <h1 class:opacity-0={$pool.apy == 0} class="text-5xl sm:text-6xl lg:text-[80px] mt-8 text-center font-semibold">
		<span class="tooltip tooltip-secondary flex-none" data-tip="{($pool.apy * 100).toLocaleString($user.language, {minimumFractionDigits:8})}%">{($pool.apy * 100).toFixed(2)}%</span>
		</h1>
      <h2 class="text-sm text-center max-w-2xl mt-4 mx-auto opacity-75 uppercase">Estimated pool APY</h2>

	  <div class="flex-1"></div>
	  <div class="flex justify-center">
        <WalletView wallet={$pool.wallet} title="Pool treasury:" />
      </div>
	</Card>

<style></style>
