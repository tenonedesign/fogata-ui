import { writable, derived, type Writable, get } from 'svelte/store';
import { writable as persistable } from 'svelte-local-storage-store'
import { Pool, Wallet, User, Toast, Endpoint} from '$lib/types'


export const user = persistable("user", new User());
export const rpcs = writable([new Endpoint("api.koinos.io"),new Endpoint("harbinger-api.koinos.io", true),new Endpoint("api.koinosblocks.com")]);
export const wallet = writable(new Wallet());
export const ownedPools: Writable<Pool[]> = writable([]);
export const pool = writable(new Pool());
export const pools = writable(participatingPools());
export const toasts: Writable<Toast[]> = writable([]);
export const rcLimit = writable("500000000");
export const env = derived(
	user,
	$user => {
    let currentRpc: Endpoint = get(rpcs).find(x => x.url == $user.selectedRpcUrl) || $user.customRpc;
    if (currentRpc.isTestnet) {
      return {
        "koin_address": "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
        "vhp_address": "1JZqj7dDrK5LzvdJgufYBJNUFo88xBoWC8",
        "pob_address": "198RuEouhgiiaQm7uGfaXS6jqZr6g6nyoR",
        "sponsors_address": "1AuJQxqqyBZXqqugTQZzXRVRmEYJtsMYQ8",
        "chain_id": "EiAAKqFi-puoXnuJTdn7qBGGJa8yd-dcS2P0ciODe4wupQ=="
      }
    }
    else {
      return {
        "koin_address": "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
        "vhp_address": "1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9",
        "pob_address": "159myq5YUhhoVWu3wsHKHiJYKPKGUrGiyv",
        "sponsors_address": "1AuJQxqqyBZXqqugTQZzXRVRmEYJtsMYQ8",
        "chain_id": "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA=="
      }
    }
  }
);


function participatingPools(): Pool[] {
  return [
    new Pool("16KZRu7TbjZZ8movNZnHcR2SmgqKDqJsoP"),
    new Pool("16KZRu7TbjZZ8movNZnHcR2SmgqKDqJsoP"),
    new Pool("16KZRu7TbjZZ8movNZnHcR2SmgqKDqJsoP"),
    new Pool("1DKLhNVtKfHZa6LJ6guYKTiDKfkVujzyPa")
  ]
}