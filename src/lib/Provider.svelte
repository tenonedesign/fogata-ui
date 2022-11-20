<script lang="ts">
	import { wallet, user } from '$lib/stores';
	import * as kondor from "kondor-js";
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import {onMount, onDestroy} from 'svelte';
	import { Balances, Wallet } from '$lib/types';
	import { errorToast, tokenBalance } from '$lib/utils';
	import type { Writable } from 'svelte/store';

	const connect = async () => {
		const accounts:{address:string}[] = await Promise.race([
			kondor.getAccounts(),
			new Promise((resolve) => setTimeout(() => resolve([{address: ""}]), 10000))
		]) as {address:string}[];

		if (accounts[0].address) {
			$user.address = accounts[0].address;
			$wallet.loadBalances(accounts[0].address, $user.selectedRpc || $user.customRpc).then(() => {
				wallet.set($wallet);
			}).catch(err => {
				errorToast("","Error reading token balance");
			});
		}
		return !!accounts[0].address;
	};

	const disconnect = async() => {
		// retain user api preferences, but clear wallet address
		$user.address = ""
		wallet.set(new Wallet());
	}

</script>


	{#if $user.address == ""}
		<button class="btn" on:click={connect}>Connect to Kondor</button>
	
	{:else}
		<div class="dropdown dropdown-end ">
		<button class="btn">{$user?.address?.slice(0,5)+"..."+$user?.address?.slice(-5)}</button>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div tabindex="0" class="dropdown-content menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
		  <li><button on:click={connect}>Open Kondor</button></li>
		  <li><button on:click={disconnect}>Disconnect Kondor</button></li>
		</div>
	  </div>
	{/if}


<style></style>
