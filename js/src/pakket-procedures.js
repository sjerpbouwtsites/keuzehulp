
function iwwiwProcedure(pakket) {
	// zet opties voor in iwwiwprocedure
	// omdat bv geen snelheidskeuze bekend is,
	// stellen we hier de laagste standaard in.
	// idem installatie

	const laagsteSnelheid = pakket.eigenschappen.snelheden
	.reduce((nieuweWaarde, huidigeWaarde) => (nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde), 1000000);

	pakket.mutatie(`snelheid-${laagsteSnelheid}`, 1);
	pakket.huidige_snelheid = laagsteSnelheid;

	const installatieStr = pakket.eigenschappen.eenmalig['installatie-dhz'] ? 'dhz' : pakket.eigenschappen.eenmalig['installatie-basis'] ? 'basis' : 'volledig';

	pakket.mutatie(`installatie-${installatieStr}`, 1);

	// zitten we op een belpakket? dan basis aanzetten.
	const kz = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
	 isBelKeuze = kz['ik-weet-wat-ik-wil'] === '2' || kz['ik-weet-wat-ik-wil'] === '4';

	if (isBelKeuze && pakket.heeftTelefonieBereik('basis')) {
		pakket.alleTelefonieBundelsUit();
		pakket.zetTelefonieBereikAan('basis', 1);
	}

	// zet pakketten in window om later te laden.
	window[`kz-pakket-${pakket.ID}`] = pakket;

	return pakket;
}

function vergelijkingsProcedure(pakket, keuzehulp) {


	if (typeof keuzehulp === 'undefined') {
		console.warn('keuzehulp undefined!');
		keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
	}

	// schrijf de bel & nummer keuze.
	// bellen = 1 							-> niet bellen.
	// bellen = 2 							-> basispakket.
	// bellen = 3 							-> NL pakket.
	// bellen = 3 + '2' in nummers-array 	-> Internationaal pakket.

	if (keuzehulp.bellen === '1') {
		pakket.alleTelefonieBundelsUit();
	} else if (keuzehulp.bellen === '2') {
		// zou altijd basispakket moeten hebben,
		// anders zijn verkeerde pakketten in PHP meegegeven!
		if (pakket.heeftTelefonieBereik('basis')) {
			pakket.zetTelefonieBereikAan('basis');
		}
	} else if (keuzehulp.bellen === '3') {
		if (keuzehulp.nummers && keuzehulp.nummers.indexOf('2') !== -1) {
			if (pakket.heeftTelefonieBereik('internationaal')) {
				pakket.zetTelefonieBereikAan('internationaal');
			} else if (pakket.heeftTelefonieBereik('nederland')) {
				pakket.zetTelefonieBereikAan('nederland');
			} else if (pakket.heeftTelefonieBereik('basis')) {
				pakket.zetTelefonieBereikAan('basis');
			}
		} else if (pakket.heeftTelefonieBereik('nederland')) {
				pakket.zetTelefonieBereikAan('nederland');
			} else if (pakket.heeftTelefonieBereik('basis')) {
				pakket.zetTelefonieBereikAan('basis');
			}
	} else {
		console.warn('onvoorziene situatie telefonie afhandeling vergelijkingsprocedure');
		pakket.alleTelefonieBundelsUit();
	}

	if (keuzehulp.nummers && keuzehulp.nummers.indexOf('1') !== -1) {
		pakket.mutatie('extra-vast-nummer', 1);
	} else {
		pakket.mutatie('extra-vast-nummer', 0);
	}

	// schrijf de snelheid naar het pakket.
	const snelheden = pakket.eigenschappen.snelheden;
	let gekozenSnelheid = false;
	snelheden.forEach((snelheid) => {
		const s = Number(snelheid);
		if (!gekozenSnelheid) {
			if (
				(keuzehulp.internet === '1' && s < 251)
				|| (keuzehulp.internet === '2' && s < 501)
				|| ((keuzehulp.internet === '3' || keuzehulp.internet === '4') && s > 501)) {
				gekozenSnelheid = snelheid;
			}
		}
	});

	// dan met de hand toewijzen.
	if (!gekozenSnelheid) {
		if (keuzehulp.internet.includes('1')) {

			gekozenSnelheid = snelheden[0];	

		} else if (keuzehulp.internet.includes('2')) {

			if (snelheden.length > 1){
				gekozenSnelheid = snelheden[1];	
			} else {
				gekozenSnelheid = snelheden[0];	
			}

		} else {
			gekozenSnelheid = snelheden[snelheden.length - 1];	
		}
		
	}

	const ss = gekozenSnelheid.toString();

	pakket.veranderSnelheid(ss);

	// schrijf TV opties.
	if (keuzehulp['televisie-opties']) {
		const telOpts 		= keuzehulp['televisie-opties'],
		film1Fam 			= pakket.vindOpties({suboptietype: 'Film1', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid}),
		PlusFam 			= pakket.vindOpties({suboptietype: 'Plus', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid}),
		ZiggoSportFam 		= pakket.vindOpties({suboptietype: 'ZiggoSportTotaal', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid});

		let fsEdOptieFam 	= pakket.vindOpties({suboptietype: 'FoxSportsEredivisie', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid}),
		fsIntOptieFam 		= pakket.vindOpties({suboptietype: 'FoxSportsInternationaal', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid}),
		fsComplOptieFam 	= pakket.vindOpties({suboptietype: 'FoxSportsCompleet', tvType: pakket.eigenschappen.tv_type, snelheid: gekozenSnelheid});

		const telOptMap 	= [fsEdOptieFam, ZiggoSportFam, fsIntOptieFam, PlusFam, film1Fam];

		// aanname: alleen maandelijks
		telOptMap.forEach((familie, nummer) => {
			const telOptNr = nummer + 1;
			if (telOpts.includes(telOptNr.toString())) {

				familie.forEach( ([sleutel, optie]) => pakket.mutatie(sleutel, 1));
				//familie.mOpties.forEach(optie => pakket.mutatie(optie.sleutel, 1));

			}
		});


		if (pakket.optieBestaat('extra-tv-ontvangers')) {
			const etoPrijs = pakket.optiePrijs('extra-tv-ontvangers');
			if (telOpts.includes('6')
				&& (etoPrijs.mp || etoPrijs.ep)) {
				pakket.mutatie('extra-tv-ontvangers', 1);
			}
		}


		// fox sport compleet?
		// als allebei gekozen & foxsportscompleet bestaat...
		// aanname: maar één opties binnen al die pakketten.

		if (fsEdOptieFam.length
			&& fsIntOptieFam.length
			&& fsComplOptieFam.length) {
			if (fsEdOptieFam[0][1].aantal
				&& fsIntOptieFam[0][1].aantal) {

				pakket.mutatie(fsEdOptieFam[0][0], 0);
				pakket.mutatie(fsIntOptieFam[0][0], 0);
				pakket.mutatie(fsComplOptieFam[0][0], 1);

			}
		}
	}

	if (keuzehulp.televisie === '3') {
		pakket.mutatie('opnemen', 1);
		pakket.mutatie('replay', 1);
		pakket.mutatie('begin-gemist', 1);
		pakket.mutatie('opnemen-replay-begin-gemist-samen', 1);
	}

	const inst = keuzehulp.installatie;

	if (inst === '3') {
		if (pakket.optieBestaat('installatie-volledig')) {
			pakket.mutatie('installatie-volledig', 1);
		} else if (pakket.optieBestaat('installatie-basis')) {
			pakket.mutatie('installatie-basis', 1);
		} else {
			pakket.mutatie('installatie-dhz', 1);
		}
	} else if (inst === '2') {
		if (pakket.optieBestaat('installatie-basis')) {
			pakket.mutatie('installatie-basis', 1);
		} else if (pakket.optieBestaat('installatie-volledig')) {
			pakket.mutatie('installatie-volledig', 1);
		} else {
			pakket.mutatie('installatie-dhz', 1);
		}
	} else if (pakket.optieBestaat('installatie-dhz')) {
			pakket.mutatie('installatie-dhz', 1);
		} else if (pakket.optieBestaat('installatie-basis')) {
			pakket.mutatie('installatie-basis', 1);
		} else {
			pakket.mutatie('installatie-volledig', 1);
		}


	// zet pakketten in window om later te laden.
	window[`kz-pakket-${pakket.ID}`] = pakket;

	return pakket;
}
