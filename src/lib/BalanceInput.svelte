<script lang="ts">
	import { utils } from "koilib";

	export let value: bigint = BigInt(0);
	export let valid: boolean = true;
	let humanValue: string;
	let humanInput: any;


	// monitor value from parent
	function watchValue(val: bigint) {
    humanValue = utils.formatUnits(val, 8);
	}
	watchValue(value);
	$: watchValue(value);

	// monitor value from this input
	$: value = BigInt(utils.parseUnits((humanInput?.validity?.valid ? humanValue : "0"), 8)); 
	$: valid = Boolean(humanValue) ? Boolean(humanInput?.validity?.valid) : true;

</script>

<input bind:value={humanValue} bind:this={humanInput} type="text" size="1" pattern="[0-9.]+" placeholder="0" class="thisinput input input-bordered input-primary min-w-[150px] flex-1 invalid:bg-red-100" />

<style></style>
