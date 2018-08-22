/* global doc, location, EfiberAjax, efiberModal, efiberTekst, gformInitDatepicker */

function aanmeldformulierHaalWaardeUitRij(rij) {
	const knop1 = rij.getElementsByClassName('knop')[0];

	// is het een tekstveld, nummer oid?
	if (knop1.hasAttribute('type')) {
		return knop1.value;
	} if (knop1.classList.contains('efiber-radio')) {
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

function efiberUpdateHidden() {
	/*------------------------------------------------------
	|
	| 	functie draait iedere keer dat een knop wordt aangeklikt
	| 	print waarden van dynamische formulier in hidden velden GF.
	|
	|-----------------------------------------------------*/

	const rijen = Array.from(doc.getElementById('print-aanmeldformulier').getElementsByClassName('heeft-knop')),

	printMappen = {
		belpakketten: doc.getElementById('input_1_38'),
		nummerbehoud: doc.getElementById('input_1_39'),
		'huidige-nummer': doc.getElementById('input_1_40'),
		'extra-vast-nummer': doc.getElementById('input_1_41'),
		'nummerbehoud-extra-vast-nummer': doc.getElementById('input_1_42'),
		'huidige-extra-nummer': doc.getElementById('input_1_43'),
		installatie: doc.getElementById('input_1_44'), // let op 45 46 missen
		'opnemen-replay-begin-gemist-samen': doc.getElementById('input_1_50'),
		opnemen: doc.getElementById('input_1_51'),
		replay: doc.getElementById('input_1_52'),
		'begin-gemist': doc.getElementById('input_1_53'),
		app: doc.getElementById('input_1_54'),
		'fox-sports-eredivisie':	doc.getElementById('input_1_55'),
		'fox-sports-internationaal': doc.getElementById('input_1_56'),
		'fox-sports-compleet': doc.getElementById('input_1_57'),
		'ziggo-sport-totaal': doc.getElementById('input_1_58'),
		film1: doc.getElementById('input_1_59'),
		'erotiek-pakket': doc.getElementById('input_1_60'),
		'plus-pakket': doc.getElementById('input_1_61'),
		'extra-tv-ontvangers': doc.getElementById('input_1_62'),
		'inschrijving-telefoonboek': doc.getElementById('input_1_74'),
		'extra-optie': doc.getElementById('input_1_75'),
	},

	printArrayMap = {
		foxsportseredivisie:	doc.getElementById('input_1_55'),
		foxsportsinternationaal: doc.getElementById('input_1_56'),
		foxsportscompleet: doc.getElementById('input_1_57'),
		ziggosporttotaal: doc.getElementById('input_1_58'),
		plus: doc.getElementById('input_1_61'),
	},

	printInfo = {};

	rijen.forEach((rij) => {
		let GFPrintPlek = false;

		// zoeken in printmapping naar passende printplek.
		// Zoek uit de classname, maar haal 'rij' en 'heeft-knop' eruit.
		// maak een diep kopie om wijziging via referentie te voorkomen
		const klasseDiepKopieAr = (` ${rij.className}`).replace('rij', '').replace('heeft-knop', '').trim().split(' ');

		// nu zoeken
		klasseDiepKopieAr.forEach((kn) => {
			if (printMappen[kn]) {
				GFPrintPlek = printMappen[kn];

				const waarde = aanmeldformulierHaalWaardeUitRij(rij);
				if (waarde) {
					if (!printInfo[kn]) {
						printInfo[kn] = {
							GFPrintPlek,
							waarde,
						};
					} else {
						printInfo[kn] = {
							GFPrintPlek,
							waarde: `${printInfo[kn].waarde}, ${waarde}`,
						};
					}
				}
			}
		});

		if (!GFPrintPlek) {
			// dan dus als array.
			const optieSoort = rij.getElementsByClassName('knop')[0].id.split('-')[0];
			if (printArrayMap[optieSoort]) {
				GFPrintPlek = printArrayMap[optieSoort];

				const waarde = aanmeldformulierHaalWaardeUitRij(rij);
				if (waarde) {
					if (!printInfo[optieSoort]) {
						printInfo[optieSoort] = {
							GFPrintPlek,
							waarde,
						};
					} else {
						printInfo[optieSoort] = {
							GFPrintPlek,
							waarde: `${printInfo[optieSoort].waarde}, ${waarde}`,
						};
					}
				}
			} else {
				console.log('nog steeds niet', rij.getElementsByClassName('knop')[0].id);
			}
		}
	}); // iedere rij.

	Object.entries(printInfo).forEach(([key, printRij]) => {
		const pr = printRij;
		pr.GFPrintPlek.value = printRij.waarde;
	});
}

function haalPrintAanmeldformulier(knop) {
	/*------------------------------------------------------
	|
	| 	Haalt het formulier op van efiber_haal_aanmeldformulier
	| 	Doe formulier nabewerking, zet wat eventhandlers er op
	| 	Doet wat inputvalidatie
	| 	Zet de datepicker 'juist aan'
	| 	Kent de klasse 'actief' toen aan rijen met een geactiveerde optie
	| 	Vervangt %ALGEMENE VOORWAARDEN% in html met providerspecifieke tekst.
	|
	|-----------------------------------------------------*/


	// bereid pakket voor voor verzending
	let pakket = window[`efiber-pakket-${knop.getAttribute('efiber-data-pakket-id')}`];


	pakket.bereidJSONverzendingVoor();

	doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';

	const ajf = new EfiberAjax({
		ajaxData: {
			action: 'efiber_haal_aanmeldformulier',
			adres: JSON.parse(sessionStorage.getItem('efiber-adres')),
			keuzehulp: JSON.parse(sessionStorage.getItem('efiber-keuzehulp')),
			pakket: pakket.klaarVoorJSON,
		},
		cb(r) {
			if (!r) console.warn('geen correcte JSON teruggekregen haalPrintAanmeldformulier');

			// const keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));

			const printPlek = doc.getElementById('print-aanmeldformulier');
			printPlek.innerHTML = '';
			$(printPlek).append($(r.print)); // de HTML van het formulier.

			// @TODO DYNAMISCH MAKEN

			printPlek.getElementsByTagName('form')[0].setAttribute('action', `${location.origin}/keuzehulp`);

			pakket = window[`efiber-pakket-${r.id}`];

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
			const adres = JSON.parse(sessionStorage.getItem('efiber-adres')),
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
				let rij = knopE;

				knopE.setAttribute('data-pakket-id', r.id);

				do { rij = rij.parentNode; } while (!rij.classList.contains('rij'));

				rij.classList.add('heeft-knop');

				if (knopE.classList.contains('actief')) {
					rij.classList.add('actief');
				}
			});

			// schrijf pakket naam en provider naar formulier
			doc.getElementById('input_1_66').value = `${pakket.naam_composiet} ${pakket.huidige_snelheid}`;
			doc.getElementById('input_1_64').value = pakket.provider;

			// schrijf opties naar GF
			efiberUpdateHidden();


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
			$('.datepicker_with_icon').on('change', function () {
				const v = this.value;

				if (v.length > 5) {
					const is18 = (Number(v.split('/')[2]) - 2000) < 0;
					if (!is18) {
						efiberModal(efiberTekst('minimum18'), 2000);
						$('#gform_submit_button_1').hide();
					} else {
						$('#gform_submit_button_1').show();
					}
				}
			});

			$('#input_1_30').on('blur', function () {
				const vastNummer = /^(((0)[1-9]{2}[0-9][-]?[1-9][0-9]{5})|((\\+31|0|0031)[1-9][0-9][-]?[1-9][0-9]{6}))$/,
				mobielNummer = /^(((\\+31|0|0031)6){1}[1-9]{1}[0-9]{7})$/i;

				if (!(vastNummer.test(this.value) || mobielNummer.test(this.value))) {
					efiberModal(efiberTekst('correctTel'), 1500);
				}
			});

			// is er misschien via ajax een nieuwe ingezet en heeft die %PRINT_ALGEMENE_VOORWAARDEN%?

			// @TODO LELIJKE HACK

			const vervangAlgemeneVoorwaarden = setInterval(() => {
				const e = $('#field_1_72'),
				tekstFaal = e.text().indexOf('%PRINT_ALGEMENE_VOORWAARDEN%') !== -1;

				if (tekstFaal) {
					e.empty();
					let t = r.pakket.eigenschappen.pakket_meta.provider.ik_ga_akkoord_met;
					t = t.replace(/\\\//g, '/');
					e.append($(t));

					clearInterval(vervangAlgemeneVoorwaarden);
				}
			}, 500);

			pakket.printPrijzen();

			// op veranderen snelheid, opnieuw pakket versturen naar dit formulier.
			doc.getElementById('schakel-snelheid').addEventListener('change', () => {
				pakket.veranderSnelheid(doc.getElementById('schakel-snelheid').value);

				doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';

				pakket.bereidJSONverzendingVoor();
				this.ajaxData.pakket = pakket.klaarVoorJSON;
				this.doeAjax();
			});
		},

	}); // ajax

	ajf.doeAjax();
}

function efiberUpdatePrijs(knop) {
	/*------------------------------------------------------
	|
	| 	Haalt pakket op
	| 	Schrijft wijzigingen weg
	| 	Print prijzen
	|
	|-----------------------------------------------------*/

	const pakket = window[`efiber-pakket-${knop.getAttribute('data-pakket-id')}`];

	let optie,
		hoeveelheid;

	if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number') {
		optie = knop.id;
		hoeveelheid = knop.value;
	} else if (knop.classList.contains('belpakket')) {
		optie = knop.id.replace('belpakket-keuze-', '');
		hoeveelheid = knop.classList.contains('actief') ? 1 : 0;
	} else if (knop.classList.contains('installatie')) {
		optie = knop.id.replace('keuze-', '');
		hoeveelheid = knop.classList.contains('actief') ? 1 : 0;
	} else {
		optie = knop.id;
		hoeveelheid = knop.classList.contains('actief') ? 1 : 0;
	}

	pakket.mutatie(optie, hoeveelheid);

	pakket.printPrijzen();
}

function efiberSchakelInputGeneriek(knop) {
	/*------------------------------------------------------
	|
	|	Vindt de rij en schakelt op rij en knop de klasse actief.
	|
	|-----------------------------------------------------*/


	let rij = knop;
	do {
		rij = rij.parentNode;
	} while (rij.className.indexOf('rij') === -1);

	if (knop.className.indexOf('actief') !== -1) {
		knop.className = knop.className.replace('actief', '').trim();
		rij.className = rij.className.replace('actief', '').trim();
	} else {
		knop.className += ' actief';
		rij.className += ' actief';
	}
}

function efiberPakKnopValue(knop) {
	/*------------------------------------------------------
	|
	|	Een number of text input gebruikt de 'echte' input.
	| 	Een zelfgebouwde radio of checkbox gebruikt data-efiber-value
	| 	Dit normaliseert dat.
	|
	|-----------------------------------------------------*/


	if (knop.hasAttribute('value') || typeof knop.value !== 'undefined') {
		return Number(knop.value);
	}
		return Number(knop.getAttribute('data-efiber-value'));
}

function efiberSchakelCheckbox(knop) {
	/*------------------------------------------------------
	|
	| 	Stuurt functies aan die de klassen schakelen,
	| 	value van input schakelt en prijsberekening en -printen doen.
	|
	|-----------------------------------------------------*/


	efiberSchakelInputGeneriek(knop);

	let val = efiberPakKnopValue(knop);

	if (!val) val = 0;

	if (val === 0) {
		knop.setAttribute('data-efiber-value', 1);
	} else {
		knop.setAttribute('data-efiber-value', 0);
	}

	efiberUpdatePrijs(knop);
}

function efiberFoxSports(knop) {
	/*------------------------------------------------------
	|
	| 	regelt het schakelen tussen de fox sports abonnementen.
	| 	@TODO WERKT NOG NIET  !!!!
	|
	|-----------------------------------------------------*/

	// @TODO dit werkt niet goed

	const eredivisie 	= doc.getElementById('fox_sports_ed'),
		internationaal 	= doc.getElementById('fox_sports_int'),
		compleet 		= doc.getElementById('fox_sports_compl');

	// Zet andere fox uit
	if (eredivisie.className.indexOf('actief') !== -1) {
		efiberSchakelCheckbox(eredivisie);
	}
	if (internationaal.className.indexOf('actief') !== -1) {
		efiberSchakelCheckbox(internationaal);
	}

	// als nu zelf actief, invalideer andere fox.
	if (compleet.className.indexOf('actief') !== -1) {
		internationaal.className += ' invalide';
		eredivisie.className += ' invalide';
	} else {
		// anders zijn ze zelf weer klikbaar
		internationaal.className = internationaal.className.replace('invalide', '').trim();
		eredivisie.className = eredivisie.className.replace('invalide', '').trim();
	}
}

function efiberToonRij(knop) {
	/*------------------------------------------------------
	|
	| 	Een knop kan de volgende rij tevoorschijn toveren met deze functie.
	|
	|-----------------------------------------------------*/


	const rij = knop.parentNode.parentNode.nextSibling;

	if (rij.className.indexOf('onzichtbaar') !== -1) {
		rij.className = rij.className.replace('onzichtbaar', '').trim();
	} else {
		rij.className += ' onzichtbaar';
	}
}


function efiberSchakelRadio(knop) {
	/*------------------------------------------------------
	|
	|	Zorgt er voor dat (quasi)-radio's hun werk doen
	| 	En gebruikt efiberSchakelCheckbox voor het effectueren van keuzes.
	| 	Je zou een verzameling radio's als een verzameling gekoppelde
	| 	checkboxes kunnen zien, daar maakt het gebruik van.
	|
	|-----------------------------------------------------*/


	const dezeKnopEnBroers = knop.parentNode.parentNode.getElementsByClassName('knop');

	// is dit maar 1 radio? dan gedraagd het zich als een checkbox.
	if (dezeKnopEnBroers.length === 1) {
		efiberSchakelCheckbox(knop);
	} else if (knop.className.indexOf('actief') !== -1) { // als deze actief is, dan deze laten gedragen als checkbox
		// sommige mogen niet géén optie hebben.
		// zoals installatie, stop die.
		if (knop.id.indexOf('installatie-keuze') === -1) {
			efiberSchakelCheckbox(knop);
		}
	} else {
		// als ander actief is, dan die en deze als checkbox laten gedragen.
		const dezeID = knop.id;

		for (let i = 0; i < dezeKnopEnBroers.length; i++) {
			if (dezeKnopEnBroers[i].className.indexOf('actief') !== -1) {
				// als actief.. en als niet de reeds geselecteerde knop
				if (dezeKnopEnBroers[i].id !== dezeID) {
					// via checkbox
					efiberSchakelCheckbox(dezeKnopEnBroers[i]);
				}
			}
		}

		// tenslotte de knop zelf
		efiberSchakelCheckbox(knop);
	}
}

function efiberSchakelNumber(knop) {
	/*------------------------------------------------------
	|
	|	Een nummer input is lekker simpel.
	|
	|-----------------------------------------------------*/

	efiberUpdatePrijs(knop);
}
