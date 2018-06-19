  function vergelijkingAjax(){

	var ajf = new efiberAjax({
		ajaxData: {
			'action': 'efiber_vergelijking',
			data: {
				gebiedscode: sessionStorage.getItem('efiber-gebiedscode'),
				keuzehulp: 	 JSON.parse(sessionStorage.getItem('efiber-keuzehulp')),
			},
		},
		cb: function(r){

			jQuery('#print-vergelijking').empty();

			if (r.pakketten && r.pakketten.length) {

				var tabel = {}; 

				for (var i = 0; i < r.pakketten.length; i++){
					tabel = tabelMiddelware(tabel, r.pakketten[i]);
				}

				// ONDUIDELIJK OF DIT GEWENST IS.
				// tabel = efiberVergelijkingstabelOpVolgorde(tabel);

				

				efiberPrintFormSectie(
					null,
					[
						efiberMaakRij(tabel.provider, 				'h3'),
						efiberMaakRij(tabel.usp, 					'span', ''),
						efiberMaakRij(tabel.internetsnelheid, 		'span', 'Internet snelheid<small>up&down</small>'),
						efiberMaakRij(tabel.pakketNaam,				'span', 'Pakket inhoud'),
						efiberMaakRij(tabel.eenmaligTotaal, 		'span', 'Eenmalig Totaal'),
						efiberMaakRij(tabel.maandelijksTotaal, 		'span', 'Pakket prijs per maand'),
						efiberMaakRij(tabel.finOpmerking, 			'span', ''),
					]
				);

				efiberPrintFormSectie(
					"<a class='knop geen-ikoon efiber-toon-meer-pakket' data-efiber-func='toon-meer-pakket' href='#'>Bekijk inhoud</a>",
					true
				);


				efiberPrintFormSectie(
					'Bellen',
					[
						efiberMaakRij(tabel.bellenStandaard, 		'span', 'Bellen standaard'),
						efiberMaakRij(tabel.extraTelNr, 			'span', 'Extra telefoon nummer'),
						efiberMaakRij(tabel.buitenLandsOnbeperkt,	'span', 'Buitenlands onbeperkt'),
						efiberMaakRij(tabel.telOpmerking,			'span', ''),
					]
				);

				efiberPrintFormSectie(
					'Televisie',
					[
						efiberMaakRij(tabel.zenders, 				'span', 'Aantal zenders'),
						efiberMaakRij(tabel.typeTV, 				'span', 'Type TV'),
						efiberMaakRij(tabel.TVOpmerkingen, 			'span', ''),
					]
				);

				efiberPrintFormSectie(
					'Extra opties',
					[
						efiberMaakRij(tabel.extraOntvangers, 		'span', 'Extra TV ontvanger of smartcard'),
						efiberMaakRij(tabel.opnemen, 				'span', 'Opnemen'),
						efiberMaakRij(tabel.beginGemist, 			'span', 'Begin Gemist'),
						efiberMaakRij(tabel.replay, 				'span', 'Terugkijken'),
						efiberMaakRij(tabel.plusPakket, 			'span', 'Pluspakket'),
						efiberMaakRij(tabel.foxSportsEd, 			'span', 'Fox Sports ED'),
						efiberMaakRij(tabel.foxSportsInt, 			'span', 'Fox Sports Int.'),
						efiberMaakRij(tabel.ziggoSportTotaal, 		'span', 'Ziggo Sport Totaal'),
						//efiberMaakRij(tabel.erotiek, 				'span', 'Erotiek'),
						efiberMaakRij(tabel.film1, 					'span', 'Film1'),
						efiberMaakRij(tabel.TVPakketOpmerkingen,	'span', ''),
					]
				);

				efiberPrintFormSectie(
					'Installatie',
					[
						efiberMaakRij(tabel.installatie, 			'span', 'Installatie'),
					]
				);

				efiberPrintFormSectie(
					'Kosten',
					[
						efiberMaakRij(tabel.borg, 					'span', 'Borg apparatuur'),
						efiberMaakRij(tabel.eenmaligTotaal, 		'span', 'Eenmalig Totaal'),
						efiberMaakRij(tabel.maandelijksTotaal, 		'span', 'Maandelijks Totaal'),
					]
				);

				efiberPrintFormSectie(
					'',
					[
						efiberMaakRij(tabel.bestelKnop,				'span', ''),
						efiberMaakRij(tabel.tekstOnderaan,			'p', 	'Aanvullende informatie'),
					]
				);

				var disclaimerTekst = doc.getElementById("vergelijking-disclaimer").textContent;
				$(".efiber-bestelknop").attr('title', disclaimerTekst);

				jQuery('#print-vergelijking').css({'display': 'block', 'opacity': '1'});

			} else {
				efiberModal('geen pakketten gevonden', 1500);
			} // als r cq response
		}
	});

	ajf.doeAjax();

} //vergelijking ajax

function efiberPrintFormSectie(titel, rijen) {

	// functie print alleen sectie als rijen goed gevuld.
	// tenzij expliciet rijen niet array maar 'true'

	var $torso = jQuery("<div class='efiber-form-sectie-torso'></div>"),
	$sectie = jQuery("<section class='efiber-form-sectie'></section>");

	if (typeof rijen === 'boolean' && rijen){

		rijen = [];

	} else {

		// eerst kijken of rijen leeg zijn
		var leegOfFouteRijen = 0;
		for (var i = 0; i < rijen.length; i++) {
			if (!rijen[i]) {
				leegOfFouteRijen++;
			}
		}

		if (leegOfFouteRijen === rijen.length) {
			return false; // geen lege secties
		}

	}



	if (titel) {
		if (rijen.length) {
			$sectie.append("<header><h3>"+titel+"</h3></header>");
		} else {
			$torso.append(titel);
		}
	}

	for (var i = 0; i < rijen.length; i++) {
		$torso.append(rijen[i]);
	}

	$sectie.append($torso);

	jQuery('#print-vergelijking').append($sectie);
}

function efiberMaakRij(rij, wrap, rijTitel) {

	if (typeof rij === 'undefined') {
		console.warn('rij undefined', rijTitel);
		return false;
	}

	// als lege rij, alles false, dan niet printen.
	var aantalFalse = 0;
	for (i = 0; i < rij.length; i++) {
		if (!rij[i]) aantalFalse++;
	}
	if (aantalFalse == rij.length) return false;

	var $rij = jQuery("<div class='rij'></div>"),
		$veld = jQuery("<div class='veld'></div>"),
		rijKlasse,
		$ditVeld,
		$veld1;

	$veld1 = $veld.clone();

	if (typeof rijTitel !== 'undefined') {
		rijKlasse = rijTitel.replace(/[^a-z0-9+]+/gi, '-');
		$rij.addClass(rijKlasse);
		$veld1.append(rijTitel);
	}

	$rij.append($veld1);

	for (i = 0; i < rij.length; i++) {
		$ditVeld = $veld.clone();
		$ditVeld.append(jQuery('<'+wrap+'>'+rij[i]+'</'+wrap+'>'));
		$rij.append($ditVeld);
	}
	return $rij;
}

function efiberBelKostenHulp(bedrag) {

	// maakt het getal met twee decimalen
	var fixed = (Number(bedrag) * 100).toFixed(2);

	// controle of rond bedrag. als rond, dan niets geen kommas.
	var str = fixed.toString();

	// tweede decimaal 0? eraf
	if (str[(str.length - 1)] === '0') {
		str = str.substring(0, (str.length-1));
	}

	// eerste decimaal 0? eraf en komma weg.
	if (str[(str.length - 1)] === '0') {
		str = str.split('.')[0];
	}

	return str.replace('.', ',');
}

function efiberVergelijkingstabelOpVolgorde(tabel){

	// maak verzameling met bedragen als getallen	
	var bedragen = tabel.maandelijksTotaal.map(function(waarde, index){
		return Number(waarde.replace("&euro; ", '').replace(',', '.'));
	});

	// kopieer de verzameling tbv sortering en sorteer
	var bedragenSort = (bedragen.map(function(w){return w})).sort();

	// zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
	var indicesVolgorde = bedragenSort.map(function(w){	return bedragen.indexOf(w) });

	var rijNaam, rijKopie, i;

	// per rij, volgorde aanpassen adhv indicesvolgorde.
	for (rijNaam in tabel) {

		rijKopie = tabel[rijNaam].map(function(w){return w});
		tabel[rijNaam] = [];

		for (i = 0; i < rijKopie.length; i++) {
			tabel[rijNaam].push( rijKopie[ (indicesVolgorde[i]) ] );		
		}

	}

	return tabel;
}

function tabelMiddelware (tabel, pakket) {

	// eigenschappen is het object van het pakket
	// tabel is de data die geprint gaat worden
	// eigenschappen gaat als kolom
	// tabel gaat als rijen.

	var eigenschappen = pakket.eigenschappen,
		telOpts, s, v, m;

	eigenschappen.maandelijksTotaal = 0;
	eigenschappen.eenmaligTotaal = 0;

	var keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));

	if (!('provider' in tabel)) tabel.provider = [];
	if (!('usp' in tabel)) tabel.usp = [];
	if (!('internetsnelheid' in tabel)) tabel.internetsnelheid = [];

	tabel.provider.push(eigenschappen.thumb);

	tabel.usp.push((eigenschappen.usp ? eigenschappen.usp : ''));

	tabel.internetsnelheid.push(eigenschappen.snelheid + " Mb/s");
	eigenschappen.maandelijksTotaal += Number(eigenschappen.financieel.maandelijks);
	eigenschappen.eenmaligTotaal += Number(eigenschappen.financieel.eenmalig);

	if (!('pakketNaam' in tabel)) tabel.pakketNaam = [];
	var pakketNaam = 'Internet<br>';

	if (keuzehulp.bellen !== '1') {
		pakketNaam += 'Bellen<br>';
	}

	if (keuzehulp.televisie === '2' || keuzehulp.televisie === '3') {
		pakketNaam += 'Televisie<br>';
	}

	// laatste br eraf.
	pakketNaam = pakketNaam.substr(0, pakketNaam.length - 4);

	tabel.pakketNaam.push(pakketNaam);

	if (!('finOpmerking' in tabel)) tabel.finOpmerking = [];
	tabel.finOpmerking.push((eigenschappen.financieel.opmerkingen ? eigenschappen.financieel.opmerkingen : ''));



	// TELEFONIE

	if (!('bellenStandaard' in tabel)) tabel.bellenStandaard = [];
	if (!('extraTelNr' in tabel)) tabel.extraTelNr = [];
	if (!('buitenLandsOnbeperkt' in tabel)) tabel.buitenLandsOnbeperkt = [];
	if (!('telOpmerking' in tabel)) tabel.telOpmerking = [];

	if (eigenschappen.telefonie.heeft_telefonie) {

		telOpts = eigenschappen.telefonie.telefonie_opties;

		s = "Start " + efiberBelKostenHulp(			telOpts.start_tarief ) + " ct<br>";
		v = "Vast " + efiberBelKostenHulp(			telOpts.vast_nl ) + " ct<br>";
		m = "Mobiel " + efiberBelKostenHulp(		telOpts.mobiel_nl ) + " ct";

		tabel.bellenStandaard.push(					s + v + m );

		keuzehulp.nummers = ('nummers' in keuzehulp ? keuzehulp.nummers : []);

		// extra nr
		if (keuzehulp.nummers.indexOf('1') !== -1) {

			var et = 								efiberNietMin1ReturnZelfOfFalse(eigenschappen.telefonie.telefonie_opties.extra_tel);
			eigenschappen.maandelijksTotaal += 		Number(et);
			tabel.extraTelNr.push(					efiberEuro(et) );

		} else {
			tabel.extraTelNr.push(					false);
		}

		// veel bellen buitenland
		if (keuzehulp.nummers.indexOf('2') !== -1) {

			var blo = 								efiberNietMin1ReturnZelfOfFalse(eigenschappen.telefonie.telefonie_opties['belpakket_nl_&_vast_internationaal']);
			eigenschappen.maandelijksTotaal += 		Number(blo);
			tabel.buitenLandsOnbeperkt.push(		efiberEuro(blo) );

		} else {
			tabel.buitenLandsOnbeperkt.push(		false);
		}

		tabel.telOpmerking.push((eigenschappen.telefonie.telefonie_opties.opmerkingen ? eigenschappen.telefonie.telefonie_opties.opmerkingen : ''));

	} else {
		tabel.bellenStandaard.push(					false);
		tabel.extraTelNr.push(						false);
		tabel.buitenLandsOnbeperkt.push(			false);
		tabel.telOpmerking.push(					false);
	}





	// TELEVISIE

	if (!('heeftTV' in tabel)) 				tabel.heeftTV = [];
	if (!('ontvangers' in tabel)) 			tabel.ontvangers = [];
	if (!('extraOntvangers' in tabel))		tabel.extraOntvangers = [];
	if (!('zenders' in tabel)) 				tabel.zenders = [];
	if (!('typeTV' in tabel)) 				tabel.typeTV = [];
	if (!('TVOpmerkingen' in tabel)) 		tabel.TVOpmerkingen = [];
	if (!('opnemen' in tabel)) 				tabel.opnemen = [];
	if (!('beginGemist' in tabel)) 			tabel.beginGemist = [];
	if (!('replay' in tabel)) 				tabel.replay = [];
	if (!('onDemandSamen' in tabel)) 		tabel.onDemandSamen = [];
	if (!('foxSportsEd' in tabel)) 			tabel.foxSportsEd = [];
	if (!('ziggoSportTotaal' in tabel))		tabel.ziggoSportTotaal = [];
	if (!('foxSportsInt' in tabel)) 		tabel.foxSportsInt = [];
	if (!('plusPakket' in tabel)) 			tabel.plusPakket = [];
	//if (!('erotiek' in tabel)) 				tabel.erotiek = [];
	if (!('film1' in tabel)) 				tabel.film1 = [];
	if (!('TVPakketOpmerkingen' in tabel)) 	tabel.TVPakketOpmerkingen = [];

	keuzehulp['televisie-opties'] = ('televisie-opties' in keuzehulp ? keuzehulp['televisie-opties'] : []);

	if (eigenschappen.tv) {

		var tv = eigenschappen.tv;

		tabel.heeftTV.push(true);

		tabel.zenders.push(
			tv.zenders + ' zenders (' + tv.zenders_hd + 'HD)'
		);

/*
		if (tv.extra_tv_onvanger && tv.extra_tv_onvanger !== '-1') {
			tabel.ontvangers.push(efiberEuro(tv.extra_tv_onvanger));
		} else {
			tabel.ontvangers.push('niet beschikbaar'); // bv als niets ingevuld
		}*/

		if (typeof tv.type_tv === 'string') {
			tabel.typeTV.push(tv.type_tv);
		} else {
			tabel.typeTV.push('');
		}

		tabel.TVOpmerkingen.push((eigenschappen.tv.opmerkingen ? eigenschappen.tv.opmerkingen : ''));

		// LET OP DE SPELFOUT extra_tv_ONVANGER
		// als heeft extra tvs, tv optie 6, dan meerekenen, anders rij vullen met false.

		if (keuzehulp['televisie-opties'].indexOf('6') !== -1) {


			if (tv.extra_tv_onvanger !== '-1') {

				var etoMaandelijks = 				efiberNietMin1ReturnZelfOfFalse(tv.extra_tv_onvanger);
				eigenschappen.maandelijksTotaal += 	Number(etoMaandelijks	);

				// let op de spelfout extra_tv_ontvangeN_eenmalig
				var etoEenmalig = 					efiberNietMin1ReturnZelfOfFalse(tv.extra_tv_ontvangen_eenmalig);
				eigenschappen.eenmaligTotaal += 	Number(etoEenmalig);

				tabel.extraOntvangers.push(
					(

						Number(etoMaandelijks) ? (efiberEuro( etoMaandelijks) + " p/m") : ( '&euro; 0,-' + " p/m")

					) + (

						Number(etoEenmalig) ? ("<br>" + efiberEuro( etoEenmalig ) + " eenmalig" ) : ''

					)
				);




			} else {
				tabel.extraOntvangers.push('niet nodig');
			}

		} else {
			tabel.extraOntvangers.push(false);
		}

		tabel.TVPakketOpmerkingen.push((eigenschappen.tv.paketten.opmerkingen ? eigenschappen.tv.paketten.opmerkingen : ''));


		// INTERACTIEVE TV.
		// Als gekozen voor interactieve TV, dan vullen afhankelijk van of alles in 1 interactief of niet
		// Anders vullen met false

		if (keuzehulp.televisie === '3') {

			var onDemand = tv.on_demand;

			if (onDemand.opnemen_replay_begin_gemist_samen === '-1') {

				var opn = 							efiberNietMin1ReturnZelfOfFalse(onDemand.opnemen);
				var beg = 							efiberNietMin1ReturnZelfOfFalse(onDemand.begin_gemist);
				var repl = 							efiberNietMin1ReturnZelfOfFalse(onDemand.replay);

				tabel.opnemen.push(					efiberEuro( opn ) );
				tabel.beginGemist.push(				efiberEuro( beg ) );
				tabel.replay.push(					efiberEuro( repl ) );
				tabel.onDemandSamen.push(			false );

				eigenschappen.maandelijksTotaal += 	(opn !== -1 ? (!isNaN(Number(opn)) ? Number(opn) : 0) : 0);
				eigenschappen.maandelijksTotaal += 	(beg !== -1 ? (!isNaN(Number(beg)) ? Number(beg) : 0) : 0);
				eigenschappen.maandelijksTotaal += 	(repl !== -1 ? (!isNaN(Number(repl)) ? Number(repl) : 0) : 0);

			} else {

				var ods = 							efiberNietMin1ReturnZelfOfFalse(onDemand.opnemen_replay_begin_gemist_samen);

				tabel.opnemen.push(					efiberEuro( ods ) );
				eigenschappen.maandelijksTotaal += 	Number(ods);

				tabel.beginGemist.push(				'bij opnemen' );
				tabel.replay.push(					'bij opnemen' );
				tabel.onDemandSamen.push(			onDemand.opnemen_replay_begin_gemist_samen );

			}

		} else {

				tabel.opnemen.push(					false );
				tabel.beginGemist.push(				false );
				tabel.replay.push(					false );
				tabel.onDemandSamen.push(			false );

		}

		var pakketten = tv.paketten;
		var tvOpties = ('televisie-opties' in keuzehulp ? keuzehulp['televisie-opties'] : {}) ;

		if (tvOpties.indexOf('1') !== -1) {

			var fse = 								efiberNietMin1ReturnZelfOfFalse(pakketten.fox_sports_ed);
			tabel.foxSportsEd.push(					efiberEuro( fse ) );
			eigenschappen.maandelijksTotaal += 		Number(fse);

		} else {
			tabel.foxSportsEd.push(					false );
		}

		if (tvOpties.indexOf('2') !== -1) {

			var zst = 								efiberNietMin1ReturnZelfOfFalse(pakketten.ziggo_sport_totaal);
			tabel.ziggoSportTotaal.push(			efiberEuro( zst ) );
			eigenschappen.maandelijksTotaal += 		Number(zst);

		} else {
			tabel.ziggoSportTotaal.push(			false );
		}

		if (tvOpties.indexOf('3') !== -1) {

			var fsi = 								efiberNietMin1ReturnZelfOfFalse(pakketten.fox_sports_int)
			tabel.foxSportsInt.push(				efiberEuro( fsi ) );
			eigenschappen.maandelijksTotaal += 		Number(fsi);

		} else {
			tabel.foxSportsInt.push(				false );
		}

		if (tvOpties.indexOf('4') !== -1) {

			var pp = 								efiberNietMin1ReturnZelfOfFalse(pakketten.plus_pakket);
			//var ero = 								efiberNietMin1ReturnZelfOfFalse(pakketten.erotiek_pakket);
			tabel.plusPakket.push(					efiberEuro( pp ) );
			//tabel.erotiek.push(						efiberEuro( ero ) );
			eigenschappen.maandelijksTotaal += 		Number(pp);
			//eigenschappen.maandelijksTotaal += 		Number(ero);

		} else {
			tabel.plusPakket.push(					false );
			//tabel.erotiek.push(						false );
		}

		if (tvOpties.indexOf('5') !== -1) {

			var f1 = 								efiberNietMin1ReturnZelfOfFalse(pakketten.film1);
			tabel.film1.push(						efiberEuro( f1 ) );
			eigenschappen.maandelijksTotaal += 		Number(f1);

		} else {
			tabel.film1.push(						false );
		}

	} else {

		tabel.zenders.push(							false );
		tabel.ontvangers.push(						false );
		tabel.extraOntvangers.push(					false );
		tabel.opnemen.push(							false );
		tabel.heeftTV.push(							false );
		tabel.beginGemist.push(						false );
		tabel.replay.push(							false );
		tabel.onDemandSamen.push(					false );
		tabel.plusPakket.push(						false );
		tabel.foxSportsEd.push(						false );
		tabel.foxSportsInt.push(					false );
		tabel.ziggoSportTotaal.push(				false );
		//tabel.erotiek.push(							false );
		tabel.film1.push(							false );

	}

	// INSTALLATIE

	if (!('installatie' in tabel)) tabel.installatie = [];

	// als dhz, kijk dan of dhz, anders basis, anders volledig/
	// als basis; kijk dan of basis, anders volledig, anders dhz.

	var installatieKeuze = 							keuzehulp.installatie,
		idhz = 										eigenschappen.installatie.dhz !== '-1',
		ibi = 										eigenschappen.installatie.basis_installatie !== '-1',
		ivi = 										eigenschappen.installatie.volledige_installatie !== '-1',
		sdhz = 										"<span>Doe het zelf</span> ",
		sbasis = 									"<span>Basis</span> ",
		svolledig = 								"<span>Volledig</span> ";

	if (installatieKeuze === '1') {

		if (idhz) {

			tabel.installatie.push(	sdhz + 			efiberEuro(eigenschappen.installatie.dhz) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.dhz);

		} else if (ibi) {

			tabel.installatie.push(	sbasis + 		efiberEuro(eigenschappen.installatie.basis_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.basis_installatie);

		} else if (ivi) {

			tabel.installatie.push(	svolledig + 	efiberEuro(eigenschappen.installatie.volledige_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.volledige_installatie);

		} else {

			tabel.installatie.push(					false);

		}

	} else if (installatieKeuze === '2') {

		if (ibi) {

			tabel.installatie.push(	sbasis + 		efiberEuro(eigenschappen.installatie.basis_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.basis_installatie);

		} else if (ivi) {

			tabel.installatie.push(	svolledig +	 	efiberEuro(eigenschappen.installatie.volledige_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.volledige_installatie);

		} else if (idhz) {

			tabel.installatie.push(	sdhz + 			efiberEuro(eigenschappen.installatie.dhz) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.dhz);

		} else {

			tabel.installatie.push(					false);

		}

	} else {

		if (ivi) {

			tabel.installatie.push(	svolledig + 	efiberEuro(eigenschappen.installatie.volledige_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.volledige_installatie);

		} else if (ibi) {

			tabel.installatie.push(	sbasis + 		efiberEuro(eigenschappen.installatie.basis_installatie) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.basis_installatie);

		} else if (idhz) {

			tabel.installatie.push(	sdhz + 			efiberEuro(eigenschappen.installatie.dhz) );
			eigenschappen.eenmaligTotaal +=			Number(eigenschappen.installatie.dhz);

		} else {

			tabel.installatie.push(					false);

		}

	}

	// FINANCIEEL

	if (!('maandelijksTotaal' in tabel)) tabel.maandelijksTotaal = [];
	if (!('eenmaligTotaal' in tabel)) tabel.eenmaligTotaal = [];
	if (!('borg' in tabel)) tabel.borg = [];
	if (!('bestelKnop' in tabel)) tabel.bestelKnop = [];

	tabel.maandelijksTotaal.push(efiberEuro(eigenschappen.maandelijksTotaal));

	tabel.eenmaligTotaal.push(efiberEuro(eigenschappen.eenmaligTotaal));

	tabel.borg.push(efiberEuro(eigenschappen.financieel.borg));

	var bestelKnop = new efiberMaakBestelKnop(pakket, eigenschappen);
	tabel.bestelKnop.push(bestelKnop.HTML);

	// ONDERAAN

	if (!('tekstOnderaan' in tabel)) tabel.tekstOnderaan = [];

	//console.log(pakket_post_content);
	tabel.tekstOnderaan.push(pakket.post_content);

	return tabel;
}
