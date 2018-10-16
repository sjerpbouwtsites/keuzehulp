<?php
echo "<style>";
include_once plugin_dir_path( __FILE__ ) . "../css/kz-admin.css" ;
echo "</style>";

set_time_limit(6000);

$notificatie = array(
	'status' => false,
	'tekst' => '',
);
 
if( array_key_exists('keuzehulp_insert', $_POST) ){
	$notificatie = keuzehulp_insert();
} else if (array_key_exists('keuzehulp_delete_gebiedscode', $_POST) ) {
	$notificatie = keuzehulp_delete($_POST['keuzehulp_delete_gebiedscode']);
}

function kz_naar_statuscode($rekam_code = '') {

	$r = null;

	switch ($rekam_code) {
		case 'O':
			$r = 5;
			break;
		case 'P':
			$r = 5;
			break;		
		case 'C':
			$r = 1;
			break;			
		default:
			$r = 0;
			break;
	}

	return $r;
}

function kz_tekens_toegelaten($s) {
	return preg_replace('/[^\w-]/', '', $s);
}


function kz_pc_naar_gc($pc){

	$ss = (int) substr($pc, 0, 4);

	if ($ss > 2800 && $ss < 2810) {
		return "gouda";
	} else {
		return "buiten-gouda";
	}

	
}


function keuzehulp_insert() {

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

		$notificatie_tekst = '';

		$ging_goed = 0;
		$ging_verkeerd = 0;

		while (($getData = fgetcsv($file, 10000, ";")) !== FALSE) :

			if (!$eerste_geweest) {
				$eerste_geweest = true;
				continue;
			}

			if (!$getData[0]) { //leeg
				continue;
			}

			$postcode_cols = "perceelcode, postcode, huisnummer, toevoeging, kamer, straatnaam, plaatsnaam, gemeentenaam, gebiedscode, aanvraag_gedaan, provider, status";
			$waardes = 
				 "'".kz_tekens_toegelaten(addslashes($getData[0]))."','". //perceelcode
				 kz_tekens_toegelaten(addslashes($getData[4]))."','".		//postcode
				 kz_tekens_toegelaten(addslashes($getData[2]))."','".		//huisnummer
				 kz_tekens_toegelaten(addslashes($getData[3]))."','".		//toevoeging
				 ""."','".							//kamer		
				 kz_tekens_toegelaten(addslashes($getData[1]))."','".		//straatnaam
				 kz_tekens_toegelaten(addslashes($getData[5]))."','".		//plaatsnaam
				 kz_tekens_toegelaten(addslashes($getData[5]))."','".		//gemeentenaam
				 kz_tekens_toegelaten(kz_pc_naar_gc(addslashes($getData[6])))."','".						//gebiedscode
				 "0"."','".							//aanvraag_gedaan
				 "0','".							//provider
				  kz_tekens_toegelaten(kz_naar_statuscode(addslashes($getData[6])))."'";		//status



		    $sql = "INSERT into postcodes ($postcode_cols) 
		       values ($waardes)";

		    $result = mysqli_query($con, $sql);

			if(!isset($result)) {
				$ging_verkeerd++;
			} else {
				$ging_goed++;
			}

		endwhile; //while getdata

		fclose($file);	
	else : 
		$notificatie = array(
			'status' => 'error',
			'tekst' => 'Vergeet niet de CSV te uploaden',
		);
	endif; //if files csv size	

		$notificatie = array(
			'status' => 'melding',
			'tekst' => "Ging $ging_goed keer goed en $ging_verkeerd keer verkeerd",
		);

	return $notificatie;
}

function keuzehulp_delete($gebiedscode) {

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
			'tekst' => "gebiedscode $gebiedscode succesvol verwijderd. SQL: $sql",
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

	<h1>Kz postcode naar database</h1>

	<form class="form-table kz-insert" action="#" method="post" name="upload_excel" enctype="multipart/form-data">

		<input type='hidden' name='keuzehulp_insert'>

		<?php csv_fieldset_print('Importeer adressen'); ?>

	</form


	>

	<hr>

	<form class="form-table kz-delete" action="#" method="post"">

		<h2>Verwijder per gebiedscode zonder die met abo</h2>
	    
		<select name='keuzehulp_delete_gebiedscode'>
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
