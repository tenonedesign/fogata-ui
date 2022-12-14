import { balanceToFloat, getAccountRc, pobRead, poolRead, tokenBalanceOf, tokenTotalSupply } from "$lib/utils";
import { env } from "$lib/stores";
import { get } from "svelte/store";
import { utils } from "koilib";

export class Pool {
  constructor(
    public address: string = "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS",
    public parameters: PoolParams = new PoolParams(),
    public apy = 0,
    public userBalance = BigInt(0),
    public userBalanceKoin = BigInt(0),
    public userBalanceVhp = BigInt(0),
    public userBalanceVapor = BigInt(0),
    public wallet: Wallet = new Wallet()
  ) { }
  public refresh = async () => {
    await this.wallet.loadBalances(this.address);
    await this.loadParameters();
    await this.calculateApy();
  }
  public loadParameters = async () => {
    this.parameters = await poolRead(this.address, "get_pool_params", {});
    Promise.resolve();
	}
  public calculateApy = async () => {
    // calculate apy
		let totalKoin = await tokenTotalSupply(get(env).koin_address);
		let totalVhp = await tokenTotalSupply(get(env).vhp_address);

		// from pob_producer.cpp:
		// .quanta_per_block_interval = consensus_params.target_block_interval() / consensus_params.quantum_length()
		// auto vhp = difficulty / _auxiliary_data->quanta_per_block_interval;
		let pobConsensusParams = await pobRead("get_consensus_parameters");
		let pobMetadata = await pobRead("get_metadata");
		let difficultyHexString = "0x"+utils.toHexString(utils.decodeBase64url(pobMetadata.difficulty));
		let difficulty = BigInt(difficultyHexString);
		let quantaPerBlockInterval = BigInt(pobConsensusParams.target_block_interval / pobConsensusParams.quantum_length);
		let vhpProducingGlobal =  balanceToFloat(difficulty / quantaPerBlockInterval);

		// is this too clever?
		// if (totalVhp < vhpProducingGlobal) {
		// 	vhpProducingGlobal = totalVhp;
		// }
		// console.log(vhpProducingGlobal);

		// burnkoin calculation
		// const virtualSupply = (koinTotalSupply.data || 0) + (vhpTotalSupply.data || 0);
		// const yearlyInflationAmount = virtualSupply * Math.pow(Math.E, 0.019802) - virtualSupply;
		// const apy = (currentApy = 0.95 * (100 * yearlyInflationAmount) / (vhpTotalSupply.data || 1));

		// CALCULATE POOL APY
		// strategy is 0.95 * (yearlyMinedByPool / currentPoolAssets).
		// expected koin mined by pool is yearlyMinedGlobal * (currentPoolAssets / vhpProducing)
		// note that 0.05 taken after the year is done differs from 0.05 taken from each mined reward, thereby preventing its use in future mining.
		// however, the effective difference is very small (on the order of 0.001% apy difference)
		let yearlyMinedGlobal = 0.019999360139121 * balanceToFloat(totalKoin + totalVhp);	// would be 0.02, but simulated output of pob contract is slightly less
		let currentPoolAssets = balanceToFloat(this.wallet.balances.koin + this.wallet.balances.vhp);	// should include koin, too?  assumption of impending burn?
		let yearlyMinedByPool =  yearlyMinedGlobal * (currentPoolAssets / vhpProducingGlobal);
		let totalApy = yearlyMinedByPool /  currentPoolAssets;
		if (this.wallet.balances.vhp == BigInt(0)) {
			totalApy = 0;	// don’t show apy if pool has no VHP (this should probably trigger a message somewhere with instructions how to make first deposit)
		}
    let combinedBeneficiaryPercentage = 0;
    this.parameters.beneficiaries.forEach((beneficiary: {address: string, percentage: number}) => {
      combinedBeneficiaryPercentage += beneficiary.percentage;
    });
    let poolPercentage = combinedBeneficiaryPercentage / 100000;
		let participantApy = (1 - poolPercentage) * totalApy;

		// console.log("vhpProducingGlobal: "+ vhpProducingGlobal);
		// console.log("virtual supply: "+ balanceToFloat(totalKoin + totalVhp));
		// console.log("yearlyMinedGlobal: "+ yearlyMinedGlobal);
		// console.log("currentPoolAssets: "+ currentPoolAssets);
		// console.log("yearlyMinedByPool: "+ yearlyMinedByPool);
		// console.log("totalApy: "+totalApy);
		// console.log("participantApy: "+participantApy);
		this.apy = participantApy;
  }
}


export enum TokenName {
  KOIN = "KOIN",
  VHP = "VHP",
}

export class User {
  constructor(
    public address: string = "",
    public language: string = "en-US",
    public selectedRpcUrl: string = "api.koinos.io",  // "" indicates use of customRpc
    public customRpc: Endpoint = new Endpoint(""),
    public ownedPools: string[] = [],
  ) { }
}

export class Endpoint {
  constructor(
    public url: string,
    public isTestnet: boolean = false
  ) { }
}
export class Wallet {
  constructor(
    public balances: Balances = new Balances(),
  ) { }

  public loadBalances = async (address: string) => {
		this.balances.koin = await tokenBalanceOf(get(env).koin_address, address);
		this.balances.vhp = await tokenBalanceOf(get(env).vhp_address, address);
		this.balances.mana = BigInt(await getAccountRc(address)) || BigInt(0);
		Promise.resolve();
	}
}

export class Balances {
  constructor(
    public koin: bigint = BigInt(0),
    public mana: bigint = BigInt(0),
    public vhp: bigint = BigInt(0),
  ) { }
}

export class Toast {
  constructor(
    public type: string = "info", // info, success, error
    public title: string = "",
    public message: string = "",
    public duration: number = 0,
    public position: string = "toast-start",
    public id: string = Math.random().toString(36).substring(2),
  ) { }
  public classes() {
    switch (this.type) {
      case "success": return "bg-success text-success-content";
      case "info": return "bg-secondary text-secondary-content";
      case "warning": return "bg-warning text-warning-content";
      case "error": return "bg-error text-error-content";
      default: return "bg-secondary text-secondary-content";
    }
  }
}

export class PoolParams {
  constructor(
    public name: string = "",
    public image: string = "",
    public description: string = "",
    public beneficiaries: Beneficiary[] = [new Beneficiary("", 5000)],
    public payment_period: number = 0,
  ) { }
}
export class Beneficiary {
  constructor(
    public address: string = "",
    public percentage: number = 0,
  ) { }
}