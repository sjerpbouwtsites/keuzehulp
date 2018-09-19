<?php

/* template name: keuzehulp */


// !! Omwille van geheugengebruik maak ik maar één keer een instance aan van de Ef_knop klasse.
// Denk er aan dat als je een waarde aanpast bij knop n, knop n + 1 wellicht die eigenschap erft.

///<link href="https://fonts.googleapis.com/css?family=Maven+Pro" rel="stylesheet"> 

$afb_pad = plugins_url( '../iconen-nieuw/png-rekam/', __FILE__ );

function efiber_keuzehulp_pak_afb ($str = '') {
	global $afb_pad;
	$class = explode(' ', $str);
	return "<img class='{$class[0]}' src='".$afb_pad.$str.".png' alt='$str' width='300' height='224' />";
}

require 'header.php';
require 'keuze-menu-lijst.php';

?>

<div class='keuzehulp'><div class='verpakking'>

	<?php

		$pc_teksten = get_field('postcode_teksten', 'option');

		$postcode_sectie = new EfiberSectie(array(

			'stap'			=> 1,
			'titel'			=> '',
			'torso_intro'	=> "<div class='flex-links'><h2>".$pc_teksten['titel']."</h2>".$pc_teksten['intro']."</div>",
			'torso_direct'	=> 	"<form class='keuzehulp-fieldset' action='#' id='keuze-postcodeform' method='POST'>
			 				<h3>Postcodecheck</h3>
			 				<p>Vul postcode en huisnummer in en bekijk de mogelijkheden op jouw adres</p>
			 				<label for='postcode'>
			 					<span>Postcode</span>
			 					<input
			 						class='keuzehulp-input'
			 						id='postcode'
			 						name='postcode'
			 						type='text'
			 						placeholder='1000 AA'
			 						minlength='6'
			 						maxlength='7'
			 					>
			 				</label>
			 				<label for='huisnummer'>
			 					<span>Huisnummer</span>
			 					<input
			 						class='keuzehulp-input'
			 						id='huisnummer'
			 						name='huisnummer'
			 						type='text'
			 						minlength='1'
			 					>
			 				</label><label for='toevoeging'>
			 					<span>Toevoeging</span>
			 					<input
			 						class='keuzehulp-input'
			 						id='toevoeging'
			 						name='toevoeging'
			 						type='text'
			 					>
			 				</label>
			 				<label for='kamer'>
			 					<span>Kamer</span>
			 					<input
			 						class='keuzehulp-input'
			 						id='kamer'
			 						name='kamer'
			 						type='text'
			 					>
			 				</label>
			  				<input class='blauwe-knop' type='submit' value='doe de check!'>
						</form>",
		));


		$postcode_sectie->print();

		/////////////////////////////////////////////////

		$kofnt = get_field('keuzehulp_of_niet_teksten', 'option');

		$keuzehulp_of_niet_titel = [];
		$keuzehulp_of_niet_intro = [];
		$keuzehulp_of_niet_ja_knoptekst = [];
		$keuzehulp_of_niet_nee_knoptekst = [];

		foreach ($kofnt as $groepnaam => $verzameling) {
			
			if (!is_array($verzameling)) {
				continue;
			}

			if ($groepnaam === 'status_groep') {
				$statuscode = '0';
			} else {
				$e = explode('_', $groepnaam);
				$statuscode = $e[1];
			}

			$keuzehulp_of_niet_titel[] = "
				<div class='statusbepaald status-$statuscode'>".$verzameling['titel']."</div>
			";
			$keuzehulp_of_niet_intro[] = "
				<div class='statusbepaald status-$statuscode'>".$verzameling['intro']."</div>
			";
			$keuzehulp_of_niet_ja_knoptekst[] = "
				<div class='statusbepaald status-$statuscode'>".$verzameling['wel_keuze_hulp']."</div>
			";
			$keuzehulp_of_niet_nee_knoptekst[] = "
				<div class='statusbepaald status-$statuscode'>".$verzameling['geen_keuzehulp']."</div>
			";						

		}

		$keuzehulp_knoppen = '';
		$knop = new Kz_knop_combi(array(
			'func'		=> "animeer zet-niveau-knop toon-stap",
			'link'		=> '#3',
			'tekst'		=> implode('', $keuzehulp_of_niet_ja_knoptekst),
			'tooltip'	=> $kofnt['wel_keuze_hulp_tooltip'],
			'geen_ikoon'=> false,
			'ikoon'		=> efiber_keuzehulp_pak_afb("meta 2"),
			'class'		=> 'blauwe-knop'
		));
		$keuzehulp_knoppen .= $knop->maak();

		$knop->link = '#20';
		$knop->tekst = implode('', $keuzehulp_of_niet_nee_knoptekst);
		$knop->ikoon = efiber_keuzehulp_pak_afb("meta 3");
		$knop->func = 'toon-stap animeer leeg-keuzehulp';
		$knop->tooltip = $kofnt['geen_keuze_hulp_tooltip'];
		$keuzehulp_knoppen .= $knop->maak();



		$keuzehulp_of_niet = new EfiberSectie(array(
			'stap'			=> 2,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("gefeliciteerd titel"),
			'titel'			=> implode('', $keuzehulp_of_niet_titel),
			'torso_intro'	=> implode('', $keuzehulp_of_niet_intro),
			'torso_direct'	=> 	"<div class='knoppendoos'>$keuzehulp_knoppen</div>",
		));

		$keuzehulp_of_niet->print();

		/////////////////////////////////////////////////

		$situatie_teksten = get_field('situatie_teksten', 'option');

		$kies_situatie_knoppen = '';
		$knop->func = 'animeer zet-niveau-knop zet-situatie toon-stap zet-nummers-consequentie';
		$knop->attr = 'data-efiber-situatie-keuze="klein-huishouden"';
		$knop->tekst = $situatie_teksten['1-2_persoons_huishouden'];
		$knop->tooltip = $situatie_teksten['1-2_persoons_huishouden_tooltip'];
		$knop->link = '#5';
		$knop->geen_ikoon = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 1");
		$kies_situatie_knoppen .= $knop->maak();

		$knop->attr = 'data-efiber-situatie-keuze="gezin"';
		$knop->tekst = $situatie_teksten['gezin'];
		$knop->tooltip = $situatie_teksten['gezin_tooltip'];
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 2");
		$kies_situatie_knoppen .= $knop->maak();

		$knop->attr = '';
		$knop->func = 'toon-stap animeer';
		$knop->link = '#4';
		$knop->tekst = $situatie_teksten['klein_zakelijk'];
		$knop->tooltip = $situatie_teksten['klein_zakelijk_tooltip'];
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 3");
		$kies_situatie_knoppen .= $knop->maak();

		$knop->attr = 'data-efiber-situatie-keuze="bedrijf"';
		$knop->func = 'toon-stap animeer haal-zakelijk-formulier';
		$knop->link = '#50';
		$knop->tekst = $situatie_teksten['bedrijf'];
		$knop->tooltip = $situatie_teksten['bedrijf_tooltip'];
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 4");
		$kies_situatie_knoppen .= $knop->maak();

		$kies_situatie = new EfiberSectie(array(
			'stap'			=> 3,
			'titel'			=> $situatie_teksten['titel'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("huishouden titel"),
			'torso_intro'	=> $situatie_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_situatie_knoppen</div>",
		));

		$kies_situatie->print();

		/////////////////////////////////////////////////

		$bedrijf_of_zakelijk_teksten = get_field('bedrijf_of_zakelijk', 'option');

		$kies_klein_zakelijk_knoppen = '';
		$knop->attr = 'data-efiber-situatie-keuze="klein-zakelijk"';
		$knop->func = 'animeer zet-niveau-knop zet-situatie toon-stap zet-nummers-consequentie';
		$knop->link = '#5';
		$knop->tekst = $bedrijf_of_zakelijk_teksten['nee'];
		$knop->tooltip = $bedrijf_of_zakelijk_teksten['nee_tooltip'];
		$knop->geen_ikoon = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 3");
		$kies_klein_zakelijk_knoppen .= $knop->maak();

		$knop->attr = 'data-efiber-situatie-keuze="bedrijf"';
		$knop->func = 'toon-stap animeer haal-zakelijk-formulier';
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 4");
		$knop->tooltip = $bedrijf_of_zakelijk_teksten['ja_tooltip'];
		$knop->link = '#50';
		$knop->tekst = $bedrijf_of_zakelijk_teksten['ja'];
		$kies_klein_zakelijk_knoppen .= $knop->maak();

		$kies_klein_zakelijk = new EfiberSectie(array(
			'stap'			=> 4,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("huishouden titel"),
			'titel'			=> $bedrijf_of_zakelijk_teksten['titel'],
			'torso_intro'	=> $bedrijf_of_zakelijk_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_klein_zakelijk_knoppen</div>",
		));

		$kies_klein_zakelijk->print();

		/////////////////////////////////////////////////

		$kies_internet_teksten = get_field('internet_teksten', 'option');

		$kies_internet_knoppen = '';
		$knop->tekst = $kies_internet_teksten['beetje_browsen_en_emailen'];
		$knop->tooltip = $kies_internet_teksten['beetje_browsen_en_emailen_tooltip'];
		$knop->func = 'animeer zet-niveau-knop toon-stap zet-keuze-internet';
		$knop->link = '#6';
		$knop->attr = 'data-efiber-internet-keuze="1"';
		$knop->geen_ikoon = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet 1");
		$kies_internet_knoppen .= $knop->maak();

		$knop->tekst = $kies_internet_teksten['browsen_emailen_social_media_en_netflix_of_spotify'];
		$knop->tooltip = $kies_internet_teksten['browsen_emailen_social_media_en_netflix_of_spotify_tooltip'];
		$knop->attr  = 'data-efiber-internet-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet 2");
		$kies_internet_knoppen .= $knop->maak();

		$knop->tekst = $kies_internet_teksten['browsen_mailen_gamen_netflix_spotify_backup-up_in_de_cloud'];
		$knop->tooltip = $kies_internet_teksten['browsen_mailen_gamen_netflix_spotify_backup-up_in_de_cloud_tooltip'];
		$knop->attr  = 'data-efiber-internet-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet 3");
		$kies_internet_knoppen .= $knop->maak();

		$knop->tekst = $kies_internet_teksten['browsen_mail_en_werken_in_de_cloud'];
		$knop->tooltip = $kies_internet_teksten['browsen_mail_en_werken_in_de_cloud_tooltip'];
		$knop->attr  = 'data-efiber-internet-keuze="4"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet 4");
		$kies_internet_knoppen .= $knop->maak();

		$kies_internet = new EfiberSectie(array(
			'stap'			=> 5,
			'titel'			=> $kies_internet_teksten['titel'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("internet titel"),
			'torso_intro'	=> $kies_internet_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_internet_knoppen</div>",
		));

		$kies_internet->print();

		/////////////////////////////////////////////////

		$kies_bellen_teksten = get_field('bellen_teksten', 'option');

		$kies_bellen_knoppen = '';
		$knop->tekst = $kies_bellen_teksten['ik_bel_alleen_mobiel'];
		$knop->tooltip = $kies_bellen_teksten['ik_bel_alleen_mobiel_tooltip'];
		$knop->func = 'animeer zet-niveau-knop zet-keuze-bellen toon-stap';
		$knop->link = '#8';
		$knop->attr = 'data-efiber-bellen-keuze="1"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("bellen 1");
		$kies_bellen_knoppen .= $knop->maak();

		$knop->tekst = $kies_bellen_teksten['ik_bel_niet_veel_maar_wil_wel_een_vast_nummer'];
		$knop->tooltip = $kies_bellen_teksten['ik_bel_niet_veel_maar_wil_wel_een_vast_nummer_tooltip'];
		$knop->attr  = 'data-efiber-bellen-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("bellen 2");
		$kies_bellen_knoppen .= $knop->maak();

		$knop->tekst = $kies_bellen_teksten['ik_bel_vaak_met_de_vaste_lijn'];
		$knop->tooltip = $kies_bellen_teksten['ik_bel_vaak_met_de_vaste_lijn_tooltip'];
		$knop->link = '#7';
		$knop->attr  = 'data-efiber-bellen-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("bellen 3");
		$kies_bellen_knoppen .= $knop->maak();

		$kies_bellen = new EfiberSectie(array(
			'stap'			=> 6,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("bellen titel"),
			'titel'			=> $kies_bellen_teksten['titel'],
			'torso_intro'	=> $kies_bellen_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_bellen_knoppen</div>",
		));

		$kies_bellen->print();

		/////////////////////////////////////////////////

		$kies_nummers_teksten = get_field('nummers_teksten', 'option');

		$kies_nummers_knoppen = '';
		$knop->class= 'multiselect';
		$knop->tekst = $kies_nummers_teksten['ik_heb_meerdere_telefoonnummers_nodig'];
		$knop->tooltip = $kies_nummers_teksten['ik_heb_meerdere_telefoonnummers_nodig_tooltip'];
		$knop->func = 'animeer zet-niveau-knop zet-keuze-nummers';
		$knop->link = '';
		$knop->attr = 'data-efiber-nummers-keuze="1"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("nummer 1");
		$kies_nummers_knoppen .= $knop->maak();

		$knop->tekst = $kies_nummers_teksten['ik_bel_veel_naar_vaste_nummers_in_het_buitenland'];
		$knop->tooltip = $kies_nummers_teksten['ik_bel_veel_naar_vaste_nummers_in_het_buitenland_tooltip'];
		$knop->attr  = 'data-efiber-nummers-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("nummer 2");
		$kies_nummers_knoppen .= $knop->maak();

		$kies_nummers = new EfiberSectie(array(
			'stap'			=> 7,
			'titel'			=> $kies_nummers_teksten['titel'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("nummer titel"),
			'torso_intro'	=> $kies_nummers_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_nummers_knoppen</div>",
			//'footer_inh'	=> 	"<div class='knoppendoos'>$kies_nummers_footer_knoppen</div>",
		));

		$kies_nummers->print();

		/////////////////////////////////////////////////

		$televisie_teksten = get_field('televisie_teksten', 'option');

		$kies_televisie_knoppen = '';
		$knop->geen_ikoon = false;
		$knop->func = 'animeer zet-niveau-knop toon-stap zet-keuze-televisie';
		$knop->class = 'blauwe-knop';


		$knop->tekst = $televisie_teksten['geen_tv'];
		$knop->tooltip = $televisie_teksten['geen_tv_tooltip'];
		$knop->attr  = 'data-efiber-televisie-keuze="5"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie 5");
		$knop->link = '#11';
		$kies_televisie_knoppen .= $knop->maak();

		$knop->tekst = $televisie_teksten['geen_poespas'];
		$knop->tooltip = $televisie_teksten['geen_poespas_tooltip'];
		$knop->link = '#9';
		$knop->attr  = 'data-efiber-televisie-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie 2");
		$kies_televisie_knoppen .= $knop->maak();

		$knop->tekst = $televisie_teksten['interactief_tv'];
		$knop->tooltip = $televisie_teksten['interactief_tv_tooltip'];
		$knop->attr  = 'data-efiber-televisie-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie 3");
		$kies_televisie_knoppen .= $knop->maak();

		$knop->tekst = $televisie_teksten['alleen_netflix'];
		$knop->tooltip = $televisie_teksten['alleen_netflix_tooltip'];
		$knop->link = '#11';
		$knop->attr = 'data-efiber-televisie-keuze="1"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie 1");
		$kies_televisie_knoppen .= $knop->maak();

		$knop->tekst = $televisie_teksten['tevreden'];
		$knop->tooltip = $televisie_teksten['tevreden_tooltip'];
		$knop->attr  = 'data-efiber-televisie-keuze="4"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie 4");
		$kies_televisie_knoppen .= $knop->maak();


		$kies_televisie = new EfiberSectie(array(
			'stap'			=> 8,
			'titel'			=> $televisie_teksten['titel'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("televisie titel"),
			'torso_intro'	=> $televisie_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_televisie_knoppen</div>",
		));

		$kies_televisie->print();

		/////////////////////////////////////////////////

		$kies_televisie_opties_knoppen = '';

		$televisie_opties_teksten = get_field('televisie_opties_teksten', 'option');

		$knop->class = 'multiselect';
		$knop->link = '#';
		$knop->func = 'animeer zet-niveau-knop zet-keuze-televisie-opties';

		$knop->tekst = $televisie_opties_teksten['nederlands_voetbal'];
		$knop->tooltip = $televisie_opties_teksten['nederlands_voetbal_tooltip'];
		$knop->attr = 'data-efiber-televisie-opties-keuze="1"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 1");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$knop->tekst = $televisie_opties_teksten['onbeperkt_films'];
		$knop->tooltip = $televisie_opties_teksten['onbeperkt_films_tooltip'];
		$knop->attr  = 'data-efiber-televisie-opties-keuze="5"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 5");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$knop->tekst = $televisie_opties_teksten['meerdere_tvs'];
		$knop->tooltip = $televisie_opties_teksten['meerdere_tvs_tooltip'];
		$knop->attr  = 'data-efiber-televisie-opties-keuze="6"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 6");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$knop->tekst = $televisie_opties_teksten['amerikaanse_sporten_en_duits_voetbal'];
		$knop->tooltip = $televisie_opties_teksten['amerikaanse_sporten_en_duits_voetbal_tooltip'];
		$knop->attr  = 'data-efiber-televisie-opties-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 3");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$knop->tekst = $televisie_opties_teksten['formule1_golf_enof_buitenlandse_voetbalcompetities'];
		$knop->tooltip = $televisie_opties_teksten['formule1_golf_enof_buitenlandse_voetbalcompetities_tooltip'];
		$knop->attr  = 'data-efiber-televisie-opties-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 2");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$knop->tekst = $televisie_opties_teksten['extra_veel_zenders'];
		$knop->tooltip = $televisie_opties_teksten['extra_veel_zenders_tooltip'];
		$knop->attr  = 'data-efiber-televisie-opties-keuze="4"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("televisie opties 4");
		$kies_televisie_opties_knoppen .= $knop->maak();

		$kies_televisie_opties = new EfiberSectie(array(
			'stap'			=> 9,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("televisie opties titel"),
			'titel'			=> $televisie_opties_teksten['titel'],
			'torso_intro'	=> $televisie_opties_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_televisie_opties_knoppen</div>",
		));

		$kies_televisie_opties->print();

		/////////////////////////////////////////////////

		$kies_installatie_knoppen = '';

		$installatie_teksten = get_field('installatie_teksten', 'option');

		$knop->class = 'blauwe-knop';
		$knop->tekst = $installatie_teksten['ik_ben_handig'];
		$knop->tooltip = $installatie_teksten['ik_ben_handig_tooltip'];
		$knop->func = 'animeer zet-niveau-knop toon-stap zet-keuze-installatie vergelijking';
		$knop->link = '#30';
		$knop->attr = 'data-efiber-installatie-keuze="1"';
		$knop->geen_ikoon = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("installatie 1");
		$kies_installatie_knoppen .= $knop->maak();

		$knop->tekst = $installatie_teksten['even_de_boel_aansluit'];
		$knop->tooltip = $installatie_teksten['even_de_boel_aansluit_tooltip'];
		$knop->attr  = 'data-efiber-installatie-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("installatie 2");
		$kies_installatie_knoppen .= $knop->maak();

		$knop->tekst = $installatie_teksten['iemand_alles_installeert'];
		$knop->tooltip = $installatie_teksten['iemand_alles_installeert_tooltip'];
		$knop->attr  = 'data-efiber-installatie-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("installatie 3");
		$kies_installatie_knoppen .= $knop->maak();

		$kies_installatie = new EfiberSectie(array(
			'stap'			=> 11,
			'titel'			=> $installatie_teksten['titel'],
			'torso_intro'	=> $installatie_teksten['intro'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("installatie titel"),
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_installatie_knoppen</div>",
		));

		$kies_installatie->print();

		/////////////////////////////////////////////////

		$kies_pakket_knoppen = '';

		$iwwiw_teksten = get_field('ik_weet_wat_ik_wil_teksten', 'option');

		$knop->tekst = $iwwiw_teksten['alleen_internet'];
		$knop->tooltip = $iwwiw_teksten['alleen_internet_tooltip'];
		$knop->attr  = 'data-efiber-ik-weet-wat-ik-wil-keuze="1"';
		$knop->func = 'animeer zet-keuze-ik-weet-wat-ik-wil toon-stap laad-ik-weet-wat-ik-wil-pakketten';
		$knop->link = '#21';
		$knop->geen_ikoon = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet 1");
		$kies_pakket_knoppen .= $knop->maak();

		$knop->tekst = $iwwiw_teksten['internet_en_bellen'];
		$knop->tooltip = $iwwiw_teksten['internet_en_bellen_tooltip'];
		$knop->attr  = 'data-efiber-ik-weet-wat-ik-wil-keuze="2"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet-en-bellen");
		$kies_pakket_knoppen .= $knop->maak();

		$knop->tekst = $iwwiw_teksten['internet_en_tv'];
		$knop->tooltip = $iwwiw_teksten['internet_en_tv_tooltip'];
		$knop->attr  = 'data-efiber-ik-weet-wat-ik-wil-keuze="3"';
		$knop->ikoon = efiber_keuzehulp_pak_afb("internet-en-tv");
		$kies_pakket_knoppen .= $knop->maak();

		$knop->tekst = $iwwiw_teksten['alles_in_1'];
		$knop->tooltip = $iwwiw_teksten['alles_in_1_tooltip'];
		$knop->ikoon = efiber_keuzehulp_pak_afb("alles-in-1");
		$knop->attr  = 'data-efiber-ik-weet-wat-ik-wil-keuze="4"';
		$kies_pakket_knoppen .= $knop->maak();

		$knop->tekst = $iwwiw_teksten['zakelijk'];
		$knop->tooltip = $iwwiw_teksten['zakelijk_tooltip'];
		$knop->func = 'toon-stap haal-zakelijk-formulier';
		$knop->link = '#50';
		$knop->attr = false;
		$knop->ikoon = efiber_keuzehulp_pak_afb("huishouden 5");
		$kies_pakket_knoppen .= $knop->maak();

		$kies_pakket = new EfiberSectie(array(
			'stap'			=> 20,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("pakketten vinkje titel"),
			'titel'			=> $iwwiw_teksten['titel'],
			'torso_intro'	=> $iwwiw_teksten['intro'],
			'torso_direct'	=> 	"<div class='knoppendoos'>$kies_pakket_knoppen</div>",

		));

		$kies_pakket->print();

		/////////////////////////////////////////////////

		$provider_pakketten_teksten = get_field('provider_pakketten', 'option');

		$print_provider_pakketten = new EfiberSectie(array(
			'stap'			=> 21,
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("pakketten vinkje titel"),
			'titel'			=> $provider_pakketten_teksten['titel'],
			'torso_intro'	=> $provider_pakketten_teksten['intro'],
			'torso_direct'	=> 	"<div class='print-provider-pakketten' id='print-provider-pakketten'></div>",
		));

		$print_provider_pakketten->print();

		/////////////////////////////////////////////////

		$vergelijking_teksten = get_field('vergelijking_teksten', 'option');

		$disclaimer = "<div id='vergelijking-disclaimer'>" . apply_filters("the_content", $vergelijking_teksten['disclaimer']) .  "</div>";

		$print_vergelijking = new EfiberSectie(array(
			'stap'			=> 30,
			'titel'			=> $vergelijking_teksten['titel'],
			//'titel_afb'		=> efiber_keuzehulp_pak_afb("pakketten vinkje titel"),
			'torso_intro'	=> $vergelijking_teksten['intro'],
			'torso_direct'	=> 	"<div class='print-vergelijking' id='print-vergelijking'></div>$disclaimer",
		));

		$print_vergelijking->print();

		/////////////////////////////////////////////////

		$zakelijk_formulier_teksten = get_field('zakelijk_formulier_teksten', 'option');

		$contactformulier_zakelijk = new EfiberSectie(array(
			'stap'			=> 50,
			'titel'			=> $zakelijk_formulier_teksten['titel'],
			'torso_intro'	=> $zakelijk_formulier_teksten['intro'],
			'torso_direct'	=> "<div class='print-zakelijk-formulier' id='print-zakelijk-formulier'></div>",
		));

		$contactformulier_zakelijk->print();

		/////////////////////////////////////////////////

		$lead_formulier_teksten = get_field('lead_formulier_teksten', 'option');

		$contactformulier_lead = new EfiberSectie(array(
			'stap'			=> 51,
			'titel'			=> $lead_formulier_teksten['titel'],
			'torso_intro'	=> $lead_formulier_teksten['intro'],
			'torso_direct'	=> "<div class='print-lead-formulier' id='print-lead-formulier'></div>",
		));

		$contactformulier_lead->print();

		/////////////////////////////////////////////////

		$aanmeld_formulier_teksten = get_field('aanmeld_formulier_teksten', 'option');

		$aanmeldformulier = new EfiberSectie(array(
			'stap'			=> 100,
			'titel'			=> $aanmeld_formulier_teksten['titel'],
			'torso_intro'	=> $aanmeld_formulier_teksten['intro'],
			'torso_direct'	=> "<div class='print-aanmeldformulier' id='print-aanmeldformulier'></div>",
		));

		$aanmeldformulier->print();

		require "navigatie-beneden.php";

	?>

</div></div><!-- verpakkign en keuzehulp -->

<?php require 'footer.php'; ?>

