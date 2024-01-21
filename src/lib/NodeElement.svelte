<script lang="ts">
  import { Server, EllipsisVertical } from 'svelte-ionicons';
	import type { KoinosNode } from '$lib/types';
  export let node: KoinosNode;
  export let editAction: any = () => {};
  export let removeAction: any = () => {};
</script>

<div class="flex gap-4 p-4 items-center">
  <Server class="flex-none h-9 w-auto sm:h-12" size="24" />
  <div class="flex flex-wrap items-center flex-1">
    <div class="flex-1 font-semibold">{node.name}</div>
    <div class="flex-none"><span class="text-xs">pubKey:</span> {node.publicKey?.slice(0,5)+"..."+node.publicKey?.slice(-5)}</div>
  </div>
  <div class="dropdown dropdown-end flex-none">
    <label tabindex="0" class="btn btn-circle btn-ghost"><EllipsisVertical class="" size="24" /></label>
    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
      <li><a on:click={() => (editAction(node.publicKey))}>Edit node info</a></li>
      <li><a on:click={() => (removeAction(node.publicKey))}>Remove node</a></li>
    </ul>
  </div>
</div>

<style></style>
