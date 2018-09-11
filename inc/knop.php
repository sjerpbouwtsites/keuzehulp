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

class Kz_knop_combi extends Ef_knop {


	public function __construct ($a = array()) {
		parent::__construct($a);
	}

	public function maak() {

		$this->nalopen();

		if (!$this->cp_truthy('tooltip', $this)) {
			$this->tooltipHTML = "";	
		} else {


			$this->tooltipHTML = "<a 
				href='#' 
				class='knop kz-tooltip' 
				data-tooltip-titel='{$this->tekst}' 
				data-tooltip-tekst='{$this->tooltip}'
				data-efiber-func='tooltip'
				title='Meer informatie'
			>"
			. file_get_contents (plugin_dir_path(__FILE__)."../iconen-nieuw/svg/info.svg") . 
			"</a>";	
		}

		$f = $this->func !== '' ? " data-efiber-func='$this->func' " : "";
		$ikoon = $this->print_ikoon();
		$this->html = 
		"
		<div class='kz-knop-combi'>
			<div 
				class='kz-knop-combi_links knop'
				{$f}
				{$this->attr}
				data-href='{$this->link}'
			>
				$ikoon
			</div>
			<div class='kz-knop-combi_rechts'>
				<span class='kz-knop-combi_rechts-boven'>
					<span>{$this->tekst}</span>
					{$this->tooltipHTML}
				</span>
				<a 
					{$f}
					{$this->attr}
					class='knop blauwe-knop {$this->class}'
					href='{$this->link}'
				>
					<span>
						DIT PAST BIJ MIJ
					</span>
					". file_get_contents (plugin_dir_path(__FILE__)."../iconen-nieuw/svg/dichtklappen.svg") . "												
				</a>
			</div>
		</div>";
		return $this->html;
	}

}
