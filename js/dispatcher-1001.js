
/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */
function knoppenDispatcher() {
	/*------------------------------------------------------
	|
	|	een knop (class='knop') kan 0 tot n functies hebben
	|	data-efiber-func='efiber-stap-terug efiber-drink-koffie'
	|	doet: knoppenFuncs['efiberStapTerug'](knop) en
	|	knoppenFuncs['efiberDrinkKoffie'](knop)
	|	met de knop dus als parameter.
	|
	|	Het nut van deze dispatcher zit er in dat pas op het moment dat de daadwerkelijke
	| 	klik gedaan wordt, en deze dus aankomt bij de body, de functie wordt aangeroepen.
	| 	Het eea. is dus niet HTML of JS-volgorde afhankelijk, louter van of de body bestaat als
	| 	deze dispatcherfunctie wordt gedraaid.
	|
	| 	In principe stuur de dispatcher alleen aan maar voor zeer kleine functies is een uitzondering gemaakt.
	|
	|-----------------------------------------------------*/


	body.addEventListener('click', (e) => {
		const t = e.target,

		 knop = efiberVindKnop(t, 'knop');
		if (knop) {
			e.preventDefault();

			if (
				!knop.hasAttribute('data-efiber-func')
				|| knop.className.indexOf('invalide') !== -1
			) return;


			const funcAttr = knop.getAttribute('data-efiber-func').trim();

			// efiberModal(funcAttr, 2500);

			if (!funcAttr || typeof funcAttr === 'undefined') {
				console.error('funcAttr undefined');
				console.log(knop);
				return false;
			}

			// zijn het er één of meer?
			let funcs = [];
			if (funcAttr.indexOf(' ') !== '') {
				funcs = funcAttr.split(' ');
			} else {
				funcs = [funcAttr];
			}

			for (let i = 0; i < funcs.length; i++) {
				const funcNaam = naarCamelCase(funcs[i]);
				if (knoppenFuncs[funcNaam]) {
					knoppenFuncs[funcNaam](knop);
				} else {
					console.log('geen knop func gedefinieerd', funcNaam);
				}
			}
		} else {
			// kan ieder willekeurig ander element zijn geweest.
		}
	});
}

var knoppenFuncs = {

	// zie knoppendispatcher

	toonStap(knop) {
		efiberRouting.ga(knop.href.split('#')[1]);
	},
	animeer(knop) {
		if (knop.className.indexOf('actief') !== -1) {
			// als multiselect, verwijder dan klasse.
			if (knop.className.indexOf('multiselect') !== -1) {
				knop.className = knop.className.replace('actief', '').trim();
			} else {
				// als geen multiselect, dan is dit een bevestiging van de keuze, dus geen actie
			}
		} else {
			// als geen multiselect
			// dan dienen andere knoppen nu geen actief meer te hebben
			if (knop.className.indexOf('multiselect') === -1) {
				const knoppen = knop.parentNode.getElementsByClassName('knop');

				for (let i = knoppen.length - 1; i >= 0; i--) {
					knoppen[i].className = knoppen[i].className.replace('actief', '').trim();
				}
			}

			// tenslotte actief op knop zelf toevoegen.
			knop.className += ' actief';
		}
	},
	stapTerug(knop) {
		efiberRouting.stapTerug();
	},
	leegKeuzehulp() {
		sessionStorage.setItem('efiber-keuzehulp', JSON.stringify({}));
	},
	zetNiveauKnop(knop) {
		efiberZetNiveauKnop(knop);
	},
	zetSituatie(knop) {
		const s = knop.getAttribute('data-efiber-situatie-keuze');

		keuzehulpGeneriek(knop, 'data-efiber-situatie-keuze', 'situatie', () => {
			body.setAttribute('data-efiber-situatie-keuze', s);
		});

		eFiberSluitRoutesUit(naarCamelCase(s));

		// dit is de eerste keuze waar je langs komt als je
		// van IWWIW komt en vervolgens naar de keuzehulp gaat.
		// in het aanmeldformulier is het bestaan van die sleutel en test of je daarvandaan komt
		// dus hier weghalen
		const kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
		if ('ik-weet-wat-ik-wil' in kh) {
			delete kh['ik-weet-wat-ik-wil'];
			sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(kh));
		}
	},
	haalZakelijkFormulier() {
		EfiberAjaxKleineFormulieren('efiber_haal_zakelijk_formulier', 'print-zakelijk-formulier', { gebiedscode: sessionStorage.getItem('efiber-gebiedscode') });
	},
	zetKeuzeInternet(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-internet-keuze', 'internet');
	},
	zetNummersConsequentie(knop) {
		const k = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));

		if ('situatie' in k) {
			if (k.situatie === 'kleinZakelijk') {
				eFiberSluitRoutesUit('nummersZakelijk');
			} else {
				eFiberSluitRoutesUit('nummersParticulier');
			}
		} else {
			eFiberSluitRoutesUit('nummersParticulier');
		}
	},
	zetKeuzeBellen(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-bellen-keuze', 'bellen');
	},
	zetKeuzeNummers(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-nummers-keuze', 'nummers');
	},
	zetKeuzeTelevisie(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-televisie-keuze', 'televisie');
	},
	zetKeuzeTelevisieOpties(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-televisie-opties-keuze', 'televisie-opties');
	},
	zetKeuzeBekabeling(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-bekabeling-keuze', 'bekabeling');
	},
	zetKeuzeInstallatie(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-installatie-keuze', 'installatie');
	},
	zetKeuzeIkWeetWatIkWil(knop) {
		keuzehulpGeneriek(knop, 'data-efiber-ik-weet-wat-ik-wil-keuze', 'ik-weet-wat-ik-wil');
	},

	laadIkWeetWatIkWilPakketten() {
		ikWeetWatIkWilPakkettenAjax();
	},

	vergelijking() {
		vergelijkingAjax();
	},

	aanmeldformulier(knop) {
		// aanmeldformulier.js
		haalPrintAanmeldformulier(knop);
	},
	zakelijkFormulier() {
		efiberHaalZakelijkFormulier();
	},

	aanmeldingSchakel(knop) {
		if (knop.className.indexOf('radio') !== -1) {
			// aanmeldformulier.js
			efiberSchakelRadio(knop);
		} else if (knop.className.indexOf('checkbox') !== -1) {
			// aanmeldformulier.js
			efiberSchakelCheckbox(knop);
		} else if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number') {
			// aanmeldformulier.js
			efiberSchakelNumber(knop);
		} else {
			console.warn('formulier schakel func onbekend');
		}
	},
	belpakketten(knop) {
		// aanmeldformulier.js
		efiberBelpakketten(knop);
	},
	extraVastNummer(knop) {
		// aanmeldformulier.js
		efiberExtraVastNummer(knop);
	},
	foxSports() {
		// aanmeldformulier.js
		efiberFoxSports();
	},
	formToonRij(knop) {
		// aanmeldformulier.js
		efiberToonRij(knop);
	},
	updateHidden() {
		// aanmeldformulier.js
		efiberUpdateHidden();
	},
	verwijderModal() {
		efiberVerwijderModal();
	},
	verstopKeuzeNiveaus() {
		doc.getElementById('sticky-keuzes').style.display = 'none';
	},
	toonMeerPakket() {
		const secties = doc.getElementById('print-vergelijking').getElementsByClassName('efiber-form-sectie');

		for (let i = 1; i < secties.length; i++) {
			// tweede sectie verwijderen
			if (i === 1) {
				secties[i].parentNode.removeChild(secties[i]);
			} else {
				secties[i].style.display = 'block';
			}
		}

		$('.Aanvullende-informatie').css({ display: 'flex' });
	},
};
