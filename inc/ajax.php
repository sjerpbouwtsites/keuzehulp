<?php

$func_n = "kz_schrijf_fout";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );



function kz_schrijf_fout() {

	error_log(print_r($_POST['data'], true));
	echo json_encode(array('succes' => true));
	die();

}



$func_n = "keuzehulp_controleer_postcode";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );


function keuzehulp_controleer_aanvraag_al_gedaan ($ad, $con) {


	/*---------------------------------------------------------
	|
	| 	Dit is een hulp functie van keuzehulp_controleer_postcode.
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

    	$provider_gegevens = get_field('bedrijfsgegevens', $provider->ID);

		echo json_encode(array(
			'gevonden'			=> true,
			'aanvraag_al_gedaan'=> true,
			'status'			=> (mysqli_fetch_assoc($result))['provider'],
			'provider_beschikbaar'	=> kz_provider_beschikbaar($rij['gebiedscode']),
			'aanvraag_info'		=> array(
				'naam'		=> $provider_naam,
				'URL'		=> $provider_gegevens['website'],
				'email'		=> $provider_gegevens['email'],
				'telefoon'	=> $provider_gegevens['telefoon'],
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

function kz_provider_beschikbaar ($gebiedscode = '') {
	$providers = get_posts(array(
		'posts_per_page'	=> 1,
		'post_type'			=> 'provider',
		'tax_query'	=> array(
			array(
				'taxonomy' => 'regio',
				'field' => 'slug',
				'terms' => strtolower($gebiedscode),
			),
		)
	));
	return count($providers) > 0;
}


function keuzehulp_controleer_postcode() {



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
    	$gezocht_naar_aanvraag = keuzehulp_controleer_aanvraag_al_gedaan($ajax_data, $con);

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
				'status'				=> $rij['status'],
				'provider_beschikbaar'	=> kz_provider_beschikbaar($rij['gebiedscode'])
			));
	    } else {

	    	// opnieuw proberen met postcode met spatie
	    	// @TODO refactor naar

	    	$pc = substr($ajax_data['postcode'], 0, 4) . " " . substr($ajax_data['postcode'], 4, 2);

	    	$sql = "SELECT * FROM postcodes WHERE postcode='$pc' AND huisnummer='{$ajax_data['huisnummer']}' AND toevoeging='{$ajax_data['toevoeging']}' AND kamer='{$ajax_data['kamer']}'";
	    	$result = mysqli_query($con, $sql);

		   if ($result) {

		   		// als onderstaande functie wat vindt wordt huidige functie afgebroken
				$gezocht_naar_aanvraag = keuzehulp_controleer_aanvraag_al_gedaan($ajax_data, $con);

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
						'status'				=> $rij['status'],
						'provider_beschikbaar'	=> kz_provider_beschikbaar($rij['gebiedscode'])
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

function filter_op_regio_en_verrijk_pakket ($pakketten, $toegestane_providers, $naam_postfix = '', $status = '100', $ajax_data = array()) {

	$providers = array();

	$sc = array();

	// stript overbodige properties van post obj af.
	$pakketten = array_map(function($verz){
		return (object) array( 'ID'  => $verz->ID, 'titel' => $verz->post_title);
	}, $pakketten);

	$sc['pakketen_na'] = $pakketten;
	$sc['tekst'] = array();

	foreach ($pakketten as $p) :

		// eigenschappen als provider, minimale contractsduur en pakketopties
		$p->eigenschappen = keuzehulp_pakket_eigenschappen($p, $ajax_data['adres']['gebiedscode'], $status, $ajax_data);
		$sc['tekst'][] = $p;
		$p->provider = $p->eigenschappen['provider_meta']['naam'];

		// nu pakketten filteren op provider cq filteren op regio.
		if (!in_array($p->provider, $toegestane_providers)) continue;

		//$p->naam_composiet = $p->provider . " " . $naam_postfix;
		$p->naam_composiet = $naam_postfix; //heet postfix omdat het oorspronkeljik achter de providernaam zat

		$providers[$p->provider][] = $p;
		if (!array_key_exists($p->provider, $providers)) {
			// er zijn nog geen pakketten van deze provider. initialiseer de array.
			$providers[$p->provider] = array();
		}


	endforeach;

	return array(
		'providers' 	=> $providers,
		'params' 		=> func_get_args(),
		'sc'			=> $sc
	);
}

function toegestane_providers($regio = '') {
	return array_map(
		function($provider_post){
			return $provider_post->post_title;
		},
		get_posts( array(
        	'posts_per_page' => -1,
        	'post_type' => 'provider',
        	'tax_query' => array( array( 'taxonomy' => 'regio', 'field' => 'slug', 'terms' => $regio ), )
        ) )
	);
}


$func_n = "keuzehulp_vergelijking";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );

function keuzehulp_vergelijking() {


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
	$gebiedscode = strtolower($ajax_data['adres']['gebiedscode']);

	$status = strtolower($ajax_data['adres']['status']);

	$tax_query = array();


	if ($keuzehulp['televisie'] === '2' || $keuzehulp['televisie'] === '3') {

        $tax_query[] = array(
            'taxonomy' 	=> 'tv-type',
            'field' 	=> 'slug',
            'terms' 	=> $keuzehulp['televisie'] === '2' ? "DTV" : "ITV",
        );

		if ($keuzehulp['bellen'] !== '1') {

			$postfix = 'alles in 1 '. ($keuzehulp['televisie'] === '2' ? "DTV" : "ITV");

	        $tax_query[] = array(
	            'taxonomy' 	=> 'type',
	            'field' 	=> 'slug',
	            'terms' 	=> array( "alles-in-1"),
	        );

		} else {

			$postfix = 'internet en '. ($keuzehulp['televisie'] === '2' ? "DTV" : "ITV");

	        $tax_query[] = array(
	            'taxonomy' 	=> 'type',
	            'field' 	=> 'slug',
	            'terms' 	=> array("internet-en-tv" ),
	        );
		}

	} else {

		if ($keuzehulp['bellen'] !== '1') {

			$postfix = 'internet en bellen';

	        $tax_query[] = array(
	            'taxonomy' 	=> 'type',
	            'field' 	=> 'slug',
	            'terms' 	=> array("internet-en-bellen" ),
	        );

		} else {

			$postfix = 'internet';

	        $tax_query[] = array(
	            'taxonomy' 	=> 'type',
	            'field' 	=> 'slug',
	            'terms' 	=> array( "alleen-internet",),
	        );
		}
	}

	$tax_query[] = array(
	    'taxonomy' => 'status',
	    'field' => 'slug',
	    'terms' => 'status-'.$status,
	);

	$pakketten = get_posts(array(
		'posts_per_page'	=> -1,
		'post_type'			=> 'nieuw-pakket',
		'tax_query'			=> $tax_query
	));


	$console['tax_query'] = $pakketten;

	finalizeer_verzenden_pakketten(array(
		'pakketten' 			=> $pakketten,
		'gebiedscode'			=> $gebiedscode,
		'postfix'				=> $postfix,
		'status'				=> $status,
		'ajax_data'				=> $ajax_data,
		'console'				=> $console
	));

}


function finalizeer_verzenden_pakketten($arg = array()) {

	$console = array();

	$console['finalizeer_args'] = $arg;

	$toegestane_providers = toegestane_providers($arg['gebiedscode']);
	//$console['$toegestane_providers'] = $toegestane_providers;

	if ($arg['pakketten'] and count($arg['pakketten'])) :

		$reg_filter = filter_op_regio_en_verrijk_pakket(
			$arg['pakketten'], $toegestane_providers, $arg['postfix'], $arg['status'], $arg['ajax_data']
		);

		$console['reg_filter'] = $reg_filter;

		echo json_encode(array(
			'providers' 	=> $reg_filter['providers'],
			'console'		=> array_key_exists('console', $arg) ? array_merge($arg['console'], $console) : $console
		));
	    wp_die();

	else :

		echo json_encode(array(
			'error'			=> true,
			'providers' 	=> null,
			'console' 		=> $console
		));
	    wp_die();

	endif;

}



$func_n = "keuzehulp_ik_weet_wat_ik_wil_pakketten";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );

function keuzehulp_ik_weet_wat_ik_wil_pakketten() {


	/*---------------------------------------------------------
	|
	| 	Genereert lijst met pakketten per provider + provider pitch
	| 	adhv keuzehulp data & gebiedscode
	| 	pakketten worden gesorteerd met Netrebel als eerste
	|
	-----------------------------------------------------------*/

	$console = array();

	$ajax_data = $_POST['data'];
	$gebiedscode = $ajax_data['adres']['gebiedscode'];
	$status = $ajax_data['adres']['status'];
	$keuzehulp = $ajax_data['keuzehulp'];

	$slug_ar = array(
		'1'		=> 'alleen-internet',
		'2'		=> 'internet-en-bellen',
		'3'		=> 'internet-en-tv',
		'4'		=> 'alles-in-1',
	);

	$naam_ar = array(
		'1'		=> 'Internet',
		'2'		=> 'Internet en bellen',
		'3'		=> 'Internet en TV',
		'4'		=> 'Alles in 1',
	);


	$type_slug = $slug_ar[($keuzehulp['ik-weet-wat-ik-wil'])];
//	$console['type_slug'] = $type_slug;

	$pakken_query_args = array(
        'posts_per_page' => -1,
        'post_type' => 'nieuw-pakket',
        'tax_query' => array(
            array(
                'taxonomy' => 'type',
                'field' => 'slug',
                'terms' => $type_slug,
            ),
            array(
                'taxonomy' => 'status',
                'field' => 'slug',
                'terms' => 'status-'.$status,
            ),
        )
    );

	//$console['paketten_query'] = $pakken_query_args;

	$pakketten = get_posts($pakken_query_args);
//	$console['pakketten-rauw'] = $pakketten;

	$postfix = $naam_ar[($keuzehulp['ik-weet-wat-ik-wil'])]; // DTV of ITV in JS

	finalizeer_verzenden_pakketten(array(
		'pakketten' 			=> $pakketten,
		'gebiedscode'			=> $gebiedscode,
		'postfix'				=> $postfix,
		'status'				=> $status,
		'ajax_data'				=> $ajax_data,
		'console'				=> $console
	));


}
