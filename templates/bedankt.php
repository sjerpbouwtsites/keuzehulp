<?php

/* template name: bedankt */

$provider = $_GET['prov'];
$afb_pad = plugins_url( '../iconen-nieuw/png-rekam/', __FILE__ );
require 'header.php';

?>

<div class='keuzehulp'><div class='verpakking'>

	<?php

		$postcode_sectie = new KzSectie(array(

			'stap'			=> 1,
			'titel'			=> '',
			'torso_intro'	=> "<div class='flex-links'><h2>Bedankt voor uw bestelling</h2>".apply_filters('the_content', str_replace("%%naam provider%%",$provider,$post->post_content))."</div>",
			'torso_direct'	=> 	"",
		));


		$postcode_sectie->print();

		/////////////////////////////////////////////////


	?>

</div></div><!-- verpakkign en keuzehulp -->
<style>
	body {
		background: linear-gradient(.25turn, #269d38 0%, #269d38 40%, #bfd24d 100%);
	}
	.app-header {
		background-color: white;
	}
</style>
<script>
	document.body.classList.add('keuzehulp');
</script>

<?php require 'footer.php'; ?>

