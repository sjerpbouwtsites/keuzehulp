/* globals doc, location, uniek, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */


function kzPakPakket(getal) {
	/*----------------------------------
	|
	| 	Wordt nergens gebruikt - louter voor tijdens debuggen direct in console
	|
	|---------------------------------*/	
	return window[`kz-pakket-${getal}`];
}

function VerrijktPakket(p) {
	/*------------------------------------------------------
	|
	| 	Wat binnenkort is een bewerkt post-object
	| 	Maakt er een soort kassasysteem van.
	|
	|-----------------------------------------------------*/

	Object.entries(p).forEach(([k, w]) => {
		this[k] = w;
	});

	this.generiekTotaal = (soortTotaal, formatteren = false) => {
		/*------------------------------------------------------
		|
		| 	Geeft totalen terug van eenmalige of maandelijkse kosten
		| 	Al dan niet geformatteerd of als getal.
		|
		|-----------------------------------------------------*/

		const t = Object.entries(this.eigenschappen[soortTotaal])
			.map(([optieNaam, optieWaarde]) => optieWaarde)
			.reduce((totaal, optie) => totaal + (optie.aantal * optie.prijs), 0);

		return formatteren ? this.formatteerPrijs(t) : t;
	};


	// Voorkant voor generiektotaal
	this.eenmaligTotaal = formatteren => this.generiekTotaal('eenmalig', formatteren);


	// Voorkant voor generiektotaal
	this.maandelijksTotaal = formatteren => this.generiekTotaal('maandelijks', formatteren);


	// Voorkant voor borgtotaal
	this.borgTotaal = formatteren => this.generiekTotaal('borg', formatteren);


	// Maakt van Amerikaans getal europese prijs.
	// @TODO als 0 dan 'gratis' of 'inclusief'
	this.formatteerPrijs = prijs => `<span class='euro'>&euro;</span>${Number(prijs).toFixed(2).replace('.', ',')}`;


	this.printPrijzen = (formatteer = true) => {
		/*------------------------------------------------------
		|
		| 	Geeft totalen terug van eenmalige of maandelijkse kosten
		| 	Al dan niet geformatteerd of als getal.
		|
		|-----------------------------------------------------*/
		['maandelijks', 'eenmalig', 'borg'].forEach((prijsCat) => {
			const printHier = document.getElementsByClassName(`${prijsCat}-totaal`);
			Array.from(printHier).forEach((printPlek) => {
				printPlek.innerHTML = this.generiekTotaal(prijsCat, formatteer);
			});
		});
	};


	// Ongerefereerde huidige snelheid.
	this.pakHuidigeSnelheid = () => Number(String(this.huidige_snelheid));

	// Ongerefereerde huidige snelheid.
	this.pakHuidigeUploadSnelheid = () => this.eigenschappen.down_up[String(this.huidige_snelheid)];

	this.veranderSnelheid = (nweSnelheid) => {
		/*------------------------------------------------------
		|
		| 	Veranderd niet alleen de snelheid (snelheid-50.aantal = 1 -> snelheid-1000.aantal = 1)
		| 	Maar probeert dat ook te doen voor snelheidsbepaalde pakketten zoals de TV pakketten.
		|
		|-----------------------------------------------------*/

		const vorigeSnelheid = this.pakHuidigeSnelheid();
		if (vorigeSnelheid === nweSnelheid) return;

		// kan zijn dat uberhaupt nog geen snelheid is ingesteld.
		this.mutatie(`snelheid-${nweSnelheid}`, 1);


		['maandelijks', 'eenmalig'].forEach((prijsCat) => {
			// voor iedere optie in eigenschappen.eenmalig en eigenschappen.maandelijks

			Object.entries(this.eigenschappen[prijsCat]).forEach(([optieNaam, optieWaarden]) => {
				// selectie op 1) snelheidsafhankelijk 2) vorige snelheid
				if (optieWaarden.snelheid && optieWaarden.snelheid === vorigeSnelheid) {
					const oudeHoeveelheid = optieWaarden.aantal;

					// nu zet je de oude snelheid op aantal 0
					this.mutatie(optieNaam, 0);

					// hier maak je van film1-film1-500 film1-film1-1000
					const nweOptie = optieNaam.replace(vorigeSnelheid, nweSnelheid);

					// bestaat de optie? oude hoeveelheid schrijven.
					if (this.optieBestaat(nweOptie)) this.mutatie(nweOptie, oudeHoeveelheid);
				}
			});
		});

		this.huidige_snelheid = nweSnelheid;
	};


	this.geefMaandtotaalVoorSnelheid = (proefSnelheid) => {
		/*------------------------------------------------------
		|
		| 	Zet pakket tijdelijk in een andere snelheidsstand
		| 	Geeft maandtotale voor die stand
		| 	Zet pakket weer terug in snelheidsstand.
		|
		|-----------------------------------------------------*/

		const huidigeSnelheid = this.pakHuidigeSnelheid();
		this.veranderSnelheid(proefSnelheid);
		const r = this.formatteerPrijs(this.maandelijksTotaal());
		this.veranderSnelheid(huidigeSnelheid);
		return r;
	};


	this.mutatie = (optie, aantal) => {
		/*------------------------------------------------------
		|
		| 	Werkpaard!
		| 	Schrijft absoluut een nieuw aantal weg voor één optie
		| 	Zowel in de eenmalige als de maandelijkse opties.
		|
		|-----------------------------------------------------*/

		const e = this.eigenschappen;
		if (e.eenmalig[optie]) e.eenmalig[optie].aantal = aantal;
		if (e.maandelijks[optie]) e.maandelijks[optie].aantal = aantal;
	};

	this.vindOptieSleutel = zoek => {
		/*------------------------------------------------------
		|
		| 	WAT EEN MOOIE FUNCTIE
		| 	Zoekt door de **maandelijkse** opties en geeft de
		| 	eerste hit terug die matcht op alle meegegeven 
		| 	sleutels. Alle sleutels zijn facultatief.
		| 	snelheid is niet hard op type omdat die niet consequent aan de 
		| 	pakketten is meegegeven.
		|
		|-----------------------------------------------------*/
		let {naam, optietype, suboptietype, snelheid} = zoek;
		//als zoekopdracht niet meegegegeven, altijd ok.
		const r = Object.entries(this.eigenschappen.maandelijks)
			.find( ([sleutel, optie]) => {
			return ![
				!naam || optie.naam === naam,
				!optietype || optie.optietype === optietype,
				!suboptietype || optie.suboptietype === suboptietype,
				!snelheid || optie.snelheid == snelheid
			].includes(false);
		});

		return r[0];

	};


	// doet niet meer dat de naam aangeeft.
	this.optieBestaat = (optie = '') => !!(this.eigenschappen.eenmalig[optie] || this.eigenschappen.maandelijks[optie]);


	this.optieAantal = (optie = '') => {
		/*------------------------------------------------------
		|
		|	Geeft het aantal terug uit OF maandelijks OF eenmalig
		| 	Aanname: aantal is aldaar gelijk. Anders bugt iets ook.
		| 	Als de optie niet bestaat word 0 / falsy teruggegeven.
		|
		|-----------------------------------------------------*/

		const e = this.eigenschappen;

		if (e.eenmalig[optie]) return Number(e.eenmalig[optie].aantal);
		if (e.maandelijks[optie]) return Number(e.maandelijks[optie].aantal);

		return 0;
	};

	this.zoekSubOptie = (suboptietype = '') => {
		const mOpties = Object.entries(this.eigenschappen.maandelijks)
		.filter(([sleutel, optie]) => optie.suboptietype === suboptietype)
		.map(([sleutel, optie]) => Object.assign({ sleutel }, optie)),

		eOpties = Object.entries(this.eigenschappen.eenmalig)
		.filter(([sleutel, optie]) => optie.suboptietype === suboptietype)
		.map(([sleutel, optie]) => Object.assign({ sleutel }, optie));

		return {
			bestaat: mOpties.length || eOpties.length,
			mOpties,
			eOpties,
		};
	};

	this.zoekOptieType = (optietype = '') => {
		const mOpties = Object.entries(this.eigenschappen.maandelijks)
		.filter(([sleutel, optie]) => optie.optietype === optietype)
		.map(([sleutel, optie]) => Object.assign({ sleutel }, optie)),

		eOpties = Object.entries(this.eigenschappen.eenmalig)
		.filter(([sleutel, optie]) => optie.optietype === optietype)
		.map(([sleutel, optie]) => Object.assign({ sleutel }, optie));

		return {
			bestaat: mOpties.length || eOpties.length,
			mOpties,
			eOpties,
		};
	};


	// zoekt in maandelijks en eenmalig en geeft prijs terug.
	// als samengestelde prijs geeft het een object terug
	this.optiePrijs = (optie = '', formatteer = false) => {
		const e = this.eigenschappen,

		ep = e.eenmalig[optie] ? e.eenmalig[optie].prijs : false,
		mp = e.maandelijks[optie] ? e.maandelijks[optie].prijs : false;

		// let wel, 0 is dus falsy maar OK.

		if (
			(ep || ep === 0)
			&& (!mp && mp !== 0)
		) {
			return formatteer ? this.formatteerPrijs(ep) : ep;
		} if (
			(!ep && ep !== 0)
			&& (mp || mp === 0)
		) {
			return formatteer ? this.formatteerPrijs(mp) : mp;
		} if (
			(ep || ep === 0)
			&& (mp || mp === 0)
		) {
			return formatteer
				? { ep: this.formatteerPrijs(ep), mp: this.formatteerPrijs(mp) }
				: { ep, mp };
		}

			console.warn(`rare fok op in pakket optieprijs van ${optie}`);
			console.trace();

		return 0;
	};

	// dev dingetje
	this.rapporteerOptie = optie => `
		${optie} van ${this.naam_composiet} is nu ${this.optieAantal(optie)}
		maandelijksTotaal ${this.maandelijksTotaal()}
		eenmaligTotaal ${this.eenmaligTotaal()}
	`;

	this.tabelletje = eigenschap => console.table(this.eigenschappen[eigenschap]);

	this.huidigeTelefonieBundel = () => {
		let gevonden = false;
		Object.entries(this.eigenschappen.telefonie_bundels)
			.forEach(([bundelNaam, bundels]) => {
				bundels.forEach((bundel) => {
					if (this.eigenschappen.maandelijks[bundel.slug].aantal > 0) {
						gevonden = bundel;
					}
				});
			});
		return gevonden;
	};

	this.heeftTelefonieBereik = bereik => !!this.eigenschappen.telefonie_bundels[bereik];

	this.alleTelefonieBundelsUit = () => {
		Object.entries(this.eigenschappen.maandelijks)
			.forEach(([optieNaam, optieWaarden]) => {
				if (optieWaarden.optietype === 'telefonie-bundel') {
					this.mutatie(optieNaam, 0);
				}
			});
	};

	this.zetTelefonieBereikAan = (bereik) => {
		// voorkantje voor mutatie functie voor in vergelijkingsprocedure.

		// alles eerst uitzetten
		this.alleTelefonieBundelsUit();

		const b = this.eigenschappen.telefonie_bundels[bereik];
		if (!b) {
			console.error('type telefonie bundel bestaat niet ', b, arguments);
			return false;
		}
		this.mutatie(this.eigenschappen.telefonie_bundels[bereik][0].slug, 1);
	};

	this.maakTelefonieTarievenLijst = () => {

		// JE BENT HIER!!!!

		/*const huiData = (this.huidigeTelefonieBundel()).data;
		const maandBedrag = ``;
		const maxMinuten = ``;
		const tarieven = Object.entries(huiData).filter([]).map( ARG => {

		}).join('') ;*/
	}

	this.pakZenders = () => {
		const aantalUniekeZenderPakketten = Object
			.entries(this.eigenschappen)
			.filter(([sleutel, object]) => sleutel.includes('zender'))
			.map(([s, o]) => o.totaal + o.hd)
			.filter(uniek).length;

		return Object.assign(this.eigenschappen[`zenders-${this.huidige_snelheid}`],
			{
				snelheid: this.huidige_snelheid,
				aantalUniekeZenderPakketten,
			});
	};


	this.pakTypeTV = () => (this.eigenschappen.tv_type === 'ITV' ? 'Interactief' : 'Digitaal');


	// geeft tekst terug.
	this.tekst = tekstSleutel => this.eigenschappen.teksten[tekstSleutel];

	// object kan via JSON verzonden worden naar achter kan maar dan zonder functies.
	this.bereidJSONverzendingVoor = () => {
		const verz = {}; // wat je daadwerkelijk verstuurd
		for (const s in this) {
			if (typeof this[s] !== 'function') verz[s] = this[s];
		}
		this.klaarVoorJSON = verz;
	};
}

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
		film1Fam 			= pakket.zoekSubOptie('Film1'),
		PlusFam 			= pakket.zoekSubOptie('Plus'),
		ZiggoSportFam 		= pakket.zoekSubOptie('ZiggoSportTotaal');

		let fsEdOptieFam 	= pakket.zoekSubOptie('FoxSportsEredivisie'),
		fsIntOptieFam 		= pakket.zoekSubOptie('FoxSportsInternationaal'),
		fsComplOptieFam 	= pakket.zoekSubOptie('FoxSportsCompleet');

		const telOptMap 	= [fsEdOptieFam, ZiggoSportFam, fsIntOptieFam, PlusFam, film1Fam];

		// aanname: alleen maandelijks
		telOptMap.forEach((familie, nummer) => {
			const telOptNr = nummer + 1;
			if (telOpts.includes(telOptNr.toString())) {
				familie.mOpties.forEach(optie => pakket.mutatie(optie.sleutel, 1));
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

		fsEdOptieFam 		= pakket.zoekSubOptie('FoxSportsEredivisie');
		fsIntOptieFam 		= pakket.zoekSubOptie('FoxSportsInternationaal');
		fsComplOptieFam 	= pakket.zoekSubOptie('FoxSportsCompleet');

		if (fsEdOptieFam.bestaat
			&& fsIntOptieFam.bestaat
			&& fsComplOptieFam.bestaat) {
			if (fsEdOptieFam.mOpties[0].aantal
				&& fsIntOptieFam.mOpties[0].aantal) {
				pakket.mutatie(fsEdOptieFam.mOpties[0].sleutel, 0);
				pakket.mutatie(fsIntOptieFam.mOpties[0].sleutel, 0);
				pakket.mutatie(fsComplOptieFam.mOpties[0].sleutel, 1);
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
