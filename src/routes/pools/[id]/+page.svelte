<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Stake from '$lib/Stake.svelte';
	import Stats from '$lib/Stats.svelte';
	import { approvedPools, wallet, pool, user, env, ownedPools, submittedPools } from '$lib/stores';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { cacheSystemContractAddresses, hideConnectionToast, loadFogataPools, poolRead, populateOwnedPools, readPoolsOwner, showConnectionToast, updateStoredObjectFormats, updateUsers } from '$lib/utils';
	import { Pool, PoolState } from '$lib/types';

	updateStoredObjectFormats();
	populateOwnedPools();
	let knownPool = false;
	let knownPoolChecked = false;
	// this loads in the pool immediately if coming in from another page, and if not it will be loaded onMount
	pool.set($approvedPools.find(x => x.address == $page.params.id) || $ownedPools.find(x => x.address == $page.params.id) || new Pool($page.params.id));

	// update stored users localstorage any time user is updated
	$: updateUsers($user);
	
	let timer: NodeJS.Timer;
	onMount(async () => {
    await cacheSystemContractAddresses();
    await loadFogataPools();
		readPoolsOwner();
		knownPool = Boolean($approvedPools.find(x => x.address == $page.params.id) || $ownedPools.find(x => x.address == $page.params.id));
		knownPoolChecked = true;
		// if (!knownPool) { return; }	// unapproved pools are ok now
		load();
		timer = setInterval(() => {
			load();
		}, 5000);
	});
	onDestroy(async () => {
		clearInterval(timer);
	});

	async function load() {

		$pool.refresh().then(() => {
			$pool = $pool;
			hideConnectionToast();
		}).catch(err => {
			showConnectionToast();
		});


		poolRead($pool.address, "get_pool_state", {}).then((value) => {
			// if this looks weird, it’s because properties with a value of "0" are ommited from response
			$pool.state = {...new PoolState(), ...value};
		});

		if ($user.address) {
			$wallet.loadBalances($user.address).then(() => {
				wallet.set($wallet);
			}).catch(err => {
			});

			poolRead($pool.address, "balance_of", { account: $user.address }).then((value) => {
				$pool.userBalanceKoin = BigInt(value?.koin_amount ?? "0");
				$pool.userBalanceVhp = BigInt(value?.vhp_amount ?? "0");
				$pool.userBalanceVapor = BigInt(value?.vapor_amount ?? "0");
				$pool.userBalance = $pool.userBalanceKoin + $pool.userBalanceVhp;
			});
			$pool.loadCollectKoinPreferences($user.address);
		}
	}
</script>

<svelte:head>
	<title>Fogata - {$pool?.parameters?.name}</title>
	<meta name="description" content="Fogata mining pool on Koinos - $pool?.parameters?.name" />
</svelte:head>


<div class="px-4">
	<Header pool="{pool}" />
	{#if knownPoolChecked && !knownPool}
		<div class="my-4 alert alert-warning shadow-lg mx-auto max-w-[1300px]">
			<div>
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
				<span class="">This pool has not been reviewed.  Do not interact with this pool unless you understand the risk or trust the pool.</span>
			</div>
		</div>
	{/if}
	{#if $pool?.parameters?.image}
		<img class="h-20 mx-auto mt-6 sm:mt-12" src={$pool?.parameters?.image} alt="{$pool.parameters?.name}" />
		<div class=" text-2xl text-center mt-2">{$pool?.parameters?.name}</div>

		<div class="dropdown flex justify-center mt-2">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<label tabindex="0" class="btn btn-outline h-6 px-3 min-h-0 rounded-full">
				About<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24"><path d="M5 11l7 7 7 -7"></path></svg>
			</label>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<div tabindex="0" class="dropdown-content z-[1] menu mt-8 p-6 shadow-xl bg-base-100 rounded-box w-screen max-w-[80vw] md:max-w-md">
				<p class="mt-4 whitespace-pre-wrap">{$pool?.parameters?.description}</p>
			</div>
		</div>
	{/if}
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 max-w-[1300px] mx-auto pb-40 pt-10">
		<Stake />
		<Stats />
	</section>
</div>


<style>
</style>
