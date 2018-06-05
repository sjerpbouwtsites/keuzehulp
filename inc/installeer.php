<?php

register_activation_hook( __FILE__, 'installeer_efiber' );

function installeer_efiber(){

        $new_page_title = 'Bedankt voor uw bestelling';
        $new_page_content = 'Bedankt voor uw bestelling';
        $new_page_template = '';
        $page_check = get_page_by_title($new_page_title);
        $new_page = array(
                'post_type' => 'page',
                'post_title' => $new_page_title,
                'post_content' => $new_page_content,
                'post_status' => 'publish',
                'post_author' => 1,
        );
        if(!isset($page_check->ID)){
                $new_page_id = wp_insert_post($new_page);
                if(!empty($new_page_template)){
                        update_post_meta($new_page_id, '_wp_page_template', $new_page_template);
                }
        }


}
