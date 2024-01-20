<script lang="ts">

	import Header from '$lib/Header.svelte';
	import Card from '$lib/Card.svelte';
	import vaporLogo from '$lib/images/vapor-icon.svg?raw';
	import { approvedPools, connectedAddress, env, ownedPools, submittedPools, user } from '$lib/stores.js';
	import { onDestroy, onMount } from 'svelte';
	import PoolCreator from '$lib/PoolCreator.svelte';
	import { pobWrite, populateOwnedPools, updateStoredObjectFormats, updateUsers, loadFogataPools, poolsWrite, readPoolsOwner, userIsPoolsOwner, intervalDisplayFormat, balanceTooltipFormat, uploadPoolContract, uploadUserContract, infoToast, removeToastWithId, successToast, warningToast, errorToast } from '$lib/utils';
	import PoolListElement from '$lib/PoolListElement.svelte';
	import type { KoinosNode } from '$lib/types';
	import NodeElement from '$lib/NodeElement.svelte';
	import InputsModal from '$lib/InputsModal.svelte';
	import SelectModal from '$lib/SelectModal.svelte';
	import Faqs from '$lib/Faqs.svelte';
	import ReservedKoinEditor from '$lib/ReservedKoinEditor.svelte';
	import { utils } from 'koilib';

	let timer: NodeJS.Timer;
  let files: any;
  let contractDataBase64: string;
  let abiJson: any;
  let uploadEnabled = false;

	onMount(async () => {
		load();
		timer = setInterval(() => {
			load();
		}, 30000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {

	}

  const deployContract = async (): Promise<any> => {
    let timeout = 30000;

    uploadUserContract(contractDataBase64, abiJson).then((transaction) => {
      let toastId = infoToast("Uploading contract", "Your contract is being created.  This may take some time.", 0).id;
      transaction.wait("byBlock", timeout).then((blockInfo) => {
        removeToastWithId(toastId);
        successToast("Transaction is complete","Contract upload completed successfully. View transaction on <a style=\"text-decoration: underline;\" target=\"_blank\" rel=\"noopener\" href=\"https://koinosblocks.com/tx/"+transaction.id+"\">Koinos Blocks</a>.", 10000);
      })
      .catch((error: Error) => {
        removeToastWithId(toastId);
        warningToast("The transaction is taking a while", "The transaction was not included in a block after "+timeout / 1000+" seconds.  It may yet complete, but you will not be further notified.")
      });
    })
    .catch((error: Error) => {
      errorToast("Contract creation failed", "There was an error creating the contract. "+error)
    });
  }

  $: console.log(files);
  $: uploadEnabled = (contractDataBase64?.length > 0) && (abiJson?.methods);
 
  $: {
    if (files && files[0]) {
      Array.from(files).forEach((binfile: any) => {
        let reader = new FileReader();
        let extension = binfile.name.split(".").pop();
        console.log(extension);
        reader.onload = function(evt) {
          if (extension == "wasm") {
            contractDataBase64 = utils.encodeBase64(new Uint8Array(evt?.target?.result as ArrayBuffer));
          }
          if (extension == "json") {
            var dec = new TextDecoder("utf-8");
            abiJson = JSON.parse(dec.decode(evt?.target?.result as ArrayBuffer));
          }
        }
        reader.readAsArrayBuffer(binfile);
      });

    }
  }
</script>

<svelte:head>
	<title>Fogata</title>
	<meta name="description" content="Koinos mining pools" />
</svelte:head>

<!-- clip prevents tooltips from messing up page scaling -->
<div class="px-4 overflow-clip">

  <Header pool={null} />

  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pt-20">

    <Card>
      <div class="text-lg">Upload contract to signed-in address</div>
      <div class="form-control w-full max-w-xs mt-8">
        <label class="label">
          <span class="label-text">Select wasm and json abi files</span>
        </label>
        <input type="file" multiple class="file-input file-input-bordered w-full max-w-xs" bind:files />
      </div>
      <div class="mt-8">
        <div><span class="text-sm font-bold">Contract wasm: </span><span>{contractDataBase64?.length ? "loaded" : "not loaded"}</span></div>
        <div><span class="text-sm font-bold">Abi json: </span><span>{abiJson?.methods ? "loaded": "not loaded"}</span></div>
      </div>
      
      <button class="btn max-w-xs mt-16 mb-4" disabled={!uploadEnabled} on:click={deployContract}>Upload now</button>
    </Card>
  </section>


</div>

<style>
</style>
