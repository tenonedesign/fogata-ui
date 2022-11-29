<script lang="ts">
  export let pool: any;
</script>

<div class="flex gap-4 p-4 items-center">
  <img  class="flex-none h-2 w-auto sm:h-12" src={pool.logo} alt="{pool.name}" />
  <a href="/pools/{pool.address}" class="flex-1 font-semibold">{pool.name}</a>
  <div class="flex-none"><span class="text-xs">APY:</span> {(pool.apy * 100).toFixed(2)}%</div>
</div>

<style></style>
