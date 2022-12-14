<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { pools, wallet, pool, user, env, ownedPools } from '$lib/stores';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { balanceDisplayFormat, balanceToFloat, hideConnectionToast, pobRead, poolRead, populateOwnedPools, showConnectionToast, tokenBalanceOf, tokenTotalSupply, updateStoredObjects } from '$lib/utils';
	import { Pool } from '$lib/types';
	import { Serializer, utils } from 'koilib';

	updateStoredObjects();
	populateOwnedPools();
	pool.set($pools.find(x => x.address == $page.params.id) || $ownedPools.find(x => x.address == $page.params.id) || new Pool());

	let timer: NodeJS.Timer;
	onMount(async () => {
		load();
		timer = setInterval(() => {
			load();
		}, 5000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {

		$pool.refresh().then(() => {
			pool.set($pool);
			$pool = $pool;
			hideConnectionToast();
		}).catch(err => {
			showConnectionToast();
		});

		if ($user.address) {
			$wallet.loadBalances($user.address).then(() => {
				wallet.set($wallet);
			}).catch(err => {
			});

			poolRead($pool.address, "balance_of", { account: $user.address }).then((value) => {
				$pool.userBalanceKoin = BigInt(value?.koin_amount ?? "0");
				$pool.userBalanceVhp = BigInt(value?.vhp_amount ?? "0");
				$pool.userBalance = $pool.userBalanceKoin + $pool.userBalanceVhp;
			});
		}
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="px-4">
  <Header pool="{pool}" />
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pb-40 pt-20">
    <Stake />
    <Stats />
  </section>
</div>


<style>
</style>
