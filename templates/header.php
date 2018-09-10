<header class='app-header'>
	<div class='verpakking'>
		<div class='header-links'>
			<?=wp_get_attachment_image(get_field('logo', 'option'), 'full')?>
		</div>

		<div class='header-midden'>
			<ol class='stappen-visualisatie'>
				<li class='stappen-visualisatie_stap'>
					<span class='stappen-visualisatie_afb'></span>
					<span class='stappen-visualisatie_tekst'>Samenstellen</span>
				</li>
				<li class='stappen-visualisatie_stap'>
					<span class='stappen-visualisatie_afb'></span>
					<span class='stappen-visualisatie_tekst'>Vergelijken</span>
				</li>
				<li class='stappen-visualisatie_stap'>
					<span class='stappen-visualisatie_afb'></span>
					<span class='stappen-visualisatie_tekst'>Bestellen</span>
				</li>
			</ol>
		</div>

		<div class='header-rechts'>
			<a href='<?=get_field('contactpagina', 'option')?>'>
				<img src='/wp-content/plugins/efiber/iconen-nieuw/svg/bellen.svg' alt='neem contact op' width='25' height='25' />
			</a>
		</div>
	</div>
</header>