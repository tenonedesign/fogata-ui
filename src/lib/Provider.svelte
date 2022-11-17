<script lang="ts">
	import { address, wallet, language } from '$lib/stores';
	import * as kondor from "kondor-js";
	import { Signer, Contract, Provider, Serializer, utils } from "koilib";
	import {onMount, onDestroy} from 'svelte';

	onMount(async () => {
		if ($address) {
			getBalance();
		}
	});

	const tokenBalance = async (contractId: string, address: string): Promise<number> => {
		const contract = new Contract({
			id: contractId,
			abi: utils.tokenAbi,
			provider: kondor.provider,
			signer: kondor.signer,
		});
		const { result } = await contract.functions.balanceOf({ owner: address });
		return Promise.resolve(result?.value as number || 0);
	}
	const getBalance = async () => {

		const koinBalance = await tokenBalance("15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL", $address);
		const vhpBalance = await tokenBalance("1AdzuXSpC6K9qtXdCBgD5NUpDNwHjMgrc9", $address);
		const manaBalance = await kondor.provider.getAccountRc($address) || 0;
		wallet.set({ balances: {koin: koinBalance, mana: manaBalance, vhp: vhpBalance}});
	}

	const connect = async () => {
		// setIsConnecting(true);
		// @ts-ignore getAccounts returns objects, not strings
		const accounts = await Promise.race([
			kondor.getAccounts(),
			new Promise((resolve) => setTimeout(() => resolve([{ address: "" }]), 10000))
		]);

		if (accounts[0].address) {
			address.set(accounts[0].address);
			getBalance();
		}
		// if (address) setAccount(address);
		// setIsConnecting(false);

		return !!accounts[0].address;
	};

	
</script>

{#if $address == ""}
	<button class="btn" on:click={connect}>Connect to Kondor</button>
{:else}
	<button class="btn" on:click={connect}>{$address.slice(0,5)+"..."+$address.slice(-5)}</button>
{/if}
<style></style>
