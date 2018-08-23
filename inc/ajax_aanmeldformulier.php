<?php


$func_n = "efiber_haal_aanmeldformulier";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );


function kz_heeft_optie($optie, $e){
	return array_key_exists($optie, $e['eenmalig']) || array_key_exists($optie, $e['maandelijks']);
}

function kz_optie_prijs ($optie, $e) {

	// WERKT ALLEEN ALS SLECHTS EENMALIG OF MAANDELIJKS

	return (array_key_exists($optie, $e['eenmalig']) ?
		(float) $e['eenmalig'][$optie]['prijs']
	:
		(float) $e['maandelijks'][$optie]['prijs']
	);
}

function kz_optie_kost_geld ($optie, $e) {
	return (	(kz_optie_prijs ($optie, $e)) !== 0	);
}

function kz_optie_aantal ($optie, $e) {

	return (array_key_exists($optie, $e['eenmalig']) ?
		(float) $e['eenmalig'][$optie]['aantal']
	:
		(float) $e['maandelijks'][$optie]['aantal']
	);
}

function kz_tv_pakketten($tv_pakket, $e, $s) {

	// geeft array terug van alle tv pakketten binnen die bundel, zoals alle plus pakket opties.

	$r = array();
	$s = (string) $s;
	foreach ($e['maandelijks'] as $naam => $v) {

		$expl = explode('-', $naam);

		//naam en snelheid komt overeen?
		if (strpos($naam, $tv_pakket) !== false && in_array($s, $expl)) {

			$sss = '';
			for ($i=1; $i < count($expl) -1; $i++) {
				$sss .= $expl[($i)] . " ";
			}

			$v['naam'] = trim($sss);
			$v['naam_volledig'] = $naam;
			$r[] = $v;
		}
	}
	return $r;
}

function efiber_haal_aanmeldformulier() {


	/*---------------------------------------------------------
	|
	| 	LEZEN vanaf afgeleide objecten
	| 	SCHRIJVEN direct naar pakket object
	|
	-----------------------------------------------------------*/

	// efiber_input gaat er van uit dat de SVGs een klasse hebben
	{
		$svgs = "
		<svg data-name='svg-ja' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122 51'><defs><style>.cls-1-1{fill:#921c80;}.cls-2-1{fill:#e6007e;}.cls-3-1{fill:#fff;}</style></defs><title>Knopjes</title><rect class='cls-1-1' x='0.46' y='0.64' width='120.54' height='49.14' rx='24.57' ry='24.57'/><circle class='cls-2-1' cx='96.47' cy='25.21' r='19.35'/><path class='cls-3-1' d='M33.05,28a10.85,10.85,0,0,1-.32,2.67,5.19,5.19,0,0,1-3.26,3.67,9.29,9.29,0,0,1-3.42.54,10.17,10.17,0,0,1-3.26-.46,9.08,9.08,0,0,1-2.25-1.07L22,30a13,13,0,0,0,1.72.83,5.32,5.32,0,0,0,2,.37A2.91,2.91,0,0,0,28,30.37a3.9,3.9,0,0,0,.7-2.62V15.16h4.35Z'/><path class='cls-3-1' d='M42.21,19.42a9.49,9.49,0,0,1,3.06.42,4.75,4.75,0,0,1,2,1.19,4.41,4.41,0,0,1,1,1.9,9.1,9.1,0,0,1,.31,2.48V34c-.6.13-1.42.29-2.48.46a23.35,23.35,0,0,1-3.84.27,12.69,12.69,0,0,1-2.58-.25,5.43,5.43,0,0,1-2-.83,3.63,3.63,0,0,1-1.28-1.49A5.07,5.07,0,0,1,36,30a4.18,4.18,0,0,1,.52-2.17,4,4,0,0,1,1.37-1.43,6.43,6.43,0,0,1,2-.76,11,11,0,0,1,2.31-.24c.54,0,1,0,1.44.07a7.44,7.44,0,0,1,1,.18v-.39a2.34,2.34,0,0,0-.64-1.7,3.14,3.14,0,0,0-2.23-.64,13.1,13.1,0,0,0-2.09.16,8.71,8.71,0,0,0-1.79.43l-.52-3.34a9.28,9.28,0,0,1,.9-.24,11.86,11.86,0,0,1,1.18-.22c.43-.07.88-.13,1.36-.17A13.56,13.56,0,0,1,42.21,19.42Zm.33,12.14,1.17,0a7.72,7.72,0,0,0,.9-.09V28.3l-.76-.11c-.33,0-.64-.05-.92-.05a7.73,7.73,0,0,0-1.1.07,2.71,2.71,0,0,0-.9.26,1.51,1.51,0,0,0-.61.53,1.46,1.46,0,0,0-.23.84,1.42,1.42,0,0,0,.66,1.35A3.59,3.59,0,0,0,42.54,31.56Z'/></svg>
		<svg
			data-name='svg-nee'
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 122 51'>
			<defs>
				<style>.cls-1{fill:#8567a8;opacity:0.36;}.cls-2{fill:#fff;}</style>
			</defs>
			<title>Knopjes</title>
			<rect class='cls-1' x='0.46' y='0.64' width='120.54' height='49.14' rx='24.57' ry='24.57' transform='translate(121.46 50.42) rotate(-180)'/>
			<circle class='cls-2' cx='24.99' cy='25.21' r='19.35'/>
			<path class='cls-2' d='M69.44,34.46q-1.86-3.32-4-6.55a69.18,69.18,0,0,0-4.62-6.1V34.46H56.49V15.16H60c.61.61,1.29,1.36,2,2.25s1.5,1.85,2.27,2.86,1.54,2.06,2.3,3.15,1.47,2.13,2.14,3.13V15.16h4.32v19.3Z'/>
			<path class='cls-2' d='M76.57,27.25a9,9,0,0,1,.6-3.42,7.2,7.2,0,0,1,1.58-2.43A6.35,6.35,0,0,1,81,19.92a7.07,7.07,0,0,1,2.6-.5,6.47,6.47,0,0,1,4.93,1.91,7.84,7.84,0,0,1,1.81,5.61c0,.24,0,.51,0,.79s0,.55,0,.77H80.83a2.8,2.8,0,0,0,1.2,2,4.83,4.83,0,0,0,2.84.76,12.08,12.08,0,0,0,2.25-.21,8.08,8.08,0,0,0,1.79-.52l.56,3.37a6.77,6.77,0,0,1-.89.34,11.39,11.39,0,0,1-1.24.29c-.46.08-.94.15-1.46.21s-1,.08-1.56.08a9.21,9.21,0,0,1-3.44-.58,6.67,6.67,0,0,1-2.43-1.61A6.34,6.34,0,0,1,77,30.25,9.67,9.67,0,0,1,76.57,27.25Zm9.75-1.59a4.45,4.45,0,0,0-.18-1,2.47,2.47,0,0,0-1.28-1.53,2.61,2.61,0,0,0-1.21-.26,2.73,2.73,0,0,0-1.2.24,2.65,2.65,0,0,0-.84.63,2.84,2.84,0,0,0-.51.9,6.75,6.75,0,0,0-.27,1.05Z'/><path class='cls-2' d='M92.84,27.25a9,9,0,0,1,.6-3.42A7.34,7.34,0,0,1,95,21.4a6.48,6.48,0,0,1,2.25-1.48,7.07,7.07,0,0,1,2.6-.5,6.48,6.48,0,0,1,4.93,1.91,7.84,7.84,0,0,1,1.81,5.61c0,.24,0,.51,0,.79s0,.55,0,.77H97.1a2.77,2.77,0,0,0,1.2,2,4.83,4.83,0,0,0,2.84.76,11.89,11.89,0,0,0,2.24-.21,8,8,0,0,0,1.8-.52l.56,3.37a6.77,6.77,0,0,1-.89.34,12,12,0,0,1-1.24.29q-.69.12-1.47.21c-.52,0-1,.08-1.56.08a9.29,9.29,0,0,1-3.44-.58,6.71,6.71,0,0,1-2.42-1.61,6.34,6.34,0,0,1-1.42-2.41A9.38,9.38,0,0,1,92.84,27.25Zm9.75-1.59a4.45,4.45,0,0,0-.18-1,2.47,2.47,0,0,0-1.28-1.53,2.61,2.61,0,0,0-1.21-.26,2.73,2.73,0,0,0-1.2.24,2.54,2.54,0,0,0-.84.63,2.84,2.84,0,0,0-.51.9,6.75,6.75,0,0,0-.27,1.05Z'/>
		</svg>";
	}
	// hierin wordt de HTML opgeslagen. Pas aan het eind printen want ajaxfunctie.
	$print = '';

	// console kan gebruikt worden om mee te geven aan de console key in de JSON.
	// De console key veroorzaakt een console.log
	$console = array();

	// verrijkte pakketobject afkomstig uit efiber_pakket_eigenschappen($p) + data afkomstig van vergelijker.
	$pakket = $_POST['pakket'];
	$eigenschappen = $pakket['eigenschappen'];
	$teksten = $eigenschappen['teksten'];

	// bevat gebiedscode, regio en adres.
	$adres = $_POST['adres'];

	// zie onder bij keuzecode voor voorbeeld. Sommige sleutels kunnen ontbreken omdat ze pas gecreeert worden als
	// een bijbehorende optie aangevinkt wordt.
	$keuzehulp = $_POST['keuzehulp'];

	$op_iwwiw = !!array_key_exists('ik-weet-wat-ik-wil', $keuzehulp);

	/*
		// voorbeeld
		$print .= efiber_form_sectie(
			'SECTIE TITEL',
			efiber_form_rij (
				RIJ VELD 1,
				RIJ VELD 2 - vaak input, kan ook tekst of afbeelding zijn
			)
		);
	*/

	// GAAT UIT VAN IWWIW

	$gekozen_snelheid = false;
	$snelheden_opts = '';
	foreach ($eigenschappen['snelheden'] as $s) {

		if (!$gekozen_snelheid) {
			if ($eigenschappen['maandelijks']['snelheid-'.$s]['aantal'] != 0) {
				$gekozen_snelheid = $s;
			}
		}

		$snelheden_opts .= "<option value='$s' ".($gekozen_snelheid == $s ? "selected" : "")." >$s Mb/s</option>";

	}

	$print .= efiber_form_sectie(
		'Samenvatting', // sectie titel
		efiber_form_rij (
			'', // rij zonder titel
			str_replace('\\', '', $eigenschappen['provider_meta']['thumb']) // post thumbnail - backslashes worden ergens door de ajax veroorzaakt ?
		) .

		efiber_form_rij (
			'Internet snelheid',
			"<select id='schakel-snelheid' name='internetsnelheid'>
				$snelheden_opts
			</select>"
		) .

		efiber_form_rij(
			'Pakket inhoud',
			(
				$op_iwwiw ?
					// maakt array en zoekt meteen waarde op.
					['Internet', 'Internet en bellen', 'Internet en TV', 'Alles in 1'][	(	(int) $keuzehulp['ik-weet-wat-ik-wil'] - 1 )	]
				:
					'niet op iwwiw?!:!'
			)
		) .

		efiber_form_rij(
			'Pakket prijs per maand',
			"<span class='maandelijks-totaal'></span>"
		) .

		efiber_form_rij(
			'Eenmalige prijs',
			"<span class='eenmalig-totaal'></span>"
		) .

		(
			(array_key_exists('usps', $teksten)	and $teksten['usps'] !== '') ?
				efiber_form_rij (
					'Bijzonderheden',
					$teksten['usps']

				)
			:
				""
		)

	);

	$print .=  "<p><strong>Jouw gekozen opties</strong></p>";


	if (in_array('Alles in 1', $eigenschappen['pakket_type']) || in_array('Internet en TV', $eigenschappen['pakket_type'])) :

		$tv = array(); // WEGHALEN UIT PHP

		$tv_inhoud .= efiber_form_rij (
			'TV interactief',
			$eigenschappen['tv_type'] === "ITV" ? "Ja" : "Nee"
		);

		if ( kz_heeft_optie('extra-tv-ontvangers', $eigenschappen) ) :

			$koos_extra_tv = !!kz_optie_aantal('extra-tv-ontvangers', $eigenschappen);

			$tv_inhoud .= efiber_form_rij (
				'Extra TV ontvangers',
				efiber_input (array(
					'naam'		=>	'extra-tv-ontvangers',
					'type'		=> "number",
					'value'		=> $koos_extra_tv ? "1" : "0", // als gekozen voor extra TV, initialiseer dan met waarde 1
					'func'		=> 'aanmelding-schakel',
					'waarde'	=> kz_optie_prijs('extra-tv-ontvangers', $eigenschappen)
				))
			);

		endif; // extra tv ontvanger


		////////////////////////////////////////////////
		////////////////////////////////////////////////


		if ($eigenschappen['tv_type'] === "ITV") :

			if ( kz_heeft_optie('opnemen_replay_begin_gemist_samen', $eigenschappen) ) :

				$tv_inhoud .= efiber_form_rij (
					'Opnemen, terugkijken, begin gemist',
					efiber_input (array(
						'naam'		=> 'opnemen_replay_begin_gemist_samen',
						'type'		=> "checkbox",
						'value'		=> kz_optie_aantal('opnemen_replay_begin_gemist_samen', $eigenschappen),
						'waarde'	=> kz_optie_prijs('opnemen_replay_begin_gemist_samen', $eigenschappen),
						'label'		=> $svgs
					))
				);

			else : // dus on demand niet samen

				if (kz_heeft_optie('opnemen', $eigenschappen)) :

					if (kz_optie_kost_geld('opnemen', $eigenschappen)) {
						$tv_inhoud .= efiber_form_rij (
							'Opnemen',
							efiber_input (array(
								'naam'		=> 'opnemen',
								'type'		=> "checkbox",
								'waarde'	=> kz_optie_prijs('opnemen', $eigenschappen),
								'value'		=> kz_optie_aantal('opnemen', $eigenschappen),
								'label'		=> $svgs
							))

						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= efiber_form_rij (
							'Opnemen',
							'Inclusief'
						);
					}

				endif; //opnemen beschikbaar

				if (kz_heeft_optie('replay', $eigenschappen)) :

					if (kz_optie_kost_geld('replay', $eigenschappen)) {
						$tv_inhoud .= efiber_form_rij (
							'Terugkijken',
							efiber_input (array(
								'naam'		=> 'replay',
								'type'		=> "checkbox",
								'waarde'	=> kz_optie_prijs('replay', $eigenschappen),
								'value'		=> kz_optie_aantal('replay', $eigenschappen),
								'label'		=> $svgs
							))

						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= efiber_form_rij (
							'Terugkijken',
							'Inclusief'
						);
					}

				endif; // replay beschikbaar

				if (kz_heeft_optie('begin_gemist', $eigenschappen)) :

					if (kz_optie_kost_geld('begin_gemist', $eigenschappen)) {
						$tv_inhoud .= efiber_form_rij (
							'Begin gemist',
							efiber_input (array(
								'naam'		=> 'begin gemist',
								'type'		=> "checkbox",
								'waarde'	=> kz_optie_prijs('begin_gemist', $eigenschappen),
								'value'		=> kz_optie_aantal('begin_gemist', $eigenschappen),
								'label'		=> $svgs
							))

						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= efiber_form_rij (
							'Begin gemist',
							'Inclusief'
						);
					}

				endif; // begin gemist beschikbaar

			endif; // on demand samen of niet

		endif; // is interactief


		////////////////////////////////////////////////
		////////////////////////////////////////////////


		if (kz_heeft_optie('app', $eigenschappen)) :

			if (kz_optie_kost_geld('app', $eigenschappen)) {
				$tv_inhoud .= efiber_form_rij (
					'App',
					efiber_input (array(
						'naam'		=>	'app',
						'type'		=> "checkbox",
						'waarde'	=> kz_optie_prijs('app', $eigenschappen),
						'value'		=> kz_optie_aantal('app', $eigenschappen),
						'label'		=> $svgs
					))
				);
			} else {
				$tv_inhoud .= efiber_form_rij (
					'App',
					'Inclusief'
				);
			}

		endif; // tv app beschikbaar


		$tv_pakket_namen = array('film1', 'plus', 'fox-sports-eredivisie', 'fox-sports-internationaal', 'fox-sports-compleet', 'ziggo-sport-totaal', 'erotiek');

		foreach ($tv_pakket_namen as $tv_pakket_naam) {

			$deze_pakketten = kz_tv_pakketten($tv_pakket_naam, $eigenschappen, $gekozen_snelheid);

			if (count($deze_pakketten) > 0) :
				foreach ($deze_pakketten as $dit_pakket) :

					if (kz_optie_kost_geld($dit_pakket['naam_volledig'], $eigenschappen)) {

						$tv_inhoud .= efiber_form_rij (
							ucfirst($dit_pakket['naam']),
							efiber_input (array(
								'naam'		=> $dit_pakket['naam_volledig'],
								'type'		=> "radio",
								'value'		=> $dit_pakket['aantal'],
								'waarde'	=> $dit_pakket['prijs'],
								'label'		=> $svgs,
								'eclass'	=> 'tv-pakket'
							))
						);

					} else { // gratis optie
						$tv_inhoud .= efiber_form_rij (
							$dit_pakket['naam'],
							'Inclusief'
						);
					}

				endforeach;
			endif; // film1 beschikbaar
		}


	endif; //heeft TV

	// zet de TV_inhoud in print
	if ($tv_inhoud && $tv_inhoud !== '') {
		$print .= efiber_form_sectie(
			'Televisie',
			$tv_inhoud
		);
	}



	// HTML houder
	$bel_inhoud = '';

	if (in_array('Alles in 1', $eigenschappen['pakket_type']) || in_array('Internet en bellen', $eigenschappen['pakket_type'])) :

		$belknoppen = '';

			foreach ($eigenschappen['telefonie_bundels'] as $tb_a) {

				foreach ($tb_a as $tb) {
					$n = slugify($tb['naam']);
					$belknoppen .= efiber_input (array(
						'naam'		=> 'belpakket-keuze-'.$tb['naam'],
						'type'		=> "radio",
						'value'		=> kz_optie_aantal($n, $eigenschappen),
						'waarde'	=> kz_optie_prijs($n, $eigenschappen),
						'eclass'	=> 'belpakket',
						'label'		=> "<span class='radio-naam'>".$tb['naam']."</span>" .  $svgs
					));
				}

			}

		// belknoppen naar bel inhoud HTML
		if ($belknoppen !== '') {
			$bel_inhoud .= efiber_form_rij (
				'Belpakketten',
				$belknoppen
			);

		}

		$bel_inhoud .= efiber_form_rij (
			"Nummerbehoud",
			efiber_input (array(
				'naam'		=> 'nummerbehoud',
				'type'		=> "checkbox",
				'func'		=> 'form-toon-rij',
				'value'		=> 0,
				'label'		=> $svgs
			))
		);

		$bel_inhoud .= efiber_form_rij (
			"Huidige nummer",
			efiber_input (array(
				'naam'		=> 'huidige_nummer',
				'type'		=> "text",
				'func'		=> '',
			)),
			'onzichtbaar' // wordt zichtbaar als geklikt op nummerbehoud
		);

		if (kz_heeft_optie('extra-vast-nummer', $eigenschappen)) :


			$bel_inhoud .= efiber_form_rij (
				"Extra vast nummer",
				efiber_input (array(
					'naam'		=> 'extra_vast_nummer',
					'type'		=> "checkbox",
					'func'		=> 'form-toon-rij',
					'value'		=> kz_optie_aantal('extra-vast-nummer', $eigenschappen),
					'waarde'	=> kz_optie_prijs('extra-vast-nummer', $eigenschappen),
					'label'		=> $svgs
				))
			);

			$bel_inhoud .= efiber_form_rij (
				"Nummerbehoud extra vast nummer",
				efiber_input (array(
					'naam'		=> 'nummerbehoud_extra_vast_nummer',
					'type'		=> "checkbox",
					'func'		=> 'form-toon-rij',
					'label'		=> $svgs
				)),
				($koos_extra_nummer ? '' : 'onzichtbaar') // wordt zichtbaar als geklikt op nummerbehoud
			);

			$bel_inhoud .= efiber_form_rij (
				"Huidige extra nummer",
					efiber_input (array(
						'naam'		=> 'huidige_extra_nummer',
						'type'		=> "text",
				)),
				'onzichtbaar' // wordt zichtbaar als extra nummer gekozen en nummerbehoud
			);

		endif; // extra tel mogelijk

		$bel_inhoud .= efiber_form_rij (
			"Inschrijving telefoonboek",
			efiber_input (array(
				'naam'		=> 'inschrijving_telefoonboek',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'value'		=> 0
			)),
			$eigenschappen['provider_meta']['inschrijving_telefoonboek_mogelijk'] !== 'false' ? '' : 'onzichtbaar' // alleen bepaalde providers bieden dit aan.
		);

	endif; // if telefonie


	// zet bel inhoud op print HTML
	if ($bel_inhoud && $bel_inhoud !== '') {
		$print .= efiber_form_sectie(
			'Bellen',
			$bel_inhoud
		);
	}



	// HTML houder
	$meta_inhoud = '';


	$installatie_namen = array("Doe het zelf", 'Basis installatie', 'Volledige installatie');
	$installatie_sleutels = array("dhz", 'basis', 'volledig');


	for ($i = 0; $i < count($installatie_namen); $i++) {

		if (kz_heeft_optie('installatie-'.$installatie_sleutels[($i)], $eigenschappen)) {

			$installatie_knoppen .=
			efiber_input (array(
				'naam'		=> 'installatie-keuze-'.$installatie_sleutels[($i)],
				'type'		=> "radio",
				'label'		=> "<span class='radio-naam'>".$installatie_namen[$i]."</span>" .  $svgs,
				'waarde'	=> kz_optie_prijs('installatie-'.$installatie_sleutels[($i)], $eigenschappen),
				'value'		=> kz_optie_aantal('installatie-'.$installatie_sleutels[($i)], $eigenschappen),
				'eclass'	=> 'installatie'
			));

		}

	}



	// zet installatieknoppen in meta inhoud HTML
	$meta_inhoud .= efiber_form_rij (
		'Installatie',
		$installatie_knoppen
	);




	// is bijvoorbeeld Netrebels TV optie
	if (kz_heeft_optie('extra_optie', $eigenschappen)) {

		$meta_inhoud .= efiber_form_rij (
			$eigenschappen['teksten']['extra_optie_naam'],
			efiber_input (array(
				'naam'		=> 'extra-optie',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'waarde'	=> kz_optie_prijs('extra_optie', $eigenschappen),
				'value'		=> kz_optie_aantal('extra_optie', $eigenschappen),
			))
		);

	}


	$meta_inhoud .= (
		efiber_form_rij (
			'Incl. wifi router',
			(($eigenschappen['provider_meta']['incl_wifi_router']) === "true" ? "Ja" : "Nee")
		) .
		"<br>" .
		efiber_form_rij (
			'Eenmalige kosten',
			"<span class='eenmalig-totaal'></span>"
		) .
		efiber_form_rij (
			'Waarvan borg',
			efiber_maak_geld_op($eigenschappen['eenmalig']['borg']['prijs'])
		) . ((float)$eigenschappen['eenmalig']['glasvezel_naar_huis']['prijs'] > 0.01
			?
				efiber_form_rij (
					'Waarvan kosten glasvezel naar huis doortrekken',
					efiber_maak_geld_op($eigenschappen['eenmalig']['glasvezel_naar_huis']['prijs'])
				)		
			: ''
		) .
		efiber_form_rij (
			'Totaal maandelijks',
			"<span class='maandelijks-totaal'></span>"
		) .
		"<br>" . (
		efiber_form_rij (
			'Minimale contractsduur',
			$eigenschappen['provider_meta']['minimale_contractsduur'])
		)
	);



	// bij klein zakelijk kan een waarschuwing komen dat sommigen geen zakelijke factuur kunnen sturen aan een consumentenpakket (=kleinzakelijk)
	if ($keuzehulp['situatie'] === 'kleinZakelijk') {

		if ($eigenschappen['teksten']['klein_zakelijk_waarschuwing']) {
			$meta_inhoud .= "<small>" . $klein_zakelijk_waarschuwing . "</small>";
		}

	}

	$meta_inhoud .= "<small>Bovenstaande gegevens zijn overgenomen van de provider. Wijzigingen voorbehouden.</small>";

	// en de meta inhoud in print HTML houder
	$print .= efiber_form_sectie (
		'Meta',
		$meta_inhoud
	);


	// hier wordt het aanmeldformulier opgehaald
	// @TODO is die echo & buffer nodig?
	ob_start();
	echo do_shortcode('[gravityform id="1" ajax=true]');
	$gf = ob_get_clean();


	// nu de algemene voorwaarden van de provider er in zetten.
	// gaat via stringherkenning
	$algemene_voorwaarden = $eigenschappen['pakket_meta']['provider']['ik_ga_akkoord_met'];
	$algemene_voorwaarden = str_replace("\\", '', $algemene_voorwaarden); // ook kapotge-ajaxt
	$gf = str_replace('%PRINT_ALGEMENE_VOORWAARDEN%', $algemene_voorwaarden, $gf);

	// datumveld mag niet automatisch vullen ivm iphone bug
	// iphone vult het op een andere wijze dan formulier verwacht
	// vervolgens verdwijnt vanwege de validatie de submitknop
	// maar de gebruiker krijgt geen notificatie
	$gf = str_replace("id='input_1_32'", "id='input_1_32' autocomplete='off'", $gf);

	$print .= $gf;

	// @TODO het is onduidelijk wat hiervan daadwerkelijk wordt gebruikt en wat overbodig is.
	$r = array(
		'id'			=> $pakket['ID'],
		'print'			=> $print,
	);

	// @TODO hier is geen foutafhandeling?
	echo json_encode($r);

	wp_die();


}

