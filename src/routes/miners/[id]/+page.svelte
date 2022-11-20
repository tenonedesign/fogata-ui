<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import { pools, wallet, pool, user } from '$lib/stores';
	import { page, getStores } from '$app/stores';
	import { onMount } from 'svelte';
	import { errorToast } from '$lib/utils';
	

	onMount(async () => {
		load();
		setInterval(() => {
			load();
		}, 5000);
	});

	function load() {

		$pool.wallet.loadBalances($pool.address, $user.selectedRpc || $user.customRpc).then(() => {
			pool.set($pool);
		}).catch(err => {
			errorToast("","Error reading pool token balance");
		});

		if ($user.address) {
			$wallet.loadBalances($user.address, $user.selectedRpc || $user.customRpc).then(() => {
				wallet.set($wallet);
			}).catch(err => {
				errorToast("","Error reading wallet token balance");
			});
		}
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="px-4">
  <Header name="{$pools.find(x => x.id === $page.params.id)?.name}" />

  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pb-40 pt-20">
    <Stake />
    <Stats />
  </section>
</div>


<style>
</style>
