
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import * as kondor from "kondor-js";
  import { toasts } from "$lib/stores";
  import { rpcs, user } from '$lib/stores'
  import { Pool, Toast } from "$lib/types";
  import { get } from "svelte/store";
  import poolAbiJson from "$lib/burnkoin_pool_abi_js.json";
  import type { Abi } from "koilib/lib/interface";


  export const poolOperation = async (functionName: string, token: string, amount: number, pool: Pool, rpc: string) => {
    const address = get(user).address;
    const provider = new Provider([addHttps(rpc)]);
    const signerAddress = get(user).address;
		const signer = signerAddress ? kondor.getSigner(signerAddress) as Signer : undefined;

    const poolAbi: Abi = {
      koilib_types: poolAbiJson.types,
      ...poolAbiJson
    };

		const contract = new Contract({
			id: pool.address,
			abi: poolAbi,
			provider: provider,
			signer: signer,
		});

    let result;
    try {
        console.log("function: "+functionName+", account: "+address+", value: "+amount);
        result = await contract.functions[functionName]({ account: address, value: amount }, {
          sendTransaction: false,
        });
        result = await provider.sendTransaction(result.transaction!);
    } catch (error) {
      console.log(error);
      // Error: {"error":"'from' has insufficient balance","code":1,"logs":["transaction reverted: 'from' has insufficient balance"]} at listener (Messenger.ts:232:18)
      errorToast("Deposit failed","The transaction will not be proceed.", 5000);
      return;
    }
    
    let toastId = infoToast(token + " deposit submitted","The transaction containing your " + token + " deposit is being processed.  This may take some time.", 10000).id;

    await result?.transaction?.wait();

    removeToastWithId(toastId);
    successToast("Deposit is complete","This transaction was completed successfully.", 5000);
  }


	export const tokenBalance = async (contractId: string, address: string, rpc: string): Promise<number> => {
		const provider = new Provider([addHttps(rpc)]);
		const signer = address ? kondor.getSigner(address) as Signer : undefined;

		const contract = new Contract({
			id: contractId,
			abi: utils.tokenAbi,
			provider: provider,
			signer: signer,
		});
    const { result } = await contract.functions.balanceOf({ owner: address });
    return Promise.resolve(result?.value as number || 0);
	}

  export function addHttps(url: string): string {
    if (url && !/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
  }

export function balanceDisplayFormat(balance: number, language: string = "en-US"): string {
  let num = balance;
  let dec = (num / 100000000);
  if (num == 0) { return "0"; }
  if (num <= 10000) { return dec.toLocaleString(language, {minimumFractionDigits:8}); }
  if (num <= 100000000) { return dec.toLocaleString(language, {minimumFractionDigits:5}); }
  if (num <= 10000000000) { return dec.toLocaleString(language, {minimumFractionDigits:3}); } // less than 100
  if (num <= 100000000000) { return dec.toLocaleString(language, {minimumFractionDigits:2}); }  // less than 1k
  if (num <= 100000000000000) { return dec.toLocaleString(language, {minimumFractionDigits:2}); } // less than 1M
  return dec.toLocaleString(language, {minimumFractionDigits:0}); // over 1M
}
export function balanceTooltipFormat(balance: number, language: string = "en-US"): string {
  return (balance / 100000000).toLocaleString(language, {minimumFractionDigits:8});
}




  let position = "toast-start";


  export function showConnectionToast() {
    if (toastsContainId("connection-message")) { return; }
    let toast = new Toast("alert-warning", "", "Connection attempts recently failed", 0, position);
    toast.id = "connection-message";
    addToast(toast);
    return toast;
  }
  export function hideConnectionToast() {
    removeToastWithId("connection-message");
  }
  export function successToast(title: string, message: string, duration: number = 0): Toast {
    let toast = new Toast("alert-success", title, message, duration, position);
    addToast(toast);
    return toast;
  }
  export function infoToast(title: string, message: string, duration: number = 0): Toast {
    let toast = new Toast("alert-info", title, message, duration, position);
    addToast(toast);
    return toast;
  }
  export function warnToast(title: string, message: string, duration: number = 0): Toast {
    let toast = new Toast("alert-warning", title, message, duration, position);
    addToast(toast);
    return toast;
  }
  export function errorToast(title: string, message: string, duration: number = 0): Toast {
    let toast = new Toast("alert-error", title, message, duration, position);
    addToast(toast);
    return toast;
  }
  export function addToast(toast: Toast) {
    let currentToasts = get(toasts);
    currentToasts.push(toast);
    toasts.set(currentToasts);
    if (toast.duration > 0) {
      setTimeout(() => { removeToastWithId(toast.id); }, toast.duration);
    }
  }
  export function toastsContainId(id: string) {
    let currentToasts = get(toasts);
    return currentToasts.some(e => e.id === id);
  }
  export function removeToastWithId(id: string) {
    let currentToasts = get(toasts);
    toasts.set(currentToasts.filter(object => {
      return object.id !== id;
    }));
  }
