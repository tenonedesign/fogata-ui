<script lang="ts">
  export let faqs: {q: string, a: string}[] = [];
</script>

{#each faqs as faq}
  <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mt-2">
    <input type="checkbox" /> 
    <div class="collapse-title text-l font-medium">
      {faq.q}
    </div>
    <div class="collapse-content"> 
      <p>{faq.a}</p>
    </div>
  </div>
{/each}

  
<style></style>