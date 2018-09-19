</main>
<?php 

	$modal_teksten = get_field('modalteksten', 'option');

	echo "<script>
		const kzModalTeksten = ".json_encode($modal_teksten).";
	</script>";

	wp_footer();
	echo "</body></html>";
	die(); //voorkomt laden thema footer
?>