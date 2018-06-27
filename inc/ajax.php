<?php

$func_n = "efiber_controleer_postcode";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );


function efiber_controleer_aanvraag_al_gedaan ($ad, $con) {


	/*---------------------------------------------------------
	|
	| 	Dit is een hulp functie van efiber_controleer_postcode.
	| 	Als op een postcode al een aanvraag is gedaan dient de gebruiker 
	| 	niet in de keuzehulp te komen.
	| 	In plaats daarvan krijgt de gebruiker info van de provider te zien;
	| 	bij de provider kan hij dan de aanvraag corrigeren / inzien. Daar blijven wij buiten
	| 
	| 	Deze functie doet een query op de postcodedatabase adhv adresgegevens & aanvraag gedaan; als er minstens één 
	| 	hit is wordt de eifber_controleer_postcode functie onderbroken door een JSON echo en een die()
	| 	Anders wordt queryresultaat teruggegeven.
	|
	-----------------------------------------------------------*/


   	$sql = "SELECT * FROM postcodes WHERE postcode='{$ad['postcode']}' AND huisnummer='{$ad['huisnummer']}' AND toevoeging='{$ad['toevoeging']}' AND kamer='{$ad['kamer']}' AND aanvraag_gedaan = 1";

    $result = mysqli_query($con, $sql);

    if ($result->num_rows > 0) {

    	$provider_naam = (mysqli_fetch_assoc($result))['provider'];

    	// @TODO terugval optie als provider niet gevonden ...!
    	// Idealiter wordt dit gedaan via provider ID... maar dat vereist (weer) een extra kolom erbij in het aanmeldingsformulier, waar de data vandaan komt.
    	$provider = get_page_by_title( $provider_naam, 'object', 'provider' );

		echo json_encode(array(
			'gevonden'			=> true,
			'aanvraag_al_gedaan'=> true,
			'aanvraag_info'		=> array(
				'naam'		=> $provider_naam,
				'URL'		=> get_field('website', $provider->ID),
				'email'		=> get_field('email', $provider->ID),
			)
		));	    	
		die();
    } else {
    	return array(
    		$sql,
    		$result,
    		mysqli_fetch_assoc($result)	
    	);
    }
}

function efiber_controleer_postcode() {


	/*---------------------------------------------------------
	|
	| 	Deze functie zoekt tweemaal of adresgegevens voorkomen in de postcodetabel
	|	Eerst volgens 1000AA, daarna met spelvariant 1000 AA.
	| 	Als er een resultaat is gevonden wordt gecontroleerd of daarop al een aanvraag loopt
	| 	In het antwoord naar de voorkant wordt ook informatie over de regio mee teruggegeven: 
	| 	dit is legacy. Eerder werd dan gezegd 'Wij leggen glasvezel in Koggenland' etc. 
	| 	strtolower(postcode.gebiedscode) === regio.slug
	|
	-----------------------------------------------------------*/


	// standaard antwoord voor als niets gevonden is
	$fout = json_encode(array(
		'gevonden'		=> false,
		'gebiedscode'	=> NULL,
	));

	$ajax_data = $_POST['data'];

	// zet de mysql verbinding klaar
	$con = getdb();

   	$sql = "SELECT * FROM postcodes WHERE postcode='{$ajax_data['postcode']}' AND huisnummer='{$ajax_data['huisnummer']}' AND toevoeging='{$ajax_data['toevoeging']}' AND kamer='{$ajax_data['kamer']}'";

    $result = mysqli_query($con, $sql);

    if ($result) {

    	// als onderstaande functie wat vindt wordt huidige functie afgebroken
    	$gezocht_naar_aanvraag = efiber_controleer_aanvraag_al_gedaan($ajax_data, $con);

	    $rij = mysqli_fetch_assoc($result);
	    if ($rij and count($rij)) {

	    	// regio taxonomy object
	    	$regio = get_term_by('slug', strtolower($rij['gebiedscode']), 'regio', 'object');

			echo json_encode(array(
				'gevonden'				=> true,
				'gebiedscode'			=> $rij['gebiedscode'],
				'regio'					=> $regio->name,
				'data'					=> $ajax_data,
				'aanvraag_al_gedaan'	=> false,
				'aanvraag_info'			=> false,
			));
	    } else {

	    	// opnieuw proberen met postcode met spatie
	    	// @TODO refactor naar 

	    	$pc = substr($ajax_data['postcode'], 0, 4) . " " . substr($ajax_data['postcode'], 4, 2);

	    	$sql = "SELECT * FROM postcodes WHERE postcode='$pc' AND huisnummer='{$ajax_data['huisnummer']}' AND toevoeging='{$ajax_data['toevoeging']}' AND kamer='{$ajax_data['kamer']}'";
	    	$result = mysqli_query($con, $sql);

		   if ($result) {

		   		// als onderstaande functie wat vindt wordt huidige functie afgebroken
				$gezocht_naar_aanvraag = efiber_controleer_aanvraag_al_gedaan($ajax_data, $con);

			    $rij = mysqli_fetch_assoc($result);
			    if ($rij and count($rij)) {

			    	// regio taxonomy object
			    	$regio = get_term_by('slug', strtolower($rij['gebiedscode']), 'regio', 'object');

					echo json_encode(array(
						'gevonden'				=> true,
						'gebiedscode'			=> $rij['gebiedscode'],
						'regio'					=> $regio->name,
						'data'					=> $ajax_data,
						'aanvraag_al_gedaan'	=> false,
						'aanvraag_info'			=> false,
					));
			    } else {

			    	echo $fout;

			    }
		    } else {
		    	echo $fout;
		    }


	    }
    } else {
    	echo $fout;
    }

    // zonder die print een 0 erachteraan
	wp_die();
	
}



$func_n = "efiber_vergelijking";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );

function efiber_vergelijking() {


	/*---------------------------------------------------------
	|
	| 	Informatie afkomstig uit de pakkettoewijzingen worden
	| 	gefilterd op regio / gebiedscode
	| 	bekabeling indien van toepassing
	| 	en wordt (indirect) de pakket variabele verrijkt met info uit ACF, de provider e.d.
	|
	-----------------------------------------------------------*/


	$ajax_data = $_POST['data'];

	// keuzehulp geheugen obj
	$keuzehulp = $ajax_data['keuzehulp'];

	// code à la toewijzingen dus bijv 423 of 101
	$keuzecode = $keuzehulp['internet'] . $keuzehulp['bellen'] . $keuzehulp['televisie'];

	// per code zijn pakketten toegewezen. 
	// $bundels is een array met 100 => pakket1, pakket2, pakket3; 101 => pakket1, pakket4; etc.
	// hier is ook opgeslagen (...) of de telefoonbundel NL vooringevuld dient te zijn.
	// let op mogelijk verwarrend taalgebruik... hier is een bundel een set pakketten.
	$bundels = get_field('toewijzing', 'option');

	// gebiedscode bind postcodetabel aan de regios en zo aan welke pakketten kunnen... 
	// pakketten hebben regio taxonomy waarvan slug = gebiedscode in onderkast
	$gebiedscode = strtolower($ajax_data['gebiedscode']);

	// eerste 'emmertje' om pakketten in te gooien
	$gevonden = array();

	// legacy debug
	$hulp = array();

	// emmertje met daarin gevonden pakketten die ook een passende regio hebben
	$regio_ok = array();

	// derde en laatste emmertje waarmee, als nodig, wordt gefilterd op bekabelingstype
	// Bepaalde providers leveren ITV via coax oid... onnavolgbaar.
	// hiervoor hebben pakketten bekabelingstaxonomy met waarden utp en coax.
	$kabel_gecontroleerd = array();
	
	// kabel gecontroleerd met de pakketeigenschappen erop geplakt.
	$pakketten_met = array();



	if ($bundels) :

		// @TODO dit is een loze if statement. Moet ook kijken of count correct is. 
		// else statement toevoegen: afbreken functie en foutmelding terugschrijven.

		// $bundel is dus 
		// 		keuze_uitkomst zoals 101
		//		pakketten => array (pakket, pakket, pakket...)
		//		belbundel_nl_vooringevuld true/false

		// houdt rekening met mogelijk meerdere keren dezelfde keuzecode in de toewijzingen.
		// $gevonden kan dus meerdere bundels hebben

		foreach ($bundels as $bundel) :

			if ($bundel['keuze_uitkomst'] == $keuzecode) {
				$gevonden[] = $bundel;
			}

		endforeach;

	endif;



	if ($gevonden) :

		// @TODO loze if statement... controleer ook count

		foreach ($gevonden as $g) :

			$pakketten = $g['pakketten'];

			// @TODO loze if statement... controleer ook count

			if ($pakketten) :

				foreach ($pakketten as $pakket_a) :

					$regio_terms = wp_get_post_terms($pakket_a['pakket']->ID, 'regio');

					// pakketten kunnen meer dan één regio hebben toegewezen.
					// loop over regios heen, als gelijk aan dit pakket, dan doorlaten, en door naar volgende pakket.
					// belbundel info wordt hier ook direct op het pakket geschreven. 

					foreach ($regio_terms as $regio) {
						if ($regio->slug === $gebiedscode) {
							$pakket_a['pakket']->belbundel_nl_vooringevuld = $g['belbundel_nl_vooringevuld'];
							$regio_ok[] = $pakket_a['pakket'];
							break 1; // niet meer dan één keer in zetten.
						}
					}

				endforeach; // pakketten as pakket_a

			else :

				// gaat naar evt. foutmelding
				$hulp[] = "$pakketten leeg";

			endif;

		endforeach; // gevonden as g

		///////////
		///////////

		// haal uit de keuzehulp op of gefilterd moet worden op utp of coax
		$kabel_optie_waarde = array_key_exists('bekabeling', $keuzehulp) ? ($keuzehulp['bekabeling'] === '1' ? 'coax' : 'utp') : '';

		// maar we hoeven alleen te filteren als de TV optie 'digitaal' is gekozen. 
		// als dat niet zo is dan is kabel_gecontroleerd gelijk aan regio_ok.
		if ($keuzehulp['televisie'] !== '2') {
			$kabel_gecontroleerd = $regio_ok;
		} else {

			// gelijk aan filtering op regio
			foreach ($regio_ok as $pakket) :

				$bekabeling_terms = wp_get_post_terms($pakket->ID, 'bekabeling');

				foreach ($bekabeling_terms as $kabel_optie) {

					if ($kabel_optie->slug === $kabel_optie_waarde) {
						$kabel_gecontroleerd[] = $pakket;
						break 1; // niet meer dan één keer in zetten.
					}

				}

			endforeach;

		}

	else :

		// gaat naar evt. foutmelding
		$hulp[] = "gevonden leeg voor $keuzecode";

	endif;

	$fout = json_encode(array(
		'gevonden'		=> false,
		'pakketten'		=> NULL,
		'hulp'			=> $hulp,
		'ajax_data'		=> $ajax_data,
		'regio_ok'		=> $regio_ok,
		'regio_niet_ok'	=> $regio_niet_ok,
	));

	// @TODO controleren op count..!
	if ($kabel_gecontroleerd) :

		foreach ($kabel_gecontroleerd as $p) {

			// haalt pakket en provider opties op
			$p->eigenschappen = efiber_pakket_eigenschappen($p);
			$pakketten_met[] = $p;

		}

		echo json_encode(array(
			'pakketten'		=> $pakketten_met,
//			'console'		=> $pakketten_met, // console wordt in de console geprint
		));

	else :

		echo $fout;

	endif;

	wp_die();

}