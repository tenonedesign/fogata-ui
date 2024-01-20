<script lang="ts">
	import BalanceInput from '$lib/BalanceInput.svelte';
import Card from '$lib/Card.svelte';
	import Header from '$lib/Header.svelte';
	import { env, user, wallet } from '$lib/stores';
	import { SponsorsContract } from '$lib/types';
	import { balanceDisplayFormat, balanceTooltipFormat, sponsorsWrite, tokenTotalSupply } from '$lib/utils';
	import WalletView from '$lib/WalletView.svelte';
	import { onDestroy, onMount } from 'svelte';
	

	let timer: NodeJS.Timer;
	let sponsors = new SponsorsContract($env.sponsors_address);
	let contribution = BigInt(0);


	onMount(async () => {
		load();
		timer = setInterval(() => {
			load();
		}, 15000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {
		sponsors.refresh().then(() => {
			sponsors = sponsors;
		});
		if ($user.address) {
			$wallet.loadBalances($user.address).then(() => {
				$wallet = $wallet;
			});
		}

	}


	const contributeKoin = async (): Promise<any> => {
    const params = {
      from: $user.address,
      value: contribution.toString(),
    }
    sponsorsWrite("contribute", params, "sponsors contribution");
  }

</script>

<svelte:head>
	<title>Sponsors contract</title>
	<meta name="description" content="List of pools" />
</svelte:head>

<div class="px-4">
	<Header pool={null} />
	<section class="grid grid-cols-1 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20">

		<Card>
			<h1 class=" text-5xl sm:text-6xl lg:text-[70px] mt-8 text-center font-semibold">
				<span class="tooltip tooltip-secondary" data-tip="{balanceTooltipFormat(sponsors.wallet.balances.koin)} KOIN">
					{(sponsors.loaded)? balanceDisplayFormat(sponsors.wallet.balances.koin) : " "}
				</span>
			</h1>
			<div class="text-sm text-center max-w-2xl mt-4 mx-auto">
        <span class="opacity-75">
					Sponsors Koin balance
					<br />
					Total Vapor supply: <span class="tooltip" data-tip="{balanceTooltipFormat(sponsors.totalSupply)} VAPOR">{(sponsors.loaded)? balanceDisplayFormat(sponsors.totalSupply) : " "}</span>
				</span>
			</div>

			<div class="flex justify-around gap-4 mt-10 flex-1">
				<div class="form-control flex-1 max-w-xs">
					<label class="label"><span class="label-text">Enter amount of Koin to contribute</span></label>
					<div class="flex items-center">
						<BalanceInput bind:value={contribution}></BalanceInput>
						<button on:click={contributeKoin} disabled={contribution <= BigInt(0)} class="btn btn-primary ml-2">Go</button>
					</div>
				</div>
      </div>

			<div class="flex justify-center mt-10">
        <WalletView wallet={$wallet} connected="{!!$user.address}" title="Your wallet:" />
      </div>
		</Card>

	</section>

</div>


<style>
</style>
