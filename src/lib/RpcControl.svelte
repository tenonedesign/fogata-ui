<script lang="ts">
	import type { Writable } from "svelte/store";
	import type { User } from "./types";

  export let rpcs: Writable<string[]>;
  export let user: Writable<User>;
</script>

<div>
  <select bind:value={$user.selectedRpc} on:change="{() => ''}" class="select select-ghost w-full max-w-xs">
    {#each $rpcs as rpc}
      <option value={rpc}>{rpc}</option>
    {/each}
    <option value="">Other</option>
  </select>

  {#if $user.selectedRpc == ""}
    <input type="text" placeholder="api.koinos.io" class="input input-bordered w-full mt-2" bind:value={$user.customRpc} />
  {/if}
</div>

<style></style>
