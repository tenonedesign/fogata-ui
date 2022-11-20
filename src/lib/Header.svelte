<script lang="ts">
	import logo from '$lib/images/fogata.svg';
	import Provider from '$lib/Provider.svelte';
  import { SettingsSharp } from 'svelte-ionicons';
  import { rpcs, user } from '$lib/stores'
	import RpcControl from './RpcControl.svelte';
	import type { Writable } from 'svelte/store';
	import type { Pool } from '$lib/types';

  export let pool: Writable<Pool>;

  // $: console.log('user: ', $user);

</script>


   <div class="pt-4">

    {#if $pool?.name}
      <div class="">Pool name: {$pool?.name}</div>
    {/if}


    <div class="navbar max-w-[1300px] px-4 py-3 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100 shadow-red-100 dark:shadow-red-500/30 shadow-md">
		  <div class="flex flex-wrap w-full gap-4 justify-between items-center">

        <div class="flex items-center gap-4">
          <span class="sr-only">{$pool?.name}</span>
          <img src={logo} alt="VHP Miner" class="h-10 w-auto sm:h-14 relative -top-1"/>
        </div>

        <div class="flex gap-4">
          <Provider />

          <div class="dropdown dropdown-end ">
            <button class="btn btn-outline">
              <SettingsSharp size="24" />
            </button>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div tabindex="0" class="dropdown-content menu mt-2 p-2 shadow bg-base-100 rounded-box w-[250px]">
              <!-- <li><button>Parent menu item</button></li> -->
              <div class="menu-title mt-4 mb-1 pl-4 text-xs font-bold opacity-30">RPC endpoint</div>
              <RpcControl rpcs={rpcs} user={user} />
            </div>
          </div>

        </div>
		  </div>
		</div>
  </div>


<style></style>
