function controleerPostcode() {


	/*------------------------------------------------------
	|
	| 	Gaat om met de input van de postcodeformulier
	| 	Valideert de invoer
	| 	Stuurt info naar de achterkantfunctie efiber_controleer_postcode
	| 	Laat de afhandeling van die ajax call verder doen door postcodeAjaxCB
	|
	| 	Bevat een stukje routing; als iemand op een url komt waarop de keuzehulp niet draait
	| 	herkent adhv of formulier bestaat of niet, dan wordt die persoon doorgestuurd naar /keuzehulp
	| 	Dus bijvoorbeeld verversen in keuzehulp/nep-URI -> 404 -> /keuzehulp
	|
	|-----------------------------------------------------*/


	var postcodeForm = doc.getElementById('keuze-postcodeform');

	// @TODO LELIJKE HACK
	// zou in htaccess moeten
	if (!postcodeForm) {
		doc.getElementsByTagName('body')[0].style.display = "none";
		location.href = location.origin + "/keuzehulp";
		return false;
	}

	// houdt toetsaanslagen tegen die geen nummer zijn.
	// @TODO afsplitsen naar app-generieke functie.
    $('#huisnummer').keydown(function (e) {
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

	postcodeForm.addEventListener('submit', function(e){

		// we valideren alleen postcode en huisnummer
		// want andere twee zouden leeg moeten kunnen zijn.

		e.preventDefault();

		var postcodeTekst = doc.getElementById('postcode').value.replace(' ', '').toUpperCase();
		var correctePostcode = /^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i.test(postcodeTekst);
		var huisnummer = doc.getElementById('huisnummer').value.replace(' ', '').toLowerCase();

		if (!huisnummer.length) {
			efiberModal(teksten['vulHuisnummerIn'], 2500);
			return;
		}

		if (correctePostcode) {

			var ajf = new efiberAjax({
				ajaxData :{
					'action': 'efiber_controleer_postcode',
					data: {
						postcode: postcodeTekst,
						huisnummer: huisnummer,
						toevoeging: doc.getElementById('toevoeging').value.replace(' ', '').toLowerCase(),
						kamer: doc.getElementById('kamer').value.replace(' ', '').toLowerCase(),
					},
				},
				cb: postcodeAjaxCB,
			});

			ajf.doeAjax();

		// verkeerd geformatteerde postcode
		} else {
			efiberModal(teksten['postcodeVerkeerdGeformatteerd'], 2500);
		}

	});
}

function postcodeAjaxCB(r) {


	/*------------------------------------------------------
	|
	| 	callback voor postcode ajax
	| 	breekt af met modal en doorverwijzing als achterkant zegt: niet in gebied
	| 	breekt af met modal en doorverwijzing als achterkant zegt: in gebied, maar aanvraag al gedaan
	| 	slaat anders info over gebied op die uit achterkant komt
	| 	vervangt ankers in hele app met terugverwijzingen naar respectieve campagnepagina's
	| 	initialiseert stickyKeuzes functie
	| 	verwijst door naar daadwerkelijke keuzehulp, niveau 2.
	|
	|-----------------------------------------------------*/


	if (r && r.gevonden) {

		if (r.aanvraag_al_gedaan) {

			// "Er is al een aanvraag gedaan vanaf uw adres bij %provider%. Bezoekt u de website op %providerURL% of mailt u naar %providerMail%"

			efiberModal(efiberTekst ('aanvraagAlGedaan', [r.aanvraag_info.naam,	r.aanvraag_info.URL, r.aanvraag_info.naam, r.aanvraag_info.email ]), 60000);
			efiberRouting.ga(1); // terug naar de voorpagina.
			return;
		}


		// @TODO dit is drie keer hetzelfde. Doe het allemaal via het adres.
		// hoe wordt door de achterkant teruggegeven?!
		r.data.gebiedscode = r.gebiedscode;
		sessionStorage.setItem('efiber-adres', JSON.stringify(r.data));
		sessionStorage.setItem('efiber-code', r.gebiedscode);
		sessionStorage.setItem('efiber-gebiedscode', r.gebiedscode);

		var ankers = doc.querySelectorAll("a[href^='https://iedereenglasvezel']");

		var thuisUrl = '';

		if (r.gebiedscode === 'EFIKOGG01') {
			thuisUrl = "koggenlandopglasvezel";
		} else {
			thuisUrl = "heerhugowaardopglasvezel";
		}

		for (var i = ankers.length - 1; i >= 0; i--) {
			ankers[i].href = ankers[i].href.replace('iedereenglasvezel', thuisUrl);
			ankers[i].style.visibility = "visible";
		}

		efiberModal(
			efiberTekst('welInUwGebiedTorso', r.regio)
		, 2000);
		efiberRouting.ga(2);

		// wacht op rendering van eea zodat pixelberekeningen kloppen
		setTimeout(function(){
			efiberStickyKeuzes();
		}, 150);

	} else {
		efiberModal(teksten['nietInUwGebied'], 5000);
		efiberRouting.ga(51);
		efiberAjaxKleineFormulieren('efiber_haal_lead_formulier', 'print-lead-formulier', {});
		//efiberHaalLeadFormulier();
	}
}
