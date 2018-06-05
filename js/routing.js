// ROUTING

var efiberRouting = {

	// 1  : postcode controle
	// 2  : keuzehulp of niet
	// 3  : situatie
	// 4  : klein zakelijk bedrijf of niet
	// 5  : internet
	// 6  : bellen
	// 7  : nummers
	// 8  : televisie
	// 9  : televisie opties
	// 10 : kabel opties
	// 11 : aansluiting

	// 20 : pakketkeuze
	// 21 : pakketkeuze selectie

	// 30 : vergelijking

	// 50 : contactform zakelijk
	// 51 : contactform lead

	// 100: aanmeldformulier


	init: function (){

		var _t = this;

		_t.stappen = doc.querySelectorAll('[data-keuzehulp-stap]');

		window.addEventListener('popstate', function(e) {

			e.preventDefault();

			// apple heeft een andere implementatie van popstate.
			// ook laden v/d pagina is popstate
			// als gs nog length 1 dan is pagina net geladen en is deze popstate van apple.

			if (_t.gs.length > 1) {
				_t.stapTerug();
			}


		}, false);

	},

	gs: [1],

	laatsteInGs: function (){
		return efiberRouting.gs[efiberRouting.gs.length-1];
	},

	stapTerug: function(){

		//laatste eraf
		this.gs.pop();
		this.ga(this.laatsteInGs());

	},

	uitzonderingen: [7], // bellen -> nummers

	verwerkUitzondering: function (stapNr){

		switch(stapNr) {
		    case 7:

		    	// als gekozen voor 'ik bel alleen mobiel' cq telefoon = 1
			    // dan niet door naar nummerkeuze.
			    if ((JSON.parse(sessionStorage.getItem('efiber-keuzehulp'))).bellen === '1') {
			    	stapNr = 8;
			    }

		        break;
		    default:
		        console.warn('uitzondering verwerk naar nummer niet gevonden');
		        break;
		}

		return stapNr;

	},

	ga: function(stap){

		// als de stap als nummer wordt gegeven,
		// worden alle stappen als literal array genomen en wordt gegaan naar de index.
		// als de stap als string wordt gegeven wordt gekeken naar het
		// data-keuzehulp-stap attribuut.

		//controle
		if (!this.stappen) this.init();

		var _s = this.stappen;

		var dezeStap = doc.querySelector('[data-keuzehulp-stap="'+stap+'"]'); //dit is de section

		if (!dezeStap) {
			console.error('stap onbekend', dezeStap, 'stap ' + stap, typeof stap);
			console.trace();
			return false;
		}

		var nummerDezeStap = Number(dezeStap.getAttribute('data-keuzehulp-stap'));

		// is er een uitzonderingssituatie?
		// mogelijk door naar andere stap.
		if (this.uitzonderingen.indexOf(nummerDezeStap) !== -1) {
			nummerDezeStap = this.verwerkUitzondering(nummerDezeStap);
			dezeStap = doc.querySelector('[data-keuzehulp-stap="'+nummerDezeStap+'"]');
		}

		// zet alle stappen op none en de komende op block
		for(var i = 0; i < _s.length; i++) {
			_s[i].style.display = "none";
		}
		dezeStap.style.display = "block";


		// ook de evt. knop in de navigatie onderaan schakelen.

		var knopOnder = doc.querySelector('.efiber-navigatie-binnen [data-keuzehulp-stap="'+stap+'"]');
		if (knopOnder) {
			knopOnder.style.display = "inline-block";
		}


		// zet in geschiedenis array, als niet reeds laatste
		if (this.laatsteInGs() !== nummerDezeStap) {
			this.gs.push(nummerDezeStap);
		}

		// zet op body el
		body.setAttribute('data-efiber-stap', nummerDezeStap);

		// en trigger history
		this.zetHistory(dezeStap, nummerDezeStap);


		// @TODO scroll functie
	    $('html, body').animate({
	        scrollTop: $(dezeStap).offset().top - 50
	    }, 100);

	},
	zetHistory: function(dezeStap, nummerDezeStap){

		// dit is een afgeleide... het zou opgehaald kunnen worden via laatsteInGs?
		// stabieler? dit is sneller...

		var titel  = dezeStap.getElementsByTagName('header')[0].getElementsByTagName('h2')[0].textContent.trim();
		var url = '/keuzehulp/' + encodeURI(titel.replace(/[\W_]+/g,"-")).toLowerCase();
		history.pushState(null, titel, url);


	}
};

