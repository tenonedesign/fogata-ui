import { writable, derived } from 'svelte/store';
import { writable as persistable } from 'svelte-local-storage-store'
import logo from '$lib/images/logo.svg';

export const address = persistable("pool.wallet.address", "");
export const language = persistable("pool.language","en-US");
export const wallet: any = writable({balances: {mana: 0, koin: 0, vhp: 0}});
export const apy = writable(0);
export const pools = writable(examplePools());

export function balanceDisplayFormat(balance: number, language: string = "en-US"): string {
  let num = balance;
  let dec = (num / 100000000);
  if (num == 0) { return "0"; }
  if (num < 10000) { return parseFloat(dec.toFixed(8)).toLocaleString(language); }
  if (num < 100000000) { return parseFloat(dec.toFixed(5)).toLocaleString(language); }
  if (num < 10000000000) { return parseFloat(dec.toFixed(3)).toLocaleString(language); }
  if (num < 100000000000) { return parseFloat(dec.toFixed(2)).toLocaleString(language); }
  return parseFloat(dec.toFixed(2)).toLocaleString(language);
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