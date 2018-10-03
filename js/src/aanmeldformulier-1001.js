/* global doc, location, KzAjax, kzModal, kzTekst, gformInitDatepicker */

function aanmeldformulierHaalWaardeUitRij(rij) {
	/*--------------------------------------------------
	|
	|	Geeft de voor de 'rij' relevante waarde terug
	|	Dit is verschillend voor tekstvelden, tv-pakketten, 
	|	belpakketten, installaties
	|
	|**************************************************/

	const knop1 = rij.getElementsByClassName('knop')[0];

	// is het een tekstveld, nummer oid?
	if (knop1.hasAttribute('type')) {
		return knop1.value;
	} if (knop1.classList.contains('kz-radio')) {
		const actieveKnop = rij.getElementsByClassName('actief');
		if (actieveKnop.length) {
			const ID = actieveKnop[0].id;
			if (knop1.classList.contains('tv-pakket')) {
				const s = ID.split('-');
				s.shift();
				s.pop();
				return s.join(' ');
			} if (rij.classList.contains('installatie')) {
				return ID.replace('installatie-keuze-', '');
			} if (rij.classList.contains('belpakketten')) {
				return ID.replace('belpakket-keuze-', '').replace('-', ' '); 
			}
			return ID;
		}
		return '';
	}

	// checkbox stijl

	// IF ACTIEF!!!
	if (knop1.classList.contains('actief')) {
		return 'Ja';
	}
		return '';
}

function kzMaakPrintMap(){
	/*--------------------------------------------------
	|
	|	Creert object met daarin referenties van de aanmeldformulier 
	| 	invoervelden naar de GF velden waarnaar geprint dient te worden
	| 	Slaat dit object ter referentie op in een global; 
	| 	maakt het maar één keer aan.
	|
	|**************************************************/	

	if (window['kzPrintMappen']) return window['kzPrintMappen'];

	this.printMapInit = id => {
		return {
			printEl: document.getElementById(id),
			print: [],
		};
	};

	const printMappen = {
		'begin-gemist':						this.printMapInit('input_1_53'),
		'dvb-c': 							this.printMapInit('input_1_76'),
		erotiek: 							this.printMapInit('input_1_60'),
		'extra-optie': 						this.printMapInit('input_1_75'),
		'extra-tv-ontvangers': 				this.printMapInit('input_1_62'),
		'extra-vast-nummer': 				this.printMapInit('input_1_41'),
		foxsportscompleet: 					this.printMapInit('input_1_57'),
		foxsportseredivisie: 				this.printMapInit('input_1_55'),
		foxsportsinternationaal: 			this.printMapInit('input_1_56'),
		'huidige-extra-nummer': 			this.printMapInit('input_1_43'),
		'huidige-nummer': 					this.printMapInit('input_1_40'),
		'inschrijving-telefoonboek': 		this.printMapInit('input_1_74'),
		'nummerbehoud-extra-vast-nummer': 	this.printMapInit('input_1_42'),
		'opnemen-replay-begin-gemist-samen':this.printMapInit('input_1_50'),
		'plus':								this.printMapInit('input_1_61'),
		ziggosporttotaal: 					this.printMapInit('input_1_58'),
		app: 								this.printMapInit('input_1_54'),
		belpakket: 							this.printMapInit('input_1_38'),
		film1: 								this.printMapInit('input_1_59'),
		installatie: 						this.printMapInit('input_1_44'),
		nummerbehoud: 						this.printMapInit('input_1_39'),
		opnemen: 							this.printMapInit('input_1_51'),
		replay: 							this.printMapInit('input_1_52'),
	};

	window.kzPrintMappen = printMappen;
	return printMappen;
}

function kzUpdateHidden() {
	/*------------------------------------------------------
	|
	| 	functie draait iedere keer dat een knop wordt aangeklikt
	| 	print waarden van dynamische formulier in hidden velden GF.
	| 	printwijze is afhankelijk van type data
	|
	|-----------------------------------------------------*/

	const printMappen = kzMaakPrintMap();

	const aanmeldformulier = doc.getElementById('print-aanmeldformulier');
	const inputs = aanmeldformulier.querySelectorAll('[data-kz-waarde]');
	const rijen = Array
		.from(inputs, input => kzVindRij(input))
		.filter(uniek)
		.forEach(rij => {

			const inputs = rij.querySelectorAll('[data-kz-waarde]');
			const isRadio = !!rij.getElementsByClassName('kz-radio').length;
			let printsleutel = null; // sleutel in printMappen

			if (isRadio) {

				// bv belpakket
				let famIDPrefix = inputs[0].id.split('-')[0];
				
				const dezeRadios = doc.querySelectorAll(`[id*="${famIDPrefix}"]`);
				printMappen[famIDPrefix].print = Array.from(dezeRadios, input => {

					if (input.classList.contains('tv-pakket')) {
						const w = (kzPakKnopValue(input) ? "ja" : "nee");
						const s = input.id.split('-');

						return `Type: ${s[0]} - subtype: ${s[1]} => ${w}.`;

					} else {
						const w = kzPakKnopValue(input);

						if (w) {

							let s = input.id.split('-');

							s.shift();
							s.shift();
							s = s.join(' ');
							return s;

						}

					}

				});
				

			} else {

				printsleutel = inputs[0].id;

				if (['huidige-nummer', 'huidige-extra-nummer'].includes(printsleutel)) {
					printMappen[printsleutel].print = [inputs[0].value];
					printMappen[printsleutel].contekst = 'tekstveld';
				} else {
					const w = kzPakKnopValue(inputs[0]);

					if(!printMappen[printsleutel]) {
						console.warn(printsleutel + 'niet gevonden in printmap');
					} else {
						printMappen[printsleutel].contekst = 'getal of ja/nee';
						if (!w) {
							printMappen[printsleutel].print = ['nee'];
						} else if (w < 2) {
							printMappen[printsleutel].print = ['ja'];
						} else {
							printMappen[printsleutel].print = [w];
						}
					}

				}

			}
		});

	Object.entries(printMappen).forEach(([printMapID, printVerz]) => {
		printVerz.printEl.value = printVerz.print.filter(w => w && w.length).join(' - ');
	});

}

function haalPrintAanmeldformulier(knop) {
	/*------------------------------------------------------
	|
	| 	Haalt het formulier op van keuzehulp_haal_aanmeldformulier
	| 	Doe formulier nabewerking, zet wat eventhandlers er op
	| 	Doet wat inputvalidatie
	| 	Zet de datepicker 'juist aan'
	| 	Kent de klasse 'actief' toen aan rijen met een geactiveerde optie
	| 	Vervangt %ALGEMENE VOORWAARDEN% in html met providerspecifieke tekst.
	|
	|-----------------------------------------------------*/


	// bereid pakket voor voor verzending
	let pakket = window[`kz-pakket-${knop.getAttribute('kz-data-pakket-id')}`];

	// zet veilig data-object op pakket met daarin de eigenschappen
	pakket.bereidJSONverzendingVoor();

	doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';
	doc.getElementById('print-aanmeldformulier').setAttribute('data-pakket-id', pakket.ID);

	const ajf = new KzAjax({
		ajaxData: {
			action: 'keuzehulp_haal_aanmeldformulier',
			adres: JSON.parse(sessionStorage.getItem('kz-adres')),
			keuzehulp: JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
			pakket: pakket.klaarVoorJSON,
		},
		cb(r) {
			if (!r) console.warn('geen correcte JSON teruggekregen haalPrintAanmeldformulier');

			// const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

			const printPlek = doc.getElementById('print-aanmeldformulier');
			printPlek.innerHTML = '';
			$(printPlek).append($(r.print)); // de HTML van het formulier.

			// het formulier kan proberen te printen naar een niet bestaande url
			printPlek.getElementsByTagName('form')[0].setAttribute('action', kzBasisUrl);

			pakket = kzPakPakket(r.id);

			// het zijn de click events die de verwerking van de data aanjagen..
			printPlek.addEventListener('change', (e) => {
				const t = e.target,
					idAr = ['huidige-nummer', 'huidige-extra-nummer'];
				if (
					(t.hasAttribute('type') && t.getAttribute('type') === 'number')
					|| (idAr.indexOf(t.id) !== -1)
					) {
					e.target.click();
				}
			});


			// hieronder printen we het adres naar het formulier, voorzover we dat hebben.
			const adres = JSON.parse(sessionStorage.getItem('kz-adres')),
			adresDataToewijzing = {
				input_1_20: 'postcode',
				input_1_21: 'huisnummer',
				input_1_22: 'toevoeging',
				input_1_23: 'kamer',
				input_1_73: 'gebiedscode',
			};

			Object.entries(adresDataToewijzing).forEach(([key, value]) => {
				const el = doc.getElementById(key);
				el.value = adres[value];
			});


			// alle rijen met actieve knoppen op actief
			Array.from(printPlek.getElementsByClassName('knop')).forEach((knopE) => {

				const rij = kzVindRij(knopE);
				if (knopE.classList.contains('actief')) {
					rij.classList.add('heeft-actieve-knop');
				}
				rij.classList.add('heeft-knop');

				//knopE.setAttribute('data-pakket-id', r.id);

			});

			// schrijf pakket naam en provider naar formulier
			doc.getElementById('input_1_66').value = `${pakket.naam_composiet} ${pakket.huidige_snelheid}`;
			doc.getElementById('input_1_64').value = pakket.provider;
			doc.getElementById("input_1_81").value = JSON.parse(sessionStorage.getItem('kz-adres')).perceelcode;
			// schrijf opties naar GF
			kzUpdateHidden();

			// oa de datepicker initialiseren
			kzInitialiseerGF();

			// schrijf de user naar de GF hidden fields
			// kzUser wordt in een footer in PHP uitgedraaid
			if (kzUser && kzUser.data && kzUser.data.display_name) {
				doc.getElementById('input_1_80').value = kzUser.data.display_name;
			}

			// controle van het mobiele nummer
			$('#input_1_30').on('blur', function () {
				const vastNummer = /^(((0)[1-9]{2}[0-9][-]?[1-9][0-9]{5})|((\\+31|0|0031)[1-9][0-9][-]?[1-9][0-9]{6}))$/,
				mobielNummer = /^(((\\+31|0|0031)6){1}[1-9]{1}[0-9]{7})$/i;

				if (!(vastNummer.test(this.value) || mobielNummer.test(this.value))) {
					kzModal(kzTekst('correct_tel'), 1500);
				}
			});

			// is er misschien via ajax een nieuwe ingezet en heeft die %PRINT_ALGEMENE_VOORWAARDEN%?
			// @TODO LELIJKE HACK
			const vervangAlgemeneVoorwaarden = setInterval(() => {
				const e = $('#field_1_72'),
				tekstFaal = e.text().indexOf('%PRINT_ALGEMENE_VOORWAARDEN%') !== -1;

				if (tekstFaal) {
					e.empty();
					let t = null;
					if (r.pakket) {
						t = r.pakket.eigenschappen.teksten.ik_ga_akkoord_met;
					} else {
						t = kzPakPakket(doc.getElementById('print-aanmeldformulier').dataset.pakketId).eigenschappen.teksten.ik_ga_akkoord_met
					}
					
					t = t.replace(/\\\//g, '/');
					e.append($(t));

					clearInterval(vervangAlgemeneVoorwaarden);
				}
			}, 500);

			// schrijft eenmalig & maandelijks naar hun totalen
			pakket.printPrijzen();

			// op veranderen snelheid, opnieuw pakket versturen naar dit formulier.
			const schakelSnelheid  = doc.getElementById('schakel-snelheid');
			if (schakelSnelheid) {
				doc.getElementById('schakel-snelheid').addEventListener('change', () => {
					pakket.veranderSnelheid(doc.getElementById('schakel-snelheid').value);
					doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';
					pakket.bereidJSONverzendingVoor();
					this.ajaxData.pakket = pakket.klaarVoorJSON;
					this.doeAjax();
				});
			}

		},

	}); // ajax

	ajf.doeAjax();
}

function kzInitialiseerGF() {
	/*------------------------------------------------------
	|
	| 	Hulpfunctie voor haal aanmeldformulier op
	|	Initialiseert de datumpicker en doet leeftijdsvalidatie.
	|
	|-----------------------------------------------------*/

	jQuery.datepicker.regional.nl = {
		closeText: 'Sluiten',
		prevText: '←',
		nextText: '→',
		currentText: 'Vandaag',
		monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
		'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
		monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
		'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
		dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
		dayNamesShort: ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'],
		dayNamesMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
		weekHeader: 'Wk',
		dateFormat: 'dd-mm-yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: '',
	};

	jQuery.datepicker.setDefaults(jQuery.datepicker.regional.nl);

	// date field interactief.
	gformInitDatepicker();

	// valideert minimumleeftijd = 18 want je moet minstens in 2000 geboren zijn.
	// @TODO is precies genoeg
	$('.datepicker_with_icon').on('change', function () {
		const v = this.value;

		if (v.length > 5) {
			const is18 = (Number(v.split('/')[2]) - 2000) < 0;
			if (!is18) {
				kzModal(kzTekst('minimum_18'), 2000);
				$('#gform_submit_button_1').hide();
			} else {
				$('#gform_submit_button_1').show();
			}
		}
	});

}


function kzUpdatePrijs(knop) {
	/*------------------------------------------------------
	|
	| 	Haalt pakket op
	| 	Schrijft wijzigingen weg
	| 	Print prijzen
	|
	|-----------------------------------------------------*/

	let pakket = null;

	if (knop.hasAttribute('data-pakket-id')) {
		pakket = window[`kz-pakket-${knop.getAttribute('data-pakket-id')}`];
	} else {
		pakket = window[`kz-pakket-${doc.getElementById('print-aanmeldformulier').getAttribute('data-pakket-id')}`];
	}

	let optie,
		hoeveelheid;

	if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number') {
		optie = knop.id;
		hoeveelheid = knop.value;
	} else if (knop.classList.contains('belpakket')) {
		optie = knop.id.replace('belpakket-keuze-', '');
		hoeveelheid = kzPakKnopValue(knop);
	} else if (knop.classList.contains('installatie')) {
		optie = knop.id.replace('keuze-', '');
		hoeveelheid = kzPakKnopValue(knop);
	} else {
		optie = knop.id;
		hoeveelheid = kzPakKnopValue(knop);
	}

	if (knop.classList.contains('tv-pakket')) {
		const sleutel = pakket.vindOptieSleutel({
			naam: knop.dataset.kzOptienaam,
			snelheid: pakket.huidige_snelheid,
			optietype: 'televisie-bundel',
			suboptietype: knop.dataset.kzSuboptietype,
			tvType: pakket.eigenschappen.tv_type
		});

		pakket.mutatie(sleutel, hoeveelheid);

	} else {
		pakket.mutatie(optie, hoeveelheid);
	}
	

	pakket.printPrijzen();
}

function kzSchakelInputGeneriek(knop) {
	/*------------------------------------------------------
	|
	|	Vindt de rij en schakelt op rij en knop de klasse actief.
	| 	Tenzij een radio, dan wordt de knop actief geschakelt
	|
	|-----------------------------------------------------*/

	if (knop.classList.contains('actief')) {
		knop.classList.remove('actief');
	} else {
		knop.classList.add('actief');
	}

	const rij = kzVindRij(knop);
	if (rij.getElementsByClassName('actief').length) {
		rij.classList.add('heeft-actieve-knop');
	} else {
		rij.classList.remove('heeft-actieve-knop');
	}

}

function kzPakKnopValue(knop) {
	/*------------------------------------------------------
	|
	|	Een number of text input gebruikt de 'echte' input.
	| 	Een zelfgebouwde radio of checkbox gebruikt data-kz-value
	| 	Dit normaliseert dat.
	|
	|-----------------------------------------------------*/


	if (knop.hasAttribute('value') || typeof knop.value !== 'undefined') {
		return Number(knop.value);
	}
		return Number(knop.getAttribute('data-kz-value'));
}

function kzSchakelCheckbox(knop) {
	/*------------------------------------------------------
	|
	| 	Stuurt functies aan die de klassen schakelen,
	| 	value van input schakelt en prijsberekening en -printen doen.
	|
	|-----------------------------------------------------*/


	kzSchakelInputGeneriek(knop);

	let val = kzPakKnopValue(knop);

	if (!val) val = 0;

	if (val === 0) {
		knop.setAttribute('data-kz-value', 1);
	} else {
		knop.setAttribute('data-kz-value', 0);
	}

	kzUpdatePrijs(knop);
}


function kzSchakelRadio(knop) {
	/*------------------------------------------------------
	|
	|	Zorgt er voor dat (quasi)-radio's hun werk doen
	| 	En gebruikt kzSchakelCheckbox voor het effectueren van keuzes.
	| 	Je zou een verzameling radio's als een verzameling gekoppelde
	| 	checkboxes kunnen zien, daar maakt het gebruik van.
	|
	|-----------------------------------------------------*/

	let rij = knop;
	do {rij = rij.parentNode} while (
		!rij.classList.contains('rij')
		&& !rij.classList.contains('print-aanmeldformulier')
	);

	if (rij.classList.contains('print-aanmeldformulier')) return new Error('rij niet gevonden');

	const echteRadio = knop.classList.contains('installatie');
	const magErGeenTweeHebben = knop.classList.contains('kz-radio');
	const knoppenInVerzameling = rij.getElementsByClassName('knop');
	const isActief = knop.classList.contains('actief');

	if ( isActief && !echteRadio ) {

		kzSchakelCheckbox(knop);

	} else if ( isActief && echteRadio ){


		if (knoppenInVerzameling.length === 1) {

			// niets doen.
		} else {

			// eerst zelf uitzetten
			// dan eerste best aanzetten.
			kzSchakelCheckbox(knop);


			Array.from(knoppenInVerzameling).forEach(knopUitVerz => {
				if (knopUitVerz.id !== knop.id) kzSchakelCheckbox(knopUitVerz);
			});

		}

	} else if ( !isActief && !echteRadio ) {


		if (magErGeenTweeHebben) {
			if (rij.getElementsByClassName('actief').length) {
				kzSchakelCheckbox(rij.getElementsByClassName('actief')[0]);
			}
		}

		kzSchakelCheckbox(knop);

	} else {


		if (rij.getElementsByClassName('actief').length) {
			kzSchakelCheckbox(rij.getElementsByClassName('actief')[0]);
		}
		kzSchakelCheckbox(knop);

	}

}

function kzFoxSchakel(knop) {
	/*------------------------------------------------------
	|
	|	Sommige pakketten hebben eredivisie compleet. Dit is een kortingsbundel van 
	| 	fox eredivisie en fox internationaal. Die sluiten elkaar uit
	| 	schakelen elkaar. Dat wordt hier geregeld.
	|
	|-----------------------------------------------------*/

	// is dit de compleet knop of eredivisie / internationaal?
	const alleFox = Array.from(doc.querySelectorAll('[data-kz-func~="fox-sports"]'));
	if (knop.id.includes('compleet')) {
		// de knop domineert. Als deze uitgaat, blijven anderen uit. Als de aan gaat, gaan anderen uit.
		// dus naar normale schakelCheckbox slechts de andere twee uitzetten.
		if (kzPakKnopValue(knop)) {
			alleFox
				.filter(filterKnop => !filterKnop.id.includes('compleet') && kzPakKnopValue(filterKnop))
				.forEach(zetKnop => kzSchakelCheckbox(zetKnop));
		}
	} else if (alleFox.length > 2) {
		// zijn er wel drie pakketten?
		// als ze allebei aan staan, dan allebei uit en compleet knop aan.
		// andere gevallen hoeft niet geschakeld te worden.
		// dus loopen en schakelen
		const aantalAan = alleFox.filter(knop2 => !knop2.id.includes('compleet') && kzPakKnopValue(knop2)).length;

		// altijd compleet uit, voor de vergelijking, als je op een losse klikt.
		alleFox.filter(knop3 => knop3.id.includes('compleet') && kzPakKnopValue(knop3)).forEach(knop4 => kzSchakelCheckbox(knop4));

		if (aantalAan > 1) {
			alleFox
				.filter(nietDeCompleetKnop => !nietDeCompleetKnop.id.includes('compleet'))
				.forEach(zetMUit => kzSchakelCheckbox(zetMUit));
			alleFox
				.filter(nietDeCompleetKnop => nietDeCompleetKnop.id.includes('compleet'))
				.forEach(zetMAan => kzSchakelCheckbox(zetMAan));
		}
	}

}

function kzSchakelNumber(knop) {
	/*------------------------------------------------------
	|
	|	Een nummer input is lekker simpel.
	|
	|-----------------------------------------------------*/

	kzUpdatePrijs(knop);

	const rij = kzVindRij(knop);
	if (kzPakKnopValue(knop) > 0) {
		rij.classList.add('heeft-actieve-knop');
	} else {
		rij.classList.remove('heeft-actieve-knop');
	}

}

function KzAantalTvs(optellen) {
	/*------------------------------------------------------
	|
	|	Middelware tussen number input aantal TVs en rest formulier / updateHidden
	|
	|-----------------------------------------------------*/	
	let extraTVontvangers = document.getElementById('extra-tv-ontvangers');
	if (optellen) {
		extraTVontvangers.value = Number(extraTVontvangers.value) + 1;
	} else if (Number(extraTVontvangers.value)) { // is niet 0
		extraTVontvangers.value = Number(extraTVontvangers.value) - 1;
	}
	extraTVontvangers.click();
}





var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}

/* eslint-enable */