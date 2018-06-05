<?php

$console_lijst = array();

function console($a = '', $push_sleutel = false) {

	if(!WP_DEBUG) return;

	global $console_lijst;

	if (!$push_sleutel) {
		$console_lijst[] = $a;
	} else {
		if (!(array_key_exists($push_sleutel, $console_lijst) and is_array($console_lijst[$push_sleutel]))) {
			$console_lijst[$push_sleutel] = array();
		} 
		$console_lijst[$push_sleutel][] = $a;
	}
	

}

if (WP_DEBUG) {

	function print_console_voorraad() {

		global $console_lijst;

		$print_nummers = array();
		$print_strings = array();
		$print_arrays = array();
		$print_objecten = array();

		if ($console_lijst) : 

			foreach ($console_lijst as $cl) :

				if (is_string($cl)) {
					$print_strings[] = $cl;
				} else if (is_numeric($cl)) {
					$print_nummers[] = $cl;
				} else if (is_array($cl)) {
					$print_arrays[] = $cl;
				} else if (is_object($cl)) {
					$print_objecten[] = $cl;
				}

			endforeach;

			$print = array_merge($print_nummers, $print_strings, $print_arrays, $print_objecten);

			foreach ($print as $cl) {
				echo "<script>console.dir(".json_encode($cl).");</script>";
			}

		endif;
	}

	add_action('wp_footer', 'print_console_voorraad');
}
