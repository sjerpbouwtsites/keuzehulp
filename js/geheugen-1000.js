
function uitsessionStorageZetKnoppenActief() {

	// gaat door het geheugen heen en zet de relevante knoppen op actief.

	var kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
	var gs;

	if (!!kh) {
		for (var s in kh) {
			gs = kh[s];
			if (Array.isArray(gs)) {
				for (var i = gs.length - 1; i >= 0; i--) {
					uitsessionStorageZetKnoppenActiefHelper(s, gs[i]);
				}
			} else {
				uitsessionStorageZetKnoppenActiefHelper(s, gs);
			}
		}
	}
}

function uitsessionStorageZetKnoppenActiefHelper(s, keuze) {

	var el = doc.querySelector('[data-efiber-'+s+'-keuze="'+keuze+'"]');

	if (!el) {
		//opnieuw zoeken met streepcase
		var selector = '[data-efiber-'+naarStreepCase(s)+'-keuze="'+naarStreepCase(keuze)+'"]';
		el = doc.querySelector(selector);
	}

	if (el) {

		el.className = el.className + " actief";
		// en zet ze ook in de zijbalk
		efiberAppendNiveauKnop(el);

	} else {
		console.warn('el null', s, keuze);
	}

}


function eFiberNormaliseerGeheugen(str) {
	var isJSON = sessionStorage.getItem(str);
	var geheugenObj;
	if (isJSON) {
		geheugenObj = JSON.parse(isJSON);
	} else {
		geheugenObj = {};
	}
	return geheugenObj;
}

function keuzehulpGeneriek (knop, dataAttrNaam, keuzeSleutel, callback){

	var dezeKeuze = naarCamelCase(knop.getAttribute(dataAttrNaam));
	keuzehulpGeheugen = eFiberNormaliseerGeheugen('efiber-keuzehulp');

	if (knop.className.indexOf('multiselect') !== -1) {
		// als multiselect, sla op in array, en controleer of deze in array, verwijderen zo ja etc.


		if (keuzeSleutel in keuzehulpGeheugen) {
			//als deze waarde al in array, dan verwijderen, anders toevoegen
			var dki = keuzehulpGeheugen[keuzeSleutel].indexOf(dezeKeuze);
			if (dki !== -1) {
				keuzehulpGeheugen[keuzeSleutel].splice(dki, 1);
			} else {
				keuzehulpGeheugen[keuzeSleutel].push(dezeKeuze);
			}
		} else {
			keuzehulpGeheugen[keuzeSleutel] = [dezeKeuze];
		}


	} else {
		// normaal opslaan is direct opslaan / overschrijven
		keuzehulpGeheugen[keuzeSleutel] = dezeKeuze;
	}

	sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(keuzehulpGeheugen));

	if (typeof callback === 'function') {
		callback();
	}
}