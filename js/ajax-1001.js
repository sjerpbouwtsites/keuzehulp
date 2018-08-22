/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */
function EfiberAjax(params) {
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
		console.clear();

		if ('console' in r) {
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

function efiberFormStijlKlassen() {
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

function EfiberAjaxKleineFormulieren(backendFunctie, printElID, data) {
	/*------------------------------------------------------
	|
	|	Generieke functie die ajaxcalls aanstuurt voor lead en zakelijk formulier.
	|
	|-----------------------------------------------------*/

	const ajf = new EfiberAjax({
		ajaxData: {
			action: backendFunctie,
			data,
		},
		cb(r) {
			jQuery(`#${printElID}`).append($(r.print));
			jQuery(`#${printElID}`).find('form').attr('action', 'https://iedereenglasvezel.nl/keuzehulp/');

			efiberFormStijlKlassen();
		},
	});

	ajf.doeAjax();
}
