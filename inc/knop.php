<?php

$Kz_knop_teller = 0;
function knop_enumerator(){
	global $Kz_knop_teller;
	return ++$Kz_knop_teller;
}

class Kz_knop extends Kz_basis_class {


    /*---------------------------------------------------------
    |
    |	maakt en print knoppen
    | 	afkomstig uit agitatie
    |
    -----------------------------------------------------------*/


//  VOORBEELD

//	$knop = new Kz_knop(array(
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
		$f = $this->func !== '' ? " data-kz-func='$this->func' " : "";
		$i = knop_enumerator();
		$this->html = "<a {$e}
				{$f}
				{$this->attr}
				data-knop-id='$i'
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

class Kz_knop_combi extends Kz_knop {


	public function __construct ($a = array()) {
		parent::__construct($a);
	}

	public function maak_tooltip(){
		if (!$this->cp_truthy('tooltip', $this)) {
			$this->tooltipHTML = "";
		} else {

			$print_teksten = is_array($this->tooltip)
				? 'NULL'
				: $this->tooltip;

			$st = is_array($this->tooltip) ? '' : strip_tags($this->tekst);

			$json_tt = '';

			if (is_array($this->tooltip)) {
				foreach ($this->tooltip as $status => $status_tekst) {
					$json_tt .= " data-tooltip-$status='$status_tekst' ";
				}
			}

			$ec = (is_array($this->tooltip) ? "status-tooltip" : '');

			$this->tooltipHTML = "<a
				href='#'
				class='knop kz-tooltip $ec'
				data-tooltip-titel='$st'
				data-tooltip-tekst='$print_teksten'
				$json_tt
				data-kz-func='tooltip'
				title='Meer informatie'
			>"
			. file_get_contents (plugin_dir_path(__FILE__)."../iconen-nieuw/svg/info.svg") .
			"</a>";
		}
	}


	public function als_single_select_blauwe_knop (){
		return in_array('multiselect', (explode(' ', $this->class)))
		? ''
		: "<span>KIES</span>".file_get_contents (plugin_dir_path(__FILE__)."../iconen-nieuw/svg/dichtklappen.svg");
	}

	public function maak_knop() {

		$this->enum = knop_enumerator();
		$f = $this->func !== '' ? " data-kz-func='$this->func' " : "";
		$this->knop_html = "
			<a
				{$f}
				{$this->attr}
				class='knop  {$this->class}'
				href='{$this->link}'
				data-knop-id='{$this->enum}'
			>
			{$this->als_single_select_blauwe_knop()}
			</a>
		";
		return $this->knop_html;
	}

	public function maak() {

		$this->nalopen();
		$this->maak_tooltip();
		$knop_html = $this->maak_knop();
		$ikoon = $this->print_ikoon();

		$ccc = (in_array('multiselect', (explode(' ', $this->class))) ? "heeft-multiselect" : "");
		$this->html =
		"
		<div class='kz-knop-combi $ccc'>
			<div class='kz-knop-combi_links'>
				$ikoon
			</div>
			<div class='kz-knop-combi_rechts'>
				<span class='kz-knop-combi_rechts-boven'>
					<span>{$this->tekst}</span>
					{$this->tooltipHTML}
				</span>
				$knop_html
			</div>
		</div>";
		return $this->html;
	}

}
