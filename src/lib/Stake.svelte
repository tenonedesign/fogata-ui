<script lang="ts">
	import { user, wallet, pool } from './stores';
  import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat, poolOperation, poolWrite } from './utils';
	import Card from '$lib/Card.svelte';
	import WalletView from './WalletView.svelte';
	import { utils } from 'koilib';
	import PoolActionButton from '$lib/PoolActionButton.svelte';
	import { TokenName } from './types';
  import { EllipsisVertical, CaretDownSharp } from 'svelte-ionicons';

  let activeToken: string = TokenName.VHP;
  let depositValue: string = "";
  let withdrawalValue: string = "";

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

	async function collectKoin() {
    poolOperation($pool, "unstake", $pool.userBalanceKoin, BigInt(0));
	}
	async function collectVapor() {
		poolWrite($pool.address, "collect_vapor", {account: $user.address}, "vapor collection");
	}

</script>

    <Card>

      <!-- <div class="dropdown dropdown-end flex-none absolute right-4 top-4">
        <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><a on:click={collectVapor}>Collect vapor</a></li>
        </ul>
      </div> -->

      <h1 class=" text-5xl sm:text-6xl lg:text-[70px] mt-8 text-center font-semibold">
        <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalance)}">
          {format($pool.userBalance)}
        </span>
      </h1>
      <div class="text-sm text-center max-w-2xl mt-4 mx-auto">
        <span class="opacity-75">
          YOUR TOTAL STAKE<br />
          (Includes 
          <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceKoin)}">{format($pool.userBalanceKoin)}</span> liquid KOIN and 
          <span class="tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalanceVapor)}">{format($pool.userBalanceVapor)}</span> VAPOR)
        </span>
        {#if ($pool.userBalanceKoin > 0 || $pool.userBalanceVapor > 0)}
          <div class="dropdown dropdown-end flex-none">
            <label tabindex="0" class="btn btn-secondary px-2 h-6 min-h-0 opacity-75">collect<CaretDownSharp class="ml-2" size="12" /></label>
            <ul tabindex="0" class="dropdown-content menu p-2 mt-2 shadow bg-base-100 rounded-box w-52">
              {#if $pool.userBalanceKoin > 0}<li><a on:click={collectKoin}>Collect KOIN</a></li>{/if}
              {#if $pool.userBalanceVapor > 0}<li><a on:click={collectVapor}>Collect VAPOR</a></li>{/if}
            </ul>
          </div>
          <!-- <button class="btn btn-secondary no-underline px-2 relative h-6 min-h-0">collect<CaretDownSharp class="ml-2" size="12" /></button> -->
        {/if}
        
        </div>
      <div class="flex justify-center gap-4 mt-8 flex-1">

        {#if $wallet.balances.mana > 0}
          <PoolActionButton 
            actionName="Deposit"
            title="Deposit KOIN or VHP"
            message="Enter the amount of KOIN or VHP to deposit.  You may withdraw as VHP at any time."
            maximums={{koin: $wallet.balances.koin, vhp: $wallet.balances.vhp}}
            burnWarning="Depositing KOIN will permanently convert it to VHP. You will only be able to withdraw it as VHP."
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

<style></style>
