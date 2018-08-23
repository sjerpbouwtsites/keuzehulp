/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */
teksten = {
	postcodeVerkeerdGeformatteerd: 'Dit is niet uw postcode. Controleer wat u heeft ingevuld.',
	nietInUwGebied: 'Helaas, wij leggen (nog) geen glasvezel aan in jouw postcodegebied. We houden je graag op de hoogte van de ontwikkelingen.',
	interactieveTVGeenCoax: 'Interactieve TV gaat niet over coax. U kunt straks kiezen voor UTP kabels',
	vulHuisnummerIn: 'Vul een huisnummer in',
	minimum18: 'Om een glasvezelcontract af te sluiten dien je minimaal 18 te zijn.',
	correctTel: 'Dit is geen correct mobiel of vast nummer',
	aanvraagAlGedaan: "Iemand heeft reeds een aanvraag gedaan vanaf uw adres bij de provider %s0. Wij kunnen u niet verder helpen.<br>Bezoekt u <a href='%s1'>%s2s website</a> of mailt u naar %s3",

	leadAnnulering: "DUMMY Glasvezel gaat niet door en er zijn geen pakketten beschikbaar.",
	succesAnnulering: "DUMMY we leggen geen glasvezel maar u kunt wel een coax pakket afnemen",

	succesCoax: "DUMMY Er zijn nog geen plannen glasvezel aan te leggen maar u kunt wel een coax-pakket afnemen",

	postcodecheckFout: "DUMMY U bent tegen een fout in het programma aangelopen. Een bericht is naar de beheerders gestuurd. U wordt teruggestuurd naar iedereenglasvezel.nl",

	succesVraagbundeling: 'Gefeliciteerd, we willen glasvezel gaan aanleggen in jouw postcodegebied.',
	succesSchouwen: 'DUMMY Gefeliciteerd, we gaan glasvezel aanleggen in jouw postcodegebied. We zijn al aan het schouwen. Vlug!',
	succesGraafwerkzaamheden: 'DUMMY Gefeliciteerd, we leggen nu glasvezel aan in jouw postcodegebied. We zijn al aan het graven. Vlug!',
	succesHuisaansluitingen: 'DUMMY Gefeliciteerd, we leggen nu glasvezel aan in jouw postcodegebied. We zijn al aan het aansluiten. Vlug!',
	succesOpgeleverd: 'DUMMY Gefeliciteerd, er ligt al glasvezel in uw wijk. U kunt een abbonement afsluiten',

	geenPakkettenGevonden: "DUMMY We hebben geen pakketten gevonden met je huidige keuze. Probeer het nogmaals."
};

window.onload = function () { efiberInit(); };

function efiberTekst(snede, invoeging) {
	if (!(snede in teksten)) {
		console.error(`${snede} komt niet voor in teksten`);
		return '';
	}

	if (!invoeging) {
		return teksten[snede];
	}

	if (typeof invoeging === 'string') {
		return teksten[snede].replace('%s', invoeging);
	}

		let r = teksten[snede];

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
			$modalBinnen.append(jQuery(`<p>${tekst.torso}</p>`));
		}
	} else {
		$modalBinnen.append(jQuery(`<p>${tekst}</p>`));
	}

	const $sluiten = jQuery("<a class='knop efiber-modal-sluiten' data-efiber-func='verwijder-modal'>X</a>");
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
	console.log('verwijder modal');

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
