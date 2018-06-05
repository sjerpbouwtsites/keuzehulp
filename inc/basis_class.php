<?php

class Ef_basis_class {
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
			return true;
		}

	}

}