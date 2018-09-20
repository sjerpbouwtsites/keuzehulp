/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren, naarCamelCase  */

function kzNormaliseerGeheugen(str) {
	const isJSON = sessionStorage.getItem(str);
	let geheugenObj;
	if (isJSON) {
		geheugenObj = JSON.parse(isJSON);
	} else {
		geheugenObj = {};
	}
	return geheugenObj;
}

function keuzehulpGeneriek(knop, dataAttrNaam, keuzeSleutel, callback) {
	const dezeKeuze = naarCamelCase(knop.getAttribute(dataAttrNaam)),
	keuzehulpGeheugen = kzNormaliseerGeheugen('kz-keuzehulp');

	if (knop.className.indexOf('multiselect') !== -1) {
		// als multiselect, sla op in array, en controleer of deze in array, verwijderen zo ja etc.


		if (keuzeSleutel in keuzehulpGeheugen) {
			// als deze waarde al in array, dan verwijderen, anders toevoegen
			const dki = keuzehulpGeheugen[keuzeSleutel].indexOf(dezeKeuze);
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

	sessionStorage.setItem('kz-keuzehulp', JSON.stringify(keuzehulpGeheugen));

	if (typeof callback === 'function') {
		callback();
	}
}
