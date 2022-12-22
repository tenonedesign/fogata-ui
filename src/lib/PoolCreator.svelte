<svelte:options accessors={true}/>
<script lang="ts">
	import PoolEditor from '$lib/PoolEditor.svelte';
	import { Pool, PoolParams } from '$lib/types';
	import { contractOperation, errorToast, infoToast, koilibAbi, poolOperation, poolWrite, populateOwnedPools, removeToastWithId, successToast, uploadPoolContract, warningToast } from '$lib/utils';
	import { pool, user } from '$lib/stores';
  export let contractWasmBase64: string;
  export let poolParams = new PoolParams();
  export let mode: string = "create"; // or edit
  export let address = "";

  export const show = (initialParameters?: PoolParams) => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = true;
    if (initialParameters != null) {
      poolParams = initialParameters;
    }
    else {
      poolParams = new PoolParams();
    }
    step = 0;
  }

  let instanceId = Math.random().toString(36).substring(2);
  let poolAddress = "";
  let nodePublicKey = "";
  let step = 0;

  const deployPool = async (): Promise<any> => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = false; // close modal
    let timeout = 30000;
    uploadPoolContract(contractWasmBase64, poolParams).then((transaction) => {
      let toastId = infoToast("Creating pool", "Your pool is being created.  This may take some time.", 0).id;
      transaction.wait("byBlock", timeout).then((blockInfo) => {
        removeToastWithId(toastId);
        let newAddress = transaction.operations?.[0].upload_contract?.contract_id;
        if (newAddress) {
          poolAddress = newAddress;
          if (!$user.ownedPools.includes(newAddress)) {
            $user.ownedPools.push(newAddress);
            $user = $user;
            populateOwnedPools();
          }
        }
        successToast("Transaction is complete","Pool upload completed successfully. View transaction on <a style=\"text-decoration: underline;\" target=\"_blank\" rel=\"noopener\" href=\"https://koinosblocks.com/tx/"+transaction.id+"\">Koinos Blocks</a>.", 10000);
      })
      .catch((error: Error) => {
        removeToastWithId(toastId);
        warningToast("The transaction is taking a while", "The transaction was not included in a block after "+timeout / 1000+" seconds.  It may yet complete, but you will not be further notified.")
      });
    })
    .catch((error: Error) => {
      errorToast("Pool creation failed", "There was an error creating the pool. "+error)
    });
  }

  const updatePool = async (): Promise<any> => {
    (document.getElementById("modal-"+instanceId) as HTMLInputElement).checked = false; // close modal
    poolWrite(address, "set_pool_params", poolParams, "pool update");
  }

  const linkPool = async (): Promise<any> => {
    step++;
  }



  $: stepOneComplete = poolParams.name != "" && poolParams.image != "" && poolParams.description != "" && poolParams.payment_period > 0;
  $: stepTwoComplete = poolParams.beneficiaries.length > 0 && poolParams.beneficiaries[0].address != "";
  $: stepThreeComplete = true;
  $: stepFourComplete = poolAddress != "" && nodePublicKey != "";
</script>


<!-- Put this part before </body> tag -->
<input type="checkbox" id="modal-{instanceId}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative flex flex-col gap-4">
    <label for="modal-{instanceId}" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <ul class="steps">
      <li class="step" class:step-primary="{step >= 0}">Basic info</li>
      <li class="step" class:step-primary="{step >= 1}">Beneficiaries</li>
      {#if mode == "create"}
        <li class="step" class:step-primary="{step >= 2}">Upload</li>
      {:else}
        <li class="step" class:step-primary="{step >= 2}">Save</li>
      {/if}
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
        {#if mode == "create"}
          <div class="font-semibold mt-8">Your pool is ready to upload</div>
          <div class="mt-4">Uploading will create your mining pool smart contract on the Koinos chain.  This operation will consume mana.</div>
        {:else}
          <div class="font-semibold mt-8">Your pool is ready to save</div>
          <div class="mt-4">Saving will update your mining pool parameters.  This operation will consume mana.</div>
        {/if}
        <div class="flex justify-between mt-4">
          <button on:click={() => {step--}} class="btn btn-outline mt-4 min-w-[112px]">Previous</button>
          {#if mode == "create"}
            <button on:click={deployPool} disabled={!stepThreeComplete} class="btn btn-primary mt-4 min-w-[112px]">Upload Pool</button>
          {:else}
            <button on:click={updatePool} disabled={!stepThreeComplete} class="btn btn-primary mt-4 min-w-[112px]">Save Pool</button>
          {/if}
        </div>
      </div>
    {/if}
    {#if step==3}
      <div>
        <div class="form-control w-full">
          <label for="poolAddress-{instanceId}" class="label">
            <span class="label-text">Your pool</span>
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
