<?php


$func_n = "keuzehulp_haal_aanmeldformulier";

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
	return (	(kz_optie_prijs ($optie, $e)) > 0.01	);
}

function kz_optie_aantal ($optie, $e) {

	return (array_key_exists($optie, $e['eenmalig']) ?
		(float) $e['eenmalig'][$optie]['aantal']
	:
		(float) $e['maandelijks'][$optie]['aantal']
	);
}

function kz_maak_tooltip ($arg = array()){

	if (!array_key_exists('e', $arg)) return '';
	if (!array_key_exists('sleutel', $arg)) return '';

	$t = $arg['e']['teksten'];
	if (array_key_exists($arg['sleutel'], $t)) {
		if ($t[($arg['sleutel'])] !== '') {
		
			$ttt = array_key_exists('titel', $arg)
				? $arg['titel'] !== ''
					? $arg['titel']
					: ''
				: '';

			$s = $arg['sleutel'];

			$tekst = strip_tags($t[$s]);


			return 
			"<a href='#' class='knop kz-tooltip' data-tooltip-titel='$ttt' data-tooltip-tekst='$tekst' data-kz-func='tooltip' title='Meer informatie'><svg class='svg-info' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.f7f0e9f1-f859-4dfe-95fb-3d086fc32618{fill:#159a3c;}</style></defs><circle class='f7f0e9f1-f859-4dfe-95fb-3d086fc32618' cx='49.91' cy='71.51' r='4.36'></circle><path class='f7f0e9f1-f859-4dfe-95fb-3d086fc32618' d='M49.91,5.52A44.64,44.64,0,1,0,94.54,50.15,44.61,44.61,0,0,0,49.91,5.52Zm0,82.29A37.66,37.66,0,1,1,87.57,50.15,37.63,37.63,0,0,1,49.91,87.81Z'></path><path class='f7f0e9f1-f859-4dfe-95fb-3d086fc32618' d='M49.91,27.92A14,14,0,0,0,36,41.87a3.49,3.49,0,1,0,7,0,7,7,0,1,1,7,7,3.49,3.49,0,0,0-3.49,3.49v8.72a3.49,3.49,0,0,0,7,0V55.38a14,14,0,0,0-3.49-27.46Z'></path></svg></a>";			

		} else {
			return '';
		}
	} else {
		return '';
	}

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

function keuzehulp_haal_aanmeldformulier() {


	/*---------------------------------------------------------
	|
	| 	LEZEN vanaf afgeleide objecten
	| 	SCHRIJVEN direct naar pakket object
	|
	-----------------------------------------------------------*/

	// keuzehulp_input gaat er van uit dat de SVGs een klasse hebben
	{
		$svgs = "<img class='ja-schuif' src='/wp-content/plugins/keuzehulp/iconen-nieuw/png/ja schuif.png' alt='ja' width='65' height='27'/><img class='nee-schuif' src='/wp-content/plugins/keuzehulp/iconen-nieuw/png/nee schuif.png' alt='nee' width='65' height='27'/>";
	}
	// hierin wordt de HTML opgeslagen. Pas aan het eind printen want ajaxfunctie.
	$print = '';

	// console kan gebruikt worden om mee te geven aan de console key in de JSON.
	// De console key veroorzaakt een console.log
	$console = array();

	// verrijkte pakketobject afkomstig uit keuzehulp_pakket_eigenschappen($p) + data afkomstig van vergelijker.
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
		$print .= keuzehulp_form_sectie(
			'SECTIE TITEL',
			keuzehulp_form_rij (
				RIJ VELD 1,
				RIJ VELD 2 - vaak input, kan ook tekst of afbeelding zijn,
				'EXTRA CLASS'
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

		$up = $eigenschappen['down_up'][$s];

		$snelheden_opts .= "<option value='$s' ".($gekozen_snelheid == $s ? "selected" : "")." >$s/$up Mb/s</option>";

	}

	$print .= keuzehulp_form_sectie(
		'Samenvatting', // sectie titel
		keuzehulp_form_rij (
			str_replace('\\', '', $eigenschappen['provider_meta']['thumb']),
			"<span class='prijs-bolletje'>
				<span class='maandelijks-totaal'></span>
				<span>p/m</span>
			</span>"

		) .

//		keuzehulp_form_rij(
//			'Pakket inhoud',
//			(
//				$op_iwwiw ?
//					// maakt array en zoekt meteen waarde op.
//					['Internet', 'Internet en bellen', 'Internet en TV', 'Alles in 1'][	(	(int) $keuzehulp['ik-weet-wat-ik-wil'] - 1 )	]
//				:
//					'Dummy pakket beschrijving'
//			)
//		) .

		keuzehulp_form_rij (
			$pakket['naam_composiet'],
			""
		) .

		keuzehulp_form_rij(
			'<span class="veld-span">Eenmalige prijs</span>',
			 "<span class='eenmalig-totaal veld-span'></span>"
		) .

		keuzehulp_form_rij (
			'<span class="veld-span">Down- en upload<br>snelheid</span>',
			"<select id='schakel-snelheid' name='internetsnelheid'>
				$snelheden_opts
			</select>"
		) .

		(
			(array_key_exists('usps', $teksten)	and $teksten['usps'] !== '') ?
				keuzehulp_form_rij (
					'Bijzonderheden: '.$teksten['usps'],
					null
				)
			:
				""
		)

	);


	if (in_array('Alles in 1', $eigenschappen['pakket_type']) || in_array('Internet en TV', $eigenschappen['pakket_type'])) :

		$tv = array(); // WEGHALEN UIT PHP

		$tv_inhoud .= keuzehulp_form_rij (
			$eigenschappen['tv_type'] === "ITV" ? "<span class='ovaal'>Ja</span>" : "<span class='ovaal'>Nee</span>",
			'<strong>TV interactief</strong>',
			$eigenschappen['tv_type'] === "ITV" ? "heeft-actieve-knop" : ""
		);

		if ( kz_heeft_optie('extra-tv-ontvangers', $eigenschappen) ) :

			$koos_extra_tv = !!kz_optie_aantal('extra-tv-ontvangers', $eigenschappen);

			$nummer_svgs = "<span class='plus-en-min-svgs'>
				<a href='#' class='knop' data-kz-func='aantal-tvs-min'>
							<svg class='svg-min ' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs>
								<style>
									.c12351a7-9ebf-4540-b8e7-1c0281cccf8c{fill:#000;}
									.\30 b328a88-6a35-4e9f-a653-e1e9b298c3f4{fill:#fff;}
								</style></defs>
								<title>Rekam icons groen</title>
								<circle class='c12351a7-9ebf-4540-b8e7-1c0281cccf8c' cx='49.24' cy='49.74' r='40.49'/>
								<path class='0b328a88-6a35-4e9f-a653-e1e9b298c3f4' d='M63,43.69A1.18,1.18,0,0,1,64.29,45v9.44A1.17,1.17,0,0,1,63,55.78H35.52a1.17,1.17,0,0,1-1.32-1.32V45a1.17,1.17,0,0,1,1.32-1.33Z'/>
							</svg>			
				</a>
				<a href='#' class='knop' data-kz-func='aantal-tvs-plus'>
					<svg class='svg-plus' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.\31 ddb3e84-39b9-4147-9057-4c1f5c35c23c{fill:#159a3c;}.\39 35d1f77-3a66-4c34-b817-b76fbcca01fa{fill:#fff;}</style></defs><title>Rekam icons groen</title><circle class='1ddb3e84-39b9-4147-9057-4c1f5c35c23c' cx='50' cy='50' r='40.49'/><path class='935d1f77-3a66-4c34-b817-b76fbcca01fa' d='M55,28.29a1.19,1.19,0,0,1,1.34,1.35V44.05H71.08a1.19,1.19,0,0,1,1.34,1.34v9.13a1.18,1.18,0,0,1-1.34,1.34H56.31v14.5A1.19,1.19,0,0,1,55,71.71H45.21a1.19,1.19,0,0,1-1.34-1.35V55.86H28.92a1.18,1.18,0,0,1-1.34-1.34V45.39a1.18,1.18,0,0,1,1.34-1.34H43.87V29.64a1.19,1.19,0,0,1,1.34-1.35Z'/></svg>
				</a>
			</span>";


			$p = kz_optie_prijs('extra-tv-ontvangers', $eigenschappen);
			$veld1 = $nummer_svgs . keuzehulp_input (array(
					'naam'		=>	'extra-tv-ontvangers',
					'type'		=> "number",
					'value'		=> $koos_extra_tv ? "1" : "0", // als gekozen voor extra TV, initialiseer dan met waarde 1
					'func'		=> 'aanmelding-schakel',
					'waarde'	=> $p
				)
			);

			$tt = kz_maak_tooltip(array(
				'e'			=> $eigenschappen,
				'titel'		=> "Extra TV Ontvangers",
				'sleutel'	=> 'extra-tv-ontvangers'
			));

			$veld2 ='<span class="veld-flex"><span>Extra TV ontvangers</span><span>'.kz_maak_geld_op($p). "</span>$tt</span>"; 

			$tv_inhoud .= keuzehulp_form_rij ($veld1, $veld2, $koos_extra_tv ? "heeft-actieve-knop" : '');


		endif; // extra tv ontvanger


		////////////////////////////////////////////////
		////////////////////////////////////////////////


		if ($eigenschappen['tv_type'] === "ITV") :

			if ( kz_heeft_optie('opnemen-replay-begin-gemist-samen', $eigenschappen) ) :

				$tt = kz_maak_tooltip(array(
					'e'			=> $eigenschappen,
					'sleutel'	=> "opnemen_replay_begin_gemist_samen_tekst",
					'titel'		=> "Nonlineaire TV"
				));

				if (kz_optie_kost_geld('opnemen-replay-begin-gemist-samen', $eigenschappen)) {

					$p = kz_optie_prijs('opnemen-replay-begin-gemist-samen', $eigenschappen);
					$tv_inhoud .= keuzehulp_form_rij (
						keuzehulp_input (array(
							'naam'		=> 'opnemen-replay-begin-gemist-samen',
							'type'		=> "checkbox",
							'value'		=> kz_optie_aantal('opnemen-replay-begin-gemist-samen', $eigenschappen),
							'waarde'	=> $p,
							'label'		=> $svgs
						)),
						'<span class="veld-flex"><span>Opnemen, terugkijken, begin gemist</span><span>'.kz_maak_geld_op(kz_optie_prijs('opnemen-replay-begin-gemist-samen', $eigenschappen)).'</span>'.$tt.'</span>'
					);
				} else {
						$tv_inhoud .= keuzehulp_form_rij (
							'<span class="ovaal">Ja</span>',
							"<span class='veld-flex'><span>Opnemen, terugkijken, begin gemist</span>$tt</span>",
							'heeft-actieve-knop'
						);					
				}

			else : // dus on demand niet samen

				if (kz_heeft_optie('opnemen', $eigenschappen)) :

					$tt = kz_maak_tooltip(array(
						'e'			=> $eigenschappen,
						'sleutel'	=> "opnemen_tekst",
						'titel'		=> "Opnemen"
					));

					if (kz_optie_kost_geld('opnemen', $eigenschappen)) {
						$tv_inhoud .= keuzehulp_form_rij (
							keuzehulp_input (array(
								'naam'		=> 'opnemen',
								'type'		=> "checkbox",
								'waarde'	=> $p,
								'value'		=> kz_optie_aantal('opnemen', $eigenschappen),
								'label'		=> $svgs
							)),
							'<span class="veld-flex"><span>Opnemen</span><span>'.kz_maak_geld_op($p).'</span>'.$tt.'</span>'

						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= keuzehulp_form_rij (
							'<span class="ovaal">Ja</span>',
							'<span class="veld-flex"><span>Opnemen</span>'.$tt.'</span>',
							'heeft-actieve-knop'
						);
					}

				endif; //opnemen beschikbaar

				if (kz_heeft_optie('replay', $eigenschappen)) :

					$p = kz_optie_prijs('replay', $eigenschappen);

					$tt = kz_maak_tooltip(array(
						'e'			=> $eigenschappen,
						'sleutel'	=> "replay_tekst",
						'titel'		=> "Terugkijken"
					));					

					if (kz_optie_kost_geld('replay', $eigenschappen)) {
						
						$tv_inhoud .= keuzehulp_form_rij (
							keuzehulp_input (array(
								'naam'		=> 'replay',
								'type'		=> "checkbox",
								'waarde'	=> $p,
								'value'		=> kz_optie_aantal('replay', $eigenschappen),
								'label'		=> $svgs
							)),
							'<span class="veld-flex"><span>Terugkijken</span><span>'.kz_maak_geld_op($p).'</span>'.$tt.'</span>'
						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= keuzehulp_form_rij (
							'<span class="ovaal">Ja</span>',
							'<span class="veld-flex"><span>Terugkijken</span>'.$tt.'</span>',
							'heeft-actieve-knop'
						);
					}

				endif; // replay beschikbaar

				if (kz_heeft_optie('begin-gemist', $eigenschappen)) :

					$tt = kz_maak_tooltip(array(
						'e'			=> $eigenschappen,
						'sleutel'	=> "replay_tekst",
						'titel'		=> "Terugkijken"
					));						

					if (kz_optie_kost_geld('begin-gemist', $eigenschappen)) {
						$p = kz_optie_prijs('begin-gemist', $eigenschappen);
						$tv_inhoud .= keuzehulp_form_rij (
							keuzehulp_input (array(
								'naam'		=> 'begin gemist',
								'type'		=> "checkbox",
								'waarde'	=> $p,
								'value'		=> kz_optie_aantal('begin-gemist', $eigenschappen),
								'label'		=> $svgs
							)),
							'<span class="veld-flex"><span>Begin gemist</span><span>'.kz_maak_geld_op($p).'</span>'.$tt.'</span>'

						);
					} else { // gratis optie, waarde is 0
						$tv_inhoud .= keuzehulp_form_rij (
							'<span class="ovaal">Ja</span>',
							'<span class="veld-flex"><span>Begin gemist</span>'.$tt.'</span>',
							'heeft-actieve-knop'
						);
					}

				endif; // begin gemist beschikbaar

			endif; // on demand samen of niet

		endif; // is interactief


		////////////////////////////////////////////////
		////////////////////////////////////////////////


		if (kz_heeft_optie('app', $eigenschappen)) :

			if (kz_optie_kost_geld('app', $eigenschappen)) {
				$p = kz_optie_prijs('app', $eigenschappen);
				$tv_inhoud .= keuzehulp_form_rij (
					keuzehulp_input (array(
						'naam'		=>	'app',
						'type'		=> "checkbox",
						'waarde'	=> $p,
						'value'		=> kz_optie_aantal('app', $eigenschappen),
						'label'		=> $svgs
					)),
					'<span class="veld-flex"><span>App</span><span>'.kz_maak_geld_op($p).'</span></span>'
				);
			} else {
				$tv_inhoud .= keuzehulp_form_rij (
					'<span class="ovaal">Ja</span>',
					'<span class="veld-flex"><span>App</span></span>',
					'heeft-actieve-knop'
				);
			}

		endif; // tv app beschikbaar


		$tv_pakket_namen = array('film1', 'plus', 'fox-sports-eredivisie', 'fox-sports-internationaal', 'fox-sports-compleet', 'ziggo-sport-totaal', 'erotiek');

		foreach ($tv_pakket_namen as $tv_pakket_naam) {

			$deze_pakketten = kz_tv_pakketten($tv_pakket_naam, $eigenschappen, $gekozen_snelheid);

			if (count($deze_pakketten) > 0) :
				foreach ($deze_pakketten as $dit_pakket) :

					$volledige_naam = $dit_pakket['naam_volledig'];

					$tt = kz_maak_tooltip(array(
						'e'			=> $eigenschappen,
						'sleutel'	=> $volledige_naam,
						'titel'		=> ucfirst($dit_pakket['naam'])
					));

					if (kz_optie_kost_geld($volledige_naam, $eigenschappen)) {
						$p = $dit_pakket['prijs'];

						$tv_inhoud .= keuzehulp_form_rij (
							keuzehulp_input (array(
								'naam'		=> $volledige_naam,
								'type'		=> "radio",
								'value'		=> $dit_pakket['aantal'],
								'waarde'	=> $p,
								'label'		=> $svgs,
								'eclass'	=> 'tv-pakket'
							)),
							"<span class='veld-flex'><span>".ucfirst($dit_pakket['naam'])."</span><span>".kz_maak_geld_op($p)."</span>$tt</span>"
						);

					} else { // gratis optie
						$tv_inhoud .= keuzehulp_form_rij (
							'<span class="ovaal">Ja</span>',
							"<span class='veld-flex'><span>".$dit_pakket['naam']."</span>$tt</span>",
							'heeft-actieve-knop'
						);
					}

				endforeach;
			endif; // film1 beschikbaar
		}


	endif; //heeft TV

	// zet de TV_inhoud in print
	if ($tv_inhoud && $tv_inhoud !== '') {
		$print .= keuzehulp_form_sectie(
			'Televisie',
			$tv_inhoud,
			"<svg class='svg-tv' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.\32 5a40c2a-e21f-4ff6-8508-46524cd51bfe{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class='25a40c2a-e21f-4ff6-8508-46524cd51bfe' d='M86.9,15.56v-.12H13.05v.12A4.89,4.89,0,0,0,8.6,19.94V68.47a4.71,4.71,0,0,0,.65,2.43,4.53,4.53,0,0,0,4.21,2.47H40.12V80.1H35.05a2.23,2.23,0,1,0,0,4.46H64.91a2.23,2.23,0,1,0,0-4.46H59.84V73.37H86.5a4.52,4.52,0,0,0,4.21-2.47,4.86,4.86,0,0,0,.69-2.43V19.94A5,5,0,0,0,86.9,15.56Zm0,4.78V68.47c0,.29-.12.41-.4.41h-73c-.28,0-.41-.12-.41-.41V19.94H86.9v.4Z'/></svg>",
			'Jouw gekozen opties:'
		);
	}



	// HTML houder
	$bel_inhoud = '';

	if (in_array('Alles in 1', $eigenschappen['pakket_type']) || in_array('Internet en bellen', $eigenschappen['pakket_type'])) :

		$belknoppen = '';

			foreach ($eigenschappen['telefonie_bundels'] as $tb_a) {

				foreach ($tb_a as $tb) {

					$tt = kz_maak_tooltip(array(
						'e'			=> $eigenschappen,
						'sleutel'	=> $tb['naam'],
						'titel'		=> $tb['naam']
					));

					$n = slugify($tb['naam']);
					$p = kz_optie_prijs($n, $eigenschappen);
					$label = 
					"<span class='radio-naam-en-prijs veld-flex'>
						<span class='radio-naam'>".$tb['naam']."</span>
						<span class='radio-prijs'>".kz_maak_geld_op($p)."</span>
					</span>" . $svgs;
					$belknoppen .= keuzehulp_input (array(
						'naam'		=> 'belpakket-keuze-'.$tb['naam'],
						'type'		=> "radio",
						'value'		=> kz_optie_aantal($n, $eigenschappen),
						'waarde'	=> $p,
						'eclass'	=> 'belpakket',
						'label'		=> $label . $tt
					), $p);
				}

			}

		// belknoppen naar bel inhoud HTML
		if ($belknoppen !== '') {
			$bel_inhoud .= keuzehulp_form_rij (
				'<span>Belpakketten</span>',
				$belknoppen,
				'radios'
			);

		}

		$bel_inhoud .= keuzehulp_form_rij (
			keuzehulp_input (array(
				'naam'		=> 'nummerbehoud',
				'type'		=> "checkbox",
				'func'		=> 'form-toon-rij',
				'value'		=> 0,
				'label'		=> $svgs
			)),
			"<span class='veld-flex'><span>Nummerbehoud</span><span></span></span>",
			'heeft-sub-rij',
			array(
				keuzehulp_input (array(
					'naam'		=> 'huidige_nummer',
					'type'		=> "text",
					'func'		=> '',
				)),
				"<span class='veld-flex'><span>Huidige nummer</span></span>",
				'sub-rij',				
			)
		);

		if (kz_heeft_optie('extra-vast-nummer', $eigenschappen)) :

			$p = kz_optie_prijs('extra-vast-nummer', $eigenschappen);
			$bel_inhoud .= keuzehulp_form_rij (
				keuzehulp_input (array(
					'naam'		=> 'extra_vast_nummer',
					'type'		=> "checkbox",
					'value'		=> kz_optie_aantal('extra-vast-nummer', $eigenschappen),
					'waarde'	=> $p,
					'label'		=> $svgs
				)),
				"<span class='veld-flex'><span>Extra vast nummer</span><span>".kz_maak_geld_op($p)."</span></span>",
				'heeft-sub-rij',
				array(
					keuzehulp_input (array(
						'naam'		=> 'nummerbehoud_extra_vast_nummer',
						'type'		=> "checkbox",
						'label'		=> $svgs
					)),
					"<span class='veld-flex'><span>Nummerbehoud extra vast nummer</span></span>",
					($koos_extra_nummer ? '' : 'heeft-sub-rij sub-rij'),
					array(
						keuzehulp_input (array(
							'naam'		=> 'huidige_extra_nummer',
							'type'		=> "text",
						)),
						"<span class='veld-flex'><span>Huidige extra nummer</span></span>",
						'sub-rij sub-sub-rij' // wordt zichtbaar als extra nummer gekozen en nummerbehoud					
					)
				)

			);

		endif; // extra tel mogelijk

		$bel_inhoud .= keuzehulp_form_rij (
			keuzehulp_input (array(
				'naam'		=> 'inschrijving_telefoonboek',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'value'		=> 0
			)),
			"<span class='veld-flex'><span>Inschrijving telefoonboek</span></span>",
			$eigenschappen['provider_meta']['inschrijving_telefoonboek_mogelijk'] !== 'false' ? '' : 'onzichtbaar' // alleen bepaalde providers bieden dit aan.
		);

	endif; // if telefonie


	// zet bel inhoud op print HTML
	if ($bel_inhoud && $bel_inhoud !== '') {
		$print .= keuzehulp_form_sectie(
			'Bellen',
			$bel_inhoud,
			"<svg class='svg-bellen' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.e97ef855-384b-4714-91e0-2d37881c1420{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class='e97ef855-384b-4714-91e0-2d37881c1420' d='M70.94,58.25a7.15,7.15,0,0,0-5.18-2.38,7.43,7.43,0,0,0-5.24,2.36l-4.84,4.83-1.18-.61c-.55-.28-1.07-.54-1.52-.81a52.83,52.83,0,0,1-12.61-11.5,30.92,30.92,0,0,1-4.13-6.52c1.25-1.15,2.42-2.35,3.55-3.5.43-.42.86-.87,1.29-1.3,3.22-3.21,3.22-7.38,0-10.6L36.9,24c-.48-.48-1-1-1.43-1.46-.92-.95-1.88-1.93-2.88-2.85a7.24,7.24,0,0,0-5.13-2.25,7.5,7.5,0,0,0-5.21,2.25l0,0L17,25a11.18,11.18,0,0,0-3.32,7.12,26.84,26.84,0,0,0,2,11.37A65.89,65.89,0,0,0,27.37,63.06a72.09,72.09,0,0,0,24,18.8,37.2,37.2,0,0,0,13.48,4l1,0a11.54,11.54,0,0,0,8.84-3.8s0,0,.06-.07a34.89,34.89,0,0,1,2.69-2.78c.65-.62,1.33-1.28,2-2A7.68,7.68,0,0,0,81.71,72a7.36,7.36,0,0,0-2.36-5.26Zm5.48,16.13s0,0,0,0c-.59.65-1.21,1.23-1.86,1.87a39.39,39.39,0,0,0-3,3.07,7.4,7.4,0,0,1-5.76,2.43h-.71a33.14,33.14,0,0,1-11.95-3.59A68.15,68.15,0,0,1,30.57,60.44a62.05,62.05,0,0,1-11-18.37,21.8,21.8,0,0,1-1.72-9.59,7,7,0,0,1,2.12-4.55l5.22-5.23a3.5,3.5,0,0,1,2.33-1.08,3.27,3.27,0,0,1,2.24,1.07l0,0c.94.87,1.83,1.77,2.76,2.74L34,27l4.18,4.19c1.62,1.62,1.62,3.12,0,4.75-.45.44-.87.88-1.32,1.31C35.56,38.53,34.34,39.76,33,41c0,0-.07,0-.08.08a3.14,3.14,0,0,0-.8,3.48l0,.13a33.61,33.61,0,0,0,5,8.08h0A56.22,56.22,0,0,0,50.75,65.11c.63.4,1.27.72,1.88,1s1.07.54,1.52.81l.18.11a3.32,3.32,0,0,0,1.52.38,3.29,3.29,0,0,0,2.33-1l5.24-5.24A3.43,3.43,0,0,1,65.73,60a3.14,3.14,0,0,1,2.21,1.11l0,0,8.44,8.44C78,71.15,78,72.76,76.42,74.38Z'/><path class='e97ef855-384b-4714-91e0-2d37881c1420' d='M52.8,30.55A19.72,19.72,0,0,1,68.86,46.61a2,2,0,0,0,2,1.71,2.19,2.19,0,0,0,.36,0A2.08,2.08,0,0,0,73,45.9,23.88,23.88,0,0,0,53.52,26.47a2.09,2.09,0,0,0-2.39,1.69A2,2,0,0,0,52.8,30.55Z'/><path class='e97ef855-384b-4714-91e0-2d37881c1420' d='M86.08,45.3a39.3,39.3,0,0,0-32-32,2.07,2.07,0,1,0-.68,4.08A35.07,35.07,0,0,1,82,46a2.07,2.07,0,0,0,4.08-.68Z'/></svg>",
			'Jouw gekozen opties:'
		);
	}



	// HTML houder
	$meta_inhoud = '';


	$installatie_namen = array("Doe het zelf", 'Basis installatie', 'Volledige installatie');
	$installatie_sleutels = array("dhz", 'basis', 'volledig');


	for ($i = 0; $i < count($installatie_namen); $i++) {

		if (kz_heeft_optie('installatie-'.$installatie_sleutels[($i)], $eigenschappen)) {

			$p = kz_optie_prijs('installatie-'.$installatie_sleutels[($i)], $eigenschappen);

			$label = 
			"<span class='radio-naam-en-prijs veld-flex'>
				<span class='radio-naam'>".$installatie_namen[$i]."</span>
				<span class='radio-prijs'>".kz_maak_geld_op($p)."</span>
			</span>" . $svgs;

			$installatie_knoppen .=
				keuzehulp_input (array(
					'naam'		=> 'installatie-keuze-'.$installatie_sleutels[($i)],
					'type'		=> "radio",
					'label'		=> $label,
					'waarde'	=> $p,
					'value'		=> kz_optie_aantal('installatie-'.$installatie_sleutels[($i)], $eigenschappen),
					'eclass'	=> 'installatie'
				), 
				kz_maak_geld_op($p)
			);

		}

	}



	// zet installatieknoppen in meta inhoud HTML
	$meta_inhoud .= keuzehulp_form_rij (
		"<span>Installatie</span>",
		$installatie_knoppen,
		'radios'
	);






	// is bijvoorbeeld Netrebels TV optie
	if (kz_heeft_optie('extra-optie', $eigenschappen)) {

		$eon = $eigenschappen['teksten']['extra_optie_naam'];

		$tt = kz_maak_tooltip(array(
			'e'			=> $eigenschappen,
			'sleutel'	=> 'extra_optie_tekst',
			'titel'		=> $eon
		));

		$p = kz_optie_prijs('extra-optie', $eigenschappen);
		$meta_inhoud .= keuzehulp_form_rij (
			keuzehulp_input (array(
				'naam'		=> 'extra-optie',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'waarde'	=> $p,
				'value'		=> kz_optie_aantal('extra-optie', $eigenschappen),
			)),
			"<span class='veld-flex'><span>$eon</span><span>".kz_maak_geld_op($p)."</span>$tt</span>"
		);

	}

	if (kz_heeft_optie('dvb-c', $eigenschappen)) {

		$tt = kz_maak_tooltip(array(
			'e'			=> $eigenschappen,
			'sleutel'	=> 'dvb-c',
			'titel'		=> 'DVB-C'
		));

		$p = kz_optie_prijs('dvb-c', $eigenschappen);
		$meta_inhoud .= keuzehulp_form_rij (
			keuzehulp_input (array(
				'naam'		=> 'dvb-c',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'waarde'	=> $p,
				'value'		=> kz_optie_aantal('dvb-c', $eigenschappen),
			)),
			"<span class='veld-flex'><span>DVB-C</span><span>".kz_maak_geld_op($p)."</span>$tt</span>"
		);

	}	


	$wrt = $eigenschappen['provider_meta']['incl_wifi_router'] === "true" 
		? "Ja" : 
		"Nee";

	$meta_inhoud .= (
		keuzehulp_form_rij (
			"<span class='ovaal'>$wrt</span>",
			'<span class="veld-flex"><span>Incl. wifi router</span></span>',
			'heeft-actieve-knop'
		) . (
		keuzehulp_form_rij (
			'Minimale contractsduur',
			'<span class="veld-flex"><span>' . $eigenschappen['provider_meta']['minimale_contractsduur']) . "</span></span>"
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
	$print .= keuzehulp_form_sectie (
		"Installatie",
		$meta_inhoud,
		"<svg class='svg-installatie'  xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.bc3ed8cd-2d3b-4536-a97d-59b790106817{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class='bc3ed8cd-2d3b-4536-a97d-59b790106817' d='M51.54,90.63l4.31-1.78A4.52,4.52,0,0,0,58.3,83l-1.11-2.68a27.65,27.65,0,0,0,5.67-5.66l2.67,1.1a4.52,4.52,0,0,0,5.9-2.44L73.23,69a4.52,4.52,0,0,0-2.45-5.9l-4-1.63a1.74,1.74,0,0,0-1.32,3.22l4,1.64A1,1,0,0,1,70,67.63L68.23,72a1.08,1.08,0,0,1-.57.56,1,1,0,0,1-.79,0l-4-1.64a1.74,1.74,0,0,0-2.11.64,23.92,23.92,0,0,1-6.71,6.7,1.75,1.75,0,0,0-.65,2.12l1.63,4a1,1,0,0,1-.56,1.36L50.2,87.42a1,1,0,0,1-.8,0,1.06,1.06,0,0,1-.56-.56l-1.64-4a1.7,1.7,0,0,0-2-1,24.15,24.15,0,0,1-9.47,0,1.77,1.77,0,0,0-2,1l-1.63,4a1,1,0,0,1-1.36.56l-4.31-1.79a1.06,1.06,0,0,1-.57-.57,1.08,1.08,0,0,1,0-.79l1.64-4A1.74,1.74,0,0,0,27,78.2a23.82,23.82,0,0,1-6.71-6.71,1.75,1.75,0,0,0-2.12-.65l-4,1.63a1,1,0,0,1-.79,0,1,1,0,0,1-.56-.56L11,67.6a1,1,0,0,1,0-.79,1,1,0,0,1,.56-.57l4-1.64a1.72,1.72,0,0,0,1-1.95,24.34,24.34,0,0,1,0-9.47,1.77,1.77,0,0,0-1-2l-4-1.63A1,1,0,0,1,11,48.23l1.79-4.31a1.05,1.05,0,0,1,1.36-.57l4,1.64a1.73,1.73,0,0,0,2.11-.63A24,24,0,0,1,27,37.65a1.75,1.75,0,0,0,.65-2.12l-1.63-4a1,1,0,0,1,.56-1.35l4.31-1.78a1,1,0,0,1,.8,0,1.06,1.06,0,0,1,.56.56l1.64,4a1.74,1.74,0,0,0,3.22-1.32l-1.64-4A4.53,4.53,0,0,0,33,25.23a4.43,4.43,0,0,0-3.45,0L25.23,27a4.52,4.52,0,0,0-2.45,5.9l1.11,2.68a27.45,27.45,0,0,0-5.67,5.67l-2.67-1.11a4.51,4.51,0,0,0-5.9,2.45L7.83,46.91a4.52,4.52,0,0,0,2.45,5.9L13,53.92a27.57,27.57,0,0,0,0,8L10.28,63a4.54,4.54,0,0,0-2.45,2.44,4.6,4.6,0,0,0,0,3.46l1.78,4.31a4.53,4.53,0,0,0,2.45,2.45,4.58,4.58,0,0,0,3.45,0l2.68-1.11a27.45,27.45,0,0,0,5.67,5.67l-1.11,2.67a4.48,4.48,0,0,0,0,3.45,4.54,4.54,0,0,0,2.44,2.45l4.32,1.8a4.51,4.51,0,0,0,5.9-2.45l1.11-2.68a27.57,27.57,0,0,0,8,0l1.11,2.68a4.51,4.51,0,0,0,5.9,2.45Z'/><path class='bc3ed8cd-2d3b-4536-a97d-59b790106817' d='M26.36,58A14.19,14.19,0,0,0,40.53,72.11h.11A14.19,14.19,0,0,0,54.72,57.83,1.74,1.74,0,0,0,53,56.1h0a1.72,1.72,0,0,0-1.72,1.76,10.69,10.69,0,0,1-3.09,7.59,10.58,10.58,0,0,1-7.53,3.19h-.07a10.7,10.7,0,0,1-.07-21.4,1.72,1.72,0,0,0,1.72-1.76,1.74,1.74,0,0,0-1.74-1.72h0A14.18,14.18,0,0,0,26.36,58Z'/><path class='bc3ed8cd-2d3b-4536-a97d-59b790106817' d='M70,5.48h-3.4a3.77,3.77,0,0,0-3.76,3.77V11A20.22,20.22,0,0,0,58,13l-1.23-1.24a3.77,3.77,0,0,0-2.66-1.1,3.7,3.7,0,0,0-2.66,1.1L49,14.16a3.74,3.74,0,0,0,0,5.32l1.23,1.23a20,20,0,0,0-2,4.82H46.5a3.77,3.77,0,0,0-3.77,3.77v3.4a3.77,3.77,0,0,0,3.77,3.77h1.74a20,20,0,0,0,2,4.82L49,42.52a3.75,3.75,0,0,0-1.11,2.66A3.68,3.68,0,0,0,49,47.84l2.39,2.4a3.8,3.8,0,0,0,2.66,1.11,3.7,3.7,0,0,0,2.66-1.11L58,49a20.22,20.22,0,0,0,4.83,2v1.74a3.77,3.77,0,0,0,3.76,3.77H70a3.77,3.77,0,0,0,3.77-3.77V51a20.22,20.22,0,0,0,4.83-2l1.23,1.24a3.76,3.76,0,0,0,2.66,1.11,3.67,3.67,0,0,0,2.65-1.11l2.4-2.4a3.78,3.78,0,0,0,0-5.32l-1.23-1.23a19.56,19.56,0,0,0,2-4.82H90a3.77,3.77,0,0,0,3.77-3.77V29.3A3.77,3.77,0,0,0,90,25.53H88.26a19.56,19.56,0,0,0-2-4.82l1.23-1.23a3.78,3.78,0,0,0,0-5.32l-2.4-2.4a3.75,3.75,0,0,0-2.65-1.1,3.67,3.67,0,0,0-2.66,1.1L78.55,13a20.22,20.22,0,0,0-4.83-2V9.25A3.8,3.8,0,0,0,70,5.48Zm7.87,11.16a1.76,1.76,0,0,0,1,.3A1.69,1.69,0,0,0,80,16.43l2.2-2.2a.31.31,0,0,1,.2-.09.27.27,0,0,1,.19.09L85,16.62A.29.29,0,0,1,85,17l-2.2,2.2a1.73,1.73,0,0,0-.22,2.2,17,17,0,0,1,2.58,6.2A1.74,1.74,0,0,0,86.87,29H90a.27.27,0,0,1,.28.28v3.4A.27.27,0,0,1,90,33H86.87a1.72,1.72,0,0,0-1.7,1.41,17,17,0,0,1-2.58,6.2,1.76,1.76,0,0,0,.22,2.2L85,45a.29.29,0,0,1,0,.39l-2.4,2.39a.27.27,0,0,1-.19.09.31.31,0,0,1-.2-.09L80,45.54a1.73,1.73,0,0,0-2.2-.22,17.13,17.13,0,0,1-6.19,2.58,1.74,1.74,0,0,0-1.41,1.7v3.12a.28.28,0,0,1-.28.28h-3.4a.27.27,0,0,1-.28-.28V49.6a1.73,1.73,0,0,0-1.41-1.7,17.1,17.1,0,0,1-6.2-2.58,1.75,1.75,0,0,0-2.2.22l-2.2,2.2a.26.26,0,0,1-.2.08.25.25,0,0,1-.19-.08l-2.39-2.4a.24.24,0,0,1-.09-.19.27.27,0,0,1,.09-.2l2.2-2.2a1.74,1.74,0,0,0,.21-2.2,16.93,16.93,0,0,1-2.57-6.19A1.75,1.75,0,0,0,49.6,33H46.48a.28.28,0,0,1-.28-.29V29.27a.28.28,0,0,1,.28-.29H49.6a1.74,1.74,0,0,0,1.71-1.4,16.91,16.91,0,0,1,2.57-6.2,1.75,1.75,0,0,0-.21-2.2L51.47,17a.24.24,0,0,1-.09-.2.24.24,0,0,1,.09-.19l2.39-2.4a.25.25,0,0,1,.19-.08.26.26,0,0,1,.2.08l2.2,2.21a1.74,1.74,0,0,0,2.2.21A16.91,16.91,0,0,1,64.85,14a1.75,1.75,0,0,0,1.41-1.71V9.25A.27.27,0,0,1,66.54,9h3.4a.28.28,0,0,1,.28.28v3.11a1.74,1.74,0,0,0,1.41,1.71A16.93,16.93,0,0,1,77.82,16.64Z'/><path class='bc3ed8cd-2d3b-4536-a97d-59b790106817' d='M57.91,31A10.36,10.36,0,1,0,68.26,20.62,10.37,10.37,0,0,0,57.91,31Zm17.2,0a6.87,6.87,0,1,1-6.87-6.86A6.88,6.88,0,0,1,75.11,31Z'/></svg>",
		'Jouw gekozen opties:'
	);




	$financieel_inhoud = 

		keuzehulp_form_rij (
			'Eenmalige kosten',
			"<span class='eenmalig-totaal'></span>"
		) .
		keuzehulp_form_rij (
			'Waarvan borg',
			kz_maak_geld_op($eigenschappen['eenmalig']['borg']['prijs'])
		) . ((float)$eigenschappen['eenmalig']['glasvezel_naar_huis']['prijs'] > 0.01
			?
				keuzehulp_form_rij (
					'Waarvan kosten glasvezel naar huis doortrekken',
					kz_maak_geld_op($eigenschappen['eenmalig']['glasvezel_naar_huis']['prijs'])
				)		
			: ''
		) .
		keuzehulp_form_rij (
			'Totaal maandelijks',
			"<span class='maandelijks-totaal'></span>"
		);


	$print .= keuzehulp_form_sectie (
		null,
		$financieel_inhoud,
		null,
		'En dat kost bij elkaar:'
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
		'console'		=> $pakket,
	);

	// @TODO hier is geen foutafhandeling?
	echo json_encode($r);

	wp_die();


}

