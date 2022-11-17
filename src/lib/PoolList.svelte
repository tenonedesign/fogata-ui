<script lang="ts">
  import Card from '$lib/Card.svelte';
  import PoolListElement from '$lib/PoolListElement.svelte';
  export let miners: any;
  export let title: string = "Active miners";
</script>

<Card>
  <div class="text-lg font-semibold">{title}</div>
  {#each miners as miner}
    <PoolListElement miner={miner} />
  {/each}
</Card>

<style></style>
