<script lang="ts">
  export let miner: any;
</script>

<div class="flex gap-4 p-4 items-center">
  <img  class="flex-none h-2 w-auto sm:h-4" src={miner.logo} alt="{miner.name}" />
  <a href="/miners/{miner.id}" class="flex-1">{miner.name}</a>
  <div class="flex-none">apy: {miner.apy}%</div>
</div>

<style></style>
