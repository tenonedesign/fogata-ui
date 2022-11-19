
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import * as kondor from "kondor-js";

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

// export async function tokenBalance (contractId: string, address: string): Promise<number> {

//   console.log(selectedRpc);
//   // console.log(addHttps($selectedRpc));
//   const provider = new Provider([addHttps(selectedRpc. || customRpc)]);
//   const signer = address ? kondor.getSigner(address) as Signer : undefined;

//   const contract = new Contract({
//     id: contractId,
//     abi: utils.tokenAbi,
//     provider: provider,
//     signer: signer,
//   });
//   const { result } = await contract.functions.balanceOf({ owner: address });
//   return Promise.resolve(result?.value as number || 0);
// }


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
