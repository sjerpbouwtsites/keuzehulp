<div class="kz-navigatie-beneden kz-navigatie-beneden_buiten">
	<div class="kz-navigatie-beneden_binnen">
		<a data-efiber-func="toon-stap" data-keuzehulp-stap="7" class="knop kz-navigatie-beneden_knop blauwe-knop" href="#8">
			<span>Verder naar televisie</span>
		</a>
		<a data-efiber-func="toon-stap" data-keuzehulp-stap="9" class="knop kz-navigatie-beneden_knop blauwe-knop" href="#11">
			<span>Verder naar installatie</span>
		</a>
		<a data-efiber-func="stap-terug" class="knop efiber-stap-terug kz-navigatie-beneden_knop" href="#">
			<?php require plugin_dir_path(__FILE__)."../iconen-nieuw/svg/terug.svg"; ?>
			<span>stap terug</span>
		</a>
	</div>
</div>


<?php
/*
	$terug = new Ef_knop(array(
		'class'		=> 'efiber-stap-terug efiber-navigatie',
		'tekst'		=> 'stap terug',
		'func'		=> 'stap-terug',
		'ikoon'		=> require 
	));

	echo "<div class='efiber-navigatie-buiten'><div class='efiber-navigatie-binnen'>";
	$terug->print();

	$knop->class = '';
	$knop->link = '#8';
	$knop->func = 'toon-stap';
	$knop->tekst = 'verder';
	$knop->attr = "data-keuzehulp-stap='7'";
	$knop->geen_ikoon = true;
	$knop->ikoon = '';
	$knop->print();

	$knop->class = '';
	$knop->tekst = 'verder';
	$knop->attr = "data-keuzehulp-stap='9'";
	$knop->link = '#11';
	$knop->func = 'toon-stap';
	$knop->ikoon = '';
	$knop->geen_ikoon = true;
	$knop->print();

	echo "</div></div>";*/