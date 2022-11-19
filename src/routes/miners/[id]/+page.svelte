<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { address } from '$lib/stores.js';
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import { pools, wallet, selectedRpc, customRpc, pool } from '$lib/stores';
	import { page, getStores } from '$app/stores';
	import { onMount } from 'svelte';
	import { Pool } from '$lib/types';
	
	onMount(async () => {
		
		$pool.wallet.getBalances("1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS", $selectedRpc || $customRpc).then(() => {
			pool.set($pool);
		});	
	});
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
