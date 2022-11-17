<script>
	import { address, language, apy } from './stores';
	import Card from '$lib/Card.svelte';
	import { page } from '$app/stores';
	import logo from '$lib/images/logo.svg';
	import github from '$lib/images/github.svg';
  import { SettingsSharp } from 'svelte-ionicons';
</script>

    <Card>
      <h1 class=" text-5xl sm:text-6xl lg:text-[80px] mt-8 text-center font-semibold tooltip" data-tip="{($apy).toLocaleString($language, {minimumFractionDigits:8})}%">{$apy.toFixed(2)}%</h1>
      <h2 class="text-sm text-center max-w-2xl mt-4 mx-auto opacity-75 uppercase">Estimated pool APY</h2>
	</Card>

<style></style>
