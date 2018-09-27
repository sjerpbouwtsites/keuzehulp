<?php


if (count($argv) < 2) {
	die("argumenten vereist: bestandsnaam en toevoeging");
}

$file = fopen("rauw/".$argv[1], 'r');

if ($file) {
	bewerk_bestand($file, $argv);
} else {
	echo "ERROR ";
	var_dump($argv[1]);
	die();
}


function bewerk_bestand($csv, $argumenten) {

	$bestandsnaam = $argumenten[1];

	$zonder_witregels = [];

	//witregels weg.
	while (($kolommen = fgetcsv($csv, 10000, ";")) !== FALSE) :
		if ($kolommen and count($kolommen)) {
			$zonder_witregels[] = $kolommen;
		}
	endwhile;

	// eerste rij met koppen weg.
	array_shift($zonder_witregels);

	// toevoegingen && "" eraf
	$met_toevoeging = array_map(function ($zonder_witregel) use ($argumenten) { 
		$zonder_witregel[] = $argumenten[2];
		return  str_replace('"', "", $zonder_witregel); 
	}, $zonder_witregels);

	// open uitvoer bestand
	$uitvoer_bestand = fopen("bewerkt/$bestandsnaam", 'w');
	 
	// koppen
	fputcsv($uitvoer_bestand, array(
		"perceelcode",
		"postcode",
		"huisnummer",
		"toevoeging",
		"straatnaam",
		"plaatsnaam",
		"gemeentenaam",
		"status"
	));
	 

	 
	// save each row of the data
	foreach ($met_toevoeging as $rij)
	{
	fputcsv($uitvoer_bestand, $rij, ";");
	}
	 
	// Close the file
	fclose($uitvoer_bestand);

}
