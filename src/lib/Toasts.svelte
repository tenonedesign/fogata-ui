
<script lang="ts">
  // import Toast from "$lib/Toasts.svelte";
  import { toasts } from '$lib/stores';

  import { CloseOutline as CloseIcon } from 'svelte-ionicons';
  import { CheckmarkCircleOutline as SuccessIcon } from 'svelte-ionicons';
  import { InformationCircleOutline as InfoIcon } from 'svelte-ionicons';
  import { WarningOutline as WarnIcon } from 'svelte-ionicons';
  import { CloseCircleOutline as ErrorIcon } from 'svelte-ionicons';
	import { removeToastWithId } from '$lib/utils';
	import { fade, fly, slide } from 'svelte/transition';


  // successToast("Success title", "Message is message and message and the message", 1000);
  // infoToast("Info title", "Message is message and message and the message", 1000);
  // errorToast("Error title", "Message is message and message and the message", 1000);
</script>

<div class="toast toast-start gap-0">
  {#each $toasts as toast, i (toast)}
      <div transition:slide={{duration:500}} class="flex rounded-2xl mt-2 items-center text-sm gap-1 p-2 md:gap-4 md:p-4 md:text-base shadow-lg {toast.classes()}">
        {#if toast.type == "success"} <SuccessIcon size="24" /> {/if}
        {#if toast.type == "info"} <InfoIcon size="24" /> {/if}
        {#if toast.type == "warning"} <WarnIcon size="24" /> {/if}
        {#if toast.type == "error"} <ErrorIcon size="24" /> {/if}
        <div class="flex flex-col flex-1 gap-0 items-start max-w-md">
          <div class="w-full break-words text-wrap text font-semibold">{@html toast.title}</div>
          <div class="w-full break-words text-wrap">{@html toast.message}</div>
        </div>

        <div class="flex-none">
          <button on:click={() => { removeToastWithId(toast.id); }} class="btn btn-sm btn-ghost">Close</button>
          <!-- <button class="btn btn-sm btn-primary">Accept</button> -->
        </div>
        <!-- <button on:click={() => { removeToastWithId(toast.id); }} class="btn btn-circle btn-ghost btn-base absolute top-1 right-1 h-8 min-h-8 w-8"><CloseIcon size="24" /></button> -->
      </div>

  {/each}
</div>

<style></style>
