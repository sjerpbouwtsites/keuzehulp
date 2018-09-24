</main>
<?php

	$modal_teksten = get_field('modalteksten', 'option');

	echo "<script>
		const kzModalTeksten = ".json_encode($modal_teksten).";
		const kzUser = ".json_encode(wp_get_current_user()).";
	</script>";



	wp_footer();
	echo "</body></html>";
	die(); //voorkomt laden thema footer
?>