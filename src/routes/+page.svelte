<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import Card from '$lib/Card.svelte';
	import { pools } from '$lib/stores.js';
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import PoolList from '$lib/PoolList.svelte';

	
  
</script>

<svelte:head>
	<title>Fogata</title>
	<meta name="description" content="Koinos mining pools" />
</svelte:head>

<div class="px-4">

  <Header />

  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20 pb-60">
  	<PoolList miners={$pools} title="Join a mining pool" />
	<Card>
		<div class="text-lg font-semibold">Create a mining pool</div>
		<div class="mt-4">
			TODO: Add mining pool contract config and deployment
			<br />
			TODO: Add setup instructions for running a node (mac, linux, pc)
		</div>
	</Card>
  </section>

</div>


<style>
</style>
