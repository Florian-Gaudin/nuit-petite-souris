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
    <a class="btn btn-don" href={LIEN_DON} target="_blank" rel="noopener"><span aria-hidden="true">🧀</span> Offrir un goûter à Quenotte</a>
  </section>
{/if}

<style>
  /* Le bouton de don : rouge de l'écharpe de Quenotte, texte blanc, police arrondie */
  .btn-don {
    display: inline-flex; align-items: center; gap: 8px; min-height: 52px; padding: 0 22px; border-radius: 999px;
    background: #b8323a !important; color: #fff !important; border: 2px solid #fff !important; box-shadow: 0 4px 0 #7f1f26 !important;
    font: 800 1.1rem 'Baloo 2', 'Comic Sans MS', sans-serif; text-decoration: none;
  }
  .btn-don:hover, .btn-don:focus-visible { background: #a22b33 !important; outline: 3px solid #FFC857; outline-offset: 2px; }
</style>
