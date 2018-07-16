<?php
/*

**************************************************************************

Plugin Name:  efiber
Description:  keuzemenu voor efiber
Plugin URI:   https://indrukwekkend.nl
Version:      0.1
Author:       Indrukwekkend
Author URI:   https://indrukwekkend.nl
Text Domain:  efiber
License:      GPL2
License URI:  https://www.gnu.org/licenses/gpl-2.0.html

**************************************************************************

*/


define('EF_SITE_URI', get_site_url());
define('EF_THEME_DIR', get_template_directory());
define('EF_THEME_URI', get_template_directory_uri());

define('EF_IMG_DIR', EF_THEME_DIR . "/afb");
define('EF_IMG_URI', EF_THEME_URI . "/afb");
define('EF_JS_DIR', EF_THEME_DIR . "/js");
define('EF_JS_URI', EF_THEME_URI . "/js");


function Ef_scripts_in_rij() {

    $pak_scripts = array(
        'nuts', 'ajax', 'controleer-postcode', 'routing', 'dispatcher', 'geheugen', 'route-keuze-consequenties',
        'vergelijking', 'aanmeldformulier', 'modal', 'keuze-niveaus'
    );

/*    $pak_stijlen = array(
        'thema-stijl', '', 'form', 'modal', 'niveau-knoppen', 'stappen', 'postcode', 'print', 'knoppen'
    );*/

    $pak_stijlen = array(
        '', 'form', 'modal', 'niveau-knoppen', 'stappen', 'postcode', 'print', 'knoppen', 'hp'
    );


    $script_postfix = "1001";

    foreach ($pak_scripts as $s) {
        wp_register_script( "efiber-$s", plugins_url("efiber/js/{$s}-".$script_postfix.".js"), array(), null, true );
        wp_enqueue_script( "efiber-$s" );
    }

    wp_register_script( 'efiber-script', plugins_url('efiber/js/{efiber}-'.$script_postfix.'.js'), array(), null, true );
    wp_enqueue_script( 'efiber-script' );

    foreach ($pak_stijlen as $s) {
        $v = ($s !== '' ? "-$s" : $s);
        wp_register_style( "efiber$v", plugins_url("efiber/css/efiber{$v}-".$script_postfix.".css"), array(), null);
        wp_enqueue_style( "efiber$v" );
    }

    // NU DIE VAN GRAVITY FORMS

    wp_register_style( 'gf-formreset', plugins_url('gravityforms/css/formreset.min.css'), array(), null);
    wp_enqueue_style( 'gf-formreset' );
    wp_register_style( 'gf-datepicker', plugins_url('gravityforms/css/datepicker.min.css'), array(), null);
    wp_enqueue_style( 'gf-datepicker' );
    wp_register_style( 'gf-formsmain', plugins_url('gravityforms/css/formsmain.min.css'), array(), null);
    wp_enqueue_style( 'gf-formsmain' );
    wp_register_style( 'gf-readyclass', plugins_url('gravityforms/css/readyclass.min.css'), array(), null);
    wp_enqueue_style( 'gf-readyclass' );
    wp_register_style( 'gf-browsers', plugins_url('gravityforms/css/browsers.min.css'), array(), null);
    wp_enqueue_style( 'gf-browsers' );

    wp_register_script( 'gf-jquery-json', plugins_url('gravityforms/js/jquery.json.min.js'), array(), null, true );
    wp_enqueue_script( 'gf-jquery-json' );
    wp_register_script( 'gf-gravityforms', plugins_url('gravityforms/js/gravityforms.min.js'), array(), null, true );
    wp_enqueue_script( 'gf-gravityforms' );
    wp_register_script( 'gf-conditional-logic', plugins_url('gravityforms/js/conditional_logic.min.js'), array(), null, true );
    wp_enqueue_script( 'gf-conditional-logic' );
    wp_register_script( 'gf-datepicker', plugins_url('gravityforms/js/datepicker.min.js'), array(), null, true );
    wp_enqueue_script( 'gf-datepicker' );
    wp_register_script( 'jquery-datepicker', site_url() . '/wp-includes/js/jquery/ui/datepicker.min.js', array(), null, true );
    wp_enqueue_script( 'jquery-datepicker' );

    wp_register_script( 'gf-masked-input', plugins_url('gravityforms/js/jquery.maskedinput.min.js'), array(), null, true );
    wp_enqueue_script( 'gf-masked-input' );

}

function Ef_init () {

    foreach ( glob( plugin_dir_path( __FILE__ ) . "inc/*.php" ) as $file ) {
        require_once $file;
    }

    add_action( 'wp_enqueue_scripts', 'Ef_scripts_in_rij' );

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

function Ef_pakket_opties() {

    if ( function_exists( 'acf_add_options_sub_page' ) ){
        acf_add_options_sub_page(array(
            'title'      => 'Pakket toewijzingen',
            'parent'     => 'edit.php?post_type=pakket',
            'capability' => 'manage_options'
        ));
    }

}

function Ef_teksten() {

    if ( function_exists( 'acf_add_options_sub_page' ) ){
        $page = acf_add_options_page(array(
            'menu_title' => 'Keuzehulp teksten',
            'menu_slug' => 'keuzehulp-tekten',
            'capability' => 'edit_posts',
            'redirect' => false
        ));
    }

}

function Ef_menu(){
    add_menu_page( 'Efiber keuzehulp', 'Keuzehulp', 'manage_options', 'efiber', 'print_efiber_postcode_pagina' );
}

add_action('init', 'Ef_init');
add_action('init', 'Ef_registreer_posttypes');
add_action('admin_menu', 'Ef_menu');
add_action('init', 'Ef_pakket_opties');
add_action('admin_menu', 'Ef_teksten');

function print_efiber_postcode_pagina( ){
    include_once plugin_dir_path( __FILE__ ) . "templates/csv_naar_db.php" ;
}





// komt van
// https://github.com/wpexplorer/page-templater

class PageTemplater {

    private static $instance;
    protected $templates;
    public static function get_instance() {
        if ( null == self::$instance ) {
            self::$instance = new PageTemplater();
        }
        return self::$instance;
    }
    private function __construct() {
        if ( version_compare( floatval( get_bloginfo( 'version' ) ), '4.7', '<' ) ) {
            add_filter(
                'page_attributes_dropdown_pages_args',
                array( $this, 'register_project_templates' )
            );
        } else {
            add_filter(
                'theme_page_templates', array( $this, 'add_new_template' )
            );
        }
        add_filter(
            'wp_insert_post_data',
            array( $this, 'register_project_templates' )
        );
        add_filter(
            'template_include',
            array( $this, 'view_project_template')
        );
        $this->templates = array(
            'templates/keuzehulp.php' => 'Efiber Keuzehulp',
        );
    }

    public function add_new_template( $posts_templates ) {
        $posts_templates = array_merge( $posts_templates, $this->templates );
        return $posts_templates;
    }

    public function register_project_templates( $atts ) {

        $cache_key = 'page_templates-' . md5( get_theme_root() . '/' . get_stylesheet() );
        $templates = wp_get_theme()->get_page_templates();
        if ( empty( $templates ) ) {
            $templates = array();
        }
        wp_cache_delete( $cache_key , 'themes');
        $templates = array_merge( $templates, $this->templates );
        wp_cache_add( $cache_key, $templates, 'themes', 1800 );
        return $atts;

    }

    public function view_project_template( $template ) {
        if ( is_search() ) {
            return $template;
        }
        global $post;
        if ( ! $post ) {
            return $template;
        }
        if ( ! isset( $this->templates[get_post_meta(
            $post->ID, '_wp_page_template', true
        )] ) ) {
            return $template;
        }
        $filepath = apply_filters( 'page_templater_plugin_dir_path', plugin_dir_path( __FILE__ ) );
        $file =  $filepath . get_post_meta(
            $post->ID, '_wp_page_template', true
        );
        if ( file_exists( $file ) ) {
            return $file;
        } else {
            echo $file;
        }
        return $template;
    }

}
add_action( 'plugins_loaded', array( 'PageTemplater', 'get_instance' ) );



add_filter('gform_pre_render_2', 'zakelijke_providers_dynamisch');

function zakelijke_providers_dynamisch ($form) {

  $gebiedscode = strtolower($_POST['data']['gebiedscode']);

  foreach ($form['fields'] as &$field) :

    if ($field->id != 64) {
      continue;
    }

    $providers = get_posts(array(
      'posts_per_page'  => -1,
      'post_type'       => 'zakelijke-provider',
      'tax_query' => array(
          array(
            'taxonomy' => 'regio',
            'field'    => 'slug',
            'terms'    => $gebiedscode,
          ),
        ),      
    ));

    $keuzes = array(array(
      'text'      => 'Geen voorkeur',
      'value'     => 'geen-voorkeur',
      'isSelected'=> true
    ));

    foreach ($providers as $p) {
      $keuzes[] = array(
        'text'      => $p->post_title,
        'value'     => $p->post_name,
        'isSelected'=> false
      );
    }

    $field->choices = $keuzes;

  endforeach;

  return $form;

}

