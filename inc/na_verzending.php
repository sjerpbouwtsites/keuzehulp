<?php

if ( ! defined( 'WPINC' ) ) {
	die;
}
/*
function keuzehulp_registreer_export_test(){
    add_menu_page( 'Kz keuzehulp', 'export', 'manage_options', 'kz-export-test', 'print_keuzehulp_export_test' );
}

add_action('admin_menu', 'keuzehulp_registreer_export_test');


function print_keuzehulp_export_test() {?>
	
<div class="wrap">

	<h1>Kz export test</h1>

	<?php 

	$aanmelding_naw = array(
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 
	19, 20, '5386GG', '1', '', '', 25, 26, 27, 28, 29
	);

	echo keuzehulp_registreer_postcode_aanvraag ($aanmelding_naw)

	?>

</div>

<?php }
*/



add_action( 'gform_after_submission_1', 'keuzehulp_registreer_postcode_aanvraag', 10, 2 );

function keuzehulp_registreer_postcode_aanvraag ($entry){


	$aanmelding_data = array(
		'huisnummer'=> trim($entry[21]),
		'toevoeging'=> trim($entry[22]),
		'kamer'		=> trim($entry[23]),
		'postcode'	=> trim($entry[20]),
		'provider'	=> trim($entry[64]),
	);

	$con = getdb();

	$sql = "UPDATE postcodes SET `aanvraag_gedaan` = '1', `provider` = '{$aanmelding_data['provider']}' WHERE `postcode` = '{$aanmelding_data['postcode']}' AND `huisnummer` = '{$aanmelding_data['huisnummer']}' AND `toevoeging` = '{$aanmelding_data['toevoeging']}' AND `kamer` = '{$aanmelding_data['kamer']}'";

	$result = mysqli_query($con, $sql);

/*	if(!isset($result)) {

		$mail = 'miskleun';

	}  else {

		ob_start();

		$sql = "SELECT * FROM postcodes WHERE `postcode` = '{$aanmelding_naw['postcode']}' AND `huisnummer` = '{$aanmelding_naw['huisnummer']}' AND `toevoeging` = '{$aanmelding_naw['toevoeging']}' AND `kamer` = '{$aanmelding_naw['kamer']}'";

		$result = mysqli_query($con, $sql);		


		if ($result->num_rows == 0) {
			echo "NIETS GEVONDEN.";

			echo "<pre>";
			var_dump($aanmelding_naw);
			echo "</pre>";

		}


		echo "<table>";

		while($row = mysqli_fetch_assoc($result)) :

 		echo "<tr>
    			<th>".$row['postcode']."</th>
                <th>".$row['huisnummer']."</th>
                <th>".$row['toevoeging']."</th>
                <th>".$row['kamer']."</th>
                <th>".$row['straatnaam']."</th>
                <th>".$row['plaatsnaam']."</th>
                <th>".$row['gemeentenaam']."</th>
                <th>".$row['gebiedscode']."</th>
                <th>".$row['aanvraag_gedaan']."</th>
            </tr>";   

		endwhile;


		echo "</table>";

		return ob_get_clean();

	}*/

} 

