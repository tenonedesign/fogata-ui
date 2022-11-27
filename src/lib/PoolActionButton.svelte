<script lang="ts">
	import { utils } from "koilib";
	import { balanceTooltipFormat } from "$lib/utils";
  import { ArrowDownSharp, CaretDownSharp } from 'svelte-ionicons';
	import { TokenName } from "./types";

  export let actionName: string = "";
  export let title: string = "";
  export let message: string = "";
  export let activeToken: string;
  export let buttonAction: () => {};
  export let value: string = "";
  export let maximums: {koin?: bigint, vhp?: bigint} = {};

  let modalCheckbox: any;
  let input: any;
  let instanceId = Math.random().toString(36).substring(2);
  const _buttonAction = () => {
    modalCheckbox.checked = false;
    buttonAction();
  }
  
</script>


<label for="modal-{instanceId}" class="btn btn-outline">
  <slot></slot>
</label>

<!-- Put this part before </body> tag -->
<input bind:this={modalCheckbox} type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative overflow-visible">
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">{title}</h3>
    <p class="py-4">{message}</p>
    {#if maximums.koin !== undefined }
      <p class="text-sm">Max KOIN:<button class="group btn btn-ghost ml-1 px-2 h-5 min-h-[20px]" on:click={() => { value=utils.formatUnits(maximums.koin ?? 0, 8); activeToken = TokenName.KOIN; }}>{balanceTooltipFormat(maximums.koin)}<ArrowDownSharp class="ml-1 opacity-0 group-hover:opacity-100" size="12" /></button></p>
    {/if}
    {#if maximums.vhp !== undefined }
      <p class="text-sm mb-1">Max VHP:<button class="group btn btn-ghost ml-1 px-2 h-5 min-h-[20px]" on:click={() => { value=utils.formatUnits(maximums.vhp ?? 0, 8); activeToken = TokenName.VHP; }}>{balanceTooltipFormat(maximums.vhp)}<ArrowDownSharp class="ml-1 opacity-0 group-hover:opacity-100" size="12" /></button></p>
    {/if}
    <div class="flex items-center">
      <input bind:this={input} bind:value={value} type="text" pattern="[0-9.]+" placeholder="0" class="input input-bordered input-primary max-w-xs min-w-[150px] flex-1 invalid:bg-red-100" />
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <div class="dropdown dropdown-end flex-none">
        <label tabindex="0" class="btn btn-outline m-1 ml-2">{activeToken} <CaretDownSharp class="ml-2" size="12" /></label>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><a on:click={() => (activeToken=TokenName.KOIN)}>KOIN</a></li>
          <li><a on:click={() => (activeToken=TokenName.VHP)}>VHP</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-4">
      <label for="modal-{instanceId}" class="btn btn-outline">Cancel</label>
      <button on:click={_buttonAction} class="btn btn-primary ml-2">{actionName} {activeToken}</button>
    </div>
  </div>
</div>

<style></style>
