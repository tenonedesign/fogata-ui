
import { Signer, Contract, Provider, Serializer, utils } from "koilib";
import * as kondor from "kondor-js";
import { toasts, user } from "$lib/stores";
import { Pool, Toast } from "$lib/types";
import { get } from "svelte/store";
import poolAbiJson from "$lib/burnkoin_pool_abi_js.json";
import pobAbiJson from "$lib/pob-proto.json";
import type { Abi, TransactionJsonWait } from "koilib/lib/interface";




export const pobRead = async (methodName: string): Promise<any> => {
  return contractOperation("159myq5YUhhoVWu3wsHKHiJYKPKGUrGiyv", koilibAbi(pobAbiJson), methodName, {}).then((value) => {
    return Promise.resolve(value);
  },
  (error) => {
    errorToast("", "Something went wrong reading a reading proof of burn params. "+error, 5000);
    Promise.reject(error);
  });
}

export const poolOperation = async (pool: Pool, methodName: string, token: string, amount: number) => {
  let opType = (methodName.substring(0, 5) == "depos") ? "deposit" : "withdrawal";
  let timeout = 30000;
  return contractOperation(pool.address, koilibAbi(poolAbiJson), methodName, { account: get(user).address, value: amount }).then((transaction: TransactionJsonWait) => {
    let toastId = infoToast(token + " " + opType + " submitted", "The transaction containing your " + token + " " + opType + " is being processed.  This may take some time.", 0).id;
    transaction.wait("byBlock", timeout).then((blockInfo) => {
      removeToastWithId(toastId);
      successToast("Transaction is complete","This transaction was completed successfully. View transaction on <a style=\"text-decoration: underline;\" target=\"_blank\" rel=\"noopener\" href=\"https://koinosblocks.com/tx/"+transaction.id+"\">Koinos Blocks</a>.", 6000);
    })
    .catch((error) => {
      removeToastWithId(toastId);
      warningToast("The transaction is taking a while", "The transaction was not included in a block after "+timeout / 1000+" seconds.  It may yet complete, but you will not be further notified.")
    });
    return Promise.resolve(transaction);
  })
  .catch((error) => {
    errorToast(token + " " + opType + " transaction failed","The transaction will not be processed. "+error, 5000);
    Promise.reject(error);
  });
}


export const tokenBalanceOf = async (contractAddress: string, address: string): Promise<number> => {
  return contractOperation(contractAddress, utils.tokenAbi, "balanceOf", {owner: address}).then((value) => {
    return Promise.resolve(parseInt(value) || 0);
  });
}
export const tokenTotalSupply = async (contractAddress: string): Promise<number> => {
  return contractOperation(contractAddress, utils.tokenAbi, "totalSupply", {}).then((value) => {
    return Promise.resolve(parseInt(value) || 0);
  });
}


export const koilibAbi = (abiJson: {methods: any, types: any}): Abi => {
  return {
    koilib_types: abiJson.types,
    ...abiJson
  }
}
export const contractOperation = async (contractAddress: string, abi: any, methodName: string, args: any): Promise<any> => {
  const storedUser = get(user);
  const rpc = storedUser.selectedRpc || storedUser.customRpc;
  const provider = new Provider([addHttps(rpc)]);
  const signerAddress = storedUser.address;
  const signer = signerAddress ? kondor.getSigner(signerAddress) as Signer : undefined;

  const contract = new Contract({
    id: contractAddress,
    abi: abi,
    provider: provider,
    signer: signer,
  });

  let result;
  result = await contract.functions[methodName](args, { sendTransaction: false });
  if (result.transaction) {
    result = await provider.sendTransaction(result.transaction!);
    return Promise.resolve(result.transaction);
  }
  else {
    return Promise.resolve(result.result?.value);
  }
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
export function warningToast(title: string, message: string, duration: number = 0): Toast {
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
