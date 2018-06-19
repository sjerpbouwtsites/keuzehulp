<?php

$func_n = "efiber_controleer_postcode";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );

function efiber_controleer_postcode() {

	$fout = json_encode(array(
		'gevonden'		=> false,
		'gebiedscode'	=> NULL,
	));

	$ajax_data = $_POST['data'];

	$con = $con = getdb();

   	$sql = "SELECT * FROM postcodes WHERE postcode='{$ajax_data['postcode']}' AND huisnummer='{$ajax_data['huisnummer']}' AND toevoeging='{$ajax_data['toevoeging']}' AND kamer='{$ajax_data['kamer']}'";

    $result = mysqli_query($con, $sql);

    if ($result) {
	    $rij = mysqli_fetch_assoc($result);
	    if ($rij and count($rij)) {

	    	$regio = get_term_by('slug', strtolower($rij['gebiedscode']), 'regio', 'object');

			echo json_encode(array(
				'gevonden'		=> true,
				'gebiedscode'	=> $rij['gebiedscode'],
				'regio'			=> $regio->name,
				'data'			=> $ajax_data
			));
	    } else {

	    	// opnieuw proberen met postcode met spatie
	    	// @TODO refactor

	    	$pc = substr($ajax_data['postcode'], 0, 4) . " " . substr($ajax_data['postcode'], 4, 2);

	    	$sql = "SELECT * FROM postcodes WHERE postcode='$pc' AND huisnummer='{$ajax_data['huisnummer']}' AND toevoeging='{$ajax_data['toevoeging']}' AND kamer='{$ajax_data['kamer']}'";
	    	$result = mysqli_query($con, $sql);

		   if ($result) {
			    $rij = mysqli_fetch_assoc($result);
			    if ($rij and count($rij)) {

			    	$regio = get_term_by('slug', strtolower($rij['gebiedscode']), 'regio', 'object');

					echo json_encode(array(
						'gevonden'		=> true,
						'gebiedscode'	=> $rij['gebiedscode'],
						'regio'			=> $regio->name,
						'data'			=> $ajax_data
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

	wp_die();

	//return true/false + gebiedscode
}





$func_n = "efiber_vergelijking";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );

function efiber_vergelijking() {

	$ajax_data = $_POST['data'];
	$keuzehulp = $ajax_data['keuzehulp'];
	$keuzecode = $keuzehulp['internet'] . $keuzehulp['bellen'] . $keuzehulp['televisie'];
	$bundels = get_field('toewijzing', 'option');
	$gebiedscode = strtolower($ajax_data['gebiedscode']);
	$gevonden = array();
	$hulp = array();
	$regio_ok = array();
	$paketten_met = array();

	if ($bundels) :

		foreach ($bundels as $bundel) :

			if ($bundel['keuze_uitkomst'] == $keuzecode) {
				$gevonden[] = $bundel;
			}

		endforeach;

	endif;

	if ($gevonden) :

		foreach ($gevonden as $g) :

			$pakketten = $g['pakketten'];

			if ($pakketten) :

				foreach ($pakketten as $pakket_a) :

					$regio_terms = wp_get_post_terms($pakket_a['pakket']->ID, 'regio');

					foreach ($regio_terms as $regio) {
						if ($regio->slug === $gebiedscode) {
							$pakket_a['pakket']->belbundel_nl_vooringevuld = $g['belbundel_nl_vooringevuld'];
							$regio_ok[] = $pakket_a['pakket'];
							break 1; // niet meer dan één keer in zetten.
						}
					}



				endforeach;

			else :

				$hulp[] = "$pakketten leeg";

			endif;

		endforeach;

		///////////
		///////////

		$kabel_gecontroleerd = array();
		$kabel_optie_waarde = array_key_exists('bekabeling', $keuzehulp) ? ($keuzehulp['bekabeling'] === '1' ? 'coax' : 'utp') : '';

		if ($keuzehulp['televisie'] !== '2') {
			$kabel_gecontroleerd = $regio_ok;
		} else {

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

	if ($kabel_gecontroleerd) :

		foreach ($kabel_gecontroleerd as $p) {

			$p->eigenschappen = efiber_pakket_eigenschappen($p);

			$paketten_met[] = $p;
		}

		echo json_encode(array(
			'pakketten'		=> $paketten_met,
			'console'		=> $paketten_met,
		));

	else :

		echo $fout;

	endif;

	wp_die();

}


$func_n = "efiber_haal_zakelijk_of_lead_formulier";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );



function efiber_haal_gravity_form($form_id){

	ob_start();

	echo do_shortcode('[gravityform id="'.$form_id.'" ajax=true]');

	$r = array(
		'print'			=> ob_get_clean(),
	);

	echo json_encode($r);

	wp_die();

}





$func_n = "efiber_haal_zakelijk_formulier";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );



function efiber_haal_zakelijk_formulier() {

	ob_start();

	echo do_shortcode('[gravityform id="2" ajax=true]');

	$gf = ob_get_clean();

	$print .= $gf;

	$r = array(
		'print'			=> $print,
		//'console'		=> $_POST
	);

	echo json_encode($r);

	wp_die();
}

$func_n = "efiber_haal_lead_formulier";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );


function efiber_haal_lead_formulier() {

	ob_start();

	echo do_shortcode('[gravityform id="3" ajax=true]');

	$gf = ob_get_clean();

	$print .= $gf;

	$r = array(
		'print'			=> $print,
	);

	echo json_encode($r);

	wp_die();
}