<script lang="ts">
	import { user, pool } from '$lib/stores';
	import Card from '$lib/Card.svelte';
	import { page } from '$app/stores';
	import logo from '$lib/images/logo.svg';
	import github from '$lib/images/github.svg';
  import { SettingsSharp } from 'svelte-ionicons';
	import WalletView from './WalletView.svelte';
	import { CountdownTimer, Wallet } from './types';
  import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat, poolWrite } from './utils';
  import { EllipsisVertical } from 'svelte-ionicons';

	let countdownClock: any = null;
  let dValue = 0;
  let hValue = 0;
  let mValue = 0;
  let sValue = 0;
  let showStats = false;

	async function payBeneficiaries() {
		poolWrite($pool.address, "pay_beneficiaries", {}, "beneficiaries payment request");
	}
	async function reburnAndSnapshot() {
		poolWrite($pool.address, "reburn_and_snapshot", {}, "reburn");
	}

  function startCountdownClock(endTime: number, completionCallback:any = null) {
    const time = new CountdownTimer(endTime, (seconds: number, timeComponents: any) => {
      // console.log("tick with remaining seconds "+seconds+" and componenets: "+JSON.stringify(timeComponents));
      dValue = timeComponents.days;
      hValue = timeComponents.hours + (dValue * 24);  // only show hours
      mValue = timeComponents.minutes;
      sValue = timeComponents.seconds;
    }, () => {
      dValue = 0;
      hValue = 0;
      mValue = 0;
      sValue = 0;
      if (typeof completionCallback === 'function') {
        completionCallback();
      }
    })
  }

	$: startCountdownClock(Math.floor(Number($pool.state?.next_snapshot) / 1000));

</script>

  <Card>
    <div class="dropdown dropdown-end flex-none absolute right-4 top-4">
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-80">
        <li><a on:click={payBeneficiaries}>Pay beneficiaries</a></li>
        {#if Date.now() > Number($pool.state?.next_snapshot)}
          <li><a on:click={reburnAndSnapshot}>Reburn KOIN</a></li>
        {:else}
          <li><span class="opacity-50">
            Reburn available after 
            {#if (Number($pool.state?.next_snapshot) - Date.now()) > 10 * 60 * 1000}
              {hValue}hrs {mValue}mins 
            {:else}
              {mValue}mins {sValue}s
            {/if}
          </span></li>
        {/if}
        <li><a on:click={()=> {showStats = !showStats}}>{#if !showStats}Show{:else}Hide{/if} pool stats</a></li>
      </ul>
    </div>

    <h1 class:opacity-0={$pool.loaded == false} class="text-5xl sm:text-6xl lg:text-[70px] mt-8 text-center font-semibold">
		  <span class="tooltip tooltip-secondary flex-none" data-tip="{($pool.apy * 100).toLocaleString($user.language, {minimumFractionDigits:8})}%">{($pool.apy * 100).toFixed(2)}%</span>
		</h1>
		<div class="text-sm text-center max-w-2xl mt-4 mx-auto">
			<span class="opacity-75">
				Estimated pool APY<br />
        <span class="tooltip tooltip-secondary" data-tip="{tFormat(BigInt($pool.state?.snapshot_koin))}">{format(BigInt($pool.state?.snapshot_koin))}</span> (including your <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceKoin)}">{format($pool.userBalanceKoin)}</span>) KOIN
        {#if Date.now() > Number($pool.state?.next_snapshot)}
          may be reburned at any time
        {:else}
          may be reburned after 
          <span class="countdown mt-1">
            <span class="countdown-h font-mono" style="--value:{hValue};"></span>hrs 
            <span class="countdown-m font-mono" style="--value:{mValue};"></span>mins 
            {#if (Number($pool.state?.next_snapshot) - Date.now()) < 10 * 60 * 1000}
              <span class="countdown-s font-mono" style="--value:{sValue};"></span> sec
            {/if}
          </span>
        {/if}
			</span>
		</div>
    
    {#if showStats}
      <div class="flex flex-col items-center mt-4">
        <div class="font-bold">Live pool stats</div>
        <div class="text-sm mt-2">
          <h2><span class="font-semibold">Stake:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.stake))} KOIN">{format(BigInt($pool.state.stake))}</span></h2>
          <h2><span class="font-semibold">Virtual stake:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.virtual))} KOIN">{format(BigInt($pool.state.virtual))}</span></h2>
          <h2><span class="font-semibold">Snapshot stake:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.snapshot_stake))} VHP">{format(BigInt($pool.state.snapshot_stake))}</span></h2>
          <h2><span class="font-semibold">Snapshot KOIN:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.snapshot_koin))} VHP">{format(BigInt($pool.state.snapshot_koin))}</span></h2>
          <h2><span class="font-semibold">Snapshot VAPOR:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.snapshot_vapor))} VHP">{format(BigInt($pool.state.snapshot_vapor))}</span></h2>
          <h2><span class="font-semibold">VAPOR withdrawn:</span> <span class="tooltip" data-tip="{tFormat(BigInt($pool.state.vapor_withdrawn))} VHP">{format(BigInt($pool.state.vapor_withdrawn))}</span></h2>
          <h2><span class="font-semibold">Depositors:</span> <span>{$pool.state.user_count}</span></h2>
          <h2><span class="font-semibold">Last snapshot/reburn:</span> {(new Date(Number($pool.state.current_snapshot))).toLocaleString([],{timeZoneName:'short'})}</h2>
          <h2><span class="font-semibold">Can reburn after:</span> {(new Date(Number($pool.state.next_snapshot))).toLocaleString([],{timeZoneName:'short'})}</h2>
        </div>
      </div>
    {/if}

	  <div class="flex-1"></div>
	  <div class="flex justify-center">
        <WalletView wallet={$pool.wallet} title="Pool treasury:" />
      </div>
	</Card>

<style></style>
