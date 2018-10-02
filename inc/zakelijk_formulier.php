<?php

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

