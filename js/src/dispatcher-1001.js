/* eslint-disable */

function knoppenDispatcher() {


	/*------------------------------------------------------
	|
	|	een knop (class='knop') kan 0 tot n functies hebben
	|	data-kz-func='kz-stap-terug kz-drink-koffie'
	|	doet: knoppenFuncs['kzStapTerug'](knop) en
	|	knoppenFuncs['kzDrinkKoffie'](knop)
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
		var knop = kzVindKnop(t, 'knop');


		if (knop) {
			e.preventDefault();

			if (
				!knop.hasAttribute('data-kz-func') ||
				knop.className.indexOf('invalide') !== -1
			) return;


			var funcAttr = knop.getAttribute('data-kz-func').trim();

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

		kzRouting.ga(n);


	},
	animeer: function (knop) {

		kzAnimeerKnoppen(knop);

	},
	stapTerug: function(knop){

		kzRouting.stapTerug();

	},
	leegKeuzehulp: function (){

		sessionStorage.setItem('kz-keuzehulp', JSON.stringify({}));

	},
	zetNiveauKnop: function(knop){

		kzZetNiveauKnop(knop);

	},
	zetSituatie: function (knop){

		var s = knop.getAttribute('data-kz-situatie-keuze');

		keuzehulpGeneriek(knop, 'data-kz-situatie-keuze', 'situatie', function (){
			body.setAttribute('data-kz-situatie-keuze', s);
		});

		kzSluitRoutesUit(naarCamelCase(s));

		// dit is de eerste keuze waar je langs komt als je
		// van IWWIW komt en vervolgens naar de keuzehulp gaat.
		// in het aanmeldformulier is het bestaan van die sleutel en test of je daarvandaan komt
		// dus hier weghalen
		var kh = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
		if ('ik-weet-wat-ik-wil' in kh) {
			delete kh['ik-weet-wat-ik-wil'];
			sessionStorage.setItem('kz-keuzehulp', JSON.stringify(kh));
		}

	},
	haalZakelijkFormulier: function(){

		kzAjaxKleineFormulieren('keuzehulp_haal_zakelijk_formulier', 'print-zakelijk-formulier', {gebiedscode: sessionStorage.getItem('kz-gebiedscode')});

	},
	zetKeuzeInternet: function(knop) {

		keuzehulpGeneriek(knop, 'data-kz-internet-keuze', 'internet');

	},
	zetNummersConsequentie: function (knop){

		var k = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

		if ('situatie' in k) {
			if (k['situatie'] === 'kleinZakelijk') {
				kzSluitRoutesUit('nummersZakelijk');
			} else {
				kzSluitRoutesUit('nummersParticulier');
			}
		} else {
			kzSluitRoutesUit('nummersParticulier');
		}

	},
	zetKeuzeBellen: function(knop) {

		keuzehulpGeneriek(knop, 'data-kz-bellen-keuze', 'bellen');

	},
	zetKeuzeNummers: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-nummers-keuze', 'nummers');

	},
	zetKeuzeTelevisie: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-televisie-keuze', 'televisie');


/*		//als interactieve TV, sla dan kabelstap over en sla op dat keuze kabels is UTP.
		var tvOptiesVerderKnop = doc.querySelector('.kz-navigatie-binnen a[data-keuzehulp-stap="9"]');

		if (knop.getAttribute('data-kz-televisie-keuze') == 3) {
			tvOptiesVerderKnop.setAttribute('href', '#11');

			var kh = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
			kh.bekabeling = "2";
			sessionStorage.setItem('kz-keuzehulp', JSON.stringify(kh));

		} else if (knop.getAttribute('data-kz-televisie-keuze') == 2)  {
			tvOptiesVerderKnop.setAttribute('href', '#10');
		}*/

	},
	zetKeuzeTelevisieOpties: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-televisie-opties-keuze', 'televisie-opties');

	},
	zetKeuzeBekabeling: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-bekabeling-keuze', 'bekabeling');

	},
	zetKeuzeInstallatie: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-installatie-keuze', 'installatie');

	},
	zetKeuzeIkWeetWatIkWil: function (knop) {

		keuzehulpGeneriek(knop, 'data-kz-ik-weet-wat-ik-wil-keuze', 'ik-weet-wat-ik-wil');

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
		kzHaalZakelijkFormulieren();
	},

	aanmeldingSchakel: function(knop){

		if (knop.className.indexOf('radio') !== -1) {

			// aanmeldformulier.js
			kzSchakelRadio(knop);

		} else if (knop.className.indexOf('checkbox') !== -1)  {

			// aanmeldformulier.js
			kzSchakelCheckbox(knop);

		} else if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number')  {

			// aanmeldformulier.js
			kzSchakelNumber(knop);

		} else {
			console.warn('formulier schakel func onbekend');
		}

		//kzUpdatePrijzen();

	},
	belpakketten: function (knop) {

		// aanmeldformulier.js
		kzBelpakketten(knop);

	},
	extraVastNummer: function (knop) {

		// aanmeldformulier.js
		kzExtraVastNummer(knop);

	},
	foxSports: function (knop) {

		// aanmeldformulier.js
		kzFoxSchakel(knop);

	},
	updateHidden: function(){

		// aanmeldformulier.js
		kzUpdateHidden();
	},
	verwijderModal: function() {
		kzVerwijderModal();

	},
	toonMeerPakket: function(){

		var secties = doc.getElementById('print-vergelijking').getElementsByClassName('kz-form-sectie');

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
		const doel = document.querySelectorAll(knop.getAttribute(`data-doel`));
		if (!doel) {
			console.error(new Error(`doel van ${knop.id} (${knop.className}) niet gevonden.`));
		}
		Array.from(doel).forEach(doelEl => doelEl.classList.toggle('actief'));

		if (knop.hasAttribute('data-scroll')) {
		    $([document.documentElement, document.body]).animate({
		        scrollTop: $(knop.getAttribute(`data-scroll`)).offset().top - 20
		    }, 400);
		}




	},
	tooltip: function (knop){

		const status = JSON.parse(sessionStorage.getItem('kz-adres')).status;
		let tekst = null;

		if(!knop.classList.contains('status-tooltip')) {
			tekst = knop.getAttribute('data-tooltip-tekst');
		} else {
			tekst = knop.getAttribute(`data-tooltip-status-${status}`);
			if (!(tekst.trim()) && knop.getAttribute('data-tooltip-tekst')) {
				tekst = knop.getAttribute('data-tooltip-tekst');
			}
		}

		kzModal({
			kop: knop.getAttribute('data-tooltip-titel'),
			torso: tekst
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
		kzRouting.ga(knop.id.replace('stappen-links-', ''));
	}





};

/* eslint-enable */