<?php
		// GENERIEKE TERUG KNOP VOOR GEHELE APP ONGEACHT STAP

		$terug = new Ef_knop(array(
			'class'		=> 'efiber-stap-terug efiber-navigatie',
			'tekst'		=> 'stap terug',
			'func'		=> 'stap-terug',
			'geen_ikoon'=> true
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

		echo "</div></div>";