function naarCamelCase (str) {
	var split = str.split('-');

	if (split.length > 1) {
		for (var i = 1; i < split.length; i++) {
			split[i] = split[i][0].toUpperCase() + split[i].substring(1);
		}
	}
	return split.join('');
}

function naarStreepCase(snede) {
	return snede
	.replace(/([A-Z])/g, '-$1')
	.replace(/^./, function(str){ return str.toUpperCase(); }).toLowerCase();
}

function efiberVindKnop(t, klasse) {
	var knop = false;

	// zitten we in een SVG?
	// svg nodes hebben andere dom properties
	while (typeof t.className !== 'string') {
		t = t.parentNode;
	}

	var klassen = t.className.split(' ');

	if (klassen.indexOf(klasse) !== -1 ) {
		knop = t;
	} else if (t.parentNode.className.indexOf(klasse) !== -1) {
		knop = t.parentNode;
	}
	return knop;
}

function efiberEuro(bedrag){
	if (bedrag && typeof bedrag !== 'boolean') {
		if (bedrag == 0) {
			return 'inclusief';
		} else {
			return "&euro; " + Number(bedrag).toFixed(2).toString().replace('.', ',');
		}

	} else {
		return '-'; //als false oid
	}
}

function efiberNietMin1ReturnZelfOfFalse(a) {
	return (a !== '-1' ? a : false);
}





function efiberMaakBestelKnop(pakket, eigenschappen, tekst) {

	if (typeof tekst === 'undefined') {
		tekst = 'Bestel';
	}

	//we slaan de pakket + opties info op in sessionStorage
	// zodat die weldra via referentie naar een andere functie gestuurd kan worden

	sessionStorage.setItem('pakket-'+pakket.ID, JSON.stringify(arguments));
	this.HTML = "<a class='knop geen-ikoon efiber-bestelknop' data-efiber-func='toon-stap animeer aanmeldformulier' href='#100' efiber-data-pakket-id='"+pakket.ID+"'>"+tekst+"</a>";

}
