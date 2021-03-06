<?php
	$info = plugin_dir_path(__FILE__)."../iconen-nieuw/svg/info.svg";
	$klaar = plugin_dir_path(__FILE__)."../iconen-nieuw/svg/check.svg";
?>
<aside class='keuze-menu-lijst' id='keuze-menu-lijst'>
	<div class='keuze-menu-lijst_binnen'>
		<header>
			<h2>
				<?php require plugin_dir_path(__FILE__)."../iconen-nieuw/svg/keuzes.svg"; ?>
				<span>Uw keuzes</span>
			</h2>
			<a href='#' class='knop keuze-menu-lijst-knop' data-kz-func='schakel' data-doel='#keuze-menu-lijst'>
				<span class='keuze-menu-lijst-knop_tekst'>Wijzigen</span>
				<span class='keuze-menu-lijst-knop_alt-tekst'>Sluiten</span>
				<span class='keuze-menu-lijst-knop_afb'>
					<?php require plugin_dir_path(__FILE__)."../iconen-nieuw/svg/wijzigen.svg"; ?>
				</span>
			</a>
		</header>
		<nav class='stappen-links'>
			<ul>
				<li class='stappen-links_stap stappen-links-3'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-3'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Gezinssituatie</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-4'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-4'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Klein zakelijk</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-5'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-5'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Internetgebruik</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-6'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-6'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Bellen</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-7'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-7'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Nummers</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-8'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-8'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Televisie</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-9'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-9'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Extra televisie opties</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
				<li class='stappen-links_stap stappen-links-11'>
					<a href='#' class='knop invalide' data-kz-func='stappen-nav' id='stappen-links-11'>
						<span class='stappen-links_niet-klaar'>
							<?php require $info; ?>
						</span>
						<span class='stappen-links_klaar'>
							<?php require $klaar; ?>
						</span>
						<span class='stappen-links_tekst stappen-links_originele-tekst'>Installatie</span>
						<span class='stappen-links_tekst stappen-links_vervangende-tekst'></span>
					</a>
				</li>
			</ul>
		</nav>
	</div>
</aside>