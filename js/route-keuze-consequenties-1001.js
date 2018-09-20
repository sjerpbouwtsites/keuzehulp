/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
// hierin staan gedefinieerd, per stap
// welkle opties wèl getoond worden.
// let op: het veranderen van de volgorde van de knoppen heeft consequenties.

keuzeConsequenties = {
	kleinHuishouden: {
		internet: [1, 2, 3],
	},
	gezin: {
		internet: [2, 3],
	},
	kleinZakelijk: {
		internet: [1, 2, 4],
	},
	bedrijf: {},
	nummersParticulier: {
		nummers: [2],
	},
	nummersZakelijk: {
		nummers: [1, 2],
	},
};


function kzSluitRoutesUit(keuze) {
	if (!(keuze in keuzeConsequenties)) {
		console.error('keuze consequentie onbekend');
		console.trace();
		return;
	}

	const consequentie = keuzeConsequenties[keuze];

	let config,
		i,
		sectie,
		sectieTitel,
		selector,
		titelNormaleSpelling;


	for (sectieTitel in consequentie) { // internet, bellen, televisie etc
		titelNormaleSpelling = naarStreepCase(sectieTitel);

		// dit pakt de knoppen op volgorde van links naar rechts in de secties;
		// zo komt het overeen met het plan van Gaby en evt. aanpassingen daarin.

		selector = `[data-kz-${titelNormaleSpelling}-keuze]`;

		sectieKnoppen = doc.querySelectorAll(selector);

		if (sectieKnoppen.length) {
			// alles op display none

			for (i = 0; i < sectieKnoppen.length; i++) {
				kzVindCombiKnop(sectieKnoppen[i]).style.display = 'none';
			}

			config = consequentie[titelNormaleSpelling];

			for (i = 0; i < config.length; i++) {

				let sel = `[data-kz-${titelNormaleSpelling}-keuze='${config[i]}']`;
				let knop = doc.querySelector(sel);
				if (knop) {
					kzVindCombiKnop(knop).style.display = 'flex';
				} else {
					console.log(new Error('niet gevonden op index ', config[i]));
				}

			}
		} else {
			console.error(`sectie niet gevonden ${sectieTitel}`);
		}
	}
}

