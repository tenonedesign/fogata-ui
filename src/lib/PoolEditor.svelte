<script lang="ts">
  import { WarningOutline } from 'svelte-ionicons';
	import { env, pool, user } from '$lib/stores';
	import { Beneficiary, PoolParams } from './types';
  import { CloseOutline } from 'svelte-ionicons';
	import DurationPicker from './DurationPicker.svelte';
  export let poolParams: PoolParams = new PoolParams();
  export let attributes: string[] = ["name", "logo", "description", "payment_period", "beneficiaries"];

  // init
  let contributionBeneficiary: Beneficiary = poolParams.beneficiaries.find(x => x.address == $env.sponsors_address) ?? new Beneficiary($env.sponsors_address, 15000);
  let otherBeneficiaries: Beneficiary[] = poolParams.beneficiaries.filter(x => x.address != $env.sponsors_address);
  if (otherBeneficiaries.length == 1 && otherBeneficiaries[0].address == "") {
    otherBeneficiaries[0].address = $user.address;
  }
  let instanceId = Math.random().toString(36).substring(2);

  const removeBeneficiary = (index: number) => {
    otherBeneficiaries.splice(index, 1);
    otherBeneficiaries = otherBeneficiaries;
  }
  const addBeneficiary = () => {
    otherBeneficiaries.push(new Beneficiary());
    if (otherBeneficiaries.length == 1 && otherBeneficiaries[0].address == "") {
      otherBeneficiaries[0].address = $user.address;
    }
    otherBeneficiaries = otherBeneficiaries;
  }

  function combineBeneficiaries(contribution: Beneficiary, other: Beneficiary[]): Beneficiary[] {
    return [...other, ...[contribution]];
  }
  $: if (attributes.includes("beneficiaries")) { poolParams.beneficiaries = combineBeneficiaries(contributionBeneficiary, otherBeneficiaries); }
  // $: console.log(poolParams);
</script>

  <div class="flex flex-col flex-wrap gap-4">

    {#if attributes.includes("name")}
      <div class="form-control w-full">
        <label for="poolName-{instanceId}" class="label">
          <span class="label-text">Pool name</span>
        </label>
        <input bind:value={poolParams.name} id="poolName-{instanceId}" type="text" placeholder="Name of pool" class="input input-bordered w-full" />
      </div>
    {/if}

    {#if attributes.includes("image")}
      <div class="form-control w-full">
        <label for="poolLogo-{instanceId}" class="label">
          <span class="label-text">Pool logo URL</span>
        </label>
        <input bind:value={poolParams.image} id="poolLogo-{instanceId}" type="text" placeholder="https://example.com/id" class="input input-bordered w-full" />
      </div>
    {/if}

    {#if attributes.includes("description")}
      <div class="form-control w-full">
        <label for="poolDescription-{instanceId}" class="label">
          <span class="label-text">Pool description</span>
        </label>
        <textarea bind:value={poolParams.description} id="poolDescription-{instanceId}" class="textarea textarea-bordered" placeholder="Pool description"></textarea>
      </div>
    {/if}

    {#if attributes.includes("payment_period")}

      <label for="poolDuration-{instanceId}" class="label">
        <span class="label-text">Minimum reburn period</span>
      </label>
      <DurationPicker bind:duration={poolParams.payment_period} />
    {/if}

    {#if attributes.includes("beneficiaries")}
      <div class="form-control w-full">
        <label for="poolBeneficiaries-{instanceId}" class="label">
          <span class="label-text">Pool beneficiaries</span>
        </label>
        <div class=" bg-base-200 rounded-2xl p-4 flex flex-col gap-2">
          {#if otherBeneficiaries.length == 0}
            <span class="text-sm opacity-50 text-center mt-4">No beneficiaries</span>
          {/if}
          {#each otherBeneficiaries as beneficiary, index}
            {#if beneficiary.address != $env.sponsors_address}
              <div class="bg-base-100 rounded-xl p-2 shadow-md relative">
                <button on:click={() => {removeBeneficiary(index)}} class="btn btn-circle btn-ghost absolute right-1 top-1 min-h-0 h-7 w-7 max-w-none"><CloseOutline size="24" /></button>
                <label for="poolContribution-{instanceId}{index}" class="label">
                  <span class="label-text font-medium">Beneficiary {index + 1}</span>
                </label>
                <div class="flex flex-wrap gap-4 items-center">
                  <input bind:value={beneficiary.address} id="poolContribution-{instanceId}{index}" type="text" placeholder="1xyz..." class="input input-bordered max-w-xs" />
                  <div class=" flex-grow">
                    <div class="font-semibold">{beneficiary.percentage / 1000}% of pool profit</div>
                    <input bind:value={beneficiary.percentage} id="poolBeneficiaries-{instanceId}" type="range" min="0" max="100000" class="range range-sm mt-2" step="1000" />
                    <div class="w-full flex justify-between text-xs px-2">
                      <span>|</span> <span>|</span> <span>|</span> <span>|</span>
                      <span>|</span> <span>|</span> <span>|</span> <span>|</span>
                      <span>|</span> <span>|</span> <span>|</span>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          {/each}
          <div class="flex justify-end mt-2">
            <button on:click={addBeneficiary} class="btn btn-ghost h-4 max-h-4">Add beneficiary</button>
          </div>
        </div>
      </div>

      <div>
        <label for="communityBeneficiary-{instanceId}" class="label">
          <div>
            <span class="label-text">Community contribution</span>
            <div class="font-semibold">{contributionBeneficiary.percentage / 1000}% of pool profit</div>
            {#if contributionBeneficiary.percentage == 0}
              <div class="text-xs bg-warning text-warning-content p-3 flex gap-3 rounded-xl items-center mt-1">
                <WarningOutline class="flex-shrink-0" size="24" />
                <div>Pools without a community contribution will be available on Fogata, but are unlikely to be featured.</div>
              </div>
            {/if}
          </div>
        </label>
        <input bind:value={contributionBeneficiary.percentage} id="communityBeneficiary-{instanceId}" type="range" min="0" max="100000" class="range mt-2" step="1000" />
        <div class="w-full flex justify-between text-xs px-2">
          <span>|</span> <span>|</span> <span>|</span> <span>|</span>
          <span>|</span> <span>|</span> <span>|</span> <span>|</span>
          <span>|</span> <span>|</span> <span>|</span>
        </div>
      </div>
    {/if}

  </div>






<style></style>
