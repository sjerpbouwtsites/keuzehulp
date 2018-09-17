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
					// console.log('dispatch '+funcNaam);
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


		const n = knop.hasAttribute('href')
			? knop.href.split('#')[1]
			: knop.getAttribute('data-href').split('#')[1]

		efiberRouting.ga(n);


	},
	animeer: function (knop) {

		kzAnimeerKnoppen(knop);

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

		keuzehulpGeneriek(knop, 'data-efiber-situatie-keuze', 'situatie', function (){
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


/*		//als interactieve TV, sla dan kabelstap over en sla op dat keuze kabels is UTP.
		var tvOptiesVerderKnop = doc.querySelector('.efiber-navigatie-binnen a[data-keuzehulp-stap="9"]');

		if (knop.getAttribute('data-efiber-televisie-keuze') == 3) {
			tvOptiesVerderKnop.setAttribute('href', '#11');

			var kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
			kh.bekabeling = "2";
			sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(kh));

		} else if (knop.getAttribute('data-efiber-televisie-keuze') == 2)  {
			tvOptiesVerderKnop.setAttribute('href', '#10');
		}*/

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

		//kzUpdatePrijzen();

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
	telefonieModal: function (knop) {
		kzTelefonieModal(knop);
	},
	aantalZendersModal: function (knop){
		kzZendersModal(knop);
	},
	schakel: function (knop) {
		if (!knop.hasAttribute('data-doel')) {
			console.error(new Error(`schakel ${knop.id} (${knop.className}) heeft geen doel`));
		}
		const doel = document.querySelector(knop.getAttribute(`data-doel`));
		if (!doel) {
			console.error(new Error(`doel van ${knop.id} (${knop.className}) niet gevonden.`));
		}
		doel.classList.toggle('actief');
	},
	tooltip: function (knop){
		
		efiberModal({
			kop: knop.getAttribute('data-tooltip-titel'),
			torso: knop.getAttribute('data-tooltip-tekst')
		});
	},
	aantalTvsPlus: function (){
		KzAantalTvs(true);
	},
	aantalTvsMin: function (){
		KzAantalTvs(false);
	},
	stappenNav(knop){
		doc.getElementById('keuze-menu-lijst').classList.remove('actief');
		efiberRouting.ga(knop.id.replace('stappen-links-', ''));
	}





};

/* eslint-enable */