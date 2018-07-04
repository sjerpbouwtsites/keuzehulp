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

 
if(isset($_POST["csv_import"])){
	
	if( array_key_exists('efiber_insert', $_POST) ){
		$notificatie = efiber_insert();
	} else if (array_key_exists('efiber_delete', $_POST) ) {
		$notificatie = efiber_delete();
	}

} else {
	//niets geimporteerd
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

			$postcode_cols = "postcode, huisnummer, toevoeging, kamer, straatnaam, plaatsnaam, gemeentenaam, gebiedscode, aanvraag_gedaan";
			$waardes = 
				 addslashes($getData[0])."','".
				 addslashes($getData[1])."','".
				 addslashes($getData[2])."','".
				 addslashes($getData[3])."','".
				 addslashes($getData[4])."','".
				 addslashes($getData[5])."','".
				 addslashes($getData[6])."','".
				 addslashes($getData[7])."','".
				 "0";

		   $sql = "INSERT into postcodes ($postcode_cols) 
		       values ('$waardes')";

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

function efiber_delete() {

	global $notificatie;

	$filename=$_FILES["csv"]["tmp_name"];		

	if($_FILES["csv"]["size"] > 0) :

		$file = fopen($filename, "r");

		$eerste_geweest = false;

		$con = getdb();

		$notificatie = array(
			'status' => 'success',
			'tekst' => 'Verwijdering gelukt :)',
		);

		while (($getData = fgetcsv($file, 10000, ";")) !== FALSE) :

			if (!$eerste_geweest) {
				$eerste_geweest = true;
				continue;
			}

			if (!$getData[0]) { //leeg
				continue;
			}

			$sql = "DELETE FROM postcodes
			WHERE postcode='{$getData[0]}' 
			AND huisnummer='{$getData[1]}'
			AND toevoeging='{$getData[2]}'
			AND kamer='{$getData[3]}'
			";

			$result = mysqli_query($con, $sql);

			if(!isset($result)) {

				$notificatie = array(
					'status' => 'error',
					'tekst' => 'Query mislukt',
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


/*function get_all_records(){
    $con = getdb();
    $Sql = "SELECT * FROM postcodes";
    $result = mysqli_query($con, $Sql);  
 
    $teller = 0;

    if ($result and (mysqli_num_rows($result) > 0) ) : ?>
    	<div class='table-responsive'>
    		<table id='myTable' class='table table-striped table-bordered'>
            	<thead>
            		<tr>
            			<th>postcode</th>
                        <th>huisnummer</th>
                        <th>toevoeging</th>
                        <th>kamer</th>
                        <th>straatnaam</th>
                        <th>plaatsnaam</th>
                        <th>gemeentenaam</th>
                        <th>gebiedscode</th>
                    </tr>
                </thead>
            <tbody>
    <?php while($row = mysqli_fetch_assoc($result) and $teller < 51) :
 
 		echo "<tr>
    			<th>".$row['postcode']."</th>
                <th>".$row['huisnummer']."</th>
                <th>".$row['toevoeging']."</th>
                <th>".$row['kamer']."</th>
                <th>".$row['straatnaam']."</th>
                <th>".$row['plaatsnaam']."</th>
                <th>".$row['gemeentenaam']."</th>
                <th>".$row['gebiedscode']."</th>
            </tr>";        
        $teller++;
    endwhile;
    
    	echo "</tbody></table></div>";
     
	else :
    	echo "Geen adressen opgeslagen!";
	endif; //als adressen
}*/
 
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


	><form class="form-table efiber-delete" action="#" method="post" name="upload_excel" enctype="multipart/form-data">
		<input type='hidden' name='efiber_delete'>
	    <?php csv_fieldset_print('Verwijder adressen'); ?>
	</form>

	<?php //get_all_records(); ?>

</div>
