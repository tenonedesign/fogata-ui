<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { address } from '$lib/stores.js';
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import { pools } from '$lib/stores';
	import { page, getStores } from '$app/stores';
	
	let pool: any;

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
