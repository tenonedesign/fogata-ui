<svelte:options accessors={true}/>
<script lang="ts">
	import { clone } from "./utils";


  export let title: string = "";
  export let message: string = "";
  export let schemas: {key: string, placeholder?: string, label?: string, pattern?: string, default?: string}[] = [];
  export let value: any = {};
  export let positiveActionName: string = "Done";
  export let negativeActionName: string = "Cancel";
  export let showNegativeAction: boolean = true;
  export let buttonAction: (value: any) => void = () => {};
  export const show = (initialValue: any = null) => {
    if (initialValue == null) {
      schemas.forEach(schema => {
        value[schema.key] = schema.default ?? "";
      });
    }
    else {
      value = initialValue;
    }
    modalCheckbox.checked = true;
  }


  let modalCheckbox: any;
  let instanceId = Math.random().toString(36).substring(2);

  const _buttonAction = () => {
    modalCheckbox.checked = false;
    buttonAction(clone(value));
  }
</script>


<!-- Put this part before </body> tag -->
<input bind:this={modalCheckbox} type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative overflow-visible">
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">{title}</h3>
    <p class="pt-4 whitespace-pre-wrap">{message}</p>
    {#each schemas as schema}
    <div class="mt-2 form-control w-full">
      <label class="label"><span class="label-text">{schema.label}</span></label>
      <div class="flex items-center">
        <input bind:value={value[schema.key]} type="text" pattern="{schema.pattern || '.*'}" placeholder="{schema.placeholder}" class="input input-bordered input-primary min-w-[150px] flex-1 invalid:bg-red-100" />
      </div>
    </div>
    {/each}


    <div class="mt-6 flex gap-2">
      {#if showNegativeAction}
        <label for="modal-{instanceId}" class="btn btn-outline">{negativeActionName}</label>
      {/if}
      <button on:click={_buttonAction} class="btn btn-primary">{positiveActionName}</button>
    </div>
  </div>
</div>

<style></style>
