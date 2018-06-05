<?php



function efiber_pakket_eigenschappen($p)  {

	//$p->thumb = get_the_post_thumbnail($p->ID);
	$pm = get_field('pakket_meta', $p->ID);

	$pm['provider']->minimale_contractsduur = get_field('minimale_contractsduur', $pm['provider']->ID);
	$pm['provider']->ik_ga_akkoord_met = get_field('ik_ga_akkoord_met', $pm['provider']->ID);

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
	);
}


function getdb(){

    $servername = "localhost";
    $username = "huscqxzwaw";
    $password = "2WWKxxxxHr";
    $db = DB_NAME;

    try {

        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
         //echo "Connected successfully";
    } catch(exception $e) {
        echo "Connection failed: " . $e->getMessage();
    }

    return $conn;
}

function efiber_form_sectie ($titel = '', $inh = '') {

	$header = "";
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

	$e = explode('<', $veld1);

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

	// rommelig

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

	$naam = $params['naam'];
	$waarde = $params['waarde'];
	$value = $params['value'];
	$label = $params['label'];
	$func = $params['func'];
	$type = $params['type'];
	$class = !!$value ? 'actief' : '';
	$eclass = $params['eclass'];
	$label = $params['label'];

	$tekst = $waarde !== '' ? efiber_maak_geld_op($waarde) : '';

	$v = ($value ? " value='$value' " : "");
	$f = ($func ? "data-efiber-func='$func'" : "");
	$id = ($type === 'radio' ?
		$naam . '-' .
			strtolower(
				preg_replace("/\W|_/", '-',
					substr($label, 0, 45)
				)
			) :
		$naam
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

	$euros = number_format ( $euros, 2 );
	$euros = str_replace('.', ',', $euros);
	return "&euro;$euros";

}