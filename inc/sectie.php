<?php

class EfiberSectie extends Ef_basis_class {


	/*---------------------------------------------------------
	|
	|	Hulpfunctie die de "pagina's" cq secties van de app uitdraait.
	|
	-----------------------------------------------------------*/

	function __construct($init) {
		parent::__construct($init);
		$zet_leeg_als_ongedefinieerd = array(
			'titel', 'torso_intro', 'intro', 'torso_direct', 'footer_inh', 'titel_afb'
		);
		foreach($zet_leeg_als_ongedefinieerd as $zl) {
			if (!$this->cp_truthy($zl)) $this->$zl = '';
		}

		// legacy intro is teruggekropen...
		if ($this->torso_intro === '' && $this->intro === '') {
			$this->torso_intro = $this->intro;
		}
	}

	public function sectie_open () { ?>

		<section
			class='keuzehulp-sectie'
			data-keuzehulp-stap='<?=$this->stap?>'>

	<?php }


	public function header (){ ?>

		<header class='keuzehulp-sectie_kop'>
			<h2><?=$this->titel_afb?><span><?=$this->titel?></span></h2>
		</header>

	<?php }


	public function torso () { ?>

		<div class='keuzehulp-sectie_torso'>
			<div class='binnen'>
				<?php echo apply_filters('the_content', $this->torso_intro); ?>
				<?php echo $this->torso_direct; ?>
			</div>
		</div>

	<?php }

	public function footer () {?>

		<footer class='keuzehulp-sectie_voet'><?=$this->footer_inh?></footer>

	<?php }


	public function sectie_sluit() { ?>

		</section>

	<?php }


	public function print() {

		$this->sectie_open();
		$this->header();
		$this->torso();
		$this->footer();
		$this->sectie_sluit();

	}

}