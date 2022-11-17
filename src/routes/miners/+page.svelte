<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { pools } from '$lib/stores.js';
	import PoolList from '$lib/PoolList.svelte';
</script>

<svelte:head>
	<title>Pools</title>
	<meta name="description" content="List of miners" />
</svelte:head>

<div class="px-4">

	<Header />
	<section class="grid grid-cols-1 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20">
		<PoolList miners={$pools} title="Join a mining pool" />
	</section>

</div>


<style>
</style>
