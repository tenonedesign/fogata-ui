
import { Signer, Contract, Provider, Serializer, utils } from "koilib";
import * as kondor from "kondor-js";
import { env, rcLimit, toasts, user } from "$lib/stores";
import { Pool, Toast } from "$lib/types";
import { get } from "svelte/store";
import poolAbiJson from "$lib/pool-proto.json";
import burnKoinPoolAbiJson from "$lib/burnkoin_pool_abi_js.json";
import pobAbiJson from "$lib/pob-proto.json";
import type { Abi, TransactionJsonWait } from "koilib/lib/interface";




export const pobRead = async (methodName: string): Promise<any> => {
  return contractOperation(get(env).pob_address, koilibAbi(pobAbiJson), methodName, {}).then((result) => {
    return Promise.resolve(result.value);
  },
  (error) => {
    errorToast("", "Something went wrong reading a reading proof of burn params. "+error, 5000);
    Promise.reject(error);
  });
}


export const poolOperation = async (pool: Pool, methodName: string, koinAmount: bigint, vhpAmount: bigint) => {
  let opName = (methodName.substring(0, 5) == "stake") ? "deposit" : "withdrawal";
  let tokenName = "KOIN";
  if (koinAmount > 0n && vhpAmount > 0n) { tokenName = "KOIN and VHP"; }
  if (koinAmount > 0n && vhpAmount == 0n) { tokenName = "KOIN"; }
  if (vhpAmount > 0n && koinAmount == 0n) { tokenName = "VHP"; }
  let timeout = 30000;
  return contractOperation(pool.address, koilibAbi(poolAbiJson), methodName, { account: get(user).address, koin_amount: koinAmount.toString(), vhp_amount: vhpAmount.toString() }).then((transaction: TransactionJsonWait) => {
    let toastId = infoToast(tokenName + " " + opName + " submitted", "The transaction containing your " + tokenName + " " + opName + " is being processed.  This may take some time.", 0).id;
    transaction.wait("byBlock", timeout).then((blockInfo) => {
      removeToastWithId(toastId);
      successToast("Transaction is complete","This transaction was completed successfully. View transaction on <a style=\"text-decoration: underline;\" target=\"_blank\" rel=\"noopener\" href=\"https://koinosblocks.com/tx/"+transaction.id+"\">Koinos Blocks</a>.", 10000);
    })
    .catch((error) => {
      removeToastWithId(toastId);
      warningToast("The transaction is taking a while", "The transaction was not included in a block after "+timeout / 1000+" seconds.  It may yet complete, but you will not be further notified.")
    });
    return Promise.resolve(transaction);
  })
  .catch((error) => {
    errorToast(tokenName + " " + opName + " transaction failed","The transaction will not be processed. "+error, 0);
    Promise.reject(error);
  });
}

export const poolRead = async (pool: Pool, methodName: string, args: any) => {
  return contractOperation(pool.address, koilibAbi(poolAbiJson), methodName, args).then((result) => {
    return Promise.resolve(result);
  });
}

export const tokenBalanceOf = async (contractAddress: string, address: string): Promise<bigint> => {
  return contractOperation(contractAddress, utils.tokenAbi, "balanceOf", {owner: address}).then((result) => {
    return Promise.resolve(BigInt(result.value) || 0n);
  });
}
export const tokenTotalSupply = async (contractAddress: string): Promise<bigint> => {
  return contractOperation(contractAddress, utils.tokenAbi, "totalSupply", {}).then((result) => {
    return Promise.resolve(BigInt(result.value) || 0n);
  });
}





export const getAccountRc = (account: string): Promise<string> => {
  const storedUser = get(user);
  const rpc = storedUser.selectedRpc || storedUser.customRpc;
  const provider = new Provider([addHttps(rpc)]);
  return provider.getAccountRc(account);
}

// How to generate types:
// clone koilib
// clone fogata, or whatever project the .proto files are in
// modify koilib/generateJsonKoinosProto.js to reference proto file(s) (as *.proto if there > 1) and output location
// node generateJsonKoinosProto.js
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

  let availableRc = await provider.getAccountRc(storedUser.address);
  let rcLimitString = Math.min(parseFloat(get(rcLimit)), parseFloat(availableRc)).toString();

  // console.log(methodName);
  // console.log(args);
  // console.log(contract.functions);

  let result;
  result = await contract.functions[methodName](args, { sendTransaction: false, rcLimit: rcLimitString, chainId: get(env).chain_id });
  if (result.transaction) {
    result = await provider.sendTransaction(result.transaction!);
    return Promise.resolve(result.transaction);
  }
  else {
    return Promise.resolve(result.result);
  }
}











export function addHttps(url: string): string {
  if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
  }
  return url;
}

export function balanceToFloat(balance: bigint): number {
  return parseFloat(utils.formatUnits(balance, 8));
}
export function balanceDisplayFormat(balance: bigint, language: string = "en-US"): string {
  let dec = balanceToFloat(balance);
  if (balance == 0n) { return "0"; }
  if (balance <= 10000n) { return dec.toLocaleString(language, {minimumFractionDigits:8}); }
  if (balance <= 100000000n) { return dec.toLocaleString(language, {minimumFractionDigits:5}); }
  if (balance <= 10000000000n) { return dec.toLocaleString(language, {minimumFractionDigits:3}); } // less than 100
  if (balance <= 100000000000n) { return dec.toLocaleString(language, {minimumFractionDigits:2}); }  // less than 1k
  if (balance <= 100000000000000n) { return dec.toLocaleString(language, {minimumFractionDigits:2}); } // less than 1M
  return dec.toLocaleString(language, {minimumFractionDigits:0}); // over 1M
}
export function balanceTooltipFormat(balance: bigint, language: string = "en-US"): string {
  let dec = balanceToFloat(balance);
  return dec.toLocaleString(language, {minimumFractionDigits:8});
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



























	// block simulator to verify assumptions on inflation and apy calculations
	// 0% take -> 1.9999360139121
	// 5% take each block -> 1.89899585612153 (1.899%)
	// 5% take at the end -> 1.89993921322 (1.900%)
	// function runBlockSimulation(count: number): number {
	// 	let take = 0;
	// 	let takeAmount = 0.0;
	// 	let supply = 100000000;
	// 	let percent = 0.019802;	// produces 1.9999360139121% inflation (simulated output of pob contract minting with this value)
	// 	// let percent = .019802625;	// closer to producing exactly 2%
	// 	for (let i = 0; i < count; i++) {
	// 		let newSupply = block(supply, percent);
	// 		let reward = newSupply - supply;
	// 		let thisTake = reward * takeAmount;
	// 		supply = newSupply - thisTake;
	// 		take += thisTake;
	// 		// supply = block(supply, percent);
	// 	}
	// 	console.log("take: "+take);
	// 	return supply;
	// }
	// function block(supply: number, percent: number): number {
	// 	let yearlyInflationTokens = supply * percent;
	// 	let blocksPerYear = 31536000000 / 3000;
	// 	let blockReward = yearlyInflationTokens / blocksPerYear;
	// 	return supply + blockReward;
	// }
	// runBlockSimulation(10512000);



// export const burnKoinPoolOperation = async (pool: Pool, methodName: string, token: string, amount: number) => {
//   let opType = (methodName.substring(0, 5) == "depos") ? "deposit" : "withdrawal";
//   let timeout = 30000;
//   return contractOperation(pool.address, koilibAbi(burnKoinPoolAbiJson), methodName, { account: get(user).address, value: amount }).then((transaction: TransactionJsonWait) => {
//     let toastId = infoToast(token + " " + opType + " submitted", "The transaction containing your " + token + " " + opType + " is being processed.  This may take some time.", 0).id;
//     transaction.wait("byBlock", timeout).then((blockInfo) => {
//       removeToastWithId(toastId);
//       successToast("Transaction is complete","This transaction was completed successfully. View transaction on <a style=\"text-decoration: underline;\" target=\"_blank\" rel=\"noopener\" href=\"https://koinosblocks.com/tx/"+transaction.id+"\">Koinos Blocks</a>.", 6000);
//     })
//     .catch((error) => {
//       removeToastWithId(toastId);
//       warningToast("The transaction is taking a while", "The transaction was not included in a block after "+timeout / 1000+" seconds.  It may yet complete, but you will not be further notified.")
//     });
//     return Promise.resolve(transaction);
//   })
//   .catch((error) => {
//     errorToast(token + " " + opType + " transaction failed","The transaction will not be processed. "+error, 5000);
//     Promise.reject(error);
//   });
// }
