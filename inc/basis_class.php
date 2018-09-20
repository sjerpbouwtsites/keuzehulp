<?php



class Kz_basis_class {


	/*---------------------------------------------------------
	|
	| 	Gebruikt om te extenden. 
	| 	De construct laat je een klasse initialiseren via een array
	| 	alle keys worden properties
	| 	cp_truthy doet ... een JS truthy op een property.
	|
	-----------------------------------------------------------*/


	function __construct($a = array()) {
		if (is_array($a)) {
			foreach ($a as $k=>$v) {
				$this->$k = $v;
			}
		} else {
			$this->naam = $a;
		}
	}

	protected function cp_truthy($eigenschap) {

		if (!property_exists($this, $eigenschap)) {
			return false;
		} else if (empty($this->$eigenschap)) {
			return false;
		} else {
			return !!$this->$eigenschap;
		}

	}

}