<script lang="ts">
	import PoolEditor from '$lib/PoolEditor.svelte';
	import { PoolParams } from '$lib/types';
	import { errorToast, infoToast, removeToastWithId, uploadPoolContract } from '$lib/utils';
  export let title: string = "Pool designer";
  export let contractWasmBase64: string;

  const deployPool = async (): Promise<any> => {
    let toastId = infoToast("Creating pool", "Your pool is being created.  This may take some time.", 0).id;
    uploadPoolContract(contractWasmBase64, poolParams).then(() => {
      removeToastWithId(toastId);
      step++;
    })
    .catch((error) => {
      removeToastWithId(toastId);
      errorToast("Pool creation failed", "There was an error creating the pool. "+error)
    });
  }
  const linkPool = async (): Promise<any> => {
    step++;
  }
  let poolParams = new PoolParams();
  let instanceId = Math.random().toString(36).substring(2);

  let poolPrivateKey = "";
  let poolAddress = "";
  let nodePublicKey = "";
  let step = 0;


  $: stepOneComplete = poolParams.name != "" && poolParams.image != "" && poolParams.description != "" && poolParams.payment_period > 0;
  $: stepTwoComplete = poolParams.beneficiaries.length > 1 && poolParams.beneficiaries[0].address != "";
  $: stepThreeComplete = poolPrivateKey != "";
  $: stepFourComplete = poolAddress != "" && nodePublicKey != "";
</script>



<label for="modal-{instanceId}" class="btn btn-secondary">
  <slot></slot>
</label>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative flex flex-col gap-4">
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <ul class="steps">
      <li class="step" class:step-primary="{step >= 0}">Basic info</li>
      <li class="step" class:step-primary="{step >= 1}">Beneficiaries</li>
      <li class="step" class:step-primary="{step >= 2}">Upload</li>
      <li class="step" class:step-primary="{step >= 3}">Link to node</li>
    </ul>

    {#if step==0}
      <div>
        <PoolEditor bind:poolParams={poolParams} attributes={["name", "image", "description", "payment_period"]} />
        <div class="flex justify-between mt-4">
          <button on:click={() => {step--}} disabled class="btn btn-outline min-w-[112px] opacity-0">Previous</button>
          <button on:click={() => {step++}} disabled={!stepOneComplete} class="btn btn-primary min-w-[112px]">Next</button>
        </div>
      </div>
    {/if}
    {#if step==1}
      <div>
        <PoolEditor bind:poolParams={poolParams} attributes={["beneficiaries"]} />
        <div class="flex justify-between mt-4">
          <button on:click={() => {step--}} class="btn btn-outline min-w-[112px]">Previous</button>
          <button on:click={() => {step++}} disabled={!stepTwoComplete} class="btn btn-primary min-w-[112px]">Next</button>
        </div>
      </div>
    {/if}
    {#if step==2}
      <div>
        <div class="form-control w-full">
          <label for="poolPrivateKey-{instanceId}" class="label">
            <span class="label-text">Private key of new pool to be created (until we can get the pk from Kondor?)</span>
          </label>
          <input bind:value={poolPrivateKey} id="poolPrivateKey-{instanceId}" type="text" placeholder="5agks..." class="input input-bordered w-full" />
        </div>
        <div class="flex justify-between mt-4">
          <button on:click={() => {step--}} class="btn btn-outline mt-4 min-w-[112px]">Previous</button>
          <button on:click={deployPool} disabled={!stepThreeComplete} class="btn btn-primary mt-4 min-w-[112px]">Upload Pool</button>
        </div>
      </div>
    {/if}
    {#if step==3}
      <div>
        <div class="form-control w-full">
          <label for="poolAddress-{instanceId}" class="label">
            <span class="label-text">Address of pool</span>
          </label>
          <input bind:value={poolAddress} id="poolAddress-{instanceId}" type="text" placeholder="aagks..." class="input input-bordered w-full" />
        </div>
        <div class="form-control w-full">
          <label for="nodePublicKey-{instanceId}" class="label">
            <span class="label-text">Public key of node block producer</span>
          </label>
          <input bind:value={nodePublicKey} id="nodePublicKey-{instanceId}" type="text" placeholder="aagks..." class="input input-bordered w-full" />
        </div>
        <div class="flex justify-between mt-4">
          <button on:click={() => {step--}} class="btn btn-outline mt-4 min-w-[112px]">Previous</button>
          <button on:click={linkPool} disabled={!stepFourComplete} class="btn btn-primary mt-4 min-w-[112px]">Link Node and Pool</button>
        </div>
      </div>
    {/if}
    {#if step==4}
      <div>
        Complete!
      </div>
      <div class="flex justify-between mt-4">
        <button on:click={() => {step--}} class="btn btn-outline mt-4 min-w-[112px]">Previous</button>
        <label for="modal-{instanceId}" class="btn btn-primary mt-4 min-w-[112px]">Done</label>
      </div>
    {/if}
  </div>
</div>


<style></style>
