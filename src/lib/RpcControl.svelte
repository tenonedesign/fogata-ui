<script lang="ts">
	import type { Writable } from "svelte/store";
	import type { Endpoint, User } from "./types";

  export let rpcs: Writable<Endpoint[]>;
  export let user: Writable<User>;
</script>

<div>
  <select bind:value={$user.selectedRpcUrl} on:change="{() => ''}" class="select select-ghost w-full max-w-xs">
    {#each $rpcs as rpc}
      <option value={rpc.url}>{rpc.url}</option>
    {/each}
    <option value="">Other</option>
  </select>

  {#if $user.selectedRpcUrl == ""}
    <input type="text" placeholder="api.koinos.io" class="input input-bordered w-full mt-2" bind:value={$user.customRpc.url} />
    <div class="form-control">
      <label class="cursor-pointer label">
        <span class="label-text">Endpoint is for testnet</span>
        <input type="checkbox" class="checkbox checkbox-accent" bind:checked={$user.customRpc.isTestnet} />
      </label>
    </div>
  {/if}
</div>

<style></style>
