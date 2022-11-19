<script lang="ts">
	import { address, wallet, language, selectedRpc, customRpc } from '$lib/stores';
	import * as kondor from "kondor-js";
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import {onMount, onDestroy} from 'svelte';
	import { Balances, Wallet } from '$lib/types';
	import { tokenBalance } from '$lib/utils';
	import type { Writable } from 'svelte/store';

	onMount(async () => {
		if ($address) {
			$wallet.getBalances($address, $selectedRpc || $customRpc).then(() => {
				wallet.set($wallet);
			});
		}
	});

	const connect = async () => {
		// setIsConnecting(true);
		// @ts-ignore getAccounts returns objects, not strings
		const accounts:[any] = await Promise.race([
			kondor.getAccounts(),
			new Promise((resolve) => setTimeout(() => resolve([{ address: "" }]), 10000))
		]);

		if (accounts[0].address) {
			address.set(accounts[0].address);
			$wallet.getBalances(accounts[0].address, $selectedRpc || $customRpc).then(() => {
				wallet.set($wallet);
			});
		}
		// if (address) setAccount(address);
		// setIsConnecting(false);

		return !!accounts[0].address;
	};
	const disconnect = async() => {
		address.set("");
		wallet.set(new Wallet());
	}

	
</script>

{#if $address == ""}
	<button class="btn" on:click={connect}>Connect to Kondor</button>
{:else}
	
	<div class="dropdown dropdown-end ">
		<button class="btn">{$address.slice(0,5)+"..."+$address.slice(-5)}</button>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div tabindex="0" class="dropdown-content menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
		  <li><button on:click={connect}>Open Kondor</button></li>
		  <li><button on:click={disconnect}>Disconnect Kondor</button></li>
		</div>
	  </div>
{/if}
<style></style>
