/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */

/* LEGACY NAAM! */
function efiberZetNiveauKnop(knop) {

	const kzSectie = kzVindSectie(knop);

	const stap = kzSectie.dataset.keuzehulpStap;
	
	//uitsluiten bepaalde
	if (['2'].includes(stap)) return;	

	const stappenLinksStap = doc.getElementById(`stappen-links-${stap}`);
	stappenLinksStap.style.display = "block";
	stappenLinksStap.classList.add('knop');
	stappenLinksStap.getElementsByClassName('stappen-links_klaar')[0].style.display = "inline-block";
	stappenLinksStap.getElementsByClassName('stappen-links_niet-klaar')[0].style.display = "none";
	stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.opacity = "1";

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

