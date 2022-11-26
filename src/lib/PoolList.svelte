<script lang="ts">
  import Card from '$lib/Card.svelte';
  import PoolListElement from '$lib/PoolListElement.svelte';
  export let pools: any;
  export let title: string = "Active miners";
</script>

<Card>
  <div class="text-lg font-semibold">{title}</div>
  {#each pools as pool}
    <PoolListElement pool={pool} />
  {/each}
</Card>

<style></style>
