/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function kzPluginRelURL(){
	return "/wp-content/plugins/kz";
}

function naarCamelCase(str) {
	/*---------------------------------
	|
	|	Wat binnen komt als streep-case
	| 	Gaat er uit als camelCase
	|
	|---------------------------------*/


	const split = str.split('-');

	if (split.length > 1) {
		for (let i = 1; i < split.length; i++) {
			split[i] = split[i][0].toUpperCase() + split[i].substring(1);
		}
	}
	return split.join('');
}

function naarStreepCase(snede) {
	/*----------------------------------
	|
	|	Wat binnen komt als combinatie van
	|	woorden, spaties en &@#^&* en ;'etc
	| 	komt-er-uit-als-streep-case
	|
	|---------------------------------*/


	return snede
	.replace(/([A-Z])/g, '-$1')
	.replace(/^./, str => str.toUpperCase()).toLowerCase();
}

function uniek(waarde, index, lijst) { 
    return lijst.indexOf(waarde) === index;
}

function kzVindKnop(t, klasse) {
	/*----------------------------------
	|
	|	Gebruikt in het aanmeldformulier
	| 	Om de eigenlijke .knop te vinden
	|	Had wel met een while-loop gemogen
	|
	|---------------------------------*/


	let k = t;

	// zitten we in een SVG?
	// svg nodes hebben andere dom properties
	while (typeof k.className !== 'string') {
		k = k.parentNode;
	}

	if (k.classList.contains('knop')) return k;

	do {
		k = k.parentNode;
	} while (!k.classList.contains('knop') && !k.classList.contains('keuzehulp')); // niet doorgaan na body

	if (k.classList.contains('keuzehulp')) {
		return false;
	} else {
		return k;
	}
}

function kzEuro(bedrag) {
	/*----------------------------------
	|
	| 	Formateert bedragen:
	| 	0 => inclusief
	| 	ander geldig bedrag => euroteken + xx,xx
	| 	false => '-'
	|
	|---------------------------------*/


	if (bedrag && typeof bedrag !== 'boolean') {
		if (bedrag == 0) {
			return 'inclusief';
		}
			return `&euro; ${Number(bedrag).toFixed(2).toString().replace('.', ',')}`;
	}
		return '-'; // als false oid
}

function kzNietMin1ReturnZelfOfFalse(a) {
	/*----------------------------------
	|
	|	Onderdeel van het normaliseren van
	| 	data in de tabelmiddelware
	|
	|---------------------------------*/


	return (a !== '-1' ? a : false);
}


function kzMaakBestelKnop(pakket, eigenschappen, tekst) {
	/*----------------------------------
	|
	|	Deze functie zou niet mogen bestaan.
	|
	|---------------------------------*/


	if (typeof tekst === 'undefined') {
		tekst = 'Bestel';
	}

	// we slaan de pakket + opties info op in sessionStorage
	// zodat die weldra via referentie naar een andere functie gestuurd kan worden

	// @TODO combineren van deze twee acties is WAANZIN... html genereren en geheugen schrijven :(
	sessionStorage.setItem(`pakket-${pakket.ID}`, JSON.stringify(arguments));
	this.HTML = `<a class='knop geen-ikoon kz-bestelknop' data-kz-func='toon-stap animeer aanmeldformulier' href='#100' kz-data-pakket-id='${pakket.ID}'>${tekst}</a>`;
}

function kzVindCombiKnop(knop){

	let k = knop;

	if (k.classList.contains('kz-knop-combi')) return k;

	do {
		k = k.parentNode;
	} while (!k.classList.contains('kz-knop-combi') && !k.classList.contains('keuzehulp')); // niet doorgaan na body

	if (k.classList.contains('keuzehulp')) {
		console.error(new Error('doorgezocht naar body maar geen combiknop gevonden'));
		return;
	} else {
		return k;
	}

}

function kzVindSectie(knop) {
	let w = knop.parentNode;
	do {
	  w = w.parentNode;
	} while (!w.hasAttribute('data-keuzehulp-stap') && !w.classList.contains('keuzehulp')); // niet voorbij body

	if (w.classList.contains('keuzehulp')) {
		return new Error('sectie niet gevonden');
	} else {
		return w;
	}
	
}

function kzVindRij(knop) {
	let w = knop.parentNode;
	do {
	  w = w.parentNode;
	} while (!w.classList.contains('rij') && !w.classList.contains('keuzehulp')); // niet voorbij body

	if (w.classList.contains('keuzehulp')) {
		return new Error('sectie niet gevonden');
	} else {
		return w;
	}
	
}