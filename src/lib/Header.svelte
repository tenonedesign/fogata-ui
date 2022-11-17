<script>
	import logo from '$lib/images/logo.svg';
	import Provider from '$lib/Provider.svelte';
  import { SettingsSharp } from 'svelte-ionicons';

  export let name = ""
</script>

   <!-- relative z-0 before:bg-gradient-to-r before:from-error before:to-warning before:absolute before:left-0 before:top-0 before:w-full before:h-full before:z-[-1] before:[transform:translate3d(0px,14px,0)_scale(0.97)] before:blur-[9px] before:opacity-70 before:transition-opacity before:duration-300 before:[border-radius:inherit]
   after:absolute after:left-0 after:top-0 after:w-full after:h-full after:z-[-1] after:[background:inherit] after:[border-radius:inherit] -->

   <div class="pt-4">
		<!-- <div class="navbar max-w-[1300px] px-4 py-2 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100
          
          relative z-0 before:bg-gradient-to-r before:from-error before:to-warning before:absolute before:left-0 before:top-0 before:w-full before:h-full before:z-[-1] before:[transform:translate3d(0px,14px,0)_scale(0.97)] before:blur-[9px] before:opacity-10 before:transition-opacity before:duration-300 before:[border-radius:inherit]
   after:absolute after:left-0 after:top-0 after:w-full after:h-full after:z-[-1] after:[background:inherit] after:[border-radius:inherit]

          "> -->
    <div class="navbar max-w-[1300px] px-4 py-2 sm:px-6 sm:py-4 lg:py-4 mx-auto rounded-[20px] bg-base-100 shadow-red-100 dark:shadow-red-500/30 shadow-md">
		  <div class="flex-1 justify-between items-center">
        <div class="flex gap-4 items-center gap-4">
          <!-- <span class="sr-only">{name}</span> -->
          <img src={logo} alt="VHP Miner" class="h-10 w-auto sm:h-14"/>
          {#if name}
            <div class="">Pool name: {name}</div>
          {/if}
        </div>
        <div class="flex gap-4">





          <Provider />

          <div class="dropdown dropdown-end ">
            <button class="btn btn-outline hidden lg:flex">
              <SettingsSharp size="24" />
            </button>
            <div tabindex="0" class="dropdown-content menu mt-2 p-2 shadow bg-base-100 rounded-box w-52">
              <li><button>Item 1</button></li>
              <li><button>Item 2</button></li>
            </div>
          </div>

        </div>
		  </div>
		</div>
  </div>


<style></style>
