/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren, knoppenDispatcher, controleerPostcode, opSubmitDisable, ankerRedirect, generiekeValidatie  */
const doc = document,
	body 	= doc.body;
let $ = null;

function ankerRedirect() {


	/*------------------------------------------------------
	|
	| 	Indien iemand afkomstig is van een campagnepagina, dan worden links aangepast.
	|
	|-----------------------------------------------------*/


	var ankers = doc.querySelectorAll("a[href^='https://iedereenglasvezel']");
	var ankers2 = doc.querySelectorAll("a[href^='https://e-fiber']");

	if (location.search && location.search.indexOf('ref') !== -1) {

		var gaNaar = location.search.replace('?ref=', '');

		for (var i = ankers.length - 1; i >= 0; i--) {
			ankers[i].href = ankers[i].href.replace('iedereenglasvezel', gaNaar);
		}
		for (var i = ankers2.length - 1; i >= 0; i--) {
			ankers2[i].href = ankers2[i].href.replace('e-fiber', gaNaar);
		}

	} else {

		for (var i = ankers.length - 1; i >= 0; i--) {
			ankers[i].style.visibility = "hidden";
		}

	}	
}

function efiberInit() {
	/*------------------------------------------------------
	|
	| 	Deze functie start alles op!
	|
	|-----------------------------------------------------*/


	// alleen draaien op keuzehulp !
	if (location.href.indexOf('keuzehulp') === -1) {
		return false;
	}

	$ = jQuery;

	// afhandeling van navigatie
	efiberRouting.init();

	// dispatcher zit op de body te luisteren en stuurt functies aan.
	knoppenDispatcher();

	// viewlogica eerste scherm
	controleerPostcode();

	// zie onder
	opSubmitDisable();

	// terugsturen naar actiepagina of efiber op anker
	ankerRedirect();

	// generieke validatie zoals input alleen getallen
	generiekeValidatie();
}

window.onload = function () { efiberInit(); };

function generiekeValidatie() {
	/*------------------------------------------------------
	|
	| 	Geen letters in nummervelden.
	|
	|-----------------------------------------------------*/


	document.body.addEventListener('keydown', (e) => {
		const t = e.target,
		idAr = ['huidige-nummer', 'huidige-extra-nummer', 'input_1_21', 'huisnummer'],
		ekc = Number(e.keyCode);

		if (idAr.indexOf(e.target.id) !== -1) {
			if ($.inArray(ekc, [46, 8, 9, 27, 13, 110, 190]) !== -1
				|| (ekc === 65 && (e.ctrlKey === true || e.metaKey === true))
				|| (ekc === 67 && (e.ctrlKey === true || e.metaKey === true))
				|| (ekc === 88 && (e.ctrlKey === true || e.metaKey === true))
				|| (ekc >= 35 && e.keyCode <= 39)) {
					// let it happen, don't do anything
					return;
			}
			if ((e.shiftKey || (ekc < 48 || ekc > 57)) && (ekc < 96 || ekc > 105)) {
				e.preventDefault();
			}
		}
	});
}

function opSubmitDisable() {
	/*------------------------------------------------------
	|
	|	voorkomt dubbele verzending van Gravity Forms
	|	moet vanuit body luisteren omdat formulieren ingeajaxt worden.
	|
	|-----------------------------------------------------*/


	doc.body.addEventListener('submit', (e) => {
		if (e.target.id.indexOf('gform') !== -1)e.target.querySelector("[type='submit']").setAttribute('disabled', 'disabled');
	});
}


function efiberSorteerIWWIW(pakketten) {
	/*------------------------------------------------------
	|
	|	neemt een hoeveelheid pakketten en sorteert die op prijs
	| 	gebruikt in IWWIW
	|
	|-----------------------------------------------------*/


	// maak verzameling met bedragen aan
	const bedragen = pakketten.map(w => Number(w.eigenschappen.financieel.maandelijks)),

	// kopieer de verzameling tbv sortering en sorteer
	bedragenSort = (bedragen.map(w => w)).sort();


	// zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
	// als er een dubbele prijs is, dan zit deze index al in indicesvolgorde.
	// indexof werkt niet aangezien die alleen tot eerste index zoekt
	// een gewone map functie werkt hier niet omdat je het product moet kunnen uitlezen

	let ii,
	w,
	j;
	const indicesVolgorde = [];

	for (j = 0; j < bedragenSort.length; j++) {
		w = bedragenSort[j];
		for (ii = 0; ii < bedragen.length; ii++) {
			if (w === bedragen[ii]) {
				// zoek nu of deze index nog niet voorkomt.
				// zo ja, push waarde en break for.
				if (indicesVolgorde.indexOf(ii) === -1) {
					indicesVolgorde.push(ii);
					break;
				}
			}
		}
	}

	const pakkettenKopie = pakketten.map(ww => ww);
	pakketten = [];

	// per rij, volgorde aanpassen adhv indicesvolgorde.
	for (let i = 0; i < pakkettenKopie.length; i++) {
		pakketten.push(pakkettenKopie[ (indicesVolgorde[i]) ]);
	}

	return pakketten;
}
