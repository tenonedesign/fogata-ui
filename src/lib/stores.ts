import { writable, derived, type Writable } from 'svelte/store';
import { writable as persistable } from 'svelte-local-storage-store'
import logo from '$lib/images/logo.svg';
import { Pool, Wallet, User, Toast} from '$lib/types'


export const user = persistable("user", new User());
export const rpcs = writable(["api.koinos.io","harbinger-api.koinos.io","api.koinosblocks.com"]);
export const wallet = writable(new Wallet());
export const pool = writable(new Pool());
export const pools = writable(examplePools());
export const toasts: Writable<Toast[]> = writable([]);


function examplePools(): Pool[] {
  return [
    new Pool("1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS", "Example Pool 1", "exampleId1", logo, 4.10),
    new Pool("1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS", "Example Pool 2", "exampleId2", logo, 4.20),
    new Pool("1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS", "Example Pool 3", "exampleId3", logo, 4.30),
  ]
}