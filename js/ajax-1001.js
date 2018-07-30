
function efiberAjax (params){


	/*------------------------------------------------------
	|
	| 	Wrapperklasse voor ajaxcalls naar achterkant.
	|
	|-----------------------------------------------------*/

	// terugval
	this.ajaxData = {};
	this.cb =  function(){};

	// overschrijven met params
	for (let k in params) {
		this[k] = params[k];
	}

	this.verwerkResponse = (response) => {

		let r = JSON.parse(response);

		// @TODO zoek naar 'error' in r zo ja, afbreken. 
		console.clear();

		if ('console' in r) {
			console.dir(r.console);
		}

		return r;

	}

	this.doeAjax = () => {
		jQuery.post(location.origin + "/wp-admin/admin-ajax.php", this.ajaxData, (response) => {
			this.cb(this.verwerkResponse(response));
		});
	};

}

function efiberAjaxKleineFormulieren(backendFunctie, printElID, data) {

	/*------------------------------------------------------
	|
	|	Generieke functie die ajaxcalls aanstuurt voor lead en zakelijk formulier.
	|
	|-----------------------------------------------------*/

	var ajf = new efiberAjax({
		ajaxData :{
			'action': backendFunctie,
			data: data,
		},
		cb: function(r){

			jQuery('#'+printElID).append($(r.print));
			jQuery('#'+printElID).find('form').attr('action', 'https://iedereenglasvezel.nl/keuzehulp/');

			efiberFormStijlKlassen();

		}
	});

	ajf.doeAjax();
}

function efiberFormStijlKlassen() {


	/*------------------------------------------------------
	|
	|	Focus is op input-niveau, 
	| 	deze functie tilt dat naar li niveau voor alle GF.
	|
	|-----------------------------------------------------*/


	jQuery(".gform_wrapper").on('focus', 'input, textarea, select', function(){
		var $form = $(this).closest('.gform_wrapper form');
		$form.find('li').removeClass('heeft-focus');
		$(this).closest('li').addClass('heeft-focus');
	});
}



