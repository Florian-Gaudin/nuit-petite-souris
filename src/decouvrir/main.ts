// La page « Découvrir » : la vidéo de présentation, l'accès à l'appli, le partage (menu du téléphone,
// WhatsApp, e-mail, Facebook, copie du lien) et un QR code à imprimer.
import '../styles/style.css';
import './decouvrir.css';
import { activerTypographie } from '../lib/typographie';
import { pleinEcranAuPremierToucher } from '../lib/pleinEcran';
pleinEcranAuPremierToucher(); // au premier toucher, sauf si décoché dans les réglages
import { svgQr } from '../lib/qr';
import { LIEN_DON, donPossible } from '../lib/don';
activerTypographie();

// L'adresse de cette page, sans le reste (#…, ?…) : celle que l'on partage
const page = location.origin + location.pathname;
const titre = 'La nuit de la Petite Souris';
const message = "Quand une dent de lait tombe, Quenotte, la Petite Souris des Ardennes, vient la chercher… Une histoire interactive et personnalisée pour votre enfant, gratuite et sans publicité. La vidéo est ici :";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const copie = $<HTMLParagraphElement>('copie');

// Les liens de partage directs (aussi utiles sur ordinateur, où le menu du téléphone n'existe pas)
$<HTMLAnchorElement>('wa').href = 'https://wa.me/?text=' + encodeURIComponent(message + ' ' + page);
$<HTMLAnchorElement>('mail').href = 'mailto:?subject=' + encodeURIComponent(titre) + '&body=' + encodeURIComponent(message + '\n' + page);
$<HTMLAnchorElement>('fb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(page);

async function copier() {
  try { await navigator.clipboard.writeText(page); copie.textContent = 'Lien copié : il ne reste qu\'à le coller dans un message.'; }
  catch { copie.textContent = 'Le lien de la page : ' + page; }
}
$<HTMLButtonElement>('copier').onclick = copier;

// Le bouton principal : le menu de partage du téléphone s'il existe, sinon la copie du lien
$<HTMLButtonElement>('partager').onclick = async () => {
  if (navigator.share) {
    try { await navigator.share({ title: titre, text: message, url: page }); return; }
    catch (e) { if ((e as Error).name === 'AbortError') return; }
  }
  copier();
};

// Le QR code de cette page
$<HTMLDivElement>('qr').innerHTML = svgQr(page);

// Le don, comme dans l'espace parents
if (donPossible()) { $<HTMLElement>('don').hidden = false; $<HTMLAnchorElement>('lien-don').href = LIEN_DON; }
