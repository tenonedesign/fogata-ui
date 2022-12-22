<svelte:options accessors={true}/>
<script lang="ts">

  export let title: string = "";
  export let message: string = "";
  export let label: string = "";
  export let required: boolean = false;
  export let options: {name: string, value: string}[] = [];
  export let value: string = "";
  export let positiveActionName: string = "Select";
  export let negativeActionName: string = "Cancel";
  export let buttonAction: (value: any) => void = () => {}
  export const show = (initialValue: any = null) => {
    if (initialValue != null) {
      value = initialValue;
    }
    modalCheckbox.checked = true;
  };

  let modalCheckbox: any;
  let instanceId = Math.random().toString(36).substring(2);

  const _buttonAction = () => {
    modalCheckbox.checked = false;
    buttonAction(value);
  }

</script>


<!-- Put this part before </body> tag -->
<input bind:this={modalCheckbox} type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative overflow-visible">
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">{title}</h3>
    <p class="pt-4">{message}</p>

    <select bind:value={value} class="select select-bordered w-full mt-6">
      <option disabled selected value="">{label}</option>
      {#each options as option}
        <option value="{option.value}">{option.name}</option>
      {/each}
    </select>

    <div class="mt-6">
      <label for="modal-{instanceId}" class="btn btn-outline">{negativeActionName}</label>
      <button on:click={_buttonAction} disabled="{required && value===''}" class="btn btn-primary ml-2">{positiveActionName}</button>
    </div>
  </div>
</div>

<style></style>
