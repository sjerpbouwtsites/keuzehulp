<?php


$func_n = "efiber_haal_aanmeldformulier";

add_action( 'wp_ajax_'.$func_n, $func_n );
add_action( 'wp_ajax_nopriv_'.$func_n, $func_n );


function efiber_haal_aanmeldformulier() {


	/*---------------------------------------------------------
	|
	|	Mengt financieele berekening van EENMALIGE kosten met viewlogica
	| 	Genereerd vrnl. lijst met opties met knoppen en inputs
	| 	en plakt dit weer aan een Gravity Form vast.
	|
	-----------------------------------------------------------*/

	// efiber_input gaat er van uit dat de SVGs een klasse hebben
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

	// hierin wordt de HTML opgeslagen. Pas aan het eind printen want ajaxfunctie.
	$print = '';

	// console kan gebruikt worden om mee te geven aan de console key in de JSON. 
	// De console key veroorzaakt een console.log
	$console = array();

	// verrijkte pakketobject afkomstig uit efiber_pakket_eigenschappen($p) + data afkomstig van vergelijker.
	$pakket = $_POST['data'][0];
	$eigenschappen = $pakket['eigenschappen'];

	// bevat gebiedscode, regio en adres.
	$adres = $_POST['adres'];

	// zie onder bij keuzecode voor voorbeeld. Sommige sleutels kunnen ontbreken omdat ze pas gecreeert worden als
	// een bijbehorende optie aangevinkt wordt. 
	$keuzehulp = $_POST['keuzehulp'];

	// initialisatie
	$eenmalige_opties_prijs = 0;

	// zoals 102, 431
	// @TODO incorrecte weergave op iwwiw omdat keuzehulp object niet bestaat.
	$keuzecode_tekst = array(
		"Internet",
		((int) $keuzehulp['televisie'] == 2 || (int) $keuzehulp['televisie'] == 3) ? "Televisie" : '',
		(int) $keuzehulp['bellen'] > 1 ? "Bellen" : ''
	);

	// als geen voorberekening gedaan, dan ook geen pakketten, dus maandelijksTotaal = beginprijs.
	// dit is het geval bij totaaloverzicht / iwwiw
	if (!array_key_exists('maandelijksTotaal', $eigenschappen)) {
		$eigenschappen['maandelijksTotaal'] = $eigenschappen['financieel']['maandelijks'];
	}

	// totaaloverzicht aka iwwiw
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


	$print .= efiber_form_sectie(
		'Samenvatting', // sectie titel
		efiber_form_rij (
			'', // rij zonder titel
			str_replace('\\', '', $eigenschappen['thumb']) // post thumbnail - backslashes worden ergens door de ajax veroorzaakt ?
		) .

		efiber_form_rij (
			'Internet snelheid',
			$eigenschappen['snelheid'] . " Mb/s"
		) .

		efiber_form_rij(
			'Pakket inhoud',
			implode('<br>', $keuzecode_tekst)
		) .

		efiber_form_rij(
			'Pakket prijs per maand',
			"<span id='kopieer-de-prijs'></span>" // er wordt geprint naar een ander element, hiernaar wordt gekopieerd.
		) .

		(
			(array_key_exists('usp', $eigenschappen) and $eigenschappen['usp'] !== '') ?
				efiber_form_rij (
					'Bijzonderheden',
					$eigenschappen['usp']

				)
			:
				""
		)

	);



	$print .= efiber_form_sectie(
		'Hidden inputs',
		efiber_form_rij (
			'',
			efiber_input (array(
				'naam'		=>	'publieke_naam',
				'type'		=> "hidden",
				'value'		=> $eigenschappen['pakket_meta']['publieke_naam'],
				'func'		=> '',
				'waarde'	=> 'waarde' // @TODO raar?
			))
		) .
		efiber_form_rij (
			'',
			efiber_input (array(
				'naam'		=>	'provider',
				'type'		=> "hidden",
				'value'		=> $eigenschappen['pakket_meta']['provider']['post_title'],
				'func'		=> '',
				'waarde'	=> 'waarde' // @TODO raar?
			))
		) .
		efiber_form_rij(
			'',
			efiber_input (array(
				'naam'		=>	'pakket_key',
				'type'		=> "hidden",
				'value'		=> $eigenschappen['pakket_meta']['pakket_key'],
				'func'		=> '',
				'waarde'	=> 'waarde' // @TODO raar?
			))
		) .
		efiber_form_rij(
			'',
			efiber_input (array(
				'naam'		=>	'pakket',
				'type'		=> "hidden",
				'value'		=> $eigenschappen['pakket_meta']['pakket'],
				'func'		=> '',
				'waarde'	=> 'waarde' // @TODO raar?
			))
		)
	);

	$print .=  "<p><strong>Jouw gekozen opties</strong></p>";


	if ($eigenschappen['heeft_tv'] === "true") :

		$tv = $eigenschappen['tv'];

		$tv_inhoud .= efiber_form_rij (
			'TV interactief',
			(array_key_exists('type_tv', $tv) ? 
				( $tv['type_tv'] === 'interactief' ? 'Ja' : 'Nee' ) 
			: 
				'Niet ingevuld.' // onwaarschijnlijk
			)
		);

		if (array_key_exists('opmerkingen', $tv) and $tv['opmerkingen'] !== '') {
			$tv_inhoud .= efiber_form_rij (
				'Opmerkingen',
				$tv['opmerkingen']
			);
		}

		// LET OP DE SPELFOUTEN extra_tv_onvanger = zonder T
		// extra_tv_ontvangen_eenmalig is met een N ipv R

		// Dit is onbegrijpelijke bagger, wees voorzichtig

		if ($tv['extra_tv_onvanger'] !== '-1') {

			// extra_tv_onvanger kan ook 0 zijn, dat is als eenmalige kosten gerekend worden.

			$heeft_extra_tv = in_array('6', $keuzehulp['televisie-opties']);

			// maandelijkse kosten worden berekend op vergelijkingstabel,
			// eenmalige kosten hier.

			// aanname = pakketten hebben nooit èn eenmalige kosten voor de extra TV ontvanger 
			// èn maandelijkste kosten voor de extra TV ontvanger.

			if (	
				$heeft_extra_tv and
				array_key_exists('extra_tv_ontvangen_eenmalig', $tv) and
				$tv['extra_tv_ontvangen_eenmalig'] !== '-1'
				) {
				$eenmalige_opties_prijs += (float) $tv['extra_tv_ontvangen_eenmalig']; // als voor een extra TV eenmalige kosten worden gereken en dit pakket het mogelijk maakt en de gebruiker gekozen heeft voor een extra TV, tel dan die kosten op bij de eenmalige kosten.
			}

			$tv_inhoud .= efiber_form_rij (
				'Extra TV ontvangers',
				efiber_input (array(
					'naam'		=>	'extra_tv_ontvangers',
					'type'		=> "number",
					'value'		=> $heeft_extra_tv ? 1 : 0, // als gekozen voor extra TV, initialiseer dan met waarde 1
					'func'		=> 'aanmelding-schakel',
					'waarde'	=> $tv['extra_tv_ontvangen_eenmalig'] != 0 ? (float) $tv['extra_tv_ontvangen_eenmalig'] : (float) $tv['extra_tv_onvanger'], //extra_tv_onvanger zijn de maandelijkse kosten
					'eclass'	=> $tv['extra_tv_ontvangen_eenmalig'] != 0 ? 'eenmalig ' : '' // sommige providers rekenen eenmalige kosten voor een extra TV ontvanger, anderen maandelijkse
				))
			);

		}


		////////////////////////////////////////////////
		////////////////////////////////////////////////

		// als je vanaf IWWIW komt dan zijn de maandtotalen zonder de kosten
		// van on demand. Dus waarde ook op 0. Want ook niet ingevuld in keuzehulp.
		// als je een 'interactief pakket' hebt maar digitaal heb gekozen, dan value 0.

		$on_demand = $tv['on_demand'];

		// varia ondemand pakketten kunnen  op verschillende wijzen voorkomen:
		// - totaalprijs ('samen')
		// - losse prijzen (komt niet voor)
		// - de een betaald en de ander inclusief

		if ($on_demand['opnemen_replay_begin_gemist_samen'] !== '-1') :

			$tv_inhoud .= efiber_form_rij (
				'Opnemen, terugkijken, begin gemist',
				efiber_input (array(
					'naam'		=> 'opnemen_replay_begin_gemist_samen',
					'type'		=> "checkbox",
					'value'		=> $op_iwwiw ? 0 : 1,
					'waarde'	=> $on_demand['opnemen_replay_begin_gemist_samen'],
					'label'		=> $svgs
				))
			);

		else : // dus on demand niet samen

			if ($on_demand['opnemen'] !== '-1') :

				if ($on_demand['opnemen'] !== '0') {
					$tv_inhoud .= efiber_form_rij (
						'Opnemen',
						efiber_input (array(
							'naam'		=> 'opnemen',
							'type'		=> "checkbox",
							'waarde'	=> $on_demand['opnemen'],
							'value'		=> $op_iwwiw ? 0 : (
								($keuzehulp['televisie'] === '3' and array_key_exists('televisie', $keuzehulp)) ? 1 : 0 
							), // als niet op iwwiw en ITV gekozen. iwwiw heeft ook ITV pakketten maar daar zijn de prijzen nog niet opgeteld.
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

			if ($on_demand['replay'] !== '-1') :

				if ($on_demand['replay'] !== '0') {
					$tv_inhoud .= efiber_form_rij (
						'Terugkijken',
						efiber_input (array(
							'naam'		=> 'replay',
							'type'		=> "checkbox",
							'waarde'	=> $on_demand['replay'],
							'value'		=> 0, // kan nergens buiten aanmeldformulier gekozen worden
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

			if ($on_demand['begin_gemist'] !== '-1') :

				if ($on_demand['begin_gemist'] !== '0') {
					$tv_inhoud .= efiber_form_rij (
						'Begin gemist',
						efiber_input (array(
							'naam'		=> 'begin gemist',
							'type'		=> "checkbox",
							'waarde'	=> $on_demand['begin_gemist'],
							'value'		=> 0, // kan nergens buiten aanmeldformulier gekozen worden
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




		////////////////////////////////////////////////
		////////////////////////////////////////////////





		if ($tv['app'] !== '-1') :

			if ($tv['app'] !== '0') {
				$tv_inhoud .= efiber_form_rij (
					'App',
					efiber_input (array(
						'naam'		=>	'app',
						'type'		=> "checkbox",
						'waarde'	=> $tv['app'],
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



		$tv_pakketten = $tv['paketten'];

		if ($tv_pakketten['film1'] !== '-1') :
			if ($tv_pakketten['film1'] !== '0') {

				$heeft_film_1 = in_array('5', $keuzehulp['televisie-opties']);

				$tv_inhoud .= efiber_form_rij (
					"Film1",
					efiber_input (array(
						'naam'		=>	'film1',
						'type'		=> "checkbox",
						'value'		=> $heeft_film_1 ? 1 : 0,
						'waarde'	=> $tv_pakketten['film1'],
						'label'		=> $svgs
					))
				);

			} else { // gratis optie
				$tv_inhoud .= efiber_form_rij (
					"Film1",
					'Inclusief'
				);
			}
		endif; // film1 beschikbaar



		if ($tv_pakketten['erotiek_pakket'] !== '-1') :
			if ($tv_pakketten['erotiek_pakket'] !== '0') {

				$tv_inhoud .= efiber_form_rij (
					"Erotiek pakket",
					efiber_input (array(
						'naam'		=>	'erotiek_pakket',
						'type'		=> "checkbox",
						'value'		=> 0, // nooit kiesbaar buiten aanmeldformulier
						'waarde'	=> $tv_pakketten['erotiek_pakket'],
						'label'		=> $svgs
					))
				);
			} else { // gratis optie
				$tv_inhoud .= efiber_form_rij (
					"Erotiek pakket",
					'Inclusief'
				);
			}
		endif; // erotiek beschikbaar



		if ($tv_pakketten['plus_pakket'] !== '-1') :
			if ($tv_pakketten['plus_pakket'] !== '0') {

				$heeft_plus_pakket = in_array('4', $keuzehulp['televisie-opties']);

				$tv_inhoud .= efiber_form_rij (
					"Plus pakket",
					efiber_input (array(
						'naam'		=> 'plus_pakket',
						'type'		=> "checkbox",
						'value'		=> $heeft_plus_pakket ? 1 : 0,
						'waarde'	=> $tv_pakketten['plus_pakket'],
						'label'		=> $svgs
					))
				);
			} else { // gratis optie
				$tv_inhoud .= efiber_form_rij (
					"Plus pakket",
					'Inclusief'
				);
			}
		endif; // plus pakket beschikbaar



		if ($tv_pakketten['ziggo_sport_totaal'] !== '-1') :
			if ($tv_pakketten['ziggo_sport_totaal'] !== '0') {

				$heeft_ziggo_totaal = in_array('2', $keuzehulp['televisie-opties']);

				$tv_inhoud .= efiber_form_rij (
					"Ziggo sport totaal",
					efiber_input (array(
						'naam'		=> 'ziggo_sport_totaal',
						'type'		=> "checkbox",
						'value'		=> $heeft_ziggo_totaal ? 1 : 0,
						'waarde'	=> $tv_pakketten['ziggo_sport_totaal'],
						'label'		=> $svgs
					))
				);
			} else { // gratis optie
				$tv_inhoud .= efiber_form_rij (
					"Ziggo sport totaal",
					'Inclusief'
				);
			}
		endif; // ziggo sport totaal beschikbaar


		$heeft_eredvisie = in_array('1', $keuzehulp['televisie-opties']);
		$heeft_fox_sports_int = in_array('3', $keuzehulp['televisie-opties']);

		// bepaalde providers bieden fox sports compleet aan, een bundel van fox eredivisie en fox internationaal.
		if ($heeft_eredvisie && $heeft_fox_sports_int && $tv_pakketten['fox_sports_compl'] !== '-1') :

			$tv_inhoud .= efiber_form_rij (
				"Fox sports Compleet",
				efiber_input (array(
					'naam'		=> 'fox_sports_compl',
					'type'		=> "checkbox",
					'func'		=> 'fox-sports-compl',
					'value'		=> 1, // want combinatie van ED & INT
					'waarde'	=> $tv_pakketten['fox_sports_compl'],
					'label'		=> $svgs
				))
			);

			// is altijd beschikbaar indien fox sports compl beschikbaar is en is altijd niet gratis.
			$tv_inhoud .= efiber_form_rij (
				"Fox Sports Eredivisie",
				efiber_input (array(
					'naam'		=> 'fox_sports_ed',
					'type'		=> "checkbox",
					'value'		=> 0,// want combinatie van ED & INT
					'waarde'	=> $tv_pakketten['fox_sports_ed'],
					'label'		=> $svgs
				))
			);

			// is altijd beschikbaar indien fox sports compl beschikbaar is en is altijd niet gratis.
			$tv_inhoud .= efiber_form_rij (
				"Fox Sports Eredivisie",
				efiber_input (array(
					'naam'		=> 'fox_sports_int',
					'type'		=> "checkbox",
					'value'		=> 0,
					'waarde'	=> $tv_pakketten['fox_sports_int'],
					'label'		=> $svgs
				))
			);

		else : // niet èn heeft eredivisie èn heeft fox sports int èn heeft mogelijkheid fox sports compleet


			if ($tv_pakketten['fox_sports_compl'] !== '-1') {
				$tv_inhoud .= efiber_form_rij (
					"Fox sports Compleet",
					efiber_input (array(
						'naam'		=> 'fox_sports_compl',
						'type'		=> "checkbox",
						'func'		=> 'fox-sports',
						'value'		=> 0, // want niet èn ED èn INT
						'waarde'	=> $tv_pakketten['fox_sports_compl'],
						'label'		=> $svgs
					))
				);
			}


			if ($tv_pakketten['fox_sports_ed'] !== '-1') :
				if ($tv_pakketten['fox_sports_ed'] !== '0') {

					$tv_inhoud .= efiber_form_rij (
						"Fox Sports Eredivisie",
						efiber_input (array(
							'naam'		=> 'fox_sports_ed',
							'type'		=> "checkbox",
							'value'		=> $heeft_eredvisie ? 1 : 0,
							'waarde'	=> $tv_pakketten['fox_sports_ed'],
							'label'		=> $svgs
						))
					);

				} else { // gratis optie
					$tv_inhoud .= efiber_form_rij (
						"Fox Sports Eredivisie",
						'Inclusief'
					);
				}
			endif;


			if ($tv_pakketten['fox_sports_int'] !== '-1') :
				if ($tv_pakketten['fox_sports_int'] !== '0') {

					$tv_inhoud .= efiber_form_rij (
						"Fox Sports Internationaal",
						efiber_input (array(
							'naam'		=> 'fox_sports_int',
							'type'		=> "checkbox",
							'value'		=> $heeft_fox_sports_int ? 1 : 0,
							'waarde'	=> $tv_pakketten['fox_sports_int'],
							'label'		=> $svgs
						))
					);

				} else { // gratis optie
					$tv_inhoud .= efiber_form_rij (
						"Fox Sports Internationaal",
						'Inclusief'
					);
				}
			endif;


		endif; //eredivisie + int = compl

		// tekstmogelijkheid
		if (array_key_exists('opmerkingen', $tv['paketten']) and $tv['paketten']['opmerkingen'] !== '') {
			$tv_inhoud .= efiber_form_rij (
				'Opmerkingen',
				$tv['paketten']['opmerkingen']
			);
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

	$telefonie = $eigenschappen['telefonie'];

	if ($telefonie['heeft_telefonie'] === 'true') :

		$tel_opts = $telefonie['telefonie_opties'];

		$prijs_namen = array (
			'belpakket_avond_vast_&_mobiel' 	=> 'Belpakket avond vast & mobiel',
			'belpakket_nl_&_vast_internationaal'=> 'Belpakket NL & internationaal',
			'belpakket_nl_vast_&_mobiel'		=> 'Belpakket NL vast & mobiel',
			'belpakket_vast'					=> 'Belpakket vast'
		);

		//de pakketten die vooraf ingevuld kunnen worden.
		$nederland_pakketten = array(
			'belpakket_nl_vast_&_mobiel',
			'belpakket_nl_vast_&_mobiel',
			'belpakket_vast'
		);

		$belknoppen = '';

		// belpakket kan vanuit vanuit pakket komen. Als in keuzehulp internationaal aangegeven, dat overschrijven.

		// @TODO
		// dit is superdubbelop! dit bugt aan alle kanten. maar ook op vergelijker wordt NL pakket nog niet meegegeven.
		// neergelegd bij niet functioneren.
		// buitenland pakket wordt wel correct doorgegeven, zowel in vergelijker als hier.

		$vogv = ($pakket['belbundel_nl_vooringevuld'] !== 'false') && !in_array('2', $keuzehulp['nummers']);

		// s = computercode w = menselijk
		foreach ($prijs_namen as $s => $w) :

			if ($tel_opts[$s] !== '-1') {

				$is_nl_ok = $vogv && in_array($s, $nederland_pakketten);

				// als het een nederland bundel is,
				// en buitenlandbundel is niet gekozen,
				// en de pakkettoewijzing heeft nl bundel vooringevuld
				// zet dan deze bundel op 1
				// (per aanbieder maar één NL bundel)
				// anders, als buitenlandbundel gekozen, dan 1

				// if ($is_nl_ok) $opties_prijs += (float) $telefonie['telefonie_opties'][$s];
				// if (in_array($s, $nederland_pakketten) ? ($is_nl_ok ? 1 : 0) : in_array('2', $keuzehulp['nummers']) ? true : false) $opties_prijs += (float) $telefonie['telefonie_opties'][$s];

				$belknoppen .= efiber_input (array(
					'naam'		=> 'belpakket_keuze',
					'type'		=> "radio",
					'value'		=> $op_iwwiw ? 
										0 // belpakket keuze altijd 0 vanaf iwwiw want prijs nog niet meegerekend
									: 
										in_array($s, $nederland_pakketten) ? 
											($is_nl_ok ? 1 : 0)
										: 
											in_array('2', $keuzehulp['nummers']) ? 1 : 0,
					'waarde'	=> $telefonie['telefonie_opties'][$s],
					'label'		=> "<span class='radio-naam'>".$w."</span>" .  $svgs
				));

			}

		endforeach; // alle belpakketten

		// belknoppen naar bel inhoud HTML
		if ($belknoppen !== '') {
			$bel_inhoud .= efiber_form_rij (
				'Belpakketten',
				$belknoppen
			);

			// tekst mogelijkheid
			if (array_key_exists('opmerkingen', $telefonie['telefonie_opties']) and $telefonie['telefonie_opties']['opmerkingen'] !== '') {
				$bel_inhoud .= efiber_form_rij (
					'Opmerkingen',
					$telefonie['telefonie_opties']['opmerkingen']
				);
			}

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

		if ($tel_opts['extra_tel'] !== '-1') :

			$koos_extra_nummer = in_array('1', $keuzehulp['nummers']);

			$bel_inhoud .= efiber_form_rij (
				"Extra vast nummer",
				efiber_input (array(
					'naam'		=> 'extra_vast_nummer',
					'type'		=> "checkbox",
					'func'		=> 'form-toon-rij',
					'value'		=> $koos_extra_nummer ? 1 : 0,
					'waarde'	=> $tel_opts['extra_tel'],
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
			$eigenschappen['pakket_meta']['provider']['inschrijving_telefoonboek_mogelijk'] !== 'false' ? '' : 'onzichtbaar' // alleen bepaalde providers bieden dit aan.
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
	$installatie_sleutels = array("dhz", 'basis_installatie', 'volledige_installatie');

	$installatie_knoppen = '';

	// controleren of deze installatie vorm ok is, anders anderen nemen
	// wederom onnavolgbare logica.. 
	// probeert eerst 'meest dichtbij liggende optie' te nemen, valt anders terug tot derde, minst wenselijke optie.

	$ik = (int) $keuzehulp['installatie'] - 1;

	// mazzel... installatie keuze is beschikbaar?
	$installatie_beschikbaar = $eigenschappen['installatie'][($installatie_sleutels[$ik])] != '-1';

	if (!$installatie_beschikbaar) {

		//naar andere installatievorm schakelen

		if ($keuzehulp['installatie'] == '1') {

			//kijken of 2 beschikbaar is
			$installatie_beschikbaar = $eigenschappen['installatie'][($installatie_sleutels[1])] != '-1';

			if ($installatie_beschikbaar) {
				$keuzehulp['installatie'] = 2;
			} else {
				$keuzehulp['installatie'] = 3;
			}

		} else if ($keuzehulp['installatie'] == '2') {

			$installatie_beschikbaar = $eigenschappen['installatie'][($installatie_sleutels[2])] != '-1';

			if ($installatie_beschikbaar) {
				$keuzehulp['installatie'] = 3;
			} else {
				$keuzehulp['installatie'] = 1;
			}

		} else if ($keuzehulp['installatie'] == '3') {

			//kijken of 2 beschikbaar is
			$installatie_beschikbaar = $eigenschappen['installatie'][($installatie_sleutels[1])] != '-1';

			if ($installatie_beschikbaar) {
				$keuzehulp['installatie'] = 2;
			} else {
				$keuzehulp['installatie'] = 1;
			}

		}

	}


	$i = 1;
	$j = 0;

	// zijn er niet meerdere installatiemogelijkheden? voeg invalide klasse toe.
	// invalide klasse voorkomt klikken. Minstens één installatiemogelijkheid vereist.
	// dat is dit bs verhaal
	$bs = 0;
	foreach ($eigenschappen['installatie'] as $inst_naam => $inst_prijs) :
		if ($inst_prijs !== '-1') $bs++;
	endforeach;

	foreach ($eigenschappen['installatie'] as $inst_naam => $inst_prijs) :

		$deze_inst_gekozen = ((int) $keuzehulp['installatie']) == $i;

		if ($deze_inst_gekozen) { // installatieprijzen = deel van eenmalige kosten = nog niet berekend op vergelijking
			$eenmalige_opties_prijs += $inst_prijs;
		}

		if ($inst_prijs !== '-1') {
			$installatie_knoppen .=
			efiber_input (array(
				'naam'		=> 'installatie_keuze',
				'type'		=> "radio",
				'label'		=> "<span class='radio-naam'>".$installatie_namen[$j]."</span>" .  $svgs,
				'waarde'	=> $inst_prijs,
				'value'		=> ($deze_inst_gekozen ? 1 : 0),
				'eclass'	=> 'eenmalig ' . (($bs > 1) ? '' : 'invalide')
			));
		}

		$i++; $j++;

	endforeach; // alle installatiekeuzes

	// zet installatieknoppen in meta inhoud HTML
	$meta_inhoud .= efiber_form_rij (
		'Installatie',
		$installatie_knoppen
	);


	$extra = $eigenschappen['extra'];

	// is bijvoorbeeld Netrebels TV optie
	if ($extra['heeft_extra_optie'] === 'true') {

		$meta_inhoud .= efiber_form_rij (
			$extra['extra_inhoud']['naam'],
			efiber_input (array(
				'naam'		=> 'extra-optie',
				'type'		=> "checkbox",
				'label'		=> $svgs,
				'value'		=> 0,
				'waarde'	=> $extra['extra_inhoud']['prijs']
			))
		);

	}


	$meta_inhoud .= (
		efiber_form_rij (
			'Incl. wifi router',
			(($eigenschappen['incl_wifi_router']) === "true" ? "Ja" : "Nee")
		) . 
		"<br>" .
		efiber_form_rij (
			'Eenmalige kosten',
			"<span id='print-eenmalig-totaal'>" .
				efiber_maak_geld_op(
					( (float) $eigenschappen['financieel']['eenmalig'] + $eenmalige_opties_prijs)
				) .
			"</span>"
		) .
		efiber_form_rij (
			'Borg',
			efiber_maak_geld_op($eigenschappen['financieel']['borg'])
		) . 
		efiber_form_rij (
			'Totaal maandelijks',
			"<span id='print-maandelijks-totaal'>" .
				efiber_maak_geld_op(
					((float)$eigenschappen['maandelijksTotaal'])
				) .
			"</span>"
		) . 
		"<br>" . 
		efiber_form_rij (
			'Minimale contractsduur',
			get_field('minimale_contractsduur', $eigenschappen['pakket_meta']['provider']['ID'])
		)
	);

	// tekstmogelijkheid
	if (array_key_exists('opmerkingen', $eigenschappen['financieel']) and $eigenschappen['financieel']['opmerkingen'] !== '') {
		$meta_inhoud .= efiber_form_rij (
			'Opmerkingen',
			$eigenschappen['financieel']['opmerkingen']
		);
	}


	// bij klein zakelijk kan een waarschuwing komen dat sommigen geen zakelijke factuur kunnen sturen aan een consumentenpakket (=kleinzakelijk)
	if ($keuzehulp['situatie'] === 'kleinZakelijk') {

		// @TODO verkeerde plek om get field te doen. Zou moeten gebeuren in ajax hulpfunctie die pakketeigenschappen schrijft.
		$klein_zakelijk_waarschuwing = get_field('klein_zakelijk_waarschuwing', $eigenschappen['pakket_meta']['provider']['ID']);

		if ($klein_zakelijk_waarschuwing and $klein_zakelijk_waarschuwing !== '') {
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
		'pakket'		=> $pakket,
		'eigenschappen'	=> $_POST['data'][1],
		'print'			=> $print,
		'keuzehulp'		=> $keuzehulp,
		'console'		=> $pakket // dit komt in de console terecht van de 
	);

	// @TODO hier is geen foutafhandeling?
	echo json_encode($r);

	wp_die();


}