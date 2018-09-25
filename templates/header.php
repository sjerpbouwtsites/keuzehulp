<header class='app-header'>
	<div class='verpakking'>
		<div class='header-links-midden'>
			<div class='header-links'>
				<a href='<?php echo site_url()?>/keuzehulp'>
					<?=wp_get_attachment_image(get_field('logo', 'option'), 'full')?>
				</a>
			</div>
			<div class='header-midden'>
				<ol class='stappen-visualisatie'>
					<li class='stappen-visualisatie_stap'>
						<span class='stappen-visualisatie_afb'></span>
						<span class='stappen-visualisatie_tekst vanaf-900-px'>Samenstellen</span>
					</li>
					<li class='stappen-visualisatie_stap'>
						<span class='stappen-visualisatie_afb'></span>
						<span class='stappen-visualisatie_tekst vanaf-900-px'>Vergelijken</span>
					</li>
					<li class='stappen-visualisatie_stap'>
						<span class='stappen-visualisatie_afb'></span>
						<span class='stappen-visualisatie_tekst vanaf-900-px'>Bestellen</span>
					</li>
				</ol>
			</div>			
		</div>

		<div class='header-rechts'>
			<span class='vanaf-600-px voor-telefoon'>Heb je een vraag? Neem contact op of bel</span>
			<a href='<?=get_field('contactpagina', 'option')?>' target="_blank">
				<span>
					<?php require plugin_dir_path(__FILE__)."../iconen-nieuw/svg/operator.svg"; ?>
				</span>
			</a>
		</div>
	</div>
</header>