/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */

window.onload = function () { efiberInit(); };

function efiberTekst(snede, invoeging) {
	if (!(snede in kzModalTeksten)) {
		console.error(`${snede} komt niet voor in kzModalTeksten`);
		return '';
	}

	if (!invoeging) {
		return kzModalTeksten[snede];
	}

	//console.log('modal '+snede);

	if (typeof invoeging === 'string') {
		return kzModalTeksten[snede].replace('%s', invoeging);
	}

		let r = kzModalTeksten[snede];

		for (let i = 0; i < invoeging.length; i++) {
			r = r.replace(`%s${i}`, invoeging[i]);
		}

		return r;
}


function efiberModal(tekst, tijd = false) {
	
	doc.body.className = `${doc.body.className} efiber-modal-open`;

	$modal = jQuery("<div class='efiber-modal'></div>");
	$modalBinnen = jQuery("<div class='efiber-modal-binnen'></div>");

	if (typeof tekst !== 'string') { // object met kop en torso
		if ('kop' in tekst) {
			$modalBinnen.append(jQuery(`<header><h3>${tekst.kop}</h3></header>`));
		}
		if ('torso' in tekst) {
			const t = (tekst.torso.indexOf('<') === -1) ? `<p>${tekst.torso}</p>` : tekst.torso;
			$modalBinnen.append(jQuery(t));
		}
	} else {
		const t = (tekst.indexOf('<') === -1) ? `<p>${tekst}</p>` : tekst;
		$modalBinnen.append(jQuery(t));
	}

	const $sluiten = jQuery("<a href='#' class='knop efiber-modal-sluiten' data-efiber-func='verwijder-modal'>X</a>");
	$modalBinnen.append($sluiten);

	$modal.append($modalBinnen);

	const $modalAchtergrond = $("<div class='efiber-modal-achtergrond' ><div class='efiber-modal-achtergrond-binnen knop' data-efiber-func='verwijder-modal'></div></div>");
	$modalAchtergrond.append($modal);


	$('body').append($modalAchtergrond);

	$modal.show().fadeIn(300);

	if (tijd) {
		setTimeout(() => {
			efiberVerwijderModal();
		}, tijd);
	}
}

function efiberVerwijderModal() {

	jQuery('.efiber-modal-achtergrond').fadeOut(300, () => {
		jQuery('.efiber-modal-achtergrond').remove();
	});

	// in rare situaties kunnen er meerdere modals geopend zijn.
	do {
		doc.body.className = doc.body.className.replace('efiber-modal-open', '').trim();
	} while (doc.body.className.indexOf('efiber-modal-open') !== -1);
}

document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27 || evt.keyCode == 13) {
        efiberVerwijderModal();
    }
};
