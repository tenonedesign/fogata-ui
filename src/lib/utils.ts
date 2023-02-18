
import { Signer, Contract, Provider, Serializer, utils } from "koilib";
import * as kondor from "kondor-js";
import { env, ownedPools, rcLimit, toasts, user, users, approvedPools, submittedPools, poolsOwner } from "$lib/stores";
import { Pool, PoolParams, Toast, User } from "$lib/types";
import { get } from "svelte/store";
import poolAbiJson from "$lib/fogata-abi.json";
import poolsAbiJson from "$lib/pools-abi.json";
import pobAbiJson from "$lib/pob-proto.json";
import sponsorsAbiJson from "$lib/sponsors-proto.json";
import type { Abi, TransactionJson, TransactionJsonWait } from "koilib/lib/interface";

// this starts with a new User object that may have new properties, then fills in properties from the existing stored object
export const updateStoredObjectFormats = () => {
   user.set({...new User(), ...get(user)});
}
export const populateOwnedPools = () => {
  let pools: Pool[] = [];
  get(user).ownedPools.forEach(poolAddress => {
    let p = new Pool(poolAddress);
    p.loadPublicKey();
    pools.push(p);
  });
  ownedPools.set(pools);
}
export const readPoolsOwner = () => {
  poolsRead("get_owner", {}).then(result => {
    poolsOwner.set(result.account);
  });
}
export function userIsPoolsOwner() {
  return (get(user).address === get(poolsOwner));
}
export const loadFogataPools = () => {
  return Promise.all([
    poolsRead("get_approved_pools", {limit: 200}).then(result => {
      let pools: Pool[] = [];
      result?.value?.forEach((pool: {account: string, submission_time: string}) => {
        pools.push(new Pool(pool.account));
      });
      approvedPools.set(pools);
      Promise.resolve();
    }),
    poolsRead("get_submitted_pools", {limit: 200}).then(result => {
      let pools: Pool[] = [];
      result?.value?.forEach((pool: {account: string, submission_time: string}) => {
        pools.push(new Pool(pool.account));
      });
      submittedPools.set(pools);
      Promise.resolve();
    })
  ]);
}

// run by each $page every time the user store changes so our localStorage users stay updated
export const updateUsers = (user: User) => {
  if (user?.address) {
    let u = get(users);
    u[user.address] = user;
    users.set(u);
  }
}

export const poolsRead = async (methodName: string, args = {}): Promise<any> => {
  return contractOperation(get(env).pools_address, koilibAbi(poolsAbiJson), methodName, args).then((result) => {
    return Promise.resolve(result);
  }, (error) => {});
}
export const poolsWrite = async (methodName: string, args: any, description: string) => {
  return contractWriteWithToasts(get(env).pools_address, poolsAbiJson, methodName, args, description);
}

export const pobRead = async (methodName: string, args = {}): Promise<any> => {
  return contractOperation(get(env).pob_address, koilibAbi(pobAbiJson), methodName, args).then((result) => {
    return Promise.resolve(result.value);
  }, (error) => {});
}
export const pobWrite = async (methodName: string, args: any, description: string) => {
  return contractWriteWithToasts(get(env).pob_address, pobAbiJson, methodName, args, description);
}


export const vaporBalanceOf = async (address: string): Promise<bigint> => {
  return sponsorsRead("balance_of", {owner: address}).then((result) => {
    return Promise.resolve((result?.value) ? BigInt(result?.value) : BigInt(0));
  });
}
export const sponsorsRead = async (methodName: string, args = {}): Promise<any> => {
  return contractOperation(get(env).sponsors_address, koilibAbi(sponsorsAbiJson), methodName, args).then((result) => {
    return Promise.resolve(result);
  });
}
export const sponsorsWrite = async (methodName: string, args: any, description: string) => {
  return contractWriteWithToasts(get(env).sponsors_address, sponsorsAbiJson, methodName, args, description);
}


export const poolOperation = async (pool: Pool, methodName: string, koinAmount: bigint, vhpAmount: bigint) => {
  let opName = (methodName.substring(0, 5) == "stake") ? "deposit" : "withdrawal";
  let tokenName = "KOIN";
  if (koinAmount > BigInt(0) && vhpAmount > BigInt(0)) { tokenName = "KOIN and VHP"; }
  if (koinAmount > BigInt(0) && vhpAmount == BigInt(0)) { tokenName = "KOIN"; }
  if (vhpAmount > BigInt(0) && koinAmount == BigInt(0)) { tokenName = "VHP"; }
  return poolWrite(pool.address, methodName, { account: get(user).address, koin_amount: koinAmount.toString(), vhp_amount: vhpAmount.toString() }, tokenName + " " + opName);
}
export const poolRead = async (address: string, methodName: string, args: any) => {
  return contractOperation(address, koilibAbi(poolAbiJson), methodName, args).then((result) => {
    return Promise.resolve(result);
  });
}
export const poolWrite = async (address: string, methodName: string, args: any, description: string) => {
  return contractWriteWithToasts(address, poolAbiJson, methodName, args, description);
}



export const contractWriteWithToasts = async (address: string, abiJson: any, methodName: string, args: any, description: string) => {
  let timeout = 30000;
  return contractOperation(address, koilibAbi(abiJson), methodName, args).then((transaction: TransactionJsonWait) => {
    let toastId = infoToast("Transaction submitted", "The transaction containing your " + description + " is being processed.  This may take some time.", 0).id;
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
    errorToast("Your "+ description + " transaction failed","The transaction will not be processed. "+error, 0);
    Promise.reject(error);
  });
}

export const tokenBalanceOf = async (contractAddress: string, address: string): Promise<bigint> => {
  return contractOperation(contractAddress, utils.tokenAbi, "balanceOf", {owner: address}).then((result) => {
    return Promise.resolve(BigInt(result.value) || BigInt(0));
  });
}
export const tokenTotalSupply = async (contractAddress: string): Promise<bigint> => {
  return contractOperation(contractAddress, utils.tokenAbi, "totalSupply", {}).then((result) => {
    return Promise.resolve(BigInt(result.value) || BigInt(0));
  });
}





export const getAccountRc = (account: string): Promise<string> => {
  const storedUser = get(user);
  const rpc = storedUser.selectedRpcUrl || storedUser.customRpc.url;
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
  const rpc = storedUser.selectedRpcUrl || storedUser.customRpc.url;
  const provider = new Provider([addHttps(rpc)]);
  const signerAddress = storedUser.address;
  const signer = signerAddress ? kondor.getSigner(signerAddress, {
    providerPrepareTransaction: provider,
  }) as Signer : undefined;

  const contract = new Contract({
    id: contractAddress,
    abi: abi,
    provider: provider,
    signer: signer,
  });

  let rcLimitString = "0";
  let nextNonce = "";
  if (abi.methods[methodName]?.read_only === false) {
    const availableRc = await provider.getAccountRc(storedUser.address);
    rcLimitString = Math.min(parseFloat(get(rcLimit)), parseFloat(availableRc)).toString();
    nextNonce = await provider.getNextNonce(storedUser.address);
  }

  // console.log(methodName);
  // console.log(args);
  // console.log(contract.functions);

  try {
    let result;
    result = await contract.functions[methodName](args, { sendTransaction: false, rcLimit: rcLimitString, nonce: nextNonce, chainId: get(env).chain_id }).catch();
    if (result.transaction) {
      result = await provider.sendTransaction(result.transaction!);
      return Promise.resolve(result.transaction);
    }
    else {
      return Promise.resolve(result.result);
    }
  }
  catch (e) {
    Promise.reject(e);
  }
}

export const uploadUserContract = async (contractWasmBase64: string, abi: any): Promise<TransactionJsonWait> => {
  const storedUser = get(user);
  const rpc = storedUser.selectedRpcUrl || storedUser.customRpc.url;
  const provider = new Provider([addHttps(rpc)]);
  if (!storedUser.address) {
    return Promise.reject(new Error("No wallet connected."));
  }
  const signer = kondor.getSigner(storedUser.address, {
    providerPrepareTransaction: provider,
  }) as Signer;
  signer.provider = provider;

  // NOTE:  Setting a testnet provider will not work here maybe because it’s kondor’s signer
  // transaction will still use mainnet.
  // uploadPoolContract works.  maybe because it creates its own signer with the private key
  
  const contract = new Contract({
    id: signer.getAddress(),
    abi: abi,
    provider: provider,
    bytecode: utils.decodeBase64(contractWasmBase64),
    signer: signer
  });


  let rcLimitString = "0";
  let nextNonce = "";
  const availableRc = await provider.getAccountRc(signer.getAddress());
  rcLimitString = Math.min(parseFloat(get(rcLimit)), parseFloat(availableRc)).toString();
  nextNonce = await provider.getNextNonce(signer.getAddress());

  const { receipt, transaction } = await contract.deploy({
    abi: JSON.stringify(abi),
    authorizesTransactionApplication: true,
    nextOperations: [],
    rcLimit: rcLimitString,
    nonce: nextNonce,
    chainId: get(env).chain_id,
  });

  if (transaction) {
    // console.log(transaction);
    return Promise.resolve(transaction);
  }
  return Promise.reject(new Error("Deploy transaction did not succeed"));
  
}

export const uploadPoolContract = async (contractWasmBase64: string, abi: any, poolParams: PoolParams): Promise<TransactionJsonWait> => {
  const storedUser = get(user);
  const rpc = storedUser.selectedRpcUrl || storedUser.customRpc.url;
  const provider = new Provider([addHttps(rpc)]);
  if (!storedUser.address) {
    return Promise.reject(new Error("No wallet connected."));
  }
  const signer = kondor.getSigner(storedUser.address, {
    providerPrepareTransaction: provider,
  });
  signer.provider = provider;

  // New disposable account for contract
  const privateKeyBytes = new Uint8Array(32);
  self.crypto.getRandomValues(privateKeyBytes);
  const contractSigner = new Signer({
    privateKey: utils.toHexString(privateKeyBytes),
    provider: provider
  });

  const contract = new Contract({
    id: contractSigner.address,
    abi: abi,
    provider: provider,
    bytecode: utils.decodeBase64(contractWasmBase64),
    signer: contractSigner,
    options: {
      payer: signer.getAddress(),
      beforeSend: async (tx: TransactionJson, options) => {
        await signer.signTransaction(tx, options?.abis);
      },
    }
  });

  contract.options.onlyOperation = true;
  const { operation: takeOwnership } = await contract.functions.set_owner({ account: signer.getAddress() });
  const { operation: setPoolParams } = await contract.functions.set_pool_params(poolParams);
  const { operation: reburnToInit } = await contract.functions.reburn_and_snapshot({});
  contract.options.onlyOperation = false;

  let rcLimitString = "0";
  let nextNonce = "";
  const availableRc = await provider.getAccountRc(signer.getAddress());
  rcLimitString = Math.min(parseFloat(get(rcLimit)), parseFloat(availableRc)).toString();
  nextNonce = await provider.getNextNonce(signer.getAddress());

  const { receipt, transaction } = await contract.deploy({
    abi: JSON.stringify(abi),
    authorizesCallContract: true,
    authorizesTransactionApplication: true,
    authorizesUploadContract: true,
    nextOperations: [takeOwnership, setPoolParams, reburnToInit],
    rcLimit: rcLimitString,
    nonce: nextNonce,
    chainId: get(env).chain_id,
  });

  if (transaction) {
    // console.log(contractSigner.address);
    // console.log(transaction);
    return Promise.resolve(transaction);
  }
  return Promise.reject(new Error("Deploy transaction did not succeed"));
  
}







export function clone(o: any): any {
  return JSON.parse(JSON.stringify(o));
} 

export function addHttps(url: string): string {
  if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
  }
  return url;
}


export function intervalDisplayFormat(intervalMs: number): string {
  if (intervalMs > 1000 * 60 * 60 * 24) { return (intervalMs / (1000 * 60 * 60 * 24)).toLocaleString([], {maximumFractionDigits: 2}) + " days"; }
  if (intervalMs > 1000 * 60 * 60) { return (intervalMs / (1000 * 60 * 60)).toLocaleString([], {maximumFractionDigits: 2}) + " hours"; }
  if (intervalMs > 1000 * 60) { return (intervalMs / (1000 * 60)).toLocaleString([], {maximumFractionDigits: 2}) + " minutes"; }
  if (intervalMs > 1000) { return (intervalMs / (1000)).toLocaleString([], {maximumFractionDigits: 2}) + " seconds"; }
  return String(intervalMs) + " ms";
}
export function balanceToFloat(balance: bigint): number {
  return parseFloat(utils.formatUnits(balance, 8));
}
export function balanceDisplayFormat(balance: bigint, language: string = "en-US"): string {
  let dec = balanceToFloat(balance);
  if (dec == 0) { return "0"; }
  if (dec <= 0.0001) { return dec.toLocaleString(language, {minimumFractionDigits:8, maximumFractionDigits: 8}); }
  if (dec <= 1) { return dec.toLocaleString(language, {minimumFractionDigits:5, maximumFractionDigits: 5}); }
  if (dec <= 100) { return dec.toLocaleString(language, {minimumFractionDigits:3, maximumFractionDigits: 3}); } // less than 100
  if (dec <= 1000) { return dec.toLocaleString(language, {minimumFractionDigits:2, maximumFractionDigits: 2}); }  // less than 1k
  if (dec <= 1000000) { return dec.toLocaleString(language, {minimumFractionDigits:2, maximumFractionDigits: 2}); } // less than 1M
  return dec.toLocaleString(language, {minimumFractionDigits:0}); // over 1M
}
export function balanceTooltipFormat(balance: bigint, language: string = "en-US"): string {
  let dec = balanceToFloat(balance);
  return dec.toLocaleString(language, {minimumFractionDigits:8});
}




let position = "toast-start";

export function showConnectionToast() {
  if (toastsContainId("connection-message")) { return; }
  let toast = new Toast("warning", "", "Connection attempts recently failed", 0, position);
  toast.id = "connection-message";
  addToast(toast);
  return toast;
}
export function hideConnectionToast() {
  removeToastWithId("connection-message");
}
export function successToast(title: string, message: string, duration: number = 0): Toast {
  let toast = new Toast("success", title, message, duration, position);
  addToast(toast);
  return toast;
}
export function infoToast(title: string, message: string, duration: number = 0): Toast {
  let toast = new Toast("info", title, message, duration, position);
  addToast(toast);
  return toast;
}
export function warningToast(title: string, message: string, duration: number = 0): Toast {
  let toast = new Toast("warning", title, message, duration, position);
  addToast(toast);
  return toast;
}
export function errorToast(title: string, message: string, duration: number = 0): Toast {
  let toast = new Toast("error", title, message, duration, position);
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
