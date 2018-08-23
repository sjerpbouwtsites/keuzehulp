/* eslint-disable */

function knoppenDispatcher() {


	/*------------------------------------------------------
	|
	|	een knop (class='knop') kan 0 tot n functies hebben
	|	data-efiber-func='efiber-stap-terug efiber-drink-koffie'
	|	doet: knoppenFuncs['efiberStapTerug'](knop) en
	|	knoppenFuncs['efiberDrinkKoffie'](knop)
	|	met de knop dus als parameter.
	|
	|	Het nut van deze dispatcher zit er in dat pas op het moment dat de daadwerkelijke
	| 	klik gedaan wordt, en deze dus aankomt bij de body, de functie wordt aangeroepen. 
	| 	Het eea. is dus niet HTML of JS-volgorde afhankelijk, louter van of de body bestaat als
	| 	deze dispatcherfunctie wordt gedraaid.
	| 
	| 	In principe stuur de dispatcher alleen aan maar voor zeer kleine functies is een uitzondering gemaakt.
	|
	|-----------------------------------------------------*/

	

	body.addEventListener('click', function(e){

		var t = e.target;

		var knop = efiberVindKnop(t, 'knop');
		if (knop) {
			e.preventDefault();

			if (
				!knop.hasAttribute('data-efiber-func') ||
				knop.className.indexOf('invalide') !== -1
			) return;


			var funcAttr = knop.getAttribute('data-efiber-func').trim();

			//efiberModal(funcAttr, 2500);

			if (!funcAttr || typeof funcAttr === 'undefined') {
				console.error('funcAttr undefined');
				console.log(knop);
				return false;
			}

			//zijn het er één of meer?
			var funcs = [];
			if (funcAttr.indexOf(' ') !== '') {
				funcs = funcAttr.split(' ');
			} else {
				funcs = [funcAttr];
			}

			for (var i = 0; i < funcs.length; i++){
				var funcNaam = naarCamelCase(funcs[i]);
				if (knoppenFuncs[funcNaam]) {
					knoppenFuncs[funcNaam](knop);
				} else {
					console.log('geen knop func gedefinieerd', funcNaam);
				}
			}

		} else {
			//kan ieder willekeurig ander element zijn geweest.
		}

	});
}

var knoppenFuncs = {

	// zie knoppendispatcher

	toonStap: function(knop) {

		efiberRouting.ga(knop.href.split('#')[1]);

	},
	animeer: function (knop) {

		if (knop.className.indexOf('actief') !== -1) {

			// als multiselect, verwijder dan klasse.
			if (knop.className.indexOf('multiselect') !== -1) {
				knop.className = knop.className.replace('actief', '').trim();
			} else {
				// als geen multiselect, dan is dit een bevestiging van de keuze, dus geen actie
			}

		} else {

			// als geen multiselect
			// dan dienen andere knoppen nu geen actief meer te hebben
			if (knop.className.indexOf('multiselect') === -1) {

				var knoppen = knop.parentNode.getElementsByClassName('knop');

				for (var i = knoppen.length - 1; i >= 0; i--) {
					knoppen[i].className = knoppen[i].className.replace('actief', '').trim();
				}
			}

			//tenslotte actief op knop zelf toevoegen.
			knop.className = knop.className + " actief";

		}

	},
	stapTerug: function(knop){

		efiberRouting.stapTerug();

	},
	leegKeuzehulp: function (){

		sessionStorage.setItem('efiber-keuzehulp', JSON.stringify({}));

	},
	zetNiveauKnop: function(knop){

		efiberZetNiveauKnop(knop);

	},
	zetSituatie: function (knop){

		var s = knop.getAttribute('data-efiber-situatie-keuze');

		keuzehulpGeneriek(knop, 'data-efiber-situatie-keuze', 'situatie', function(){
			body.setAttribute('data-efiber-situatie-keuze', s);
		});

		eFiberSluitRoutesUit(naarCamelCase(s));

		// dit is de eerste keuze waar je langs komt als je
		// van IWWIW komt en vervolgens naar de keuzehulp gaat.
		// in het aanmeldformulier is het bestaan van die sleutel en test of je daarvandaan komt
		// dus hier weghalen
		var kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
		if ('ik-weet-wat-ik-wil' in kh) {
			delete kh['ik-weet-wat-ik-wil'];
			sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(kh));
		}

	},
	haalZakelijkFormulier: function(){

		efiberAjaxKleineFormulieren('efiber_haal_zakelijk_formulier', 'print-zakelijk-formulier', {gebiedscode: sessionStorage.getItem('efiber-gebiedscode')});

	},
	zetKeuzeInternet: function(knop) {

		keuzehulpGeneriek(knop, 'data-efiber-internet-keuze', 'internet');

	},
	zetNummersConsequentie: function (knop){

		var k = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));

		if ('situatie' in k) {
			if (k['situatie'] === 'kleinZakelijk') {
				eFiberSluitRoutesUit('nummersZakelijk');
			} else {
				eFiberSluitRoutesUit('nummersParticulier');
			}
		} else {
			eFiberSluitRoutesUit('nummersParticulier');
		}

	},
	zetKeuzeBellen: function(knop) {

		keuzehulpGeneriek(knop, 'data-efiber-bellen-keuze', 'bellen');

	},
	zetKeuzeNummers: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-nummers-keuze', 'nummers');

	},
	zetKeuzeTelevisie: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-televisie-keuze', 'televisie');


		//als interactieve TV, sla dan kabelstap over en sla op dat keuze kabels is UTP.
		var tvOptiesVerderKnop = doc.querySelector('.efiber-navigatie-binnen a[data-keuzehulp-stap="9"]');

		if (knop.getAttribute('data-efiber-televisie-keuze') == 3) {
			tvOptiesVerderKnop.setAttribute('href', '#11');

			var kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
			kh.bekabeling = "2";
			sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(kh));

		} else if (knop.getAttribute('data-efiber-televisie-keuze') == 2)  {
			tvOptiesVerderKnop.setAttribute('href', '#10');
		}

	},
	zetKeuzeTelevisieOpties: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-televisie-opties-keuze', 'televisie-opties');

	},
	zetKeuzeBekabeling: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-bekabeling-keuze', 'bekabeling');

	},
	zetKeuzeInstallatie: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-installatie-keuze', 'installatie');

	},
	zetKeuzeIkWeetWatIkWil: function (knop) {

		keuzehulpGeneriek(knop, 'data-efiber-ik-weet-wat-ik-wil-keuze', 'ik-weet-wat-ik-wil');

	},

	laadIkWeetWatIkWilPakketten: function(){

		ikWeetWatIkWilPakkettenAjax();

	},

	vergelijking: function(){

		vergelijkingAjax();

	},

	aanmeldformulier: function (knop) {

		// aanmeldformulier.js
		haalPrintAanmeldformulier(knop);

	},
	zakelijkFormulier: function(){
		efiberHaalZakelijkFormulier();
	},

	aanmeldingSchakel: function(knop){

		if (knop.className.indexOf('radio') !== -1) {

			// aanmeldformulier.js
			efiberSchakelRadio(knop);

		} else if (knop.className.indexOf('checkbox') !== -1)  {

			// aanmeldformulier.js
			efiberSchakelCheckbox(knop);

		} else if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number')  {

			// aanmeldformulier.js
			efiberSchakelNumber(knop);

		} else {
			console.warn('formulier schakel func onbekend');
		}

	},
	belpakketten: function (knop) {

		// aanmeldformulier.js
		efiberBelpakketten(knop);

	},
	extraVastNummer: function (knop) {

		// aanmeldformulier.js
		efiberExtraVastNummer(knop);

	},
	foxSports: function () {

		// aanmeldformulier.js
		efiberFoxSports();

	},
	formToonRij: function(knop){

		// aanmeldformulier.js
		efiberToonRij(knop);

	},
	updateHidden: function(){

		// aanmeldformulier.js
		efiberUpdateHidden();
	},
	verwijderModal: function() {
		efiberVerwijderModal();
	},
	verstopKeuzeNiveaus: function(){
		doc.getElementById('sticky-keuzes').style.display = "none";
	},
	toonMeerPakket: function(){

		var secties = doc.getElementById('print-vergelijking').getElementsByClassName('efiber-form-sectie');

		for (var i = 1; i < secties.length; i++) {

			//tweede sectie verwijderen
			if (i === 1) {
				secties[i].parentNode.removeChild(secties[i]);
			} else {
				secties[i].style.display = "block";
			}

		}

		$(".Aanvullende-informatie").css({'display' : 'flex'});

	},
};

/* eslint-enable */