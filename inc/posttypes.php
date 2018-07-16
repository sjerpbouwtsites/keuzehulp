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

class Ef_posttype_voorb {

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



function Ef_registreer_posttypes() {

    $zakelijke_provider = new Ef_posttype_voorb('zakelijke-provider', 'zakelijke-providers');
    $zakelijke_provider->pas_args_aan(array(
        'menu_icon'           => 'dashicons-building',
        'supports'              => array(
            'title', 
        )        
    ));
    $zakelijke_provider->maak_taxonomie('regio', 'regios');
    $zakelijke_provider->registreer();

    $provider = new Ef_posttype_voorb('provider', 'providers');
    $provider->pas_args_aan(array(
        'menu_icon'           => 'dashicons-admin-site',
        'supports'              => array(
            'title', 
        )                
    ));
    $provider->registreer();


    $pakket = new Ef_posttype_voorb('pakket', 'pakketten');
    $pakket->pas_args_aan(array(
        'menu_icon'             => 'dashicons-thumbs-down',
        'supports'              => array(
            'title', 'editor'
        )
    ));
    //$pakket->maak_taxonomie('regio', 'regios');
    $pakket->maak_taxonomie('type', 'typen');
    $pakket->maak_taxonomie('bekabeling', 'bekabelingen');
    $pakket->registreer();


    $nieuw_pakket = new Ef_posttype_voorb('nieuw-pakket', 'nieuwe-pakketten');
    $nieuw_pakket->pas_args_aan(array(
        'menu_icon'             => 'dashicons-cart',
        'supports'              => array(
            'title'
        )
    ));    
    $nieuw_pakket->maak_taxonomie('provider', 'providers');
    $nieuw_pakket->registreer();




    $labels = array(
            'name'              => _x( 'Regios', 'taxonomy general name' ),
            'singular_name'     => _x( 'Regio', 'taxonomy singular name' ),
            'search_items'      => __( 'Doorzoek regios' ),
            'all_items'         => __( 'Alle regios' ),
            'parent_item'       => __( 'Ouder regio' ),
            'parent_item_colon' => __( 'Ouder regio:' ),
            'edit_item'         => __( 'Bewerk regio' ),
            'update_item'       => __( 'Vernieuw regio' ),
            'add_new_item'      => __( 'Voeg nieuwe regio toe' ),
            'new_item_name'     => __( 'Naam nieuwe regio' ),
            'menu_name'         => __( 'Regio' ),
        );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'regio' ),
    );

    register_taxonomy( 'regio', array( 'pakket', 'provider', 'zakelijke-provider' ), $args );



    $labels = array(
            'name'              => _x( 'Typen', 'taxonomy general name' ),
            'singular_name'     => _x( 'Type', 'taxonomy singular name' ),
            'search_items'      => __( 'Doorzoek typen' ),
            'all_items'         => __( 'Alle typen' ),
            'parent_item'       => __( 'Ouder type' ),
            'parent_item_colon' => __( 'Ouder type:' ),
            'edit_item'         => __( 'Bewerk type' ),
            'update_item'       => __( 'Vernieuw type' ),
            'add_new_item'      => __( 'Voeg nieuw type toe' ),
            'new_item_name'     => __( 'Naam nieuw type' ),
            'menu_name'         => __( 'Type' ),
        );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'type' ),
    );

    register_taxonomy( 'type', array( 'pakket', 'nieuw-pakket', ), $args );


}

