


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


	var knopID = knop.getAttribute('efiber-data-pakket-id');
	sessionStorage.setItem('knopID', knopID);

	var ajf = new efiberAjax({
		ajaxData: {
			'action': 'efiber_haal_aanmeldformulier',
			data: JSON.parse(sessionStorage.getItem('pakket-'+knopID)),
			adres: JSON.parse(sessionStorage.getItem('efiber-adres')),
			keuzehulp: JSON.parse(sessionStorage.getItem('efiber-keuzehulp')),
		},
		cb: function(r){

			// wellicht is er al een eerder formulier ingeladen.
			jQuery('#print-aanmeldformulier').empty();

			if (!r) {
				console.warn('geen correcte JSON teruggekregen haalPrintAanmeldformulier');
			}

			var $form = jQuery(r.print);

			delete r.print;

			// formulier schrijft nog niet naar huidige locatie...
			$form.find('form').attr('action', location.href);

			jQuery('#print-aanmeldformulier').append($form);

			var adres = JSON.parse(sessionStorage.getItem('efiber-adres'));
			var keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));

			// het zijn de click events die de verwerking van de data aanjagen..
			jQuery('#print-aanmeldformulier').on('change', 'input[type="number"], #huidige_nummer, #huidige_extra_nummer', function(){
				this.click(); //dan stuurt t door naar de dispatcher
			});


			// geen niet-getallen !!
			// @TODO afsplitsen naar te bouwen generieke validatie
		    $('input[type="number"], #huidige_nummer, #huidige_extra_nummer, #input_1_21').keydown(function (e) {
		        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
		            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
		            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
		            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
		            (e.keyCode >= 35 && e.keyCode <= 39)) {
		                 // let it happen, don't do anything
		                 return;
		        }
		        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
		            e.preventDefault();
		        }
		    });

		    var adresDataToewijzing = {
				'input_1_20' : 'postcode',
				'input_1_21' : 'huisnummer',
				'input_1_22' : 'toevoeging',
				'input_1_23' : 'kamer',
				'input_1_73' : 'gebiedscode',
		    };



		    for (var input in adresDataToewijzing) {

		    	var el = doc.getElementById(input);

		    	if (!el || typeof el === 'undefined') {
		    		console.warn(input, 'bestaat niet... db issue?');
		    	} else {
		    		el.value = adres[(adresDataToewijzing[input])];
		    	}

		    }

		    // initialiseer de maandprijs bovenaan het formulier
			doc.getElementById('kopieer-de-prijs').textContent = doc.getElementById('print-maandelijks-totaal').textContent;

			// alle rijen met actieve knoppen op actief
			jQuery('#print-aanmeldformulier').find('.knop').each(function(){

				//console.log(this);

				var _t = this;

				var rij = _t;
				do {
					rij = rij.parentNode;
				} while (rij.className.indexOf('rij') === -1);

				//console.log(rij);

				rij.className = rij.className + " heeft-knop";

				if (_t.className.indexOf('actief') !== -1) {
					rij.className = rij.className + " actief";
				}

			});

			// schrijf opties naar GF
			efiberUpdateHidden();


			jQuery.datepicker.regional.nl = {
				closeText: "Sluiten",
				prevText: "←",
				nextText: "→",
				currentText: "Vandaag",
				monthNames: [ "januari", "februari", "maart", "april", "mei", "juni",
				"juli", "augustus", "september", "oktober", "november", "december" ],
				monthNamesShort: [ "jan", "feb", "mrt", "apr", "mei", "jun",
				"jul", "aug", "sep", "okt", "nov", "dec" ],
				dayNames: [ "zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag" ],
				dayNamesShort: [ "zon", "maa", "din", "woe", "don", "vri", "zat" ],
				dayNamesMin: [ "zo", "ma", "di", "wo", "do", "vr", "za" ],
				weekHeader: "Wk",
				dateFormat: "dd-mm-yy",
				firstDay: 1,
				isRTL: false,
				showMonthAfterYear: false,
				yearSuffix: "" };

			jQuery.datepicker.setDefaults( jQuery.datepicker.regional.nl );

			// date field interactief.
			gformInitDatepicker();


			// valideert minimumleeftijd = 18 want je moet minstens in 2000 geboren zijn. 
			$(".datepicker_with_icon").on('change', function(){

				var v = this.value;

				if (v.length > 5) {
					var is18 = (Number(v.split('/')[2]) - 2000) < 0;
					if (!is18) {
						efiberModal(efiberTekst('minimum18'), 2000);
						$("#gform_submit_button_1").hide();
					} else {
						$("#gform_submit_button_1").show();
					}
				}
			});

			$("#input_1_30").on('blur', function(){
				var vastNummer = /^(((0)[1-9]{2}[0-9][-]?[1-9][0-9]{5})|((\\+31|0|0031)[1-9][0-9][-]?[1-9][0-9]{6}))$/;
    			var mobielNummer = /^(((\\+31|0|0031)6){1}[1-9]{1}[0-9]{7})$/i;

    			if (	 	!(vastNummer.test(this.value) || mobielNummer.test(this.value))	) {
    				efiberModal(efiberTekst('correctTel'), 1500);
    			}
					
			});

			// is er misschien via ajax een nieuwe ingezet en heeft die %PRINT_ALGEMENE_VOORWAARDEN%?

			// @TODO LELIJKE HACK

			var vervangAlgemeneVoorwaarden = setInterval(function(){

				var e = $("#field_1_72");
				var tekstFaal = e.text().indexOf('%PRINT_ALGEMENE_VOORWAARDEN%') !== -1;

				if (tekstFaal) {

					e.empty();
					var t = r.pakket.eigenschappen.pakket_meta.provider.ik_ga_akkoord_met;
					t = t.replace(/\\\//g, "/");
					e.append($(t));

					clearInterval(vervangAlgemeneVoorwaarden);

				}

			}, 500);

		}

	}); // ajax

	ajf.doeAjax();

}

function efiberSchakelCheckbox(knop) {


	/*------------------------------------------------------
	|
	| 	Stuurt functies aan die de klassen schakelen, 
	| 	value van input schakelt en prijsberekening en -printen doen.
	|
	|-----------------------------------------------------*/


	efiberSchakelInputGeneriek(knop);

	var val = efiberPakKnopValue (knop);

	if (!val) val = 0;

	if (val === 0) {
		knop.setAttribute('data-efiber-value', 1);
	} else {
		knop.setAttribute('data-efiber-value', 0);
	}

	efiberUpdatePrijs(knop);

}

function efiberSchakelRadio(knop) {


	/*------------------------------------------------------
	|
	|	Zorgt er voor dat (quasi)-radio's hun werk doen
	| 	En gebruikt efiberSchakelCheckbox voor het effectueren van keuzes.
	| 	Je zou een verzameling radio's als een verzameling gekoppelde checkboxes kunnen zien, daar maakt het gebruik van.
	| 
	|-----------------------------------------------------*/


	var dezeKnopEnBroers = knop.parentNode.parentNode.getElementsByClassName('knop');

	//is dit maar 1 radio? dan gedraagd het zich als een checkbox.
	if (dezeKnopEnBroers.length === 1){
		efiberSchakelCheckbox(knop);
	} else {

		// als deze actief is, dan deze laten gedragen als checkbox
		if (knop.className.indexOf('actief') !== -1) {

			// sommige mogen niet géén optie hebben.
			// zoals installatie, stop die.
			if (knop.id.indexOf('installatie_keuze') === -1) {
				efiberSchakelCheckbox(knop);
			}

		} else {

			// als ander actief is, dan die en deze als checkbox laten gedragen.
			var dezeID = knop.id;

			for (var i = 0; i < dezeKnopEnBroers.length; i++) {

				if (dezeKnopEnBroers[i].className.indexOf('actief') !== -1) {

					//als actief.. en als niet de reeds geselecteerde knop
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

}

function efiberSchakelInputGeneriek(knop) {


	/*------------------------------------------------------
	|
	|	Vindt de rij en schakelt op rij en knop de klasse actief.
	| 
	|-----------------------------------------------------*/


	var rij = knop;
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

function efiberSchakelNumber(knop){


	/*------------------------------------------------------
	|
	|	Een nummer input is lekker simpel.
	| 
	|-----------------------------------------------------*/


	efiberUpdatePrijs(knop);

}

function efiberPakKnopValue (knop) {


	/*------------------------------------------------------
	|
	|	Een number of text input gebruikt de 'echte' input.
	| 	Een zelfgebouwde radio of checkbox gebruikt data-efiber-value
	| 	Dit normaliseert dat.
	| 
	|-----------------------------------------------------*/


	if (knop.hasAttribute('value') || typeof knop.value !== 'undefined') {
		return Number(knop.value);
	} else {
		return Number(knop.getAttribute('data-efiber-value'));
	}
}

function efiberUpdatePrijs(knop) {


	/*------------------------------------------------------
	|
	| 	Huidige product data wordt uit HTML gelezen
	| 	Veranderen worden berekend en geprint naar knop & respectieve totalen
	| 
	|-----------------------------------------------------*/


	var dv = efiberPakKnopValue(knop);

	if (dv < 0) {
		efiberModal('Negatief niet toegestaan');
		return false;
	}

	var print;
	if (knop.className.indexOf('eenmalig') === -1){
		print = doc.getElementById('print-maandelijks-totaal');
	} else {
		print = doc.getElementById('print-eenmalig-totaal');
	}

	// van €35,35 naar 35.35
	var huiPrijs = Number(print.textContent.trim().substr(1).replace(',', '.'));

	var dvv = Number(knop.getAttribute('data-efiber-vorige-value'));
	var dw = Number(knop.getAttribute('data-efiber-waarde'));
	var basisPrijs = huiPrijs - (dvv * dw);
	var eindPrijs = basisPrijs + (dv * dw);

	// van 35.35 naar €35,35
	var printDit = "\u20AC" + eindPrijs.toFixed(2).toString().replace('.', ',');
	print.textContent = printDit;

	if (knop.className.indexOf('eenmalig') === -1) {
		doc.getElementById('kopieer-de-prijs').textContent = printDit;
	}

	knop.setAttribute('data-efiber-vorige-value', dv);

}

function efiberFoxSports (knop){


	/*------------------------------------------------------
	|
	| 	regelt het schakelen tussen de fox sports abonnementen.
	| 
	|-----------------------------------------------------*/

	//@TODO dit werkt niet goed

	var eredivisie 		= doc.getElementById('fox_sports_ed');
	var internationaal 	= doc.getElementById('fox_sports_int');
	var compleet 		= doc.getElementById('fox_sports_compl');

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

function efiberToonRij(knop){


	/*------------------------------------------------------
	|
	| 	Een knop kan de volgende rij tevoorschijn toveren met deze functie.
	| 
	|-----------------------------------------------------*/


	var rij = knop.parentNode.parentNode.nextSibling;

	if (rij.className.indexOf('onzichtbaar') !== -1) {
		rij.className = rij.className.replace('onzichtbaar','').trim();
	} else {
		rij.className = rij.className + ' onzichtbaar';
	}

}

function efiberUpdateHidden() {


	/*------------------------------------------------------
	|
	| 	functie draait iedere keer dat een knop wordt aangeklikt
	| 	print waarden van dynamische formulier in hidden velden GF.
	| 
	|-----------------------------------------------------*/

	var inputs = doc.getElementById('print-aanmeldformulier').getElementsByClassName('knop');

	var printMapping = {
		'belpakket': 						doc.getElementById('input_1_38'),
		'nummerbehoud': 					doc.getElementById('input_1_39'),
		'huidige_nummer': 					doc.getElementById('input_1_40'),
		'extra_vast_nummer': 				doc.getElementById('input_1_41'),
		'nummerbehoud_extra_vast_nummer': 	doc.getElementById('input_1_42'),
		'huidige_extra_nummer': 			doc.getElementById('input_1_43'),
		'installatie': 						doc.getElementById('input_1_44'), // let op 45 46 missen
		'pakket_key': 						doc.getElementById('input_1_47'),
		'provider': 						doc.getElementById('input_1_48'),
		'pakket': 							doc.getElementById('input_1_49'),
		'opnemen_replay_begin_gemist_samen':doc.getElementById('input_1_50'),
		'opnemen': 							doc.getElementById('input_1_51'),
		'replay': 							doc.getElementById('input_1_52'),
		'begin_gemist': 					doc.getElementById('input_1_53'),
		'app': 								doc.getElementById('input_1_54'),
		'fox_sports_ed': 					doc.getElementById('input_1_55'),
		'fox_sports_int': 					doc.getElementById('input_1_56'),
		'fox_sports_compl': 				doc.getElementById('input_1_57'),
		'ziggo_sport_totaal': 				doc.getElementById('input_1_58'),
		'film1': 							doc.getElementById('input_1_59'),
		'erotiek_pakket': 					doc.getElementById('input_1_60'),
		'plus_pakket': 						doc.getElementById('input_1_61'),
		'extra_tv_ontvangers': 				doc.getElementById('input_1_62'),
		'publieke_naam': 					doc.getElementById('input_1_63'),
		'provider': 						doc.getElementById('input_1_64'),
		'pakket_key': 						doc.getElementById('input_1_65'),
		'pakket': 							doc.getElementById('input_1_66'),
		'inschrijving_telefoonboek': 		doc.getElementById('input_1_74'),
		'extra-optie': 						doc.getElementById('input_1_75'),
	};


	//uitzondering als input = radio & checkbox

	var di, dp, uitzondering, pmid, dev, s;

	for (var i = 0; i < inputs.length; i++) {
		di = inputs[i];

		uitzondering = di.id.indexOf('belpakket') !== -1 || di.id.indexOf('installatie') !== -1 || di.id.indexOf('extra-optie') !== -1;

		if (!uitzondering) {

			dp = printMapping[di.id];

			//geef harde error alert als undefined
			if (typeof dp === 'undefined') {
				console.warn(di.id +' heeft geen GF invoerveld of komt niet (correct) voor in mapping.');
				return false;
			} else {
				dp.value = !!di.value ? di.value : !!di.getAttribute('data-efiber-value') ? di.getAttribute('data-efiber-value') : false;
			}

		} else {

			pmid = di.id.split('_')[0]; //belpakket of installatie
			dp = printMapping[pmid];
			dev = di.getAttribute('data-efiber-value');

			// is er een input in deze verzameling aan? 


			var dezeInputVerzameling = document.querySelectorAll("[id^='"+pmid+"']");
			var erIsEenGekozen = false;

			for (var j = dezeInputVerzameling.length - 1; j >= 0; j--) {
				if (dezeInputVerzameling[j].className.indexOf('actief') !== -1) erIsEenGekozen = true;
			}

			if (erIsEenGekozen) {

				//altijd maar één radio aan, dus diegene die aanstaat mag printen
				if (dev && dev !== '0') {

					// dit kan voorkomen als 
					// 1) extra-optie of
					// 2) bla_fdsf-sdf

					// hier is een poging gedaan om het op te ruimen. Dit is niet afdoende. Dat moet nog eens uitgebreider.
					// eigenlijk slaat het hier helemaal nergens op
					s = di.id.split('_');

					if (s.length > 1) {
						dp.value = s[1];
					} else {

						// dit is de extra optie. Die heeft in de ID geen _ 

						if (di.id.indexOf('extra-optie') !== -1) {

							var rij = di.parentNode;
							while(rij.className.indexOf('rij') === -1) {
								rij = rij.parentNode;
							}

							dp.value = rij.getElementsByClassName('veld-1')[0].textContent.trim();

						}
						
					}

				}

			} else {

				// geen input aan in verzameling
				dp.value = '';

			}

		}

	}

	// nu nog pakket uit keuzehulp

	// @TODO WAT DOET DIT COMMENTAAR HIER BOVEN !??!?!

}
