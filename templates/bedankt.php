<?php

/* template name: bedankt */


get_header();

 $provider = $_GET['prov']; ?>
<h2><?php the_title(); ?></h2>



<?php

echo apply_filters('the_content', str_replace("%%naam provider%%",$provider,$post->post_content));


get_footer();
?>

