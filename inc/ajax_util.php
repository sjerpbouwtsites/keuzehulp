<?php
function keuzehulp_pakket_eigenschappen_snelheid_prijs_concreet($snelheid_prijs, $gc_id){


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

function keuzehulp_pakket_eigenschappen_up_snelheid_concreet($snelheid_prijs, $gc_id){


	/*---------------------------------------------------------
	|
	|	maakt uploadsnelheden combinaties 'concreet', toegepast op deze regio.
	| 	als geen up bekend, dan is up down.
	| 	key: down; val: up
	|
	-----------------------------------------------------------*/

	//maak array met waarden zonder gebiedscode.
	$werk = array();

	foreach ($snelheid_prijs as $s) {
		if (!$s['regio_specifiek']) {
			if (array_key_exists('uploadsnelheid', $s)) {
				$werk[($s['snelheid'])] = $s['uploadsnelheid']
					? (float) $s['uploadsnelheid']
					: (float) $s['snelheid'];
			}
		}
	}

	// nu waarden uit werk overschrijven met waarden die regiospecifiek zijn, als dit de huidige gc_id heeft.
	foreach ($snelheid_prijs as $s) {
		if ($s['regio_specifiek'] and in_array($gc_id, $s['regio_specifiek'])) {
			if (array_key_exists('uploadsnelheid', $s)) {
				$werk[($s['snelheid'])] = $s['uploadsnelheid']
					? (float) $s['uploadsnelheid']
					: (float) $s['snelheid'];
			}
		}
	}

	return $werk;

}

function keuzehulp_pakket_eigenschappen_basis_eenmalig_concreet($eenmalig, $gc_id){


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

function keuzehulp_telefonie_bundels($slug = ''){
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

function keuzehulp_televisie_bundels($provider_naam = '') {
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

function keuzehulp_pakket_eigenschappen($p, $gc = '', $status = '100')  {


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
		//$provider_post = get_page_by_title($provider_tax_data[0]->name, 'object', 'provider' );

		//////////////////////////////////////

		$provider_query = get_posts(array(
			'posts_per_page' =>'1',
			'post_type' => 'provider',
			'tax_query' => array(
		 		array(
		  			'taxonomy' => 'provider',
					'field' => 'slug',
					'terms' => $provider_tax_data[0]->slug
		  		)
			)
		));

		if (!$provider_query || !count($provider_query)) {
			 trigger_error ('geen provider gevonden onder '.$provider_tax_data->slug );
		}

		$provider_post = $provider_query[0];


		////////////////////



		$financieel = get_field('financieel', $p->ID);

		$teksten = get_field('teksten', $p->ID);

		$extra_optie = get_field('extra_optie', $p->ID);

		$extra_telefoon = get_field('extra_telefoon', $provider_post->ID);

		$pakket_type = array_map(function($verz){ return $verz->name; }, wp_get_post_terms($p->ID, 'type'));

		$return = array(
			'pakket_type' 	=> $pakket_type,
			'eenmalig' 		=> array(),
			'maandelijks' 	=> array(),
		);
	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// STATUS

	$status = get_posts(array(
        'posts_per_page' => 1,
        'post_type' => 'status',
        'tax_query' => array(
            array(
                'taxonomy' => 'status',
                'field' => 'slug',
                'terms' => 'status-'.$status,
            ),
        )
    ));



    if (count($status)) {

    	$return['status'] = array();
    	$status_post_id = $status[0]->ID;
    	$bc = get_field('bindend_contract', $status_post_id);
    	$return['status']['bindend_contract'] = (!!$bc ? $bc : false);

    	$meerprijs = get_field('installatie_meerprijs', $status_post_id);

    	$return['eenmalig']['glasvezel_naar_huis'] = new Kz_optie(array(
			'naam'		=> 'glasvezel naar huis',
			'aantal'	=> 1,
			'prijs'		=> (!!$meerprijs ? (float) $meerprijs : 0)
		));



    } else {
    	$return['status'] = false;
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
		$return['fin_rauw'] = $financieel;
		$return['fin_rauw']['gc_id'] = array(
			'gc'				=> $gc,
			'$gebiedscode_id'	=> $gebiedscode_id
		);


		$snelheid_prijs_concreet = keuzehulp_pakket_eigenschappen_snelheid_prijs_concreet(
			$financieel['snelheid-prijs'],
			$gebiedscode_id
		);

		// lijst met snelheden.
		$snelheden = array_keys($snelheid_prijs_concreet);

		// sorteer oplopend
		sort($snelheden);

		//upload ophalen
		$down_up_ar = keuzehulp_pakket_eigenschappen_up_snelheid_concreet(
			$financieel['snelheid-prijs'],
			$gebiedscode_id);

		// origineel weggooien.
		unset($financieel['snelheid-prijs']);


		//$return['snelheid_prijs']		= $snelheid_prijs_concreet;
		$return['snelheden']			= $snelheden;
		$return['down_up']				= $down_up_ar;

	}


	/////////////////////////////////////////////////////
	// - - - - - - - - - - - - - - - - - - - - - - - - //
	/////////////////////////////////////////////////////


	// EENMALIGE KOSTEN BASIS

	{

		$return['eenmalig']['basis'] = new Kz_optie(array(
			'naam'		=> 'basis',
			'aantal'	=> 1,
			'prijs'		=> keuzehulp_pakket_eigenschappen_basis_eenmalig_concreet(
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
		$return['provider_meta']['thumb'] = get_the_post_thumbnail($provider_post->ID, 'medium');
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

		$telefonie_bundel_posts = keuzehulp_telefonie_bundels($provider_tax_data[0]->slug);

		$telefonie_bundels = array();

		foreach ($telefonie_bundel_posts as $tpb) {

			$bundel_tax_data = wp_get_post_terms($tpb->ID, 'bereik');

			$slug = slugify($tpb->post_title);
			$bereik = $bundel_tax_data[0]->slug;

			if (!array_key_exists($bereik, $telefonie_bundels)) {
				$telefonie_bundels[$bereik] = array();
			}

			$telefonie_bundels[$bereik][] = array(
				'naam'			=> $tpb->post_title,
				'slug'			=> $slug,
				'data'			=> array(
					'maandbedrag'				=> get_field('maandbedrag', $tpb->ID),
					'vast'						=> get_field('vast', $tpb->ID),
					'mobiel'					=> get_field('mobiel', $tpb->ID),
					'maximum_minuten'			=> get_field('maximum_minuten', $tpb->ID)
				),
				'bereik'		=> $bereik
			);

			$return['maandelijks'][$slug] = new Kz_optie(array(
				'naam'			=> $slug,
				'optietype' 	=> 'telefonie-bundel',
				'suboptietype'  => $bereik,
				'aantal'		=> 0,
				'prijs'			=> (float) get_field('maandbedrag', $tpb->ID),
			));

			$return['teksten'][$tpb->post_title] = apply_filters('the_content', get_field('tekst', $tpb->ID));
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
					'totaal'		=> $zo_verz[$ss]['totaal'],
					'hd'			=> $zo_verz[$ss]['hd'],
					'zenderlijst'	=> apply_filters('the_content', $zo_verz[$ss]['zenderlijst'])
				);
				$return['teksten']['zenders-'.$ss.'-totaal'] = $zo_verz[$ss]['totaal_tekst'];
				$return['teksten']['hd-'.$ss.'-totaal'] = $zo_verz[$ss]['hd_tekst'];

			} else {
				$return['zenders-'.$ss] = array(
					'totaal'		=> $zenders['totaal'],
					'hd'			=> $zenders['hd'],
					'zenderlijst'	=> apply_filters('the_content', $zenders['zenderlijst'])
				);
				$return['teksten']['zenders-'.$ss.'-totaal'] = $zenders['totaal_tekst'];
				$return['teksten']['hd-'.$ss.'-totaal'] = $zenders['hd_tekst'];
			}
		}


		$televisie_bundels = keuzehulp_televisie_bundels($provider_post->post_name);

		// zijn de bundels voor specifieke snelheden?
		// dat is zo als er meer dan één bundel is.
		// we zetten het voor alle snelheden er in.

		if (count($televisie_bundels) > 1) {
			$return['test'] = 'optie 1';
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

						$return['teksten'][($slugje)] = $optie['tekst'];
					}
				}
			}
		} else {
			$return['test'] = 'optie 2';
			foreach ($televisie_bundels[0]->pakketten as $pakketgroep) {
				foreach ($pakketgroep['opties'] as $optie) {
					foreach ($snelheden as $snelheid) {
						$str = $pakketgroep['pakket_naam'] . '-' . $optie['publieke_naam'] . '-' . $snelheid;
						$prijs = (float) $optie['prijs'];
						$slugje = slugify($str);

						$return['maandelijks'][($slugje)] = new Kz_optie(array(
							'naam'			=> $optie['publieke_naam'],
							'optietype' 	=> 'televisie-bundel',
							'suboptietype'	=> $pakketgroep['pakket_naam'],
							'snelheid'		=> $snelheid,
							'aantal' 		=> $prijs < 0.01 ? 1 : 0,
							'prijs' 		=> $prijs
						));

						$return['teksten'][($slugje)] = $optie['tekst'];
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

		if ($dvb_c and $dvb_c['kan_dvc-c_doen']) { // LET OP DE SPELFOUT!

			$return['teksten']['dvb-c'] = $dvb_c['dvb-c_tekst'];

			if (   $dvb_c['dvb-c_eenmalig'] != 0 ) {
				$return['eenmalig']['dvb-c'] = new Kz_optie(array(
					'naam'			=> 'dvb-c',
					'optietype'		=> 'televisie-extra',
					'aantal' 		=> 0,
					'prijs'  		=> (float) $dvb_c['dvb-c_eenmalig'],
				));
			}

			if (  $dvb_c['dvb-c_maandelijks'] != 0 ) {
				$return['maandelijks']['dvb-c'] = new Kz_optie(array(
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
		$return['teksten']['extra_optie_tekst'] = $extra_optie['extra_optie_tekst'];

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

	sort($return['teksten']);

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

function keuzehulp_form_sectie ($titel = '', $inh = '', $svg = '', $extra_tekst = '') {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$header = "";

	//tbv stijling
	$slak = strtolower(preg_replace("/[^A-Za-z0-9 ]/", '', $titel));

	if ($titel !== '') {
		$header = "<header class='kz-form-sectie-header'>
				".
				($extra_tekst !== ''
					? "<span class='kz-form-sectie-header_groen'>$extra_tekst</span>"
					: ''
				)."
				".(($svg||$titel) ? "<h3>$svg $titel</h3>" : "")."
			</header>";
	}

	return "
		<section class='kz-form-sectie $slak'>
			$header
			<div class='kz-form-sectie-torso'>
				$inh
			</div>
		</section>
	";
}


function keuzehulp_form_rij ($veld1, $veld2 = null, $extra_klasse = '', $rij_onder = array()) {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie voor aanmeldformulier die HTML in template plaatst
	|
	-----------------------------------------------------------*/


	$e = explode('<', $veld1);

	//tbv stijling
	$klasse = strtolower(str_replace(' ', '-', preg_replace("/[^A-Za-z0-9 ]/", '', $e[0])));

	$rij_onder_html = !empty($rij_onder) ? keuzehulp_form_rij(...$rij_onder) : '';

	return "<div class='rij $klasse $extra_klasse'>
		<div class='veld veld-1'>
			$veld1
		</div>
		<div class='veld veld-2'>
			$veld2
		</div>
		$rij_onder_html
	</div>";
}

function keuzehulp_input ($params = array()) {


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

	$tekst = $waarde !== '' ? kz_maak_geld_op($waarde) : '';

	$v = ($value ? " value='$value' " : "");
	$f = ($func ? "data-kz-func='$func'" : "");

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
				data-kz-waarde='$waarde'
				data-kz-vorige-value='$value'
				data-kz-value='$value'
				data-kz-func='update-hidden $func'
				$v
				$f
			>
			$label_html
			";

	} else {
		return "
			<div
				class='kz-$type $class $eclass knop'
				id='$id'
				data-kz-func='aanmelding-schakel update-hidden $func'
				data-kz-waarde='$waarde'
				data-kz-vorige-value='$value'
				data-kz-value='$value'
				>
				<span class='label'>$label</span>
			</div>";
	}

}

function kz_maak_geld_op($euros = '') {


	/*---------------------------------------------------------
	|
	| 	Veranderd getallen in €4,95 format
	|
	-----------------------------------------------------------*/


	$euros = number_format ( $euros, 2 );
	$euros = str_replace('.', ',', $euros);
	return "&euro;$euros";

}