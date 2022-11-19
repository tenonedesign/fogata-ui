<script>
	import logo from '$lib/images/fogata.svg';
	import Provider from '$lib/Provider.svelte';
  import { SettingsSharp } from 'svelte-ionicons';
  import { rpcs, selectedRpc, customRpc } from '$lib/stores'
	import RpcControl from './RpcControl.svelte';

  export let name = ""

</script>

   <!-- relative z-0 before:bg-gradient-to-r before:from-error before:to-warning before:absolute before:left-0 before:top-0 before:w-full before:h-full before:z-[-1] before:[transform:translate3d(0px,14px,0)_scale(0.97)] before:blur-[9px] before:opacity-70 before:transition-opacity before:duration-300 before:[border-radius:inherit]
   after:absolute after:left-0 after:top-0 after:w-full after:h-full after:z-[-1] after:[background:inherit] after:[border-radius:inherit] -->

   <div class="pt-4">
		<!-- <div class="navbar max-w-[1300px] px-4 py-2 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100
          
          relative z-0 before:bg-gradient-to-r before:from-error before:to-warning before:absolute before:left-0 before:top-0 before:w-full before:h-full before:z-[-1] before:[transform:translate3d(0px,14px,0)_scale(0.97)] before:blur-[9px] before:opacity-10 before:transition-opacity before:duration-300 before:[border-radius:inherit]
   after:absolute after:left-0 after:top-0 after:w-full after:h-full after:z-[-1] after:[background:inherit] after:[border-radius:inherit]

          "> -->
          {#if name}
          <div class="">Pool name: {name}</div>
        {/if}


    <div class="navbar max-w-[1300px] px-4 py-3 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100 shadow-red-100 dark:shadow-red-500/30 shadow-md">
		  <div class="flex flex-wrap w-full gap-4 justify-between items-center">

        <div class="flex items-center gap-4">
          <span class="sr-only">{name}</span>
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
              <RpcControl rpcs={rpcs} selectedRpc={selectedRpc} customRpc={customRpc} />
            </div>
          </div>

        </div>
		  </div>
		</div>
  </div>


<style></style>
