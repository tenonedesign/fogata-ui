import { tokenBalance } from "$lib/utils";
import * as kondor from "kondor-js";

export class Pool {
  constructor(
    public wallet: Wallet = new Wallet(),
  ) { }
}

export class Wallet {
  constructor(
    public balances: Balances = new Balances(),
  ) { }

  public getBalances = async (address: string, rpc: string) => {
		this.balances.koin = await tokenBalance("15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL", address, rpc);
		this.balances.vhp = await tokenBalance("1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9", address, rpc);
		this.balances.mana = parseInt(await kondor.provider.getAccountRc(address)) || 0;
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