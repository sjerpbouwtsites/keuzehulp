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

	// procedurele code die draait bij initialisatie (new Verrijktpakket)

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

	this.vindOptie = (zoek, antwoord = 'alles') => {
		/*------------------------------------------------------
		|
		| 	WAT EEN MOOIE FUNCTIE
		| 	Zoekt door de **maandelijkse** opties en geeft de
		| 	eerste hit terug die matcht op alle meegegeven 
		| 	sleutels. Alle sleutels zijn facultatief.
		| 	snelheid is niet hard op type omdat die niet consequent aan de 
		| 	pakketten is meegegeven.
		| 	tv type is ook facultatief, maar kan ook stomweg null zijn en dient in beide gevallen true
		| 	te zijn. Als het niet null is dan is het ITV, DTV of DTV-ITV.
		|
		|-----------------------------------------------------*/
		let {naam, optietype, suboptietype, snelheid, tvType, aantal} = zoek;
		//als zoekopdracht niet meegegegeven, altijd ok.
		const r = Object.entries(this.eigenschappen.maandelijks)
			.find( ([sleutel, optie]) => {
			return ![
				!naam || optie.naam === naam,
				!optietype || optie.optietype === optietype,
				!suboptietype || optie.suboptietype === suboptietype,
				!aantal || optie.aantal == aantal,
				!snelheid || optie.snelheid == snelheid,
				!tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)
			].includes(false);
		});
		if (!r) {
			//console.warn(`geen optiesleutel in ${this.provider} ${this.naam_composiet} gevonden met:`);
			//console.table(zoek);
			return false;
		} 

		if (antwoord === 'alles') {
			return r;
		} else if (antwoord === 'sleutel') {
			return r[0]; // de sleutel		
		} else {
			return r[1];
		}
			
	};

	// oei dubbel op //
	this.vindOpties = zoek => {
		/*------------------------------------------------------
		|
		| 	WAT EEN MOOIE FUNCTIE
		| 	Zoekt door de **maandelijkse** opties en geeft de
		| 	eerste hit terug die matcht op alle meegegeven 
		| 	sleutels. Alle sleutels zijn facultatief.
		| 	snelheid is niet hard op type omdat die niet consequent aan de 
		| 	pakketten is meegegeven.
		| 	tv type is ook facultatief, maar kan ook stomweg null zijn en dient in beide gevallen true
		| 	te zijn. Als het niet null is dan is het ITV, DTV of DTV-ITV.
		|
		|-----------------------------------------------------*/
		let {naam, aantal, optietype, suboptietype, snelheid, tvType} = zoek;

		//als zoekopdracht niet meegegegeven, altijd ok.
		const r = Object.entries(this.eigenschappen.maandelijks)
			.filter( ([sleutel, optie]) => {
			return ![
				!naam || optie.naam === naam,
				!optietype || optie.optietype === optietype,
				!suboptietype || optie.suboptietype === suboptietype,
				!snelheid || optie.snelheid == snelheid,
				!aantal || optie.aantal == aantal,
				!tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)
			].includes(false);
		});
		if (!r) {
			console.warn('geen optiesleutel gevonden met:');
			console.table(zoek);
			return false;
		} 

		return r;
			
	};

	this.vindOptieSleutel = zoek => this.vindOptie(zoek, 'sleutel'); 
	this.vindOptieZelf = zoek => this.vindOptie(zoek, 'optie');

/*	this.vindOptieSleutel = zoek => {
		let {naam, optietype, suboptietype, snelheid, tvType} = zoek;
		//als zoekopdracht niet meegegegeven, altijd ok.
		const r = Object.entries(this.eigenschappen.maandelijks)
			.find( ([sleutel, optie]) => {
			return ![
				!naam || optie.naam === naam,
				!optietype || optie.optietype === optietype,
				!suboptietype || optie.suboptietype === suboptietype,
				!snelheid || optie.snelheid == snelheid,
				!tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)
			].includes(false);
		});
		if (!r) {
			console.warn('geen optiesleutel gevonden met:');
			console.table(zoek);
			return false;
		} 
			return r[0]; // de sleutel
	};*/




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

		const actieveOptie = this.vindOptie({
			aantal: 1,
			optietype: 'telefonie-bundel',
		});

		if (!actieveOptie || !actieveOptie[1]) {
			return false;
		}

		const actieveOptieData = actieveOptie[1];

		const gevondenBundel =  this.eigenschappen.telefonie_bundels[actieveOptieData.suboptietype]
			.find(bundel => bundel.slug === actieveOptieData.naam);
		gevondenBundel.optieData = actieveOptieData;

		return gevondenBundel;
	};

	this.heeftTelefonieBereik = bereik => !!this.vindOptie({
			optietype: 'telefonie-bundel',
			snelheid: this.huidige_snelheid,
			suboptietype: bereik
		});

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

		// console.log(this.huidige_snelheid, bereik);

		const telBundelSleutel = this.vindOptie({
			optietype: 'telefonie-bundel',
			snelheid: this.huidige_snelheid,
			suboptietype: bereik
		})[0];

		if (!telBundelSleutel) {
			console.error('type telefonie bundel bestaat niet ', bereik);
			return false;
		}
		this.mutatie(telBundelSleutel, 1);

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

	this.pakVoucherCodes = () => {
		return this.eigenschappen.vouchercodes;
	}

	this.zoekVoucherCode = codePoging => {

		const vcs = this.pakVoucherCodes();
		const res = vcs.find(vc => vc.code === codePoging);

		return !!res
			? res
			: false;

	};


}
