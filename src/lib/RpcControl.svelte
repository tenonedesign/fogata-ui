<script lang="ts">
	import type { Writable } from "svelte/store";

  export let rpcs: Writable<string[]>;
  export let selectedRpc: Writable<string>;
  export let customRpc: Writable<string>;
</script>

<div>
  <select bind:value={$selectedRpc} on:change="{() => ''}" class="select select-ghost w-full max-w-xs">
    {#each $rpcs as rpc}
      <option value={rpc}>{rpc}</option>
    {/each}
    <option value="">Other</option>
  </select>

  {#if $selectedRpc == ""}
    <input type="text" placeholder="api.koinos.io" class="input input-bordered w-full mt-2" bind:value={$customRpc} />
  {/if}
</div>

<style></style>
