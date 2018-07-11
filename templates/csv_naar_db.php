<?php
echo "<style>";
include_once plugin_dir_path( __FILE__ ) . "../css/efiber-admin.css" ;
echo "</style>";
// https://www.cloudways.com/blog/import-export-csv-using-php-and-mysql/

set_time_limit(6000);

$notificatie = array(
	'status' => false,
	'tekst' => '',
);
 
if( array_key_exists('efiber_insert', $_POST) ){
	$notificatie = efiber_insert();
} else if (array_key_exists('efiber_delete_gebiedscode', $_POST) ) {
	$notificatie = efiber_delete($_POST['efiber_delete_gebiedscode']);
}



function efiber_insert() {

	global $notificatie;


	$filename=$_FILES["csv"]["tmp_name"];		

	if($_FILES["csv"]["size"] > 0) :

		$file = fopen($filename, "r");

		$eerste_geweest = false;

		$con = getdb();
 
		$notificatie = array(
			'status' => 'success',
			'tekst' => 'Succes :)',
		);

		while (($getData = fgetcsv($file, 10000, ";")) !== FALSE) :

			if (!$eerste_geweest) {
				$eerste_geweest = true;
				continue;
			}

			if (!$getData[0]) { //leeg
				continue;
			}

			$postcode_cols = "postcode, huisnummer, toevoeging, kamer, straatnaam, plaatsnaam, gemeentenaam, gebiedscode, aanvraag_gedaan, provider";
			$waardes = 
				 "'".addslashes($getData[0])."','".
				 addslashes($getData[1])."','".
				 addslashes($getData[2])."','".
				 addslashes($getData[3])."','".
				 addslashes($getData[4])."','".
				 addslashes($getData[5])."','".
				 addslashes($getData[6])."','".
				 addslashes($getData[7])."','".
				 "0', ''";

		   $sql = "INSERT into postcodes ($postcode_cols) 
		       values ($waardes)";

		       $result = mysqli_query($con, $sql);

			if(!isset($result)) {

				$notificatie = array(
					'status' => 'error',
					'tekst' => 'Sql error.',
				);

			} 

		endwhile; //while getdata

		fclose($file);	
	else : 
		$notificatie = array(
			'status' => 'error',
			'tekst' => 'Vergeet niet de CSV te uploaden',
		);
	endif; //if files csv size	

	return $notificatie;
}

function efiber_delete($gebiedscode) {

	if (!$gebiedscode) {
		return array(
			'status' => "error",
			'tekst' => "Geen gebiedscode doorgekregen",
		);		
	}

	global $notificatie;

	$con = getdb();
	$sql = "DELETE FROM postcodes WHERE `gebiedscode` = '$gebiedscode' AND `aanvraag_gedaan` = '0'";
	$result = mysqli_query($con, $sql);

	if ($result) :
		$notificatie = array(
			'status' => "success",
			'tekst' => "gebiedscode $gebeidscode succesvol verwijderd. SQL: $sql",
		);		
	else : 
		$notificatie = array(
			'status' => 'error',
			'tekst' => 'Er ging iets bruut mis.',
		);
	endif; //if files csv size	

	return $notificatie;
}

?>


<?php 

function csv_fieldset_print($str) { ?>
    <fieldset>
        
        <legend><?=$str?></legend>

        <table class='form-table '>
        	<tbody>

        		<tr>
        			<th scope='row'>
        				<label class="" for="upload_csv">Selecteer je excel bestand.</label>
        			</th>
        			<td>
        				<input id='upload_csv' type="file" name="csv" id="csv">
        			</td>
		        </tr>

        		<tr>
        			<th scope='row'>
        				<label class="" for="verstuur_csv">Klik om te versturen</label>
        			</th>
        			<td>
        				<button type="submit" id="verstuur_csv" name="csv_import" class="button button-primary" data-loading-text="Loading...">Verstuur</button>
        			</td>
		        </tr>

		    </tbody>
	    </table>
    </fieldset>	
<?php }

?>

<div class='wrap'>

	<?php if ($notificatie['status']) : ?>
	<div class="notice notice-<?=$notificatie['status']?> is-dismissible">
        <p><?=$notificatie['tekst']?></p>
    <button type="button" class="notice-dismiss"><span class="screen-reader-text">Dit bericht verbergen.</span></button></div>
	<?php endif; 
	?>

	<h1>Efiber postcode naar database</h1>

	<form class="form-table efiber-insert" action="#" method="post" name="upload_excel" enctype="multipart/form-data">

		<input type='hidden' name='efiber_insert'>

		<?php csv_fieldset_print('Importeer adressen'); ?>

	</form


	>

	<hr>

	<form class="form-table efiber-delete" action="#" method="post"">

		<h2>Verwijder per gebiedscode zonder die met abo</h2>
	    
		<select name='efiber_delete_gebiedscode'>
			<option>Kies</option>
			<?php $con = getdb();

	    		$Sql = "SELECT gebiedscode FROM postcodes GROUP BY (gebiedscode)";
	    		$result = mysqli_query($con, $Sql);  

			    while ($rij = mysqli_fetch_assoc($result)) {
			        echo "<option value='{$rij['gebiedscode']}'>{$rij['gebiedscode']}</option>";
			    }


			?>			
		</select>

		<button type="submit" id="verstuur_delete" class="button button-primary" >Verstuur</button>

	</form>

	<?php //get_all_records(); ?>

</div>
