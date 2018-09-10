<?php
	
?>

<header class='app-header'>

	<div class='header-links'>
		<?=wp_get_attachment_image(get_field('logo', 'option'), 'full')?>
	</div>

	<div class='header-midden'>
		<ol class='stappen-visualisatie'>
			<li class='stappen-visualisatie_stap'>
				<img src='/wp-content/plugins/efiber/iconen-nieuw/svg/stap 1.svg' data-alt-src='/wp-content/plugins/efiber/iconen-nieuw/png/klaar.png' alt='stap 1' width='25' height='25' />
				<span class='stappen-visualisatie_tekst'>Samenstellen</span>
			</li>
			<li class='stappen-visualisatie_stap'>
				<img src='/wp-content/plugins/efiber/iconen-nieuw/svg/stap 2.svg' data-alt-src='/wp-content/plugins/efiber/iconen-nieuw/png/klaar.png' alt='stap 2' width='25' height='25' />
				<span class='stappen-visualisatie_tekst'>Vergelijken</span>
			</li>
			<li class='stappen-visualisatie_stap'>
				<img src='/wp-content/plugins/efiber/iconen-nieuw/svg/stap 3.svg' data-alt-src='/wp-content/plugins/efiber/iconen-nieuw/png/klaar.png' alt='stap 3' width='25' height='25' />
				<span class='stappen-visualisatie_tekst'>Bestellen</span>
			</li>
		</ol>
	</div>

	<div class='header-rechts'>
		<a href='mailto:<?=get_field('telefoonnummer', 'option')?>'>
				<img src='/wp-content/plugins/efiber/iconen-nieuw/svg/bellen.svg' alt='bel efiber' width='25' height='25' />
		</a>
	</div>

</header>