<?php

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