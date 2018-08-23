<?php
function efiber_pakket_eigenschappen_snelheid_prijs_concreet($snelheid_prijs, $gc_id){


	/*---------------------------------------------------------
	|
	|	maakt snelheden-prijs combinaties 'concreet', toegepast op deze regio.
	|
	-----------------------------------------------------------*/


	//maak array met waarden zonder gebiedscode.
	$werk = array();

	foreach ($snelheid_prijs as $s) {
		if (!$s['regio_specifiek']) $werk[($s['snelheid'])] = (float) $s['prijs'];
	}

	// nu waarden uit werk overschrijven met waarden die regiospecifiek zijn, als dit de huidige gc_id heeft.
	foreach ($snelheid_prijs as $s) {
		if ($s['regio_specifiek'] and in_array($gc_id, $s['regio_specifiek'])) {
			$werk[($s['snelheid'])] = (float) $s['prijs'];
		}
	}

	return $werk;

}

function efiber_pakket_eigenschappen_basis_eenmalig_concreet($eenmalig, $gc_id){


	/*---------------------------------------------------------
	|
	|	maakt basis eenmalige prijs 'concreet', toegepast op deze regio.
	|
	-----------------------------------------------------------*/


	// vind waarde zonder gebiedscode
	// aanname: niet meer dan één regioloze eenmalige prijs opgegeven.
	$werk = 0;

	foreach ($eenmalig as $e) {
		if (!$e['regio_specifiek']) $werk = (float) $e['prijs'];
	}

	// nu waarde uit werk overschrijven met waarden die regiospecifiek zijn, als dit de huidige gc_id heeft.
	foreach ($eenmalig as $e) {
		if ($e['regio_specifiek'] and in_array($gc_id, $e['regio_specifiek'])) {
			$werk = (float) $e['prijs'];
		}
	}

	return $werk;

}

function efiber_telefonie_bundels($slug = ''){
	return get_posts(array(
		'posts_per_page'	=> -1,
		'post_type'			=> 'telefonie-bundel',
		'tax_query'	=> array(
			array(
				'taxonomy' => 'provider',
				'field' => 'slug',
				'terms' => $slug,
			),
		)
	));
}

function efiber_televisie_bundels($provider_naam = '') {
	$bundels =  get_posts(array(
		'posts_per_page'	=> -1,
		'post_type'			=> 'tv-bundel',
		'tax_query'	=> array(
			array(
				'taxonomy' => 'provider',
				'field' => 'slug',
				'terms' => $provider_naam,
			),
		)
	));

	foreach ($bundels as $b) {
		$b->pakketten = get_field('pakketten', $b->ID);
		$b->snelheid = get_field('snelheid', $b->ID);
		$b->tekst = get_field('tekst', $b->ID);
	}

	return $bundels;
}

class Kz_optie {

	function __construct($params){

		// maakt een object met adhv $params. Zet params eigenlijk om in een object, 
		// indien sleutels niet voorkomen, wordt terugval gebruikt.

		$tv = array(
			'aantal'		=> 0,
			'prijs'			=> null,
			'optietype' 	=> null,
			'suboptietype'  => null,
			'snelheid'		=> null,
			'naam'			=> ''
		);

		foreach ($tv as $s => $w) {
			$this->$s = array_key_exists($s, $params) 
				? $params[$s] 
				: $w;
		}

	}
}

function efiber_pakket_eigenschappen($p, $gc = '')  {


	/*---------------------------------------------------------
	|
	|	pakket bewerken zodat het regioconcrete informatie bevat
	| 	klaar is om te rekenen
	|
	-----------------------------------------------------------*/

	{
		$gebiedscode_data = get_term_by( 'slug', $gc, 'regio');
		$gebiedscode_id = $gebiedscode_data->term_id;

		$provider_tax_data = wp_get_post_terms($p->ID, 'provider');
		if (!count($provider_tax_data)) return false;
		$provider_post = get_page_by_title($provider_tax_data[0]->name, 'object', 'provider' );

		$financieel = get_field('financieel', $p->ID);

		$teksten = get_field('teksten', $p->ID);

		$extra_optie = get_field('extra_optie', $p->ID);

		$extra_telefoon = get_field('extra_telefoon', $provider_post->ID);

		$pakket_type = array_map(function($verz){ return $verz->name; }, wp_get_post_terms($p->ID, 'type'));

		$return = array(
			'pakket_type' => $pakket_type,
			'eenmalig' => array(),
			'maandelijks' => array(),
		);
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// TEKSTEN

	{
		$return['teksten'] = $teksten;
		$return['teksten']['extra-vast-nummer'] = $extra_telefoon['tekst'];
		$prov_teksten = get_field('teksten', $provider_post->ID);
		$return['teksten'] = array_merge($return['teksten'], $prov_teksten);
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// SNELHEDEN

	// bewerkte, per regio geconcretiseerde verzameling.
	{
		$snelheid_prijs_concreet = efiber_pakket_eigenschappen_snelheid_prijs_concreet(
			$financieel['snelheid-prijs'],
			$gebiedscode_id
		);

		// lijst met snelheden.
		$snelheden = array_keys($snelheid_prijs_concreet);

		// sorteer oplopend
		sort($snelheden);

		// origineel weggooien.
		unset($financieel['snelheid-prijs']);

		//$return['snelheid_prijs']		= $snelheid_prijs_concreet;
		$return['snelheden']			= $snelheden;
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// EENMALIGE KOSTEN BASIS

	{

		$return['eenmalig']['basis'] = new Kz_optie(array(
			'naam'		=> 'basis',
			'aantal'	=> 1,
			'prijs'		=> efiber_pakket_eigenschappen_basis_eenmalig_concreet(
				$financieel['eenmalig'],
				$gebiedscode_id
			)
		));

		$return['eenmalig']['borg'] = new Kz_optie(array(
			'naam'		=> 'borg',
			'aantal'	=> 1,
			'prijs'		=> (float) $financieel['borg'],
		));
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// MAANDELIJKSE KOSTEN BASIS

	foreach ($snelheid_prijs_concreet as $snelheid => $prijs) {
		$return['maandelijks']['snelheid-'.$snelheid] = new Kz_optie(array(
			'naam'			=> $snelheid . "Mb/s",
			'snelheid'		=> $snelheid,
			'optietype' 	=> 'basis',
			'aantal'		=> 0,
			'prijs'			=> $prijs
		));
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// PROVIDER META

	{
		$return['provider_meta'] = get_field('eigenschappen', $provider_post->ID);
		$return['provider_meta']['naam'] = $provider_post->post_title;
		$return['provider_meta']['thumb'] = get_the_post_thumbnail($provider_post->ID);
	}

	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// TELEFONIE

	{
		$prijs = (float) $extra_telefoon['prijs'];
		$return['maandelijks']['extra-vast-nummer'] = new Kz_optie(array(
			'naam'		=> 'extra vast nummer',
			'optietype' => 'telefonie-extra',
			'aantal'	=> $prijs < 0.01 ? 1 : 0,
			'prijs'		=> $prijs
		));

		$telefonie_bundel_posts = efiber_telefonie_bundels($provider_tax_data[0]->slug);

		$telefonie_bundels = array();

		foreach ($telefonie_bundel_posts as $tpb) {

			$tarieven_teksten = get_field('tarieven', $tpb->ID);

			$bundel_tax_data = wp_get_post_terms($tpb->ID, 'bereik');

			$slug = slugify($tpb->post_title);
			$bereik = $bundel_tax_data[0]->slug;

			if (!array_key_exists($bereik, $telefonie_bundels)) {
				$telefonie_bundels[$bereik] = array();
			}

			$telefonie_bundels[$bereik][] = array(
				'naam'			=> $tpb->post_title,
				'slug'			=> $slug,
				'tarieven'		=> $tarieven_teksten,
				'bereik'		=> $bereik
			);

			$return['maandelijks'][$slug] = new Kz_optie(array(
				'naam'			=> $slug,
				'optietype' 	=> 'telefonie-bundel',
				'suboptietype'  => $bereik,
				'aantal'		=> 0,
				'prijs'			=> (float) $tarieven_teksten['maandbedrag']['prijs'],
			));

			$return['teksten'][$tpb->post_title] = get_field('tekst', $tpb->ID);
			$return['teksten'][$tpb->post_title.'-maandbedrag'] = $tarieven_teksten['maandbedrag']['tekst'];
			$return['teksten'][$tpb->post_title.'-starttarief'] = $tarieven_teksten['starttarief']['tekst'];
			$return['teksten'][$tpb->post_title.'-vast_nl'] = $tarieven_teksten['vast_nl']['tekst'];
			$return['teksten'][$tpb->post_title.'-mobiel_nl'] = $tarieven_teksten['mobiel_nl']['tekst'];

		}

		$return['telefonie_bundels'] = $telefonie_bundels;
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// TELEVISIE
	{
		$zenders = get_field('zenders', $p->ID);
		$zender_uitzonderingen = get_field('zender_uitzonderingen', $p->ID);
		$nonlineair = get_field('nonlineair', $p->ID);
		$extra_tv_ontvanger = get_field('extra_tv_ontvanger', $p->ID);
		$dvb_c = get_field('dvb-c', $p->ID);

		//voorbewerken zenderuitzonderingen
		$zo_verz = array();
		foreach ($zender_uitzonderingen as $zo) {
			$zo_verz[(string)($zo['snelheid'])] = $zo['uitzondering_zenders'];
		}

		foreach ($snelheden as $s){

			$ss = (string) $s;

			// uitzondering bekend? dan uitzonderingen halen. Anders uit standaard halen.

			if (array_key_exists($ss, $zo_verz)) {

				$return['zenders-'.$ss] = array(
					'totaal'	=> $zo_verz[$ss]['totaal'],
					'hd'		=> $zo_verz[$ss]['hd']
				);
				$return['teksten']['zenders-'.$ss.'-totaal'] = $zo_verz[$ss]['totaal_tekst'];
				$return['teksten']['hd-'.$ss.'-totaal'] = $zo_verz[$ss]['hd_tekst'];

			} else {
				$return['zenders-'.$ss] = array(
					'totaal'	=> $zenders['totaal'],
					'hd'		=> $zenders['hd']
				);
				$return['teksten']['zenders-'.$ss.'-totaal'] = $zenders['totaal_tekst'];
				$return['teksten']['hd-'.$ss.'-totaal'] = $zenders['hd_tekst'];
			}
		}


		$televisie_bundels = efiber_televisie_bundels($provider_post->post_name);

		// zijn de bundels voor specifieke snelheden?
		// dat is zo als er meer dan één bundel is.
		// we zetten het voor alle snelheden er in.

		if (count($televisie_bundels) > 1) {
			foreach ($televisie_bundels as $tv_bundel) {
				foreach ($tv_bundel->pakketten as $pakketgroep) {
					foreach ($pakketgroep['opties'] as $optie) {
						$str = $pakketgroep['pakket_naam'] . '-' . $optie['publieke_naam'] . '-' . $tv_bundel->snelheid;
						$prijs = (float) $optie['prijs'];

						$slugje = slugify($str);

						$return['maandelijks'][($slugje)] = new Kz_optie(array(
							'naam'			=> $optie['publieke_naam'],
							'optietype' 	=> 'televisie-bundel',
							'suboptietype'	=> $pakketgroep['pakket_naam'],
							'snelheid'		=> $tv_bundel->snelheid,
							'aantal' 		=> $prijs < 0.01 ? 1 : 0, //gratis bundels staan aan!
							'prijs' 		=> $prijs
						));

						$return['teksten'][$str] = $optie['tekst'];
					}
				}
			}
		} else {
			foreach ($televisie_bundels[0]->pakketten as $pakketgroep) {
				foreach ($pakketgroep['opties'] as $optie) {
					foreach ($snelheden as $snelheid) {
						$str = $pakketgroep['pakket_naam'] . '-' . $optie['publieke_naam'] . '-' . $snelheid;
						$prijs = (float) $optie['prijs'];

						$return['maandelijks'][slugify($str)] = new Kz_optie(array(
							'naam'			=> $optie['publieke_naam'],
							'optietype' 	=> 'televisie-bundel',
							'suboptietype'	=> $pakketgroep['pakket_naam'],
							'snelheid'		=> $snelheid,							
							'aantal' 		=> $prijs < 0.01 ? 1 : 0,
							'prijs' 		=> $prijs
						));

						$return['teksten'][$str] = $optie['tekst'];
					}
				}
			}
		}


		if ($nonlineair['heeft_non_lineair']) :

			$return['teksten'] = array_merge($return['teksten'], $nonlineair['teksten']);

			if ($nonlineair['opnemen_replay_begin_gemist_samen']) {
				$prijs = (float) $nonlineair['opnemen_replay_begin_gemist_samen_prijs'];
				$return['maandelijks']['opnemen-replay-begin-gemist-samen'] = new Kz_optie(array(
					'naam'			=> "opnemen, terugkijken & begin gemist",
					'optietype' 	=> 'televisie-extra',
					'suboptietype'	=> 'nonlineair', 
					'aantal' 		=> $prijs < 0.01 ? 1 : 0,
					'prijs'			=> $prijs
				));
			} else {

				$nl = array('opnemen', 'replay', 'begin_gemist');
				foreach ($nl as $n) {
					if ($nonlineair[$n] || $nonlineair[$n] == 0) {
						$prijs = (float) $nonlineair[$n];
						$return['maandelijks'][slugify($n)] = new Kz_optie(array(
							'naam'			=> slugify($n),
							'optietype' 	=> 'televisie-extra',
							'suboptietype'	=> 'nonlineair', 							
							'aantal' 		=> $prijs < 0.01 ? 1 : 0,
							'prijs'	 		=> $prijs
						));
					} 
				}
				$return['nonlineair'] = $nonlineair;

			}

			if ($nonlineair['app_beschikbaar']) {
				$prijs = (float) $nonlineair['app_prijs'];
				$return['maandelijks']['app'] = new Kz_optie(array(
					'naam'			=> 'app',
					'optietype' 	=> 'televisie-extra',
					'suboptietype'	=> 'nonlineair', 							
					'aantal' 		=> $prijs < 0.01 ? 1 : 0,
					'prijs' 		=> $prijs
				));
			}

		endif; // heeft non-lineair

		$return['teksten']['extra-tv-ontvangers'] = $extra_tv_ontvanger['tekst'];

		//
		if (   $extra_tv_ontvanger['eenmalig'] != 0 ) {
			$prijs = (float) $extra_tv_ontvanger['eenmalig'];
			$return['eenmalig']['extra-tv-ontvangers'] = new Kz_optie(array(
				'naam'			=> 'extra TV ontvanger',
				'optietype'		=> 'televisie-extra', 
				'aantal' 		=> $prijs < 0.01 ? 1 : 0,
				'prijs'  		=> $prijs
			));
		}

		if ( $extra_tv_ontvanger['maandelijks'] != 0 ) {
			$prijs = (float) $extra_tv_ontvanger['maandelijks'];
			$return['maandelijks']['extra-tv-ontvangers'] = new Kz_optie(array(
				'naam'			=> 'extra TV ontvanger',
				'optietype'		=> 'televisie-extra', 				
				'aantal' 		=> $prijs < 0.01 ? 1 : 0,
				'prijs'  		=> $prijs,
			));
		}

		if ($dvb_c and $dvb_c['kan_dvb-c_doen']) {

			$return['teksten']['dvb-c'] = $dvb_c['tekst'];

			if (   $dvb_c['dvb-c_eenmalig'] != 0 ) {
				$return['eenmalig']['dvb-c-eenmalig'] = new Kz_optie(array(
					'naam'			=> 'dvb-c',
					'optietype'		=> 'televisie-extra',
					'aantal' 		=> 0,
					'prijs'  		=> (float) $dvb_c['dvb-c_eenmalig'],
				));
			}

			if (  $dvb_c['dvb-c_maandelijks'] != 0 ) {
				$return['maandelijks']['dvb-c-maandelijks'] = new Kz_optie(array(
					'naam'			=> 'dvb-c',
					'optietype'		=> 'televisie-extra',					
					'aantal' 		=> 0,
					'prijs'  		=> (float) $dvb_c['dvb-c_maandelijks'],
				));
			}

		}


		$return['tv_type'] = wp_get_post_terms($p->ID, 'tv-type')[0]->name;

	}



	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////

	// EXTRA OPTIE

	if ($extra_optie['heeft_extra_optie']) {

		$return['teksten']['extra_optie_naam'] = $extra_optie['extra_optie_naam'];

		if (!!$extra_optie['extra_optie_eenmalig']) {
			$return['eenmalig']['extra-optie'] = new Kz_optie(array(
				'naam'		=> 'extra_optie',
				'optietype'	=> 'diversen',
				'aantal'	=> 0,
				'prijs'		=> (float) $extra_optie['extra_optie_eenmalig'],
			));
		}

		if (!!$extra_optie['extra_optie_maandelijks']) {
			$return['maandelijks']['extra-optie'] = new Kz_optie(array(
				'naam'		=> 'extra_optie',
				'optietype'	=> 'diversen',				
				'aantal'	=> 0,
				'prijs'		=> (float) $extra_optie['extra_optie_maandelijks'],
			));
		}

	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// INSTALLATIE

	$installatie = get_field('installatie', $provider_post->ID);
	foreach ($installatie as $i) {
		$return['eenmalig']['installatie-'.strtolower($i['naam'])] = new Kz_optie(array(
			'naam'		=> $i['naam'],
			'optietype'	=> 'installatie',
			'aantal' 	=> 0,
			'prijs'		=> (float) $i['prijs'],
		));
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// SNELHEID

	$return['huidige_snelheid'] = '';

	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////

	// RETURN

	return $return;

}

function getdb(){


	/*---------------------------------------------------------
	|
	|	Hulpfunctie die databaseverbinding opent op basis van WP constanten
	|
	-----------------------------------------------------------*/

	// @TODO waardeloze naam

    try {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    } catch(exception $e) {
    	return false;
    }

    return $conn;
}

function efiber_form_sectie ($titel = '', $inh = '') {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$header = "";

	//tbv stijling
	$slak = strtolower(preg_replace("/[^A-Za-z0-9 ]/", '', $titel));

	if ($titel !== '') {
		$header = "<header class='efiber-form-sectie-header'>
				<h3>$titel</h3>
			</header>";
	}

	return "
		<section class='efiber-form-sectie $slak'>
			$header
			<div class='efiber-form-sectie-torso'>
				$inh
			</div>
		</section>
	";
}


function efiber_form_rij ($veld1, $veld2, $extra_klasse = '') {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$e = explode('<', $veld1);

	//tbv stijling
	$klasse = strtolower(str_replace(' ', '-', preg_replace("/[^A-Za-z0-9 ]/", '', $e[0])));

	return "<div class='rij $klasse $extra_klasse'>
		<div class='veld veld-1'>
			$veld1
		</div>
		<div class='veld veld-2'>
			$veld2
		</div>
	</div>";
}

function efiber_input ($params = array()) {


	/*---------------------------------------------------------
	|
	|	Lucas 16:10-13
	| 	Functie die tekst, nummer, (nep)-radio en checkboxes uitdraait
	|	zonder idee vooraf gemaakt DUS extreem rommelig
	|
	-----------------------------------------------------------*/

	// @TODO scheiden in radio/nepradio/checkbox en nummer/tekst functie. Dit is té

	// initialisatie
	$terugval = array(
		'naam'		=> '',
		'waarde'	=> '',
		'value'		=> false,
		'label'		=> '',
		'func'		=> false,
		'type'		=> 'checkbox',
		'eclass'	=> '',
		'label'		=> '',
	);
	foreach ($terugval as $s => $w) {
		if (!(array_key_exists($s, $params))) {
			$params[$s] = $terugval[$s];
		}
	}

	$naam = $params['naam']; 		// de name
	$waarde = $params['waarde']; 	// de prijs
	$value = $params['value']; 		// het aantal
	$label = $params['label'];		// label, bv SVGs
	$func = $params['func'];		// welke dispatcher-functie aangeroepenen worden op klik
	$type = $params['type'];		// text, number, etc
	$class = !!$value ? 'actief' : ''; // checked unchecked
	$eclass = $params['eclass'];	// zoals hidden

	$tekst = $waarde !== '' ? efiber_maak_geld_op($waarde) : '';

	$v = ($value ? " value='$value' " : "");
	$f = ($func ? "data-efiber-func='$func'" : "");

	$id = slugify($naam);

	if (!in_array($type, array('radio', 'checkbox'))) {

		$label_html = $type !== 'hidden'? "<label
				for='$id'>
				$tekst
			</label>" : '';

		return "
			<input
				class='knop $eclass'
				type='$type'
				name='$naam'
				id='$id'
				data-efiber-waarde='$waarde'
				data-efiber-vorige-value='$value'
				data-efiber-value='$value'
				data-efiber-func='update-hidden $func'
				$v
				$f
			>
			$label_html
			";

	} else {
		return "
			<div
				class='efiber-$type $class $eclass knop'
				id='$id'
				data-efiber-func='aanmelding-schakel update-hidden $func'
				data-efiber-waarde='$waarde'
				data-efiber-vorige-value='$value'
				data-efiber-value='$value'
				>
				<span class='tekst'>$tekst</span>
				<span class='label'>$label</span>
			</div>";
	}

}

function efiber_maak_geld_op($euros = '') {


	/*---------------------------------------------------------
	|
	| 	Veranderd getallen in €4,95 format
	|
	-----------------------------------------------------------*/


	$euros = number_format ( $euros, 2 );
	$euros = str_replace('.', ',', $euros);
	return "&euro;$euros";

}