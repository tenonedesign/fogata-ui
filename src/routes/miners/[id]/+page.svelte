<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { pools, wallet, pool, user } from '$lib/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { hideConnectionToast, showConnectionToast, tokenBalance } from '$lib/utils';
	import { Pool } from '$lib/types';
	
	// 0% take -> 1.9999360139121
	// 5% take each block -> 1.89899585612153 (1.899%)
	// 5% take at the end -> 1.89993921322 (1.900%)
	// function runBlocks(): number {
	// 	let take = 0;
	// 	let takeAmount = 0.0;
	// 	let supply = 100000000;
	// 	// let percent = .019802625;	// closer to producing exactly 2%
	// 	let percent = 0.019802;
	// 	for (let i = 0; i < 10512000; i++) {
	// 		let newSupply = block(supply, percent);
	// 		let reward = newSupply - supply;
	// 		let thisTake = reward * takeAmount;
	// 		supply = newSupply - thisTake;
	// 		take += thisTake;
	// 		// supply = block(supply, percent);
	// 	}
	// 	console.log("take: "+take);
	// 	return supply;
	// }
	// function block(supply: number, percent: number): number {
	// 	let yearlyInflationTokens = supply * percent;
	// 	let blocksPerYear = 31536000000 / 3000;
	// 	let blockReward = yearlyInflationTokens / blocksPerYear;
	// 	return supply + blockReward;
	// }

	pool.set($pools.find(x => x.id == $page.params.id) || new Pool());

	onMount(async () => {
		load();
		setInterval(() => {
			load();
		}, 5000);
	});

	function load() {

		$pool.wallet.loadBalances($pool.address, $user.selectedRpc || $user.customRpc).then(() => {
			pool.set($pool);
			hideConnectionToast();
		}).catch(err => {
			// errorToast("","Error reading pool token balance");
			showConnectionToast();
		});

		if ($user.address) {
			$wallet.loadBalances($user.address, $user.selectedRpc || $user.customRpc).then(() => {
				wallet.set($wallet);
				hideConnectionToast();
			}).catch(err => {
				// errorToast("","Error reading wallet token balance");
				showConnectionToast();
			});
			tokenBalance($pool.address, $user.address, $user.selectedRpc || $user.customRpc).then((balance) => {
				$pool.userBalance = balance;
			});
		}

		// const virtualSupply = (koinTotalSupply.data || 0) + (vhpTotalSupply.data || 0);
		// const yearlyInflationAmount = virtualSupply * Math.pow(Math.E, 0.019802) - virtualSupply;
		// const $pool.apy = (currentApy = 0.95 * (100 * yearlyInflationAmount) / (vhpTotalSupply.data || 1));
		// $pool.apy = 4.5;

		// CALCULATE POOL APY
		// strategy is 0.95 * (pool assets + expected koin mined by pool) / (pool assets).
		// expected koin mined by pool is (pool assets) / (total vhp currently producing)
		// note that 0.05 taken after the year is done differs from 0.05 taken from each mined reward, thereby preventing its use in future mining.
		// however, the effective difference is very small (on the order of 0.001% apy difference)
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="px-4">
  <Header pool="{pool}" />
	<!-- {runBlocks()} -->
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pb-40 pt-20">
    <Stake />
    <Stats />
  </section>
</div>


<style>
</style>
