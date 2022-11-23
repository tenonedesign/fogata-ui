<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { pools, wallet, pool, user } from '$lib/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { balanceDisplayFormat, hideConnectionToast, pobRead, showConnectionToast, tokenBalanceOf, tokenTotalSupply } from '$lib/utils';
	import { Pool } from '$lib/types';
	import { Serializer, utils } from 'koilib';

	// 0% take -> 1.9999360139121
	// 5% take each block -> 1.89899585612153 (1.899%)
	// 5% take at the end -> 1.89993921322 (1.900%)
	// function runBlocks(): number {
	// 	let take = 0;
	// 	let takeAmount = 0.0;
	// 	let supply = 100000000;
	// 	let percent = 0.019802;	// produces 1.9999360139121% inflation (simulated output of pob contract minting with this value)
	// 	// let percent = .019802625;	// closer to producing exactly 2%
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

	async function load() {

		$pool.wallet.loadBalances($pool.address).then(() => {
			pool.set($pool);
			hideConnectionToast();
		}).catch(err => {
			// errorToast("","Error reading pool token balance");
			showConnectionToast();
		});

		if ($user.address) {
			$wallet.loadBalances($user.address).then(() => {
				wallet.set($wallet);
				hideConnectionToast();
			}).catch(err => {
				// errorToast("","Error reading wallet token balance");
				showConnectionToast();
			});
			tokenBalanceOf($pool.address, $user.address).then((balance) => {
				$pool.userBalance = balance;
			});
		}
		

		let totalKoin = await tokenTotalSupply("15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL");
		let totalVhp = await tokenTotalSupply("1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9");

		// from pob_producer.cpp:
		// .quanta_per_block_interval = consensus_params.target_block_interval() / consensus_params.quantum_length()
		// auto vhp = difficulty / _auxiliary_data->quanta_per_block_interval;
		let pobConsensusParams = await pobRead("get_consensus_parameters");
		let pobMetadata = await pobRead("get_metadata");
		let difficultyHexString = "0x"+utils.toHexString(utils.decodeBase64url(pobMetadata.difficulty));
		let difficulty = BigInt(difficultyHexString);
		let quantaPerBlockInterval = pobConsensusParams.target_block_interval / pobConsensusParams.quantum_length;
		let vhpProducingGlobal =  Number(difficulty / BigInt(quantaPerBlockInterval));

		// is this too clever?
		// if (totalVhp < vhpProducingGlobal) {
		// 	vhpProducingGlobal = totalVhp;
		// }
		// console.log(vhpProducingGlobal);

		// burnkoin calculation
		// const virtualSupply = (koinTotalSupply.data || 0) + (vhpTotalSupply.data || 0);
		// const yearlyInflationAmount = virtualSupply * Math.pow(Math.E, 0.019802) - virtualSupply;
		// const apy = (currentApy = 0.95 * (100 * yearlyInflationAmount) / (vhpTotalSupply.data || 1));

		// CALCULATE POOL APY
		// strategy is 0.95 * (yearlyMinedByPool / currentPoolAssets).
		// expected koin mined by pool is yearlyMinedGlobal * (currentPoolAssets / vhpProducing)
		// note that 0.05 taken after the year is done differs from 0.05 taken from each mined reward, thereby preventing its use in future mining.
		// however, the effective difference is very small (on the order of 0.001% apy difference)
		let yearlyMinedGlobal = Math.floor(0.019999360139121 * (totalKoin + totalVhp));	// would be 0.02, but simulated output of pob contract is slightly less
		let currentPoolAssets = $pool.wallet.balances.koin + $pool.wallet.balances.vhp;	// should include koin, too?  assumption of impending burn?
		let yearlyMinedByPool = yearlyMinedGlobal * (currentPoolAssets / vhpProducingGlobal);
		let totalApy = yearlyMinedByPool / currentPoolAssets;
		let participantApy = 0.95 * totalApy;

		// console.log("vhpProducingGlobal: "+balanceDisplayFormat(vhpProducingGlobal));
		// console.log("virtual supply: "+ (totalKoin + totalVhp));
		// console.log("yearlyMinedGlobal: "+ yearlyMinedGlobal);
		// console.log("currentPoolAssets: "+balanceDisplayFormat(currentPoolAssets));
		// console.log("yearlyMinedByPool: "+balanceDisplayFormat(yearlyMinedByPool));
		// console.log("totalApy: "+totalApy);
		// console.log("participantApy: "+participantApy);
		$pool.apy = participantApy;
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
