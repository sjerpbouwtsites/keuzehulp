function kzAnimeerKnoppen(knop) {
	/*------------------------------------------------------
	|
	| 	schakelt de klasse actief heen en weer voor knoppen
	| 	verschil tussen of knoppen multiselect zijn of niet. 
	|
	|-----------------------------------------------------*/
	
	const sectie = kzVindSectie(knop);
	const dezeID = knop.dataset.knopId;

	// is dit multiselect? alleen deze knop actief togglen.
	if (knop.classList.contains('multiselect')) {
		knop.classList.toggle('actief');
	} else if (knop.classList.contains('actief')) {
		// is deze al actief? dan is het een bevestiging van een keuze. 
		// niets doen.
		return;
	} else {
		// is er een actieve knop? 
		// actieve knop in deze sectie op inactief zetten
		// dan deze knop op actief zetten.
		const actief = sectie.getElementsByClassName('actief');
		if (actief.length) {
			actief[0].classList.remove('actief');
		}
		knop.classList.add('actief');

	}

}

