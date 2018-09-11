</main>
<footer class='app-footer' role='contentinfo'>
	<div class='verpakking'>
		<span>&copy;<?= date("Y"); ?> <?=get_field('bedrijfsnaam', 'option')?><br>Realisatie: <a target="_blank" href="https://indrukwekkend.nl">indrukwekkend.nl</a></span>
	</div>
</footer>
<?php 
	wp_footer();
	echo "</body></html>";
	die(); //voorkomt laden thema footer
?>