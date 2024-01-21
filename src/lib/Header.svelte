<script lang="ts">
  import logo from '$lib/images/fogata-logo.svg?raw';
	import Provider from '$lib/Provider.svelte';
  import { SettingsSharp } from 'svelte-ionicons';
  import { rpcs, user } from '$lib/stores'
	import RpcControl from './RpcControl.svelte';
	import type { Writable } from 'svelte/store';
	import type { Pool } from '$lib/types';

  export let pool: Writable<Pool> | null;

  // $: console.log('user: ', $user);

</script>


   <div class="pt-4">

    <div class="navbar max-w-[1300px] px-4 py-3 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100 shadow-purple-100 dark:shadow-purple-500/30 shadow-md">
		  <div class="flex flex-wrap w-full gap-4 justify-between items-center">

        <a class="flex flex-grow items-center gap-1 sm:gap-2" href="/">
          <span class="inline-block w-full max-w-[96px] sm:max-w-[148px] -mt-1">{@html logo}</span>
          <span class="ml-1 hidden sm:block text-2xl font-semibold">mining pools</span>
        </a>

        <div class="flex gap-2 sm:gap-4 justify-end">
          <Provider />
          <div class="dropdown dropdown-end ">
            <button class="btn btn-outline btn-sm sm:btn-md">
              <SettingsSharp size="24" />
            </button>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div tabindex="0" class="dropdown-content z-[1] menu mt-2 p-2 shadow-lg bg-base-100 dark:bg-base-200 rounded-box w-[250px]">
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
