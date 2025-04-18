import { writable, derived, type Writable, get } from 'svelte/store';
import { writable as persistable } from 'svelte-local-storage-store'
import { Pool, Wallet, User, Toast, Endpoint} from '$lib/types'
import { poolsRead } from './utils';


export const connectedAddress = persistable("connectedAddress", "");
export const users = persistable("users", <{[address: string]:User}>{});
export const user = writable(get(users)[get(connectedAddress)] ?? new User());
export const rpcs = writable([new Endpoint("api.koinos.io"),new Endpoint("harbinger-api.koinos.io", true),new Endpoint("api.koinosblocks.com")]);
export const wallet = writable(new Wallet());
export const ownedPools: Writable<Pool[]> = writable([]);
export const pool = writable(new Pool());
export const approvedPools: Writable<Pool[]> = writable([]);
export const submittedPools: Writable<Pool[]> = writable([]);
export const toasts: Writable<Toast[]> = writable([]);
export const poolsOwner = writable("");
export const rcLimit = writable("5000000000");
export const cachedAddresses: Writable<{koin: string | null, vhp: string | null, pob: string | null}> = writable({koin: null, vhp: null, pob: null});
export const env = derived(
	user,
	$user => {
    let currentRpc: Endpoint = get(rpcs).find(x => x.url == $user.selectedRpcUrl) || $user.customRpc;
    if (currentRpc.isTestnet) {
      return {
        "koin_address": "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
        "vhp_address": "1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8",
        "pob_address": "198RuEouhgiiaQm7uGfaXS6jqZr6g6nyoR",
        "pools_address": "1M4GSDejwQPwDvq3EVS2anjDA1rkzdwFF9",
        "pools_owner": "1EWf7YrKt8Yz153rxmVkhXcHPDhMBQcynU",
        "sponsors_address": "1AuJQxqqyBZXqqugTQZzXRVRmEYJtsMYQ8",
        "chain_id": "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ==",
        "minimum_reserved_koin": BigInt(500000000),
        "testnet": true
      }
    }
    else {
      return {
        "koin_address": get(cachedAddresses).koin ?? "19GYjDBVXU7keLbYvMLazsGQn3GTWHjHkK",
        "vhp_address": get(cachedAddresses).vhp ?? "12Y5vW6gk8GceH53YfRkRre2Rrcsgw7Naq",
        "pob_address": get(cachedAddresses).pob ?? "159myq5YUhhoVWu3wsHKHiJYKPKGUrGiyv",
        "pools_address": "1MmV5nzSBVGnBrjTr3B8XtA4yPs8wcSpr",
        "pools_owner": "1EWf7YrKt8Yz153rxmVkhXcHPDhMBQcynU",
        "sponsors_address": "1KTasVrqvMBofMANKMCT3HMya16sfZPLFB",
        "chain_id": "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==",
        "minimum_reserved_koin": BigInt(500000000),
        "testnet": false
      }
    }
  }
);


