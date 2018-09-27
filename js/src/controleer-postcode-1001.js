
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */

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
			// "Er is al een aanvraag gedaan vanaf uw adres bij %provider%.
			// Bezoekt u de website op %providerURL% of mailt u naar %providerMail%"


			//Iemand heeft reeds een aanvraag gedaan vanaf uw adres bij de provider %s0. Wij kunnen u nu niet verder helpen.<br>Bezoekt u <a href='%s1'>%s2s website</a> of mailt u naar %s3. U kunt ook bellen naar %s4

			kzModal({
				kop: 'Aanvraag al gedaan',
				torso: kzTekst('aanvraag_gedaan', [r.aanvraag_info.naam, r.aanvraag_info.URL, r.aanvraag_info.naam, r.aanvraag_info.email, r.aanvraag_info.telefoon])
			}, 60000);

			kzRouting.ga(1); // terug naar de voorpagina.
			return;
		}


		// @TODO dit is drie keer hetzelfde. Doe het allemaal via het adres.
		// hoe wordt door de achterkant teruggegeven?!
		r.data.gebiedscode = r.gebiedscode;
		r.data.status = r.status;
		r.data.perceelcode = r.perceelcode;
		sessionStorage.setItem('kz-adres', JSON.stringify(r.data));
		sessionStorage.setItem('kz-code', r.gebiedscode);

		body.setAttribute('data-kz-status', r.data.status);

		if (r.status === '100') { //geannuleerd

			if (r.provider_beschikbaar) {
				kzModal(
					kzTekst('succes_annulering'),
					2000,
				);
				kzRouting.ga(2);
			} else {
				kzModal(
					kzTekst('lead_annulering'),
					5000
				);
				kzRouting.ga(51);
				KzAjaxKleineFormulieren('keuzehulp_haal_lead_formulier', 'print-lead-formulier', {});
			}

		} else if (r.status === '0') {


			if (r.provider_beschikbaar) {
				kzRouting.ga(20);
			} else {
				logFouteSituatiePostcodeCheck(r);
			} 

		} else {

			if (r.provider_beschikbaar) {

/*				const tekstSleutel = {
					status1: 'succes_vraag_bundeling',
					status2: 'succes_schouwen',
					status3: 'succes_graafwerkzaamheden',
					status4: 'succes_huisaansluitingen',
					status5: 'succes_opgeleverd',
				};

				kzModal(
					kzTekst(tekstSleutel[`status${r.status}`], r.regio),
					2000,
				);*/ 
				
				kzRouting.ga(2);

			} else {
				logFouteSituatiePostcodeCheck(r);
			}

		}

	} else {
		kzModal(kzTekst('niet_in_uw_gebied'), 5000);
		kzRouting.ga(51);
		kzAjaxKleineFormulieren('keuzehulp_haal_lead_formulier', 'print-lead-formulier', {});
		// kzHaalLeadFormulier();
	}
}


function logFouteSituatiePostcodeCheck(r){

	kzModal(
		kzTekst('postcodecheck_fout'),
		5000
	);

	const ajf = new KzAjax({
		ajaxData: {
			action: 'kz_schrijf_fout',
			data: {
				aType: 'geen pakketten gevonden',
				postcodecheckData: r
			},
		},
		cb: function(){
			setTimeout(()=>{
				location.href = location.origin;
			}, 1500);
		},
	});

	ajf.doeAjax();

}

function controleerPostcode() {
	/*------------------------------------------------------
	|
	| 	Gaat om met de input van de postcodeformulier
	| 	Valideert de invoer
	| 	Stuurt info naar de achterkantfunctie keuzehulp_controleer_postcode
	| 	Laat de afhandeling van die ajax call verder doen door postcodeAjaxCB
	|
	| 	Bevat een stukje routing; als iemand op een url komt waarop de keuzehulp niet draait
	| 	herkent adhv of formulier bestaat of niet, dan wordt die persoon doorgestuurd naar /keuzehulp
	| 	Dus bijvoorbeeld verversen in keuzehulp/nep-URI -> 404 -> /keuzehulp
	|
	|-----------------------------------------------------*/ 


	const postcodeForm = doc.getElementById('keuze-postcodeform');

	if (!postcodeForm && !location.href.includes('bedankt') && !location.href.includes('dankje')) {
		location.href = location.origin;
	}

	const getVars = {};

	// binnenkomend via formulier op iedereenglasvel.nl?
	if (location.search) {
		location.search.substr(1, location.search.length).split('&').forEach((a) => {
			const t = a.split('=');
			getVars[(t[0])] = t[1];
		});

		// minimaal vereist: postcode en huisnummer
		if (getVars.huisnummer && getVars.postcode) {
			const ajf = new KzAjax({
				ajaxData: {
					action: 'keuzehulp_controleer_postcode',
					data: {
						postcode: getVars.postcode,
						huisnummer: getVars.huisnummer,
						toevoeging: getVars.toevoeging || '',
						kamer: getVars.kamer || '',
					},
				},
				cb: postcodeAjaxCB,
			});

			ajf.doeAjax();
		}
	}


	postcodeForm.addEventListener('submit', (e) => {
		// we valideren alleen postcode en huisnummer
		// want andere twee zouden leeg moeten kunnen zijn.

		e.preventDefault();

		const postcodeTekst = doc.getElementById('postcode').value.replace(' ', '').toUpperCase(),
			correctePostcode = /^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i.test(postcodeTekst),
			huisnummer = doc.getElementById('huisnummer').value.replace(' ', '').toLowerCase();

		if (!huisnummer.length) {
			kzModal(kzTekst('vul_huis_nummer_in'), 2500);
			return;
		}

		if (correctePostcode) {
			const ajf = new KzAjax({
				ajaxData: {
					action: 'keuzehulp_controleer_postcode',
					data: {
						postcode: postcodeTekst,
						huisnummer,
						toevoeging: doc.getElementById('toevoeging').value.replace(' ', '').toLowerCase(),
						kamer: doc.getElementById('kamer').value.replace(' ', '').toLowerCase(),
					},
				},
				cb: postcodeAjaxCB,
			});

			ajf.doeAjax();

		// verkeerd geformatteerde postcode
		} else {
			kzModal(kzTekst('postcode_verkeerd_geformatteerd'), 2500);
		}
	});
}
