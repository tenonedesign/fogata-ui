<script lang="ts">
	import { wallet, user, pool, users, connectedAddress, userChangedEvent as userChangedEvent } from '$lib/stores';
	import * as kondor from "kondor-js";
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import {onMount, onDestroy} from 'svelte';
	import { Balances, User, Wallet } from '$lib/types';
	import { errorToast, hideConnectionToast, showConnectionToast } from '$lib/utils';
	import type { Writable } from 'svelte/store';

	const connect = async () => {
		const accounts:{address:string}[] = await Promise.race([
			kondor.getAccounts(),
			new Promise((resolve) => setTimeout(() => resolve([{address: ""}]), 10000))
		]) as {address:string}[];

		if (accounts[0].address) {
			// $user.address = accounts[0].address;
			$connectedAddress = accounts[0].address;
			$user = $users[accounts[0].address] ?? new User();
			$user.address = accounts[0].address;
			$wallet.loadBalances(accounts[0].address).then(() => {
				wallet.set($wallet);
				hideConnectionToast();
			}).catch(err => {
				// errorToast("","Error reading token balance");
				showConnectionToast();
			});
			$userChangedEvent = !$userChangedEvent;
		}
		return !!accounts[0].address;
	};

	const disconnect = async() => {
		$connectedAddress = "";
		// retain user api preferences, but clear wallet address
		const u = new User();
		u.selectedRpcUrl = $user.selectedRpcUrl;
		u.customRpc = $user.customRpc;
		$user = u;
		$pool.userBalance = BigInt(0);
		$pool.userBalanceKoin = BigInt(0);
		$pool.userBalanceVhp = BigInt(0);
		wallet.set(new Wallet());
		$userChangedEvent = !$userChangedEvent;
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
