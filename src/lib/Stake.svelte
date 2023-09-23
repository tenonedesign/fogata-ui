<script lang="ts">
	import { user, wallet, pool } from './stores';
  import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat, intervalDisplayFormat, poolOperation, poolWrite } from './utils';
	import Card from '$lib/Card.svelte';
	import WalletView from './WalletView.svelte';
	import { utils } from 'koilib';
	import PoolActionButton from '$lib/PoolActionButton.svelte';
	import { TokenName } from './types';
  import { EllipsisVertical, CaretDownSharp } from 'svelte-ionicons';
	import CollectKoinPrefsEditor from './CollectKoinPrefsEditor.svelte';
	import { onMount } from 'svelte';

  let activeToken: string = TokenName.VHP;
  let depositValue: string = "";
  let withdrawalValue: string = "";
  let prefsEditor: any = null;
  let mounted: boolean = false;

  onMount(async () => {
    mounted = true;
	});

  async function initiateDeposit() {
    let koinAmount = (activeToken == TokenName.KOIN) ? BigInt(utils.parseUnits(depositValue, 8)) : BigInt(0);
    let vhpAmount = (activeToken == TokenName.VHP) ? BigInt(utils.parseUnits(depositValue, 8)) : BigInt(0);
    poolOperation($pool, "stake", koinAmount, vhpAmount);
    depositValue = "";
  }

  async function initiateWithdrawal() {
    let koinAmount = (activeToken == TokenName.KOIN) ? BigInt(utils.parseUnits(withdrawalValue, 8)) : BigInt(0);
    let vhpAmount = (activeToken == TokenName.VHP) ? BigInt(utils.parseUnits(withdrawalValue, 8)) : BigInt(0);
    poolOperation($pool, "unstake", koinAmount, vhpAmount);
    withdrawalValue = "";
  }

	async function collect() {
		poolWrite($pool.address, "collect", {account: $user.address}, "collection");
	}
  async function editCollectionPreferences() {
    prefsEditor.poolAddress = $pool.address;
    prefsEditor.userAddress = $user.address;
    prefsEditor.show($pool.collectKoinPreferences);
  }

</script>

    <Card>

      <!-- <div class="dropdown dropdown-end flex-none absolute right-4 top-4">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-52">
          <li><a on:click={collectVapor}>Collect vapor</a></li>
        </ul>
      </div> -->

      <h1 class=" text-5xl sm:text-6xl lg:text-[70px] mt-8 text-center font-semibold">
        <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceVhp)} VHP + {tFormat($pool.userBalanceKoin)} KOIN">
          {format($pool.userBalance)}
        </span>
      </h1>
      <div class="text-sm text-center max-w-2xl mt-4 mx-auto">
        <span class="opacity-75">
          KOIN + VHP STAKE<br />
          Last snapshot result: 
          <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceKoin)}">{format($pool.userBalanceKoin)}</span> liquid KOIN and 
          <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceVapor)}">{format($pool.userBalanceVapor)}</span> VAPOR
        </span>
        <!-- {#if ($pool.userBalanceKoin > 0 || $pool.userBalanceVapor > 0)} -->
          <div class="dropdown dropdown-end flex-none">
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label tabindex="0" class="btn btn-secondary px-2 h-6 min-h-0 opacity-75 ml-1">collect<CaretDownSharp class="ml-2" size="12" /></label>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <ul tabindex="0" class="dropdown-content menu p-2 mt-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-52">
              <li><a on:click={collect}>Collect now</a></li>
              <li><a on:click={editCollectionPreferences}>Collection preferences...</a></li>
              <!-- {#if $pool.userBalanceKoin > 0}<li><a on:click={collectKoin}>Collect KOIN</a></li>{/if} -->
              <!-- {#if $pool.userBalanceVapor > 0}<li><a on:click={collectVapor}>Collect VAPOR</a></li>{/if} -->
            </ul>
          </div>
          <!-- <button class="btn btn-secondary no-underline px-2 relative h-6 min-h-0">collect<CaretDownSharp class="ml-2" size="12" /></button> -->
        <!-- {/if} -->
      </div>

      <div class="flex justify-center gap-4 mt-8 flex-1">

        {#if $wallet.balances.mana > 0}
          <PoolActionButton 
            actionName="Deposit"
            title="Deposit KOIN or VHP"
            message="Enter the amount of KOIN or VHP to deposit.  You may withdraw as VHP at any time."
            maximums={{koin: $wallet.balances.koin, vhp: $wallet.balances.vhp}}
            burnWarning="Depositing KOIN will permanently convert it to VHP. You will only be able to withdraw it as VHP, or as small amounts of KOIN every {intervalDisplayFormat($pool.parameters?.payment_period)}."
            buttonAction={initiateDeposit}
            bind:activeToken={activeToken}
            bind:value={depositValue}>Deposit</PoolActionButton>
          <PoolActionButton
            actionName="Withdraw"
            title="Withdraw KOIN or VHP"
            message="Enter the amount of KOIN or VHP to withdraw."
            maximums={{koin: $pool.userBalanceKoin, vhp: $pool.userBalanceVhp}}
            buttonAction={initiateWithdrawal}
            bind:activeToken={activeToken}
            bind:value={withdrawalValue}>Withdraw</PoolActionButton>
        {/if}

      </div>
      <div class="flex justify-center mt-10">
        <WalletView wallet={$wallet} connected="{!!$user.address}" title="Your wallet:" />
      </div>
	</Card>

<!-- hide before onMount because modal flashes when loaded with any latency -->
{#if mounted}
  <CollectKoinPrefsEditor bind:this={prefsEditor}></CollectKoinPrefsEditor>
{/if}
<style></style>
