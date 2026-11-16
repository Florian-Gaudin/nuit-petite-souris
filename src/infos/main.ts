// Informations : confidentialité, mentions légales, accessibilité
import '../styles/style.css';
import './infos.css';
import { activerHorsLigne } from '../lib/horsLigne';
import { pleinEcranAuPremierToucher } from '../lib/pleinEcran';
pleinEcranAuPremierToucher(); // au premier toucher, sauf si décoché dans les réglages
import { activerTypographie } from '../lib/typographie';
activerTypographie(); // une espace insécable devant ! et ?
import { EMAIL_CONTACT } from '../lib/contact';

activerHorsLigne();
if (EMAIL_CONTACT) document.querySelectorAll<HTMLElement>('.contact').forEach(el => {
  el.innerHTML = '';
  const a = document.createElement('a'); a.href = 'mailto:' + EMAIL_CONTACT; a.textContent = EMAIL_CONTACT;
  el.append(a);
});
