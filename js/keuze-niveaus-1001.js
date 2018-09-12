/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */

function efiberZetNiveauKnop(knop) {

	const kzSectie = kzVindSectie(knop);

	const stap = kzSectie.dataset.keuzehulpStap;
	
	//uitsluiten bepaalde
	if (['2'].includes(stap)) return;	

	const stappenLinksStap = doc.getElementById(`stappen-links-${stap}`);
	stappenLinksStap.getElementsByClassName('stappen-links_klaar')[0].style.display = "inline-block";
	stappenLinksStap.getElementsByClassName('stappen-links_niet-klaar')[0].style.display = "none";
	stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.opacity = "1";

	const print = stappenLinksStap.getElementsByClassName('stappen-links_vervangende-tekst')[0];
	print.style.display = "block";

	console.log(kzSectie);
	print.innerHTML = Array.from(kzSectie.querySelectorAll('.actief.knop'), knop => {
		console.log(knop);
		let combiKnop = kzVindCombiKnop(knop);
		let html = combiKnop.querySelector('.kz-knop-combi_rechts-boven span').innerHTML;
		return `<span>${html}</span>`;	
	}).join('<br>');

}

