<?php



function efiber_pakket_eigenschappen($p)  {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie die pakket postobject verreikt met ACF data & provider data
	|
	-----------------------------------------------------------*/


	$pm = get_field('pakket_meta', $p->ID);

	$pm['provider']->minimale_contractsduur = get_field('minimale_contractsduur', $pm['provider']->ID);
	$pm['provider']->ik_ga_akkoord_met = get_field('ik_ga_akkoord_met', $pm['provider']->ID);
	$pm['provider']->inschrijving_telefoonboek_mogelijk = get_field('inschrijving_telefoonboek_mogelijk', $pm['provider']->ID);

	return array(
		'thumb'				=> get_the_post_thumbnail($pm['provider']->ID),
		'pakket_meta' 		=> $pm,
		'usp' 				=> get_field('usp', $p->ID),
		'snelheid' 			=> get_field('snelheid', $p->ID),
		'financieel' 		=> get_field('financieel', $p->ID),
		'incl_wifi_router' 	=> get_field('incl_wifi_router', $p->ID),
		'incl_glasconnector'=> get_field('incl_glasconnector', $p->ID),
		'vast_ip' 			=> get_field('vast_ip', $p->ID),
		'installatie' 		=> get_field('installatie', $p->ID),
		'heeft_tv' 			=> get_field('heeft_tv', $p->ID),
		'tv' 				=> get_field('tv', $p->ID),
		'telefonie' 		=> get_field('telefonie', $p->ID),
		'extra' 			=> get_field('extra', $p->ID),
	);
}


function getdb(){


	/*---------------------------------------------------------
	|
	|	Hulpfunctie die databaseverbinding opent op basis van WP constanten
	|
	-----------------------------------------------------------*/

	// @TODO waardeloze naam

    try {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    } catch(exception $e) {
    	return false;
    }

    return $conn;
}

function efiber_form_sectie ($titel = '', $inh = '') {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$header = "";

	//tbv stijling
	$slak = strtolower(preg_replace("/[^A-Za-z0-9 ]/", '', $titel));

	if ($titel !== '') {
		$header = "<header class='efiber-form-sectie-header'>
				<h3>$titel</h3>
			</header>";
	}

	return "
		<section class='efiber-form-sectie $slak'>
			$header
			<div class='efiber-form-sectie-torso'>
				$inh
			</div>
		</section>
	";
}


function efiber_form_rij ($veld1, $veld2, $extra_klasse = '') {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$e = explode('<', $veld1);

	//tbv stijling
	$klasse = strtolower(str_replace(' ', '-', preg_replace("/[^A-Za-z0-9 ]/", '', $e[0])));

	return "<div class='rij $klasse $extra_klasse'>
		<div class='veld veld-1'>
			$veld1
		</div>
		<div class='veld veld-2'>
			$veld2
		</div>
	</div>";
}

function efiber_input ($params = array()) {


	/*---------------------------------------------------------
	|
	|	Lucas 16:10-13
	| 	Functie die tekst, nummer, (nep)-radio en checkboxes uitdraait
	|	zonder idee vooraf gemaakt DUS extreem rommelig
	|
	-----------------------------------------------------------*/

	// @TODO scheiden in radio/nepradio/checkbox en nummer/tekst functie. Dit is té

	// initialisatie
	$terugval = array(
		'naam'		=> '',
		'waarde'	=> '',
		'value'		=> false,
		'label'		=> '',
		'func'		=> false,
		'type'		=> 'checkbox',
		'eclass'	=> '',
		'label'		=> '',
	);
	foreach ($terugval as $s => $w) {
		if (!(array_key_exists($s, $params))) {
			$params[$s] = $terugval[$s];
		}
	}

	$naam = $params['naam']; 		// de name
	$waarde = $params['waarde']; 	// de prijs
	$value = $params['value']; 		// het aantal
	$label = $params['label'];		// label, bv SVGs
	$func = $params['func'];		// welke dispatcher-functie aangeroepenen worden op klik
	$type = $params['type'];		// text, number, etc
	$class = !!$value ? 'actief' : ''; // checked unchecked
	$eclass = $params['eclass'];	// zoals hidden

	$tekst = $waarde !== '' ? efiber_maak_geld_op($waarde) : '';

	$v = ($value ? " value='$value' " : "");
	$f = ($func ? "data-efiber-func='$func'" : "");

	$id = ($type === 'radio' ? // radio's hebben een tekstuitkomst afhankelijk van de invoer. In dit algoritme wordt HTML geduwd en er komen ids uit.
		$naam . '-' .
			strtolower(
				str_replace(' ', '-', 
					preg_replace(
						"/[^A-Za-z0-9 ]/", '', (
							explode('.', // afbreken op eerste SVG
								strip_tags($label)
							)
						)[0]
					)
				)
			) :
		$naam // want is geen radio.
	);

	if (!in_array($type, array('radio', 'checkbox'))) {

		$label_html = $type !== 'hidden'? "<label
				for='$id'>
				$tekst
			</label>" : '';

		return "
			<input
				class='knop $eclass'
				type='$type'
				name='$naam'
				id='$id'
				data-efiber-waarde='$waarde'
				data-efiber-vorige-value='$value'
				data-efiber-value='$value'
				data-efiber-func='update-hidden $func'
				$v
				$f
			>
			$label_html
			";

	} else {
		return "
			<div
				class='efiber-$type $class $eclass knop'
				id='$id'
				data-efiber-func='aanmelding-schakel update-hidden $func'
				data-efiber-waarde='$waarde'
				data-efiber-vorige-value='$value'
				data-efiber-value='$value'
				>
				<span class='tekst'>$tekst</span>
				<span class='label'>$label</span>
			</div>";
	}

}

function efiber_maak_geld_op($euros = '') {


	/*---------------------------------------------------------
	|
	| 	Veranderd getallen in €4,95 format
	|
	-----------------------------------------------------------*/


	$euros = number_format ( $euros, 2 );
	$euros = str_replace('.', ',', $euros);
	return "&euro;$euros";

}