<script lang="ts">
	import { spring } from 'svelte/motion';
  import { CaretUpSharp, CaretDownSharp } from 'svelte-ionicons';

	export let duration = 60;

	let _value = 0;
	let d: number;
	let h: number;
	let m: number;
	let s: number;
	

	$: duration = (d || 0) * 3600 * 24 * 1000 + (h || 0) * 3600 * 1000 + (m || 0) * 60 * 1000 + (s || 0) * 1000;

	function watchValue(val: number) {
		d = timeComponents(val).days;
		h = timeComponents(val).hours;
		m = timeComponents(val).minutes;
		s = timeComponents(val).seconds;
	}
	$: watchValue(duration);

	function timeComponents(ms: number): {days: number, hours: number, minutes: number, seconds: number} {
    var d = Math.floor(ms / (3600 * 24 * 1000));
    var h = Math.floor(ms % (3600 * 24 * 1000) / (3600 * 1000));
    var m = Math.floor(ms % (3600 * 1000) / (60 * 1000));
    var s = Math.floor(ms % (60 * 1000));
    return {days: d, hours: h, minutes: m, seconds: s};
  }

	function noNegativeString(event: any) {
		return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))
	}

</script>


<div class="flex flex-wrap sm:flex-nowrap gap-3 justify-center">


	<div class="flex items-center gap-1">
		<div class="form-control min-w-[48px] max-w-[48px] sm:max-w-none">
			<input id="d" bind:value={d} type="number" min="0" on:keypress={noNegativeString} placeholder="0" class="input input-sm input-bordered text-center w-full" />
		</div>
		<div class="flex flex-col">
			<button on:click={() => (d += 1)} aria-label="One less day"><CaretUpSharp size="12" /></button>
			<button on:click={() => (d = Math.max(d-1, 0))} aria-label="One less day"><CaretDownSharp size="12" /></button>		
		</div>
		<div class="text-sm">Days</div>
	</div>

	<div class="flex items-center gap-1">
		<div class="form-control min-w-[48px] max-w-[48px] sm:max-w-none">
			<input bind:value={h} type="number" min="0" on:keypress={noNegativeString} placeholder="0" class="input input-sm input-bordered text-center w-full" />
		</div>
		<div class="flex flex-col">
			<button on:click={() => (h += 1)} aria-label="One more hour"><CaretUpSharp size="12" /></button>
			<button on:click={() => (h = Math.max(h-1, 0))} aria-label="One less hour"><CaretDownSharp size="12" /></button>		
		</div>
		<div class="text-sm">Hrs</div>
	</div>

	<div class="flex items-center gap-1">
		<div class="form-control min-w-[48px] max-w-[48px] sm:max-w-none">
			<input bind:value={m} type="number" min="0" on:keypress={noNegativeString} placeholder="0" class="input input-sm input-bordered text-center w-full" />
		</div>
		<div class="flex flex-col">
			<button on:click={() => (m += 1)} aria-label="One less minute"><CaretUpSharp size="12" /></button>
			<button on:click={() => (h = Math.max(h-1, 0))} aria-label="One less minute"><CaretDownSharp size="12" /></button>		
		</div>
		<div class="text-sm">Mins</div>
	</div>

	<!-- <div class="flex items-center gap-2">
		<div class="form-control w-12">
			<label for="s" class="label">
				<span class="label-text">Secs</span>
			</label>
			<input bind:value={s} type="number" placeholder="0" class="input input-sm input-bordered" />
		</div>
		<div class="">Days</div>
	</div> -->



</div>

<style>

input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
		appearance: none;
		margin: 0 0 0 -5px;
}

</style>
