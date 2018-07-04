<?php

class Ef_knop extends Ef_basis_class {


    /*---------------------------------------------------------
    |
    |	maakt en print knoppen
    | 	afkomstig uit agitatie
    |
    -----------------------------------------------------------*/


//  VOORBEELD

//	$knop = new Ef_knop(array(
//		'func'		=> "zet-niveau-knop toon-stap animeer",
//		'link'		=> '#3',
//		'tekst'		=> 'mooie tekst',
//		'geen_ikoon'=> false,
//		'ikoon'		=> afb_url,
//	));
//	$knop->print();



	public $class, $link, $tekst, $extern, $schakel, $html;

	public function __construct ($a = array()) {
		parent::__construct($a);
		$this->klaar = false;
	}

	public function nalopen () {
		if (!$this->cp_truthy('link', $this)) $this->link = "#";
		if (!$this->cp_truthy('attr', $this)) $this->attr = "";
		if (!$this->cp_truthy('func', $this)) $this->func = "";
		if (!$this->cp_truthy('geen_ikoon', $this)) $this->geen_ikoon = false;
		if (!$this->cp_truthy('ikoon', $this)) $this->ikoon = '';

		$this->class = $this->class . ($this->geen_ikoon && !strpos($this->class, 'geen-ikoon') ? " geen-ikoon": "");

		if (!$this->geen_ikoon) {
			$this->class = str_replace('geen-ikoon', '', $this->class);
		}

		$this->klaar = true;
	}

	public function print_ikoon() {
		if (!$this->geen_ikoon) return $this->ikoon;
	}

	public function maak() {

		$this->nalopen();

		$e = $this->extern ? " target='_blank' " : "";
		$f = $this->func !== '' ? " data-efiber-func='$this->func' " : "";
		$this->html = "<a {$e}
				{$f}
				{$this->attr}
				class='knop {$this->class}'
				href='{$this->link}'
				{$this->schakel}
			>{$this->print_ikoon()}<span>{$this->tekst}</span></a>";
		return $this->html;
	}

	public function print () {
		$this->maak();
		echo $this->html;
	}
}
