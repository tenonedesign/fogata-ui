<script>
	import Toasts from "$lib/Toasts.svelte";
	import "../app.postcss";
    import './styles.css';
</script>

<div class="app">
	<main>
		<slot></slot>
	</main>

	<footer>
	</footer>

	<Toasts />
</div>

<style>
</style>
