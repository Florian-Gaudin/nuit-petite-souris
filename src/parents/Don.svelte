<script lang="ts">
  // Un petit don pour l'appli : gratuite pour toutes les familles, elle vit grâce à ceux qui le peuvent
  import { LIEN_DON, donPossible } from '../lib/don';
</script>

{#if donPossible()}
  <section class="don carte" id="don">
    <h2><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#D64045"/></svg>Un petit coup de pouce ?</h2>
    <p>
      Cette appli est gratuite, sans publicité, et le restera pour toutes les familles.
      Si elle a fait briller les yeux de votre enfant, vous pouvez soutenir son créateur d'un petit don :
      il aide Quenotte à continuer ses voyages. Merci du fond du cœur !
    </p>
    <a class="btn btn-or" href={LIEN_DON} target="_blank" rel="noopener">Faire un don</a>
  </section>
{/if}
