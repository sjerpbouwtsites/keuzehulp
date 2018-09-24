/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function KzAjax(params) {
	/*------------------------------------------------------
	|
	| 	Wrapperklasse voor ajaxcalls naar achterkant.
	|
	|-----------------------------------------------------*/

	// terugval
	this.ajaxData = {};
	this.cb = function () {};

	// overschrijven met params
	Object.entries(params).forEach(([k, v]) => { this[k] = v; });


	this.verwerkResponse = (response) => {
		const r = JSON.parse(response);

		// @TODO zoek naar 'error' in r zo ja, afbreken.

		if ('console' in r && r.console) {
			console.dir(r.console);
		}

		return r;
	};

	this.doeAjax = () => {
		jQuery.post(`${location.origin}/wp-admin/admin-ajax.php`, this.ajaxData, (response) => {
			this.cb(this.verwerkResponse(response));
		});
	};
}

function kzFormStijlKlassen() {
	/*------------------------------------------------------
	|
	|	Focus is op input-niveau,
	| 	deze functie tilt dat naar li niveau voor alle GF.
	|
	|-----------------------------------------------------*/


	jQuery('.gform_wrapper').on('focus', 'input, textarea, select', function () {
		const $form = $(this).closest('.gform_wrapper form');
		$form.find('li').removeClass('heeft-focus');
		$(this).closest('li').addClass('heeft-focus');
	});
}

function kzAjaxKleineFormulieren(backendFunctie, printElID, data) {
	/*------------------------------------------------------
	|
	|	Generieke functie die ajaxcalls aanstuurt voor lead en zakelijk formulier.
	|
	|-----------------------------------------------------*/

	const ajf = new KzAjax({
		ajaxData: {
			action: backendFunctie,
			data,
		},
		cb(r) {
			jQuery(`#${printElID}`).append($(r.print));
			jQuery(`#${printElID}`).find('form').attr('action', location.origin + "/keuzehulp");

			kzFormStijlKlassen();
		},
	});

	ajf.doeAjax();
}
