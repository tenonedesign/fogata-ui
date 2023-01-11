import { balanceToFloat, getAccountRc, pobRead, poolRead, tokenBalanceOf, tokenTotalSupply, vaporBalanceOf } from "$lib/utils";
import { env } from "$lib/stores";
import { get } from "svelte/store";
import { utils } from "koilib";

export enum PoolListingState {
  Unknown,
  Ineligible,
  Eligible,
  Submitted,
  Listed
}

export class Pool {
  constructor(
    public address: string = "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS",
    public parameters: PoolParams = new PoolParams(),
    public state: PoolState = new PoolState(),
    public sponsorsApy = 0,
    public apy = 0,
    public userBalance = BigInt(0),
    public userBalanceKoin = BigInt(0),
    public userBalanceVhp = BigInt(0),
    public userBalanceVapor = BigInt(0),
    public wallet: Wallet = new Wallet(),
    public nodePublicKey: string = "",
    public loaded: boolean = false
  ) { }
  public refresh = async () => {
    await Promise.all([
      this.wallet.loadBalances(this.address, false),
      this.loadParameters(),
      this.loadPublicKey(),
    ]);
    await this.calculateApy();
    this.loaded = true;
  }
  public loadParameters = async () => {
    this.parameters = await poolRead(this.address, "get_pool_params", {});
    Promise.resolve();
	}
  public loadPublicKey = async () => {
    this.nodePublicKey = await pobRead("get_public_key", {"producer": this.address});
    Promise.resolve();
  }
  public sponsorsPercentage(): number {
    let sponsorsBeneficiary: Beneficiary = this.parameters.beneficiaries.find(x => x.address == get(env).sponsors_address) ?? new Beneficiary(get(env).sponsors_address, 0);
    return sponsorsBeneficiary.percentage || 0;
  }
  public beneficiariesPercentage(): number {
    let combinedBeneficiaryPercentage = 0;
    this.parameters.beneficiaries.forEach((beneficiary: {address: string, percentage: number}) => {
      combinedBeneficiaryPercentage += beneficiary.percentage;
    });
    return combinedBeneficiaryPercentage;
  }
  public isListingEligible(): boolean {
    return (!!this.nodePublicKey);
    // return (!!this.nodePublicKey && this.sponsorsPercentage() > 0);
  }
  public listingState(approvedPools: Pool[], submittedPools: Pool[]): PoolListingState {
    if (approvedPools.some(e => e.address === this.address)) { return PoolListingState.Listed; }
    if (submittedPools.some(e => e.address === this.address)) { return PoolListingState.Submitted; }
    if (!this.loaded) { return PoolListingState.Unknown; } // probably not loaded, but also could have no beneficiaries
    return this.isListingEligible() ? PoolListingState.Eligible : PoolListingState.Ineligible;
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

		// is this too clever?  YES.  ultimately, the vhpProducingGlobal number could be more accurate by averaging over several hours
		// if (totalVhp < vhpProducingGlobal) {
		// 	vhpProducingGlobal = totalVhp;
		// }
		// console.log(vhpProducingGlobal);

		// unused burnkoin calculation
		// const virtualSupply = (koinTotalSupply.data || 0) + (vhpTotalSupply.data || 0);
		// const yearlyInflationAmount = virtualSupply * Math.pow(Math.E, 0.019802) - virtualSupply;
		// const apy = (currentApy = 0.95 * (100 * yearlyInflationAmount) / (vhpTotalSupply.data || 1));

		// CALCULATE POOL APY
		// strategy is participantPercentage (e.g. 0.95) * (yearlyMinedByPool / currentPoolAssets).
		// expected koin mined by pool is yearlyMinedGlobal * (currentPoolAssets / vhpProducing)
		// note that 0.05 taken after the year is done differs from 0.05 taken from each mined reward, thereby preventing its use in future mining.
		// however, the effective difference is very small (on the order of 0.001% apy difference)
		let yearlyMinedGlobal = 0.019999360139121 * balanceToFloat(totalKoin + totalVhp);	// would be 0.02, but simulated output of pob contract is slightly less
		let currentPoolAssets = balanceToFloat(this.wallet.balances.vhp);	// should include koin, too?  assumption of impending burn?.  No - don’t think so
		let yearlyMinedByPool =  yearlyMinedGlobal * (currentPoolAssets / vhpProducingGlobal);
		let totalApy = yearlyMinedByPool /  currentPoolAssets;
		if (this.wallet.balances.vhp == BigInt(0)) {
			totalApy = 0;	// don’t show apy if pool has no VHP (this should probably trigger a message somewhere with instructions how to make first deposit)
		}
    let combinedBeneficiaryPercentage = 0;
    this.parameters.beneficiaries.forEach((beneficiary: {address: string, percentage: number}) => {
      combinedBeneficiaryPercentage += beneficiary.percentage;
    });
    let beneficiaryPercentage = combinedBeneficiaryPercentage / 100000;
		let participantApy = (1 - beneficiaryPercentage) * totalApy;

		// console.log("vhpProducingGlobal: "+ vhpProducingGlobal);
		// console.log("virtual supply: "+ balanceToFloat(totalKoin + totalVhp));
		// console.log("yearlyMinedGlobal: "+ yearlyMinedGlobal);
		// console.log("currentPoolAssets: "+ currentPoolAssets);
		// console.log("yearlyMinedByPool: "+ yearlyMinedByPool);
		// console.log("totalApy: "+totalApy);
		// console.log("participantApy: "+participantApy);

    this.sponsorsApy = (this.sponsorsPercentage() / 100000) * totalApy;
		this.apy = participantApy;

    if (!this.nodePublicKey) {
      this.apy = 0;
    }
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
    public nodes: KoinosNode[] = [],
  ) { }
}
export class KoinosNode {
  constructor(
    public name: string,
    public publicKey: string,
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

  public loadBalances = async (address: string, includeVapor = true) => {
    // promises.all pattern should work well here
    // let [someResult, anotherResult] = await Promise.all([someCall(), anotherCall()]);
		this.balances.koin = await tokenBalanceOf(get(env).koin_address, address);
		this.balances.vhp = await tokenBalanceOf(get(env).vhp_address, address);
		this.balances.mana = BigInt(await getAccountRc(address)) || BigInt(0);
		if (includeVapor) {
      this.balances.vapor = await vaporBalanceOf(address);
    }
		Promise.resolve();
	}
}

export class Balances {
  constructor(
    public koin: bigint = BigInt(0),
    public mana: bigint = BigInt(0),
    public vhp: bigint = BigInt(0),
    public vapor: bigint = BigInt(0),
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
export class PoolState {
  constructor(
    public stake: string = "0",
    public virtual: string = "0",
    public snapshot_stake: string = "0",
    public snapshot_koin: string = "0",
    public current_snapshot: string = "0",
    public next_snapshot: string = "0",
    public snapshot_vapor: string = "0",
    public vapor_withdrawn: string = "0",
    public user_count: string ="0",
    public vapor: string = "0",
    public virtual_vapor: string = "0",
  ) { }
}
export class Beneficiary {
  constructor(
    public address: string = "",
    public percentage: number = 0,
  ) { }
}

export const CountdownTimer = class countdownTimer {
  completionTimestamp = 0;
  completed = false;
  tickCallback = (remainingSeconds: number, timeComponents: any) => {};
  completionCallback = () => {};
  constructor(completionTimestamp: number, tickCallback:any, completionCallback:any) {
    this.completionTimestamp = completionTimestamp;
    this.tickCallback = tickCallback;
    this.completionCallback = completionCallback;
    this.tick();
  }
  tick() {
    if (this.completed) { return false; }
    const remainingSeconds = this.completionTimestamp - Math.floor(Date.now() / 1000);
    if (typeof this.tickCallback === 'function') {
      this.tickCallback(remainingSeconds, this.timeComponents(remainingSeconds));
    }
    if (remainingSeconds <= 0 && typeof this.completionCallback === 'function') {
      this.completionCallback();
      this.completed = true;
    }
    if (remainingSeconds > 0) {
      setTimeout(() => {this.tick()}, 1000);
    }
  }
  timeComponents(remainingSeconds: number) {
    var d = Math.floor(remainingSeconds / (3600*24));
    var h = Math.floor(remainingSeconds % (3600*24) / 3600);
    var m = Math.floor(remainingSeconds % 3600 / 60);
    var s = Math.floor(remainingSeconds % 60);
    return {days: d, hours: h, minutes: m, seconds: s};
  }
}