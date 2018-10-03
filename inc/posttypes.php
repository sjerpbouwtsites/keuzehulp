<?php
/***********************************************************************************************
 *  REGISTREER DE VARIA POSTTYPES
 *
 *	VOORBEELD. zet in registreer_posttypes.
 *
 *	$project = new Posttype_voorb('project');
 *
 *	$project->pas_args_aan(array(
 *		'supports' =>
 *			array(
 *				'title',
 *				'editor',
 *				'thumbnail'
 *			),
 *	));
 *
 *	$project->registreer();
 *
 *	$project->maak_taxonomie('cms');
 *
 *	$project->maak_taxonomie('techniek');
 *
 */

class Kz_posttype_voorb {

	function __construct($enkelvoud, $meervoud = '', $overschrijven = array()){

		if (empty($meervoud)) {
			$meervoud = $enkelvoud . 'en';
		}

		$this->enkelvoud = $enkelvoud;
		$this->meervoud = $meervoud;

		$this->termen = array(
			'name' 				=> _x(ucfirst($meervoud), 'post type general name'),
			'singular_name' 	=> _x(ucfirst($enkelvoud), 'post type singular name'),
			'add_new' 			=> _x('Voeg een nieuw '.$enkelvoud.' toe', $enkelvoud),
			'add_new_item' 		=> __('Nieuw '.$enkelvoud),
			'edit_item' 		=> __('Pas '.$enkelvoud.' aan'),
			'new_item' 			=> __('Nieuw '.$enkelvoud),
			'view_item' 		=> __('Bekijk '.$enkelvoud),
			'search_items' 		=> __('Zoek tussen '.$meervoud),
			'not_found' 		=>  __('Niets gevonden'),
			'not_found_in_trash' => __('Niet gevonden in de prullebak'),
			'parent_item_colon' => ''
		);

		if (count($overschrijven) and array_key_exists('termen', $overschrijven)) {
			foreach ($overschrijven['termen'] as $term => $waarde) {
				$this->termen[$term] = $waarde;
			}
		}

		$this->args = array(
			'labels' 			=> $this->termen,
			'description'		=> 'De ' . $this->meervoud . '.',
			//'public' 			=> true, dit overschrijft dus vele andere waarden.
			'exclude_from_search'=> false,
			'publicly_queryable' => true,
			'show_in_nav_menus'	=> true,
			'show_in_menu'		=> true,
			'add_to_menu'		=> true,
			'menu_position'		=> 10,
			'show_ui' 			=> true,
			'rewrite' 			=> true,
			'capability_type' 	=> 'post',
			'hierarchical' 		=> false,
			'public'			=> true,
			'has_archive' 		=> $this->meervoud,
			'supports' => 		array(
					'title',
					'editor',
					'excerpt',
					'thumbnail'
				),
		  );

	}

	function pas_args_aan($args){
		foreach ($args as $k=>$v) {
			$this->args[$k] = $v;
		}
	}

	function registreer(){
		register_post_type($this->enkelvoud, $this->args );
	}

	function maak_taxonomie($tax_enkelvoud = '', $tax_meervoud = ''){

		if (empty($tax_enkelvoud)) {
			return;
		}

		if (empty($tax_meervoud)) {
			$tax_meervoud = $tax_enkelvoud . 'en';
		}

		register_taxonomy(
			$tax_enkelvoud,
			$this->enkelvoud,
			array(
				'labels' => array(
					'name' => _x($tax_meervoud, 'taxonomy general name'),
					'singular_name' 	=> _x($tax_enkelvoud, 'taxonomy singular name'),
				),
				'public' 	=> true,
				'rewrite'	=> true,
	            'show_ui'           => true,
	            'show_admin_column' => true,
	            'hierarchical' 		=> true,
			)
		);
	}

}



function Kz_registreer_posttypes() {

    $zakelijke_provider = new Kz_posttype_voorb('zakelijke-provider', 'zakelijke-providers');
    $zakelijke_provider->pas_args_aan(array( 'menu_icon'  => 'dashicons-building', 'supports' => array( 'title', ) ));
    $zakelijke_provider->registreer();

    $provider = new Kz_posttype_voorb('provider', 'providers');
    $provider->pas_args_aan(array( 'menu_icon'  => 'dashicons-admin-site', 'supports'  => array( 'title', 'thumbnail' ) ));
    $provider->registreer();

    $nieuw_pakket = new Kz_posttype_voorb('nieuw-pakket', 'nieuwe-pakketten');
    $nieuw_pakket->pas_args_aan(array( 'menu_icon'   => 'dashicons-cart', 'supports' => array( 'title' ) ));
//    $nieuw_pakket->maak_taxonomie('tv-type', 'tv-typen');
    $nieuw_pakket->maak_taxonomie('type', 'typen');
    $nieuw_pakket->registreer();

    $tv_bundel = new Kz_posttype_voorb('tv-bundel', 'tv-bundels');
    $tv_bundel->pas_args_aan(array( 'menu_icon'  => 'dashicons-video-alt3', 'supports'  => array( 'title' ) ));
    $tv_bundel->registreer();

    $telefonie_bundel = new Kz_posttype_voorb('telefonie-bundel', 'telefonie-bundels');
    $telefonie_bundel->pas_args_aan(array( 'menu_icon'  => 'dashicons-phone', 'supports'  => array( 'title' ) ));
    $telefonie_bundel->maak_taxonomie('bereik', 'bereiken');
    $telefonie_bundel->registreer();


    $status = new Kz_posttype_voorb('status', 'statussen');
    $status->pas_args_aan(array( 'menu_icon'  => 'dashicons-forms', 'supports'  => array( 'title' ) ));
    $status->registreer();


    // ONDERSTAANDE TAXONOMIEEN WORDEN DOOR MEERDERE POSTTYPES GEDEELD
    // DAAROM APART INGESTELD

    //////////////////////

    register_taxonomy( 
        'provider', 
        array( 'telefonie-bundel', 'tv-bundel', 'nieuw-pakket', 'provider' ), 
        kz_taxonomie_args('provider', 'providers') 
    );

    register_taxonomy( 
        'tv-type', 
        array('nieuw-pakket', 'tv-bundel' ), 
        kz_taxonomie_args('tv-type', 'tv-typen') 
    );

    register_taxonomy( 
        'regio', 
        array('provider', 'zakelijke-provider', 'nieuw-pakket' ), 
        kz_taxonomie_args('regio', 'regios') 
    );

    register_taxonomy( 
        'status', 
        array('nieuw-pakket', 'status' ), 
        kz_taxonomie_args('status', 'statussen') 
    );

}

function kz_taxonomie_args($enkelvoud, $meervoud) {

    $labels = array(
            'name'              => _x( ucfirst($meervoud), 'taxonomy general name' ),
            'singular_name'     => _x( ucfirst($enkelvoud), 'taxonomy singular name' ),
            'search_items'      => __( 'Doorzoek '.$meervoud ),
            'all_items'         => __( 'Alle '.$meervoud ),
            'parent_item'       => __( 'Ouder '.$enkelvoud ),
            'parent_item_colon' => __( 'Ouder '.$enkelvoud.':' ),
            'edit_item'         => __( 'Bewerk '.$enkelvoud ),
            'update_item'       => __( 'Vernieuw '.$enkelvoud ),
            'add_new_item'      => __( 'Voeg nieuwe '.$enkelvoud.' toe' ),
            'new_item_name'     => __( 'Naam nieuwe '.$enkelvoud ),
            'menu_name'         => __( ucfirst($enkelvoud) ),
        );

    return array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => $enkelvoud ),
    );

}