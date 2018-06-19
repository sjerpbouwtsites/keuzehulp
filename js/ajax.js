
function efiberAjax (params){

	// als iets niet gedefinieerd in params, terugval gebruiken.

	var _t = this;

	var terugval = {
		ajaxData: {},
		cb: function(){ /**/ }
	};

	for (var k in terugval) {
		_t[k] = terugval[k];
	}

	for (var k in params) {
		_t[k] = params[k];
	}

	_t.verwerkResponse = function(response){

		var r = JSON.parse(response);

		if ('console' in r) {
			console.log(r.console);
		}

		return r;

	}

	_t.doeAjax = function(){
		jQuery.post(location.origin + "/wp-admin/admin-ajax.php", _t.ajaxData, function(response) {
			_t.cb(_t.verwerkResponse(response));
		});
	};

}

function efiberAjaxKleineFormulieren(backendFunctie, printElID, data) {
	var ajf = new efiberAjax({
		ajaxData :{
			'action': backendFunctie,
			data: data,
		},
		cb: function(r){

			jQuery('#'+printElID).append($(r.print));
			jQuery('#'+printElID).find('form').attr('action', location.href);

			efiberFormStijlKlassen();

		}
	});

	ajf.doeAjax();
}

function efiberFormStijlKlassen() {
	jQuery(".gform_wrapper").on('focus', 'input, textarea, select', function(){
		var $form = $(this).closest('.gform_wrapper form');
		$form.find('li').removeClass('heeft-focus');
		$(this).closest('li').addClass('heeft-focus');
	});
}


function ikWeetWatIkWilPakkettenAjax() {

	$print = jQuery('#print-provider-pakketten');

	// keuzehulp vullen met data installatie
	var keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
	keuzehulp.installatie = '1';
	sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(keuzehulp));


	var ajaxData = {
		'action': 'efiber_ik_weet_wat_ik_wil_pakketten',
		data: {
			keuzehulp: 	 keuzehulp,
			gebiedscode: sessionStorage.getItem('efiber-gebiedscode'),
		},
	};

	jQuery.post(location.origin + "/wp-admin/admin-ajax.php", ajaxData, function(response) {

		$print.empty();
		$print.show();

		if (!response) {
			console.warn('geen ajax response ik weet wat ik wil pakketten');
		}

		var r = JSON.parse(response);

		if (!r) {
			console.warn('JSON response leeg van ik weet wat ik wil pakketten');
		}

		var $rij = jQuery("<div class='rij'>"),
			$pakket = jQuery("<div class='pakket'>"),
			$dezeRij, dezePakketten, $dezeTitel, $ditPakket, naam, dezePitch, i, p;

		for (naam in r.providers) {

			if (!r.providers[naam].length) {
				continue;
			}

			dezePakketten = efiberSorteerIWWIW(r.providers[naam]);
			dezePitch = r.pitches[naam];

			$dezeRij = $rij.clone();

			$ditLogo = $(r.providers[naam][0].eigenschappen.thumb);

			$dezeRij.append($ditLogo);


			for (i = 0; i < dezePakketten.length; i++) {

				$ditPakket = $pakket.clone();
				$ditPakket.append($("<span>"+dezePakketten[i].eigenschappen.pakket_meta.publieke_naam+"</span>"));
				$ditPakket.append($("<span>"+dezePakketten[i].eigenschappen.snelheid+" Mb/s</span>"));

				p = "<span class='prijs'>&euro;" + Number(dezePakketten[i].eigenschappen.financieel.maandelijks).toFixed(2) + "</span>";

				$ditPakket.append($("<span>"+p+" p/m</span>"));

				var knop = new efiberMaakBestelKnop(dezePakketten[i], dezePakketten[i].eigenschappen, 'Bekijk en bestel');

				$ditPakket.append(knop.HTML);

				//$ditPakket.append($("<a class='knop geen-ikoon efiber-bestelknop' data-efiber-func='toon-stap animeer aanmeldformulier' href='#100' efiber-data-pakket-id='"+dezePakketten[i].ID+"'>Bestel</a>"));

				$dezeRij.append($ditPakket);

			}

			$print.append($dezeRij); 

		}

		$print.on('click', '.pakket', function(){

			if ($(this).hasClass('open')) {
				$(this).toggleClass('open');
			} else {
				$print.find('.pakket.open').removeClass('open');
				$(this).toggleClass('open');
			}

		});

		efiberFormStijlKlassen();

	});

}

