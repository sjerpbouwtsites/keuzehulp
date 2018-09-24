/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */

window.onload = function () { kzInit(); };

function kzTekst(snede, invoeging) {
	if (!(snede in kzModalTeksten)) {
		console.error(`${snede} komt niet voor in kzModalTeksten`);
		return '';
	}

	if (!invoeging) {
		return kzModalTeksten[snede];
	}

	// console.log('modal '+snede);

	if (typeof invoeging === 'string') {
		return kzModalTeksten[snede].replace('%s', invoeging);
	}

		let r = kzModalTeksten[snede];

		invoeging.forEach((invoeg, index) => {
			r = r.replace(`%s${index}`, invoeg);
		});

		return r;
}


function kzModal(tekst, tijd = false) {
	doc.body.className = `${doc.body.className} kz-modal-open`;

	$modal = jQuery("<div class='kz-modal'></div>");
	$modalBinnen = jQuery("<div class='kz-modal-binnen'></div>");

	if (typeof tekst !== 'string') { // object met kop en torso
		if ('kop' in tekst) {
			$modalBinnen.append(jQuery(`<header><h3>${tekst.kop}</h3></header>`));
		}
		if ('torso' in tekst) {
			$modalBinnen.append(jQuery(`<span>${tekst.torso}</span>`));
		}
	} else {
		$modalBinnen.append(jQuery(`<span>${tekst}</span>`));
	}

	const $sluiten = jQuery("<a href='#' class='knop kz-modal-sluiten' data-kz-func='verwijder-modal'>X</a>");
	$modalBinnen.append($sluiten);

	$modal.append($modalBinnen);

	const $modalAchtergrond = $("<div class='kz-modal-achtergrond' ><div class='kz-modal-achtergrond-binnen knop' data-kz-func='verwijder-modal'></div></div>");
	$modalAchtergrond.append($modal);


	$('body').append($modalAchtergrond);

	$modal.show().fadeIn(300);

	if (tijd) {
		setTimeout(() => {
			kzVerwijderModal();
		}, tijd);
	}
}

function kzVerwijderModal() {
	jQuery('.kz-modal-achtergrond').fadeOut(300, () => {
		jQuery('.kz-modal-achtergrond').remove();
	});

	// in rare situaties kunnen er meerdere modals geopend zijn.
	do {
		doc.body.className = doc.body.className.replace('kz-modal-open', '').trim();
	} while (doc.body.className.indexOf('kz-modal-open') !== -1);
}

document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27 || evt.keyCode == 13) {
        kzVerwijderModal();
    }
};
