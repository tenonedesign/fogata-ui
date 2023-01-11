<script lang="ts">
  export let faqs: {q: string, a: string}[] = [];
</script>
  
{#each faqs as faq}
  <div tabindex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mt-2">
    <div class="collapse-title text-xl font-medium">
      {faq.q}
    </div>
    <div class="collapse-content"> 
      <p>{faq.a}</p>
    </div>
  </div>
{/each}

  
<style></style>