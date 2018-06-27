var doc = document,
body 	= doc.body;

$;

// deze functie start alles op

function efiberInit() {

	// alleen draaien op keuzehulp !
	if (location.href.indexOf('keuzehulp') === -1) {
		return false;
	}

	console.clear();

	$ = jQuery

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

}

function ankerRedirect() {
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

function opSubmitDisable(){

	// voorkomt dubbele verzending van Gravity Forms
	// moet vanuit body luisteren omdat formulieren ingeajaxt worden.

	doc.body.addEventListener('submit', function(e){
		e.target.id.indexOf('gform') !== -1 && e.target.querySelector("[type='submit']").setAttribute('disabled', 'disabled');		
	});

}


function efiberSorteerIWWIW(pakketten){

	// maak verzameling met bedragen aan
	var bedragen = pakketten.map(function(w){
		return Number(w.eigenschappen.financieel.maandelijks);
	});

	// kopieer de verzameling tbv sortering en sorteer
	var bedragenSort = (bedragen.map(function(w){return w})).sort();


	// zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
	// als er een dubbele prijs is, dan zit deze index al in indicesvolgorde. 
	// indexof werkt niet aangezien die alleen tot eerste index zoekt
	// een gewone map functie werkt hier niet omdat je het product moet kunnen uitlezen

	var ii, w, j;
	var indicesVolgorde = [];

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

	var pakkettenKopie = pakketten.map(function(w){return w});
	var pakketten = [];

	// per rij, volgorde aanpassen adhv indicesvolgorde.
	for(var i = 0; i < pakkettenKopie.length; i++) {
		pakketten.push( pakkettenKopie[ (indicesVolgorde[i]) ] );		
	}

	return pakketten;
	
}




