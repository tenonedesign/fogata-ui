<script lang="ts">
	import { user, wallet, pool } from './stores';
  import { balanceDisplayFormat as format, balanceTooltipFormat as tFormat, poolOperation } from './utils';
	import Card from '$lib/Card.svelte';
	import WalletView from './WalletView.svelte';
	import { utils } from 'koilib';

  let depositCheckbox: any = null;
  let withdrawCheckbox: any = null;
  let depositInput: any = null;
  let withdrawInput: any = null;
  let tokenName: string = "KOIN";

  async function initiateDeposit() {
    depositCheckbox.checked = false;
    let koinAmount = (tokenName == "KOIN") ? BigInt(utils.parseUnits(depositInput.value, 8)) : 0n;
    let vhpAmount = (tokenName == "VHP") ? BigInt(utils.parseUnits(depositInput.value, 8)) : 0n;
    poolOperation($pool, "stake", koinAmount, vhpAmount);
    depositInput.value = "";
  }

  function initiateWithdrawal() {
    withdrawCheckbox.checked = false;
    let koinAmount = (tokenName == "KOIN") ? BigInt(utils.parseUnits(withdrawInput.value, 8)) : 0n;
    let vhpAmount = (tokenName == "VHP") ? BigInt(utils.parseUnits(withdrawInput.value, 8)) : 0n;
    poolOperation($pool, "unstake", koinAmount, vhpAmount);
    withdrawInput.value = "";
  }

</script>

    <Card>
      <h1 class=" text-5xl sm:text-6xl lg:text-[80px] mt-8 text-center font-semibold tooltip tooltip-secondary" data-tip="{tFormat($pool.userBalance)} VHP">{format($pool.userBalance)}</h1>
      <h2 class="text-sm text-center max-w-2xl mt-4 mx-auto opacity-75">YOUR STAKE (Includes {format($pool.userBalanceKoin)} liquid KOIN)</h2>
      <div class="flex justify-center gap-4 mt-8 flex-1">
        <!-- <button on:click={showDeposit} class="btn btn-outline">Deposit</button> -->



        {#if $wallet.balances.mana > 0}

          <label for="modal-deposit" class="btn btn-outline">Deposit</label>
          <!-- Put this part before </body> tag -->
          <input bind:this={depositCheckbox} type="checkbox" id="modal-deposit" class="modal-toggle" />
          <div class="modal">
            <div class="modal-box relative overflow-visible">
              <label for="modal-deposit" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
              <h3 class="text-lg font-bold">Deposit KOIN or VHP</h3>
              <p class="py-4">Enter the amount of KOIN or VHP to deposit.  You may withdraw as VHP at any time.</p>
              <div class="flex items-center">
                <input bind:this={depositInput} type="text" pattern="[0-9.,]+" placeholder="0" class="input input-bordered input-primary max-w-xs min-w-[150px] flex-1 invalid:bg-red-100" />
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div class="dropdown dropdown-end flex-none">
                  <label tabindex="0" class="btn btn-outline m-1">{tokenName}</label>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a on:click={() => (tokenName="KOIN")}>KOIN</a></li>
                    <li><a on:click={() => (tokenName="VHP")}>VHP</a></li>
                  </ul>
                </div>
              </div>
              <div class="mt-4">
                <label for="modal-deposit" class="btn btn-outline">Cancel</label>
                <button on:click={initiateDeposit} class="btn btn-primary ml-2">Deposit {tokenName}</button>
              </div>
            </div>
          </div>

          <label for="modal-withdraw" class="btn btn-outline">Withdraw</label>
          <!-- Put this part before </body> tag -->
          <input bind:this={withdrawCheckbox} type="checkbox" id="modal-withdraw" class="modal-toggle" />
          <div class="modal">
            <div class="modal-box relative overflow-visible">
              <label for="modal-withdraw" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
              <h3 class="text-lg font-bold">Withdraw KOIN or VHP</h3>
              <p class="py-4">Enter the amount of KOIN or VHP to withdraw.</p>
              <p class="text-sm">Max KOIN: {tFormat($pool.userBalanceKoin)}</p>
              <p class="text-sm mb-1">Max VHP: {tFormat($pool.userBalanceVhp)}</p>
              <div class="flex items-center">
                <input bind:this={withdrawInput} type="text" pattern="[0-9.,]+" placeholder="0" class="input input-bordered input-primary w-full max-w-xs min-w-[150px] invalid:bg-red-100" />
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div class="dropdown dropdown-end flex-none">
                  <label tabindex="0" class="btn btn-outline ml-2">{tokenName}</label>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a on:click={() => (tokenName="KOIN")}>KOIN</a></li>
                    <li><a on:click={() => (tokenName="VHP")}>VHP</a></li>
                  </ul>
                </div>
              </div>
              <div class="mt-4">
                <label for="modal-withdraw" class="btn btn-outline">Cancel</label>
                <button on:click={initiateWithdrawal} class="btn btn-primary ml-2">Withdraw VHP</button>
              </div>
            </div>
          </div>
        {/if}

      </div>
      <div class="flex justify-center mt-10">
        <WalletView wallet={$wallet} connected="{!!$user.address}" title="Your wallet:" />
      </div>
	</Card>

<style></style>
