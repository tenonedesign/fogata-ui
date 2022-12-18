<script lang="ts">
  import { EllipsisVertical } from 'svelte-ionicons';
  export let pool: any;
  export let owned: boolean = false;
  export let editAction: any = () => {};
  export let linkAction: any = () => {};
</script>

<div class="flex gap-4 p-4 items-center">
  <img  class="flex-none h-8 w-auto sm:h-12" src={pool.parameters.image} alt="{pool.parameters.name}" />
  <div class="flex flex-wrap items-center flex-1">
    <a href="/pools/{pool.address}" class="flex-1 font-semibold">{pool.parameters.name}</a>
    <div class="flex-none"><span class="text-xs">APY:</span> {(pool.apy * 100).toFixed(2)}%</div>
  </div>
  {#if owned}
    <div class="dropdown dropdown-end flex-none">
      <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
      <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a on:click={() => (editAction(pool.address))}>Edit pool</a></li>
        <li><a on:click={() => (linkAction(pool.address))}>Update block producer link</a></li>
      </ul>
    </div>
  {/if}
</div>

<style></style>
