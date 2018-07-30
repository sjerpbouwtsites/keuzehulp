function verrijktPakket (p){

	for (var k in p) this[k] = p[k];

	this.generiekTotaal = (soortTotaal) => {

		let tl = this.eigenschappen[soortTotaal], t = 0;

		for (let optieNaam in tl) t += tl[optieNaam].aantal * tl[optieNaam].prijs;

		return t;

	}

	this.eenmaligTotaal = () => this.generiekTotaal('eenmalig');
	
	this.maandelijksTotaal = () => this.generiekTotaal('maandelijks');

	this.formatteerPrijs = prijs => prijs.toFixed(2).replace('.', ',');

	this.printPrijzen = () => {

		['maandelijks', 'eenmalig'].forEach(prijsCat => {
			let printHier = document.getElementsByClassName(prijsCat+'-totaal');
			let ditTotaal = this.formatteerPrijs(this.generiekTotaal(prijsCat));
			Array.from(printHier).forEach(printPlek => {
				printPlek.innerHTML = `&euro; ${ditTotaal}`;
			});
		});
	}

	this.veranderSnelheid = nweSnelheid => {

		let vorigeSnelheid = (Number(this.huidige_snelheid)).toString(); // typecasten om verwijzing kapot te maken

		['maandelijks', 'eenmalig'].forEach(prijsCat => {
			for (let optieNaam in this.eigenschappen[prijsCat]) {
				
				if (optieNaam.indexOf(vorigeSnelheid) !== -1) {

					let oudeHoeveelheid = Number(this.eigenschappen[prijsCat][optieNaam].aantal);	// typecasten om verwijzing kapot te maken
					this.eigenschappen[prijsCat][optieNaam].aantal = 0;
					let nweOptie = optieNaam.replace(vorigeSnelheid, nweSnelheid);
					if (this.eigenschappen[prijsCat][nweOptie]) {
						this.eigenschappen[prijsCat][nweOptie].aantal = oudeHoeveelheid;	
					}
					
				}

			}
		});

		//verander andere dingen

		this.huidige_snelheid = nweSnelheid;

	}

	this.mutatie = (optie, aantal) => {
		let e = this.eigenschappen;
		if (e.eenmalig[optie]) e.eenmalig[optie].aantal = aantal;
		if (e.maandelijks[optie]) e.maandelijks[optie].aantal = aantal;
	};

	this.telOp = optie => this.mutatie(optie, this.optieAantal(optie) + 1);

	this.trekAf = optie => this.mutatie(optie, this.optieAantal(optie) - 1);

	// zoekt in maandelijks en eenmalig en geeft aantal terug. 
	// aanname: aantal is in beide objecten gelijk.
	this.optieAantal = optie => {

		let e = this.eigenschappen;

		if (e.eenmalig[optie]) return e.eenmalig[optie].aantal;
		if (e.maandelijks[optie]) return e.maandelijks[optie].aantal;

		//hele optie niet gevonden??
		console.warn(`optie ${optie} niet gevonden ${this.naam_composiet}` );
		return 0;
	}

	this.rapporteerOptie = optie => `
		${optie} van ${this.naam_composiet} is nu ${this.optieAantal('extra_telefoon')}
		maandelijksTotaal ${this.maandelijksTotaal()}
		eenmaligTotaal ${this.eenmaligTotaal()}
	`;

	// geeft tekst terug.
	this.tekst = tekstSleutel => this.eigenschappen.teksten[tekstSleutel];

	// object kan via JSON verzonden worden naar achter kan maar dan zonder functies.
	this.bereidJSONverzendingVoor = () => {
		this.klaarVoorJSON = {}; // wat je daadwerkelijk verstuurd
		for (let s in this) {
			if (typeof this[s] !== 'function' && s !== 'klaarVoorJSON') this.klaarVoorJSON[s] = this[s];
		}
	}
	
}

function iwwiwProcedure(pakket) {

	// zet opties voor in iwwiwprocedure 
	// omdat bv geen snelheidskeuze bekend is, 
	// stellen we hier de laagste standaard in.
	// idem installatie

	var laagsteSnelheid = pakket.eigenschappen.snelheden
		.reduce((nieuweWaarde, huidigeWaarde) => nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde, 1000000);

	pakket.mutatie('snelheid-'+laagsteSnelheid, 1);
	pakket.huidige_snelheid = laagsteSnelheid;

	var installatieStr = pakket.eigenschappen['eenmalig']['installatie-DHZ'] ? 'DHZ' : pakket.eigenschappen['eenmalig']['installatie-basis'] ? 'basis' : 'volledig';

	pakket.mutatie('installatie-'+installatieStr, 1);

	// zet pakketten in window om later te laden.
	window['efiber-pakket-'+pakket.ID] = pakket;

	return pakket;
}