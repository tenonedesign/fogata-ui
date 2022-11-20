
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
        result = await contract.functions[functionName]({ account: address, value: amount });
    } catch (error) {
      console.log(error);
      // Error: {"error":"'from' has insufficient balance","code":1,"logs":["transaction reverted: 'from' has insufficient balance"]} at listener (Messenger.ts:232:18)
      warnToast("Deposit cancelled","The transaction will not proceed.", 5000);
      return;
    }
    
    let toastId = infoToast(token + " deposit submitted","The transaction containing your " + token + " deposit is being processed.  This may take some time.", 10000);

    await result?.transaction?.wait();

    removeToastWithId(toastId);
    successToast("Deposit is complete","This transaction was completed successfully.", 5000);
  }

  // 218920861240335 / (217986782775523 + 1286218972329)
  // 218920861240335 / 219273001747852
  // 0.99839405 4422067
  // value * pvhp/total_assets
  // (value * pvhp_total_supply) / (pool_koin_balance + pool_pvhp_balance)
  // ((parseInt(utils.parseUnits(amount, 8)) * parseInt(pvhpTotalSupply.data || "0")) /
  //               (parseInt(poolBalances.koin?.data) + parseInt(poolBalances.vhp?.data)) ).toString()


  export const withdrawToken = async (token: string, amount: number, pool: Pool, rpc: string) => {
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
      // console.log("account: "+address+", value: "+amount);
      if (token == "KOIN") {
        result = await contract.functions.withdraw_koin({ account: address, value: amount });
      }
      if (token == "VHP") {
        result = await contract.functions.deposit_vhp({ account: address, value: amount });
      }
    } catch (error) {
      warnToast("Deposit cancelled","The transaction will not proceed.", 5000);
      return;
    }
    
    let toastId = infoToast(token + " deposit submitted","The transaction containing your " + token + " deposit is being processed.  This may take some time.", 10000);

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
  if (num <= 10000) { return parseFloat(dec.toFixed(8)).toLocaleString(language); }
  if (num <= 100000000) { return parseFloat(dec.toFixed(5)).toLocaleString(language); }
  if (num <= 10000000000) { return parseFloat(dec.toFixed(3)).toLocaleString(language); }
  if (num <= 100000000000) { return parseFloat(dec.toFixed(2)).toLocaleString(language); }  // less than 1k
  if (num <= 100000000000000) { return parseFloat(dec.toFixed(2)).toLocaleString(language); } // less than 1M
  return parseFloat(dec.toFixed(0)).toLocaleString(language); // over 1M
}
export function balanceTooltipFormat(balance: number, language: string = "en-US"): string {
  return (balance / 100000000).toLocaleString(language, {minimumFractionDigits:8});
}




  let position = "toast-start";

  export function successToast(title: string, message: string, duration: number = 0) {
    let toast = new Toast("alert-success", title, message, duration, position);
    addToast(toast);
    return toast.id;
  }
  export function infoToast(title: string, message: string, duration: number = 0) {
    let toast = new Toast("alert-info", title, message, duration, position);
    addToast(toast);
    return toast.id;
  }
  export function warnToast(title: string, message: string, duration: number = 0) {
    let toast = new Toast("alert-warning", title, message, duration, position);
    addToast(toast);
    return toast.id;
  }
  export function errorToast(title: string, message: string, duration: number = 0) {
    let toast = new Toast("alert-error", title, message, duration, position);
    addToast(toast);
    return toast.id;
  }
  export function addToast(toast: Toast) {
    let currentToasts = get(toasts);
    currentToasts.push(toast);
    toasts.set(currentToasts);
    if (toast.duration > 0) {
      setTimeout(() => { removeToastWithId(toast.id); }, toast.duration);
    }
  }
  export function removeToastWithId(id: string) {
    let currentToasts = get(toasts);
    toasts.set(currentToasts.filter(object => {
      return object.id !== id;
    }));
  }
