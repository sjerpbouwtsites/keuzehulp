
function efiberAppendNiveauKnop(knop) {

	var kc = knop.cloneNode(true);

	// alle functies behalve in toelaten worden uit data-efiber-func gehaald.
	var funcLijst = kc.getAttribute('data-efiber-func').split(' ');
	var funcLijstKopie = funcLijst.slice(0);
	var toelaten = ['toon-stap', 'vergelijking'];

	for (var i = 0; i < funcLijstKopie.length; i++) {

		if (toelaten.indexOf(funcLijstKopie[i]) === -1) {
			funcLijst.splice(funcLijst.indexOf(funcLijstKopie[i]), 1);
		}

	}

	// als dit een multiselect is dient het juist toon-stap te krijgen.
	if (knop.className.indexOf('multiselect') !== -1) {
		funcLijst.push('toon-stap');
	}

	kc.setAttribute('data-efiber-func', funcLijst.join(' '));

	// nu nog de link aanpassen naar de eigen sectie.
	// zoek degene met de keuzehulp stap

	var ouder = knop.parentNode;
	do {
	  ouder = ouder.parentNode;
	} while (!ouder.hasAttribute('data-keuzehulp-stap'));

	var link = '#' + ouder.getAttribute('data-keuzehulp-stap');

	kc.setAttribute('href', link);

	// hoe dan ook allemaal actief.
	if (kc.className.indexOf('actief') === -1) kc.className = kc.className + ' actief';

	// en klasse van img toevoegen.
	var imgKlasse = kc.getElementsByTagName('img')[0].className;
	kc.className = kc.className + ' img-' + imgKlasse;

	// nu nog ff de span verwijderen
	kc.removeChild(kc.getElementsByTagName('span')[0]);

	doc.getElementsByClassName('efiber-niveau-knoppen')[0].getElementsByClassName('efiber-niveau-knoppen-torso')[0].appendChild(kc);

	var afbNav = doc.getElementsByClassName('efiber-niveau-knoppen')[0];
	afbNav.className = afbNav.className.replace('inactief','').trim();
	$("#sticky-keuzes").show();


}



function efiberZetNiveauKnop(knop) {

	var afbNav = doc.getElementsByClassName('efiber-niveau-knoppen')[0],
		dezeImg = knop.getElementsByTagName('img')[0],
		dezeAlt = dezeImg.getAttribute('alt'),
		afbInNav = afbNav.getElementsByClassName(dezeImg.className);

	if (knop.className.indexOf('multiselect') !== -1) {

		// andere niet verwijderen. Als deze op actief staat,
		//verwijderen, knop wordt later op inactief gezet. En vice versa.

		if (knop.className.indexOf('actief') !== -1) {

			// multiselect op actief ->
			// vergelijken op alt en alleen deze verwijderen
			for(var i = 0; i < afbInNav.length; i++) {
				if (afbInNav[i].getAttribute('alt') === dezeAlt) {
					afbInNav[i].parentNode.parentNode.removeChild(afbInNav[i].parentNode);
				}
			}

		} else {

			// niet actief, toevoegen.
			efiberAppendNiveauKnop(knop);

		}

	} else {

		if (knop.className.indexOf('actief') !== -1) {

			// knop is actief. Kan zijn omdat uit geheugen heracti
			if (!afbInNav.length) {
				efiberAppendNiveauKnop(knop);
			}

		} else {

			for(var i = 0; i < afbInNav.length; i++) {
				afbInNav[i].parentNode.parentNode.removeChild(afbInNav[i].parentNode);
			}

			efiberAppendNiveauKnop(knop);
			// alle broertjes uit nav verwijderen

		}

	}
}

function efiberStickyKeuzes() {

	var sw = 200;

	var kanStickyDoen = body.scrollWidth > 1200 ;

	if (!kanStickyDoen) {
		return;
	}

	setTimeout(function(){

		$sticky = $("#sticky-keuzes");
		$sticky.css({'opacity':0});

/*		var offset = $('.keuzehulp-sectie_kop h2').first().offset().top;

		if (!offset && offset !== 0) {
			$sticky.hide();
			return;
		}*/

		var offset = 225;


		var left = ( $(".keuzehulp .verpakking").offset().left + $(".keuzehulp .verpakking").width() ) - 225;

		$('.keuzehulp .verpakking').css({
			'position' : 'relative',
			'right' : '120px'
		});

		$sticky.css({'top': offset + 'px'});
		$sticky.css({'left': left + 'px'});

		$sticky.height($('.keuzehulp .verpakking').height());

		$('body').addClass('heeft-sticky').append($sticky);

		$('.efiber-niveau-knoppen').addClass('sticky').appendTo(".sticky-binnen");

		$sticky.css({'opacity': 1});
	}, 500);


}