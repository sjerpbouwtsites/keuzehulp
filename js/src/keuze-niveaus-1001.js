/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */

/* LEGACY NAAM! */
function kzZetNiveauKnop(knop) {
	/*--------------------------------------------------
	|
	|	knoppen zijn keuzenmenuknoppen.
	| 	de secties zijn de pagina's van de keuzehulp
	| 	zodra naar een niveau wordt gegaan wordt de knop in de navigatie actief / klikbaar en krijgt
	| 	het de waarde van de keuze eronder geprint.
	|
	|**************************************************/
	const kzSectie = kzVindSectie(knop);

	const stap = kzSectie.dataset.keuzehulpStap;
	
	// uitsluiten bepaalde
	// als array zodat makkelijk meer kunnen worden toegevoegd
	if (['2'].includes(stap)) return;	

	const stappenLinksStap = doc.getElementById(`stappen-links-${stap}`);
	stappenLinksStap.parentNode.style.display = "block";
	stappenLinksStap.classList.remove('invalide');
	stappenLinksStap.getElementsByClassName('stappen-links_klaar')[0].style.display = "inline-block";
	stappenLinksStap.getElementsByClassName('stappen-links_niet-klaar')[0].style.display = "none";
	stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.opacity = "1";
	stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.fontWeight = "600";

	const print = stappenLinksStap.getElementsByClassName('stappen-links_vervangende-tekst')[0];
	print.style.display = "block";


	print.innerHTML = Array.from(kzSectie.querySelectorAll('.actief.knop'), knop => {
		const combiKnop = kzVindCombiKnop(knop);
		const s = combiKnop.querySelector('.kz-knop-combi_rechts-boven span');
		const ss = s.getElementsByTagName('strong');
		let html;
		if (ss.length) { // strong aanwezig? dan html uit strong halen. 
			html = ss[0].innerHTML;
		} else {
			html = s.innerHTML;
		}

		return `<span>${html}</span>`;	
	}).join('<br>');

}

