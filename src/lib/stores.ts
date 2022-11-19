import { writable, derived } from 'svelte/store';
import { writable as persistable } from 'svelte-local-storage-store'
import logo from '$lib/images/logo.svg';
import { Pool, Wallet } from '$lib/types'

export const address: any = persistable("pool.wallet.address", "");
export const language = persistable("pool.language","en-US");
export const selectedRpc = persistable("pool.selectedRpc","api.koinos.io");
export const customRpc = persistable("pool.customRpc","api.koinos.io");
export const rpcs = writable(["api.koinos.io","harbinger-api.koinos.io","api.koinosblocks.com"]);
export const wallet = writable(new Wallet());
export const pool = writable(new Pool());
export const apy = writable(0);
export const pools = writable(examplePools());




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

function examplePools() {
  return [
    {
      name: "Example Pool 1",
      id: "exampleId1",
      address: "1dflajsdlkfjalsdbadfsajdf",
      logo: logo,
      apy: 4.10
    },
    {
      name: "Example Pool 2",
      id: "exampleId2",
      address: "1dflajsdlkfjiisgjflksajdf",
      logo: logo,
      apy: 4.20
    },
    {
      name: "Example Pool 3",
      id: "exampleId3",
      address: "1dflajsdlkfjdksajflksajdf",
      logo: logo,
      apy: 4.30
    },
  ]
}