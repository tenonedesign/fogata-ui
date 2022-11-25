import { getAccountRc, tokenBalanceOf } from "$lib/utils";
import * as kondor from "kondor-js";
import { env } from "$lib/stores";
import { get } from "svelte/store";

export class Pool {
  constructor(
    public address: string = "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS",
    public name = "",
    public id = "",
    public logo = "",
    public apy = 0,
    public wallet: Wallet = new Wallet(),
    public userBalance = 0,
  ) { }
}

export class User {
  constructor(
    public address: string = "",
    public language: string = "en-US",
    public selectedRpc: string = "api.koinos.io",
    public customRpc: string = "",
  ) { }
}

export class Wallet {
  constructor(
    public balances: Balances = new Balances(),
  ) { }

  public loadBalances = async (address: string) => {
		this.balances.koin = await tokenBalanceOf(get(env).koin_address, address);
		this.balances.vhp = await tokenBalanceOf(get(env).vhp_address, address);
		this.balances.mana = parseInt(await getAccountRc(address)) || 0;
		Promise.resolve();
	}
}

export class Balances {
  constructor(
    public koin: number = 0,
    public mana: number = 0,
    public vhp: number = 0,
  ) { }
}

export class Toast {
  constructor(
    public type: string = "alert-info", // alert-info, alert-success, alert-error
    public title: string = "",
    public message: string = "",
    public duration: number = 0,
    public position: string = "toast-start",
    public id: string = Math.random().toString(36).substring(2),
  ) { }
}