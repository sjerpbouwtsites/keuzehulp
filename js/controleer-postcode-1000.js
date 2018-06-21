function controleerPostcode() {

	var postcodeForm = doc.getElementById('keuze-postcodeform');

	// @TODO LELIJKE HACK
	if (!postcodeForm) {
		doc.getElementsByTagName('body')[0].style.display = "none";
		location.href = location.origin + "/keuzehulp";
		return false;
	}

	// geen niet-getallen !!
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

		e.preventDefault();

		var postcodeTekst = doc.getElementById('postcode').value.replace(' ', '').toUpperCase();
		var correctePostcode = /^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i.test(postcodeTekst);
		var huisnummer = doc.getElementById('huisnummer').value.replace(' ', '').toLowerCase();

		if (!huisnummer.length) {
			efiberModal(teksten['vulHuisnummerIn']);
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
				cb: function(r){

					console.log(r);

					if (r && r.gevonden) {

						if (r.aanvraag_al_gedaan) {

							// "Er is al een aanvraag gedaan vanaf uw adres bij %provider%. Bezoekt u de website op %providerURL% of mailt u naar %providerMail%"

							efiberModal(efiberTekst ('aanvraagAlGedaan', [r.aanvraag_info.naam,	r.aanvraag_info.URL, r.aanvraag_info.naam, r.aanvraag_info.email ]), 60000);
							efiberRouting.ga(1);
							//efiberAjaxKleineFormulieren('efiber_haal_lead_formulier', 'print-lead-formulier', {});
							return;
						}


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

						//sessionStorage.setItem('efiber-keuzehulp', JSON.stringify({}));

						efiberModal(
							efiberTekst('welInUwGebiedTorso', r.regio)
						, 2000);
						efiberRouting.ga(2);

						setTimeout(function(){
						//	uitsessionStorageZetKnoppenActief();
							efiberStickyKeuzes();
						}, 150);

					} else {
						efiberModal(teksten['nietInUwGebied'], 5000);
						efiberRouting.ga(51);
						efiberAjaxKleineFormulieren('efiber_haal_lead_formulier', 'print-lead-formulier', {});
						//efiberHaalLeadFormulier();
					}
				}
			});

			ajf.doeAjax();

		// verkeerd geformatteerde postcode
		} else {
			efiberModal(teksten['postcodeVerkeerdGeformatteerd']);
		}

	});
}