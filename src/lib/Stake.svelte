<script lang="ts">
	import { user, wallet, pool } from './stores';
  import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat, poolOperation } from './utils';
	import Card from '$lib/Card.svelte';
	import WalletView from './WalletView.svelte';
	import { utils } from 'koilib';
	import PoolActionButton from '$lib/PoolActionButton.svelte';
	import { TokenName } from './types';

  let activeToken: string = TokenName.KOIN;
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

</script>

    <Card>
      <h1 class=" text-5xl sm:text-6xl lg:text-[80px] mt-8 text-center font-semibold tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalance)} VHP">{format($pool.userBalance)}</h1>
      <h2 class="text-sm text-center max-w-2xl mt-4 mx-auto opacity-75">YOUR STAKE (Includes {format($pool.userBalanceKoin)} liquid KOIN)</h2>
      <div class="flex justify-center gap-4 mt-8 flex-1">

        {#if $wallet.balances.mana > 0}
          <PoolActionButton 
            actionName="Deposit"
            title="Deposit KOIN or VHP"
            message="Enter the amount of KOIN or VHP to deposit.  You may withdraw as VHP at any time."
            maximums={{koin: $wallet.balances.koin, vhp: $wallet.balances.vhp}}
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
