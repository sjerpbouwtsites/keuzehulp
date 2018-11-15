function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

/* global doc, location, KzAjax, kzModal, kzTekst, gformInitDatepicker */
function aanmeldformulierHaalWaardeUitRij(rij) {
  /*--------------------------------------------------
  |
  |	Geeft de voor de 'rij' relevante waarde terug
  |	Dit is verschillend voor tekstvelden, tv-pakketten, 
  |	belpakketten, installaties
  |
  |**************************************************/
  var knop1 = rij.getElementsByClassName('knop')[0]; // is het een tekstveld, nummer oid?

  if (knop1.hasAttribute('type')) {
    return knop1.value;
  }

  if (knop1.classList.contains('kz-radio')) {
    var actieveKnop = rij.getElementsByClassName('actief');

    if (actieveKnop.length) {
      var ID = actieveKnop[0].id;

      if (knop1.classList.contains('tv-pakket')) {
        var s = ID.split('-');
        s.shift();
        s.pop();
        return s.join(' ');
      }

      if (rij.classList.contains('installatie')) {
        return ID.replace('installatie-keuze-', '');
      }

      if (rij.classList.contains('belpakketten')) {
        return ID.replace('belpakket-keuze-', '').replace('-', ' ');
      }

      return ID;
    }

    return '';
  } // checkbox stijl
  // IF ACTIEF!!!


  if (knop1.classList.contains('actief')) {
    return 'Ja';
  }

  return '';
}

function kzMaakPrintMap() {
  /*--------------------------------------------------
  |
  |	Creert object met daarin referenties van de aanmeldformulier 
  | 	invoervelden naar de GF velden waarnaar geprint dient te worden
  | 	Slaat dit object ter referentie op in een global; 
  | 	maakt het maar één keer aan.
  |
  |**************************************************/
  //if (window['kzPrintMappen']) return window['kzPrintMappen'];
  this.printMapInit = function (id) {
    return {
      printEl: document.getElementById(id),
      print: []
    };
  };

  var printMappen = {
    'begin-gemist': this.printMapInit('input_1_53'),
    'dvb-c': this.printMapInit('input_1_76'),
    erotiek: this.printMapInit('input_1_60'),
    'extra-optie': this.printMapInit('input_1_75'),
    'extra-tv-ontvangers': this.printMapInit('input_1_62'),
    'extra-vast-nummer': this.printMapInit('input_1_41'),
    foxsportscompleet: this.printMapInit('input_1_57'),
    foxsportseredivisie: this.printMapInit('input_1_55'),
    foxsportsinternationaal: this.printMapInit('input_1_56'),
    'huidige-extra-nummer': this.printMapInit('input_1_43'),
    'huidige-nummer': this.printMapInit('input_1_40'),
    'inschrijving-telefoonboek': this.printMapInit('input_1_74'),
    'nummerbehoud-extra-vast-nummer': this.printMapInit('input_1_42'),
    'opnemen-replay-begin-gemist-samen': this.printMapInit('input_1_50'),
    'plus': this.printMapInit('input_1_61'),
    ziggosporttotaal: this.printMapInit('input_1_58'),
    app: this.printMapInit('input_1_54'),
    belpakket: this.printMapInit('input_1_38'),
    film1: this.printMapInit('input_1_59'),
    installatie: this.printMapInit('input_1_44'),
    nummerbehoud: this.printMapInit('input_1_39'),
    opnemen: this.printMapInit('input_1_51'),
    replay: this.printMapInit('input_1_52')
  }; //window.kzPrintMappen = printMappen; @TODO TERUGOPTIMALISEREN

  return printMappen;
}

function kzUpdateHidden() {
  /*------------------------------------------------------
  |
  | 	functie draait iedere keer dat een knop wordt aangeklikt
  | 	print waarden van dynamische formulier in hidden velden GF.
  | 	printwijze is afhankelijk van type data
  |
  |-----------------------------------------------------*/
  var printMappen = kzMaakPrintMap();
  console.log(printMappen);
  var aanmeldformulier = doc.getElementById('print-aanmeldformulier');
  var inputs = aanmeldformulier.querySelectorAll('[data-kz-waarde]');
  var rijen = Array.from(inputs, function (input) {
    return kzVindRij(input);
  }).filter(uniek).forEach(function (rij) {
    var inputs = rij.querySelectorAll('[data-kz-waarde]');
    var isRadio = !!rij.getElementsByClassName('kz-radio').length;
    var printsleutel = null; // sleutel in printMappen

    if (isRadio) {
      // bv belpakket
      var famIDPrefix = inputs[0].id.split('-')[0];
      var dezeRadios = doc.querySelectorAll("[id*=\"".concat(famIDPrefix, "\"]"));
      printMappen[famIDPrefix].print = Array.from(dezeRadios, function (input) {
        if (input.classList.contains('tv-pakket')) {
          var w = kzPakKnopValue(input) ? "ja" : "nee";
          var s = input.id.split('-');
          return "Type: ".concat(s[0], " - subtype: ").concat(s[1], " => ").concat(w, ".");
        } else {
          var _w = kzPakKnopValue(input);

          if (_w) {
            var _s = input.id.split('-');

            _s.shift();

            _s.shift();

            _s = _s.join(' ');
            return _s;
          }
        }
      });
    } else {
      printsleutel = inputs[0].id;

      if (['huidige-nummer', 'huidige-extra-nummer'].includes(printsleutel)) {
        printMappen[printsleutel].print = [inputs[0].value];
        printMappen[printsleutel].contekst = 'tekstveld';
      } else {
        var w = kzPakKnopValue(inputs[0]);

        if (!printMappen[printsleutel]) {
          console.warn(printsleutel + 'niet gevonden in printmap');
        } else {
          printMappen[printsleutel].contekst = 'getal of ja/nee';

          if (!w) {
            printMappen[printsleutel].print = ['nee'];
          } else if (w < 2) {
            printMappen[printsleutel].print = ['ja'];
          } else {
            printMappen[printsleutel].print = [w];
          }
        }
      }
    }
  });
  Object.entries(printMappen).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        printMapID = _ref2[0],
        printVerz = _ref2[1];

    printVerz.printEl.value = printVerz.print.filter(function (w) {
      return w && w.length;
    }).join(' - ');
  });
}

function haalPrintAanmeldformulier(knop) {
  /*------------------------------------------------------
  |
  | 	Haalt het formulier op van keuzehulp_haal_aanmeldformulier
  | 	Doe formulier nabewerking, zet wat eventhandlers er op
  | 	Doet wat inputvalidatie
  | 	Zet de datepicker 'juist aan'
  | 	Kent de klasse 'actief' toen aan rijen met een geactiveerde optie
  | 	Vervangt %ALGEMENE VOORWAARDEN% in html met providerspecifieke tekst.
  |
  |-----------------------------------------------------*/
  // bereid pakket voor voor verzending
  var pakket = window["kz-pakket-".concat(knop.getAttribute('kz-data-pakket-id'))]; // zet veilig data-object op pakket met daarin de eigenschappen

  pakket.bereidJSONverzendingVoor();
  doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';
  doc.getElementById('print-aanmeldformulier').setAttribute('data-pakket-id', pakket.ID);
  var ajf = new KzAjax({
    ajaxData: {
      action: 'keuzehulp_haal_aanmeldformulier',
      adres: JSON.parse(sessionStorage.getItem('kz-adres')),
      keuzehulp: JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
      pakket: pakket.klaarVoorJSON
    },
    cb: function cb(r) {
      var _this = this;

      if (!r) console.warn('geen correcte JSON teruggekregen haalPrintAanmeldformulier'); // const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

      var printPlek = doc.getElementById('print-aanmeldformulier');
      printPlek.innerHTML = '';
      $(printPlek).append($(r.print)); // de HTML van het formulier.
      // het formulier kan proberen te printen naar een niet bestaande url

      printPlek.getElementsByTagName('form')[0].setAttribute('action', kzBasisUrl);
      pakket = kzPakPakket(r.id); // het zijn de click events die de verwerking van de data aanjagen..

      printPlek.addEventListener('change', function (e) {
        var t = e.target,
            idAr = ['huidige-nummer', 'huidige-extra-nummer'];

        if (t.hasAttribute('type') && t.getAttribute('type') === 'number' || idAr.indexOf(t.id) !== -1) {
          e.target.click();
        }
      }); // hieronder printen we het adres naar het formulier, voorzover we dat hebben.

      var adres = JSON.parse(sessionStorage.getItem('kz-adres')),
          adresDataToewijzing = {
        input_1_20: 'postcode',
        input_1_21: 'huisnummer',
        input_1_22: 'toevoeging',
        input_1_23: 'kamer',
        input_1_73: 'gebiedscode'
      };
      Object.entries(adresDataToewijzing).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];

        var el = doc.getElementById(key);
        el.value = adres[value];
      }); // alle rijen met actieve knoppen op actief

      Array.from(printPlek.getElementsByClassName('knop')).forEach(function (knopE) {
        var rij = kzVindRij(knopE);

        if (knopE.classList.contains('actief')) {
          rij.classList.add('heeft-actieve-knop');
        }

        rij.classList.add('heeft-knop'); //knopE.setAttribute('data-pakket-id', r.id);
      }); // schrijf pakket naam en provider naar formulier

      doc.getElementById('input_1_66').value = "".concat(pakket.naam_composiet, " ").concat(pakket.huidige_snelheid);
      doc.getElementById('input_1_64').value = pakket.provider;
      doc.getElementById("input_1_81").value = JSON.parse(sessionStorage.getItem('kz-adres')).perceelcode; // schrijf opties naar GF

      kzUpdateHidden(); // oa de datepicker initialiseren

      kzInitialiseerGF(); // schrijf de user naar de GF hidden fields
      // kzUser wordt in een footer in PHP uitgedraaid

      if (kzUser && kzUser.data && kzUser.data.display_name) {
        doc.getElementById('input_1_80').value = kzUser.data.display_name;
      } // controle van het mobiele nummer


      $('#input_1_30').on('blur', function () {
        var vastNummer = /^(((0)[1-9]{2}[0-9][-]?[1-9][0-9]{5})|((\\+31|0|0031)[1-9][0-9][-]?[1-9][0-9]{6}))$/,
            mobielNummer = /^(((\\+31|0|0031)6){1}[1-9]{1}[0-9]{7})$/i;

        if (!(vastNummer.test(this.value) || mobielNummer.test(this.value))) {
          kzModal(kzTekst('correct_tel'), 1500);
        }
      }); // is er misschien via ajax een nieuwe ingezet en heeft die %PRINT_ALGEMENE_VOORWAARDEN%?
      // @TODO LELIJKE HACK

      var vervangAlgemeneVoorwaarden = setInterval(function () {
        var e = $('#field_1_72'),
            tekstFaal = e.text().indexOf('%PRINT_ALGEMENE_VOORWAARDEN%') !== -1;

        if (tekstFaal) {
          e.empty();
          var t = null;

          if (r.pakket) {
            t = r.pakket.eigenschappen.teksten.ik_ga_akkoord_met;
          } else {
            t = kzPakPakket(doc.getElementById('print-aanmeldformulier').dataset.pakketId).eigenschappen.teksten.ik_ga_akkoord_met;
          }

          t = t.replace(/\\\//g, '/');
          e.append($(t));
          clearInterval(vervangAlgemeneVoorwaarden);
        }
      }, 500); // schrijft eenmalig & maandelijks naar hun totalen

      pakket.printPrijzen(); // op veranderen snelheid, opnieuw pakket versturen naar dit formulier.

      var schakelSnelheid = doc.getElementById('schakel-snelheid');

      if (schakelSnelheid) {
        doc.getElementById('schakel-snelheid').addEventListener('change', function () {
          pakket.veranderSnelheid(doc.getElementById('schakel-snelheid').value);
          doc.getElementById('print-aanmeldformulier').innerHTML = '<p>Formulier wordt geladen...</p>';
          pakket.bereidJSONverzendingVoor();
          _this.ajaxData.pakket = pakket.klaarVoorJSON;

          _this.doeAjax();
        });
      }
    }
  }); // ajax

  ajf.doeAjax();
}

function kzInitialiseerGF() {
  /*------------------------------------------------------
  |
  | 	Hulpfunctie voor haal aanmeldformulier op
  |	Initialiseert de datumpicker en doet leeftijdsvalidatie.
  |
  |-----------------------------------------------------*/
  jQuery.datepicker.regional.nl = {
    closeText: 'Sluiten',
    prevText: '←',
    nextText: '→',
    currentText: 'Vandaag',
    monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
    monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
    dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    dayNamesShort: ['zon', 'maa', 'din', 'woe', 'don', 'vri', 'zat'],
    dayNamesMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
    weekHeader: 'Wk',
    dateFormat: 'dd-mm-yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
  };
  jQuery.datepicker.setDefaults(jQuery.datepicker.regional.nl); // date field interactief.

  gformInitDatepicker();
}

function kzUpdatePrijs(knop) {
  /*------------------------------------------------------
  |
  | 	Haalt pakket op
  | 	Schrijft wijzigingen weg
  | 	Print prijzen
  |
  |-----------------------------------------------------*/
  var pakket = null;

  if (knop.hasAttribute('data-pakket-id')) {
    pakket = window["kz-pakket-".concat(knop.getAttribute('data-pakket-id'))];
  } else {
    pakket = window["kz-pakket-".concat(doc.getElementById('print-aanmeldformulier').getAttribute('data-pakket-id'))];
  }

  var optie, hoeveelheid;

  if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number') {
    optie = knop.id;
    hoeveelheid = knop.value;
  } else if (knop.classList.contains('belpakket')) {
    optie = knop.id.replace('belpakket-keuze-', '');
    hoeveelheid = kzPakKnopValue(knop);
  } else if (knop.classList.contains('installatie')) {
    optie = knop.id.replace('keuze-', '');
    hoeveelheid = kzPakKnopValue(knop);
  } else {
    optie = knop.id;
    hoeveelheid = kzPakKnopValue(knop);
  }

  if (knop.classList.contains('tv-pakket')) {
    var sleutel = pakket.vindOptieSleutel({
      naam: knop.dataset.kzOptienaam,
      snelheid: pakket.huidige_snelheid,
      optietype: 'televisie-bundel',
      suboptietype: knop.dataset.kzSuboptietype,
      tvType: pakket.eigenschappen.tv_type
    });
    pakket.mutatie(sleutel, hoeveelheid);
  } else {
    pakket.mutatie(optie, hoeveelheid);
  }

  pakket.printPrijzen();
}

function kzSchakelInputGeneriek(knop) {
  /*------------------------------------------------------
  |
  |	Vindt de rij en schakelt op rij en knop de klasse actief.
  | 	Tenzij een radio, dan wordt de knop actief geschakelt
  |
  |-----------------------------------------------------*/
  if (knop.classList.contains('actief')) {
    knop.classList.remove('actief');
  } else {
    knop.classList.add('actief');
  }

  var rij = kzVindRij(knop);

  if (rij.getElementsByClassName('actief').length) {
    rij.classList.add('heeft-actieve-knop');
  } else {
    rij.classList.remove('heeft-actieve-knop');
  }
}

function kzPakKnopValue(knop) {
  /*------------------------------------------------------
  |
  |	Een number of text input gebruikt de 'echte' input.
  | 	Een zelfgebouwde radio of checkbox gebruikt data-kz-value
  | 	Dit normaliseert dat.
  |
  |-----------------------------------------------------*/
  if (knop.hasAttribute('value') || typeof knop.value !== 'undefined') {
    return Number(knop.value);
  }

  return Number(knop.getAttribute('data-kz-value'));
}

function kzSchakelCheckbox(knop) {
  /*------------------------------------------------------
  |
  | 	Stuurt functies aan die de klassen schakelen,
  | 	value van input schakelt en prijsberekening en -printen doen.
  |
  |-----------------------------------------------------*/
  kzSchakelInputGeneriek(knop);
  var val = kzPakKnopValue(knop);
  if (!val) val = 0;

  if (val === 0) {
    knop.setAttribute('data-kz-value', 1);
  } else {
    knop.setAttribute('data-kz-value', 0);
  }

  kzUpdatePrijs(knop);
}

function kzSchakelRadio(knop) {
  /*------------------------------------------------------
  |
  |	Zorgt er voor dat (quasi)-radio's hun werk doen
  | 	En gebruikt kzSchakelCheckbox voor het effectueren van keuzes.
  | 	Je zou een verzameling radio's als een verzameling gekoppelde
  | 	checkboxes kunnen zien, daar maakt het gebruik van.
  |
  |-----------------------------------------------------*/
  var rij = knop;

  do {
    rij = rij.parentNode;
  } while (!rij.classList.contains('rij') && !rij.classList.contains('print-aanmeldformulier'));

  if (rij.classList.contains('print-aanmeldformulier')) return new Error('rij niet gevonden');
  var echteRadio = knop.classList.contains('installatie');
  var magErGeenTweeHebben = knop.classList.contains('kz-radio');
  var knoppenInVerzameling = rij.getElementsByClassName('knop');
  var isActief = knop.classList.contains('actief');

  if (isActief && !echteRadio) {
    kzSchakelCheckbox(knop);
  } else if (isActief && echteRadio) {
    if (knoppenInVerzameling.length === 1) {// niets doen.
    } else {
      // eerst zelf uitzetten
      // dan eerste best aanzetten.
      kzSchakelCheckbox(knop);
      Array.from(knoppenInVerzameling).forEach(function (knopUitVerz) {
        if (knopUitVerz.id !== knop.id) kzSchakelCheckbox(knopUitVerz);
      });
    }
  } else if (!isActief && !echteRadio) {
    if (magErGeenTweeHebben) {
      if (rij.getElementsByClassName('actief').length) {
        kzSchakelCheckbox(rij.getElementsByClassName('actief')[0]);
      }
    }

    kzSchakelCheckbox(knop);
  } else {
    if (rij.getElementsByClassName('actief').length) {
      kzSchakelCheckbox(rij.getElementsByClassName('actief')[0]);
    }

    kzSchakelCheckbox(knop);
  }
}

function kzFoxSchakel(knop) {
  /*------------------------------------------------------
  |
  |	Sommige pakketten hebben eredivisie compleet. Dit is een kortingsbundel van 
  | 	fox eredivisie en fox internationaal. Die sluiten elkaar uit
  | 	schakelen elkaar. Dat wordt hier geregeld.
  |
  |-----------------------------------------------------*/
  // is dit de compleet knop of eredivisie / internationaal?
  var alleFox = Array.from(doc.querySelectorAll('[data-kz-func~="fox-sports"]'));

  if (knop.id.includes('compleet')) {
    // de knop domineert. Als deze uitgaat, blijven anderen uit. Als de aan gaat, gaan anderen uit.
    // dus naar normale schakelCheckbox slechts de andere twee uitzetten.
    if (kzPakKnopValue(knop)) {
      alleFox.filter(function (filterKnop) {
        return !filterKnop.id.includes('compleet') && kzPakKnopValue(filterKnop);
      }).forEach(function (zetKnop) {
        return kzSchakelCheckbox(zetKnop);
      });
    }
  } else if (alleFox.length > 2) {
    // zijn er wel drie pakketten?
    // als ze allebei aan staan, dan allebei uit en compleet knop aan.
    // andere gevallen hoeft niet geschakeld te worden.
    // dus loopen en schakelen
    var aantalAan = alleFox.filter(function (knop2) {
      return !knop2.id.includes('compleet') && kzPakKnopValue(knop2);
    }).length; // altijd compleet uit, voor de vergelijking, als je op een losse klikt.

    alleFox.filter(function (knop3) {
      return knop3.id.includes('compleet') && kzPakKnopValue(knop3);
    }).forEach(function (knop4) {
      return kzSchakelCheckbox(knop4);
    });

    if (aantalAan > 1) {
      alleFox.filter(function (nietDeCompleetKnop) {
        return !nietDeCompleetKnop.id.includes('compleet');
      }).forEach(function (zetMUit) {
        return kzSchakelCheckbox(zetMUit);
      });
      alleFox.filter(function (nietDeCompleetKnop) {
        return nietDeCompleetKnop.id.includes('compleet');
      }).forEach(function (zetMAan) {
        return kzSchakelCheckbox(zetMAan);
      });
    }
  }
}

function kzSchakelNumber(knop) {
  /*------------------------------------------------------
  |
  |	Een nummer input is lekker simpel.
  |
  |-----------------------------------------------------*/
  kzUpdatePrijs(knop);
  var rij = kzVindRij(knop);

  if (kzPakKnopValue(knop) > 0) {
    rij.classList.add('heeft-actieve-knop');
  } else {
    rij.classList.remove('heeft-actieve-knop');
  }
}

function KzAantalTvs(optellen) {
  /*------------------------------------------------------
  |
  |	Middelware tussen number input aantal TVs en rest formulier / updateHidden
  |
  |-----------------------------------------------------*/
  var extraTVontvangers = document.getElementById('extra-tv-ontvangers');

  if (optellen) {
    if (extraTVontvangers.max) {
      var n = Number(extraTVontvangers.value) + 1;

      if (n > Number(extraTVontvangers.max)) {
        kzModal({
          kop: 'Maximum bereikt',
          torso: kzTekst('maximum_tv_ontvangers', extraTVontvangers.max)
        });
      } else {
        extraTVontvangers.value = n;
      }
    } else {
      extraTVontvangers.value = Number(extraTVontvangers.value) + 1;
    }
  } else if (Number(extraTVontvangers.value)) {
    // is niet 0
    extraTVontvangers.value = Number(extraTVontvangers.value) - 1;
  }

  extraTVontvangers.click();
}

var Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  // public method for encoding
  encode: function encode(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = (chr1 & 3) << 4 | chr2 >> 4;
      enc3 = (chr2 & 15) << 2 | chr3 >> 6;
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }

    return output;
  },
  // public method for decoding
  decode: function decode(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = enc1 << 2 | enc2 >> 4;
      chr2 = (enc2 & 15) << 4 | enc3 >> 2;
      chr3 = (enc3 & 3) << 6 | enc4;
      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }

      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);
    return output;
  },
  // private method for UTF-8 encoding
  _utf8_encode: function _utf8_encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode(c >> 6 | 192);
        utftext += String.fromCharCode(c & 63 | 128);
      } else {
        utftext += String.fromCharCode(c >> 12 | 224);
        utftext += String.fromCharCode(c >> 6 & 63 | 128);
        utftext += String.fromCharCode(c & 63 | 128);
      }
    }

    return utftext;
  },
  // private method for UTF-8 decoding
  _utf8_decode: function _utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode((c & 31) << 6 | c2 & 63);
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        i += 3;
      }
    }

    return string;
  }
  /* eslint-enable */

};
function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function KzAjax(params) {
  var _this = this;

  /*------------------------------------------------------
  |
  | 	Wrapperklasse voor ajaxcalls naar achterkant.
  |
  |-----------------------------------------------------*/
  // terugval
  this.ajaxData = {};

  this.cb = function () {}; // overschrijven met params


  Object.entries(params).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    _this[k] = v;
  });

  this.verwerkResponse = function (response) {
    var r = JSON.parse(response);

    if ('console' in r && r.console) {
      console.dir(r.console);
    }

    if ('error' in r && r.error) {
      console.error(new Error(r.error));
    }

    return r;
  };

  this.doeAjax = function () {
    jQuery.post("".concat(location.origin, "/wp-admin/admin-ajax.php"), _this.ajaxData, function (response) {
      _this.cb(_this.verwerkResponse(response));
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
    var $form = $(this).closest('.gform_wrapper form');
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
  var ajf = new KzAjax({
    ajaxData: {
      action: backendFunctie,
      data: data
    },
    cb: function cb(r) {
      jQuery("#".concat(printElID)).append($(r.print));
      jQuery("#".concat(printElID)).find('form').attr('action', location.origin);
      kzFormStijlKlassen();
    }
  });
  ajf.doeAjax();
}
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function postcodeAjaxCB(r) {
  /*------------------------------------------------------
  |
  | 	callback voor postcode ajax
  | 	breekt af met modal en doorverwijzing als achterkant zegt: niet in gebied
  | 	breekt af met modal en doorverwijzing als achterkant zegt: in gebied, maar aanvraag al gedaan
  | 	slaat anders info over gebied op die uit achterkant komt
  | 	vervangt ankers in hele app met terugverwijzingen naar respectieve campagnepagina's
  | 	initialiseert stickyKeuzes functie
  | 	verwijst door naar daadwerkelijke keuzehulp, niveau 2.
  |
  |-----------------------------------------------------*/
  if (r && r.gevonden) {
    if (r.aanvraag_al_gedaan) {
      // "Er is al een aanvraag gedaan vanaf uw adres bij %provider%.
      // Bezoekt u de website op %providerURL% of mailt u naar %providerMail%"
      //Iemand heeft reeds een aanvraag gedaan vanaf uw adres bij de provider %s0. Wij kunnen u nu niet verder helpen.<br>Bezoekt u <a href='%s1'>%s2s website</a> of mailt u naar %s3. U kunt ook bellen naar %s4
      kzModal({
        kop: 'Aanvraag al gedaan',
        torso: kzTekst('aanvraag_gedaan', [r.aanvraag_info.naam, r.aanvraag_info.URL, r.aanvraag_info.naam, r.aanvraag_info.email, r.aanvraag_info.telefoon])
      }, 60000);
      kzRouting.ga(1); // terug naar de voorpagina.

      return;
    } // @TODO dit is drie keer hetzelfde. Doe het allemaal via het adres.
    // hoe wordt door de achterkant teruggegeven?!


    r.data.gebiedscode = r.gebiedscode;
    r.data.status = r.status;
    r.data.perceelcode = r.perceelcode;
    sessionStorage.setItem('kz-adres', JSON.stringify(r.data));
    sessionStorage.setItem('kz-code', r.gebiedscode);
    body.setAttribute('data-kz-status', r.data.status);

    if (r.status === '100') {
      //geannuleerd
      if (r.provider_beschikbaar) {
        kzModal(kzTekst('succes_annulering'), 2000);
        kzRouting.ga(2);
      } else {
        kzModal(kzTekst('lead_annulering'), 5000);
        kzRouting.ga(51);
        KzAjaxKleineFormulieren('keuzehulp_haal_lead_formulier', 'print-lead-formulier', {});
      }
    } else if (r.status === '0') {
      if (r.provider_beschikbaar) {
        kzRouting.ga(2);
      } else {
        logFouteSituatiePostcodeCheck(r);
      }
    } else {
      if (r.provider_beschikbaar) {
        /*				const tekstSleutel = {
        					status1: 'succes_vraag_bundeling',
        					status2: 'succes_schouwen',
        					status3: 'succes_graafwerkzaamheden',
        					status4: 'succes_huisaansluitingen',
        					status5: 'succes_opgeleverd',
        				};
        
        				kzModal(
        					kzTekst(tekstSleutel[`status${r.status}`], r.regio),
        					2000,
        				);*/
        kzRouting.ga(2);
      } else {
        logFouteSituatiePostcodeCheck(r);
      }
    }
  } else {
    kzModal(kzTekst('niet_in_uw_gebied'), 5000);
    kzRouting.ga(51);
    kzAjaxKleineFormulieren('keuzehulp_haal_lead_formulier', 'print-lead-formulier', {}); // kzHaalLeadFormulier();
  }
}

function logFouteSituatiePostcodeCheck(r) {
  /*------------------------------------------------------
  |
  | 	Voor iedere postcode dienen er providers te zijn. Dit is een proxy voor pakketten. 
  | 	De achterkant zoekt hiernaar tijdens de postcode check.
  | 	Deze functie post naar de foutrapportage als er geen provider is voor deze postcode.
  |
  |-----------------------------------------------------*/
  kzModal(kzTekst('postcodecheck_fout'), 5000);
  var ajf = new KzAjax({
    ajaxData: {
      action: 'kz_schrijf_fout',
      data: {
        aType: 'geen pakketten gevonden',
        postcodecheckData: r
      }
    },
    cb: function cb() {
      setTimeout(function () {
        location.href = location.origin;
      }, 1500);
    }
  });
  ajf.doeAjax();
}

function controleerPostcode() {
  /*------------------------------------------------------
  |
  | 	Gaat om met de input van de postcodeformulier
  | 	Valideert de invoer
  | 	Stuurt info naar de achterkantfunctie keuzehulp_controleer_postcode
  | 	Laat de afhandeling van die ajax call verder doen door postcodeAjaxCB
  |
  | 	Bevat een stukje routing; als iemand op een url komt waarop de keuzehulp niet draait
  | 	herkent adhv of formulier bestaat of niet, dan wordt die persoon doorgestuurd naar /keuzehulp
  | 	Dus bijvoorbeeld verversen in keuzehulp/nep-URI -> 404 -> /keuzehulp
  |
  |-----------------------------------------------------*/
  var postcodeForm = doc.getElementById('keuze-postcodeform');

  if (!postcodeForm && !location.href.includes('bedankt') && !location.href.includes('dankje')) {
    location.href = location.origin;
  }

  var getVars = {}; // binnenkomend via formulier op iedereenglasvel.nl?

  if (location.search) {
    location.search.substr(1, location.search.length).split('&').forEach(function (a) {
      var t = a.split('=');
      getVars[t[0]] = t[1];
    }); // minimaal vereist: postcode en huisnummer

    if (getVars.huisnummer && getVars.postcode) {
      var pc = getVars.postcode.replace('%20', '');
      var ajf = new KzAjax({
        ajaxData: {
          action: 'keuzehulp_controleer_postcode',
          data: {
            postcode: pc,
            huisnummer: getVars.huisnummer,
            toevoeging: getVars.toevoeging || '',
            kamer: getVars.kamer || ''
          }
        },
        cb: postcodeAjaxCB
      });
      ajf.doeAjax();
    }
  }

  postcodeForm.addEventListener('submit', function (e) {
    // we valideren alleen postcode en huisnummer
    // want andere twee zouden leeg moeten kunnen zijn.
    e.preventDefault();
    var postcodeTekst = doc.getElementById('postcode').value.replace(' ', '').toUpperCase(),
        correctePostcode = /^[1-9][0-9]{3} ?(?!SA|SD|SS)[A-Z]{2}$/i.test(postcodeTekst),
        huisnummer = doc.getElementById('huisnummer').value.replace(' ', '').toLowerCase();

    if (!huisnummer.length) {
      kzModal(kzTekst('vul_huis_nummer_in'), 2500);
      return;
    }

    if (correctePostcode) {
      var _ajf = new KzAjax({
        ajaxData: {
          action: 'keuzehulp_controleer_postcode',
          data: {
            postcode: postcodeTekst,
            huisnummer: huisnummer,
            toevoeging: doc.getElementById('toevoeging').value.replace(' ', '').toLowerCase(),
            kamer: doc.getElementById('kamer').value.replace(' ', '').toLowerCase()
          }
        },
        cb: postcodeAjaxCB
      });

      _ajf.doeAjax(); // verkeerd geformatteerde postcode

    } else {
      kzModal(kzTekst('postcode_verkeerd_geformatteerd'), 2500);
    }
  });
}
/* eslint-disable */
function knoppenDispatcher() {
  /*------------------------------------------------------
  |
  |	een knop (class='knop') kan 0 tot n functies hebben
  |	data-kz-func='kz-stap-terug kz-drink-koffie'
  |	doet: knoppenFuncs['kzStapTerug'](knop) en
  |	knoppenFuncs['kzDrinkKoffie'](knop)
  |	met de knop dus als parameter.
  |
  |	Het nut van deze dispatcher zit er in dat pas op het moment dat de daadwerkelijke
  | 	klik gedaan wordt, en deze dus aankomt bij de body, de functie wordt aangeroepen.
  | 	Het eea. is dus niet HTML of JS-volgorde afhankelijk, louter van of de body bestaat als
  | 	deze dispatcherfunctie wordt gedraaid.
  |
  | 	In principe stuur de dispatcher alleen aan maar voor zeer kleine functies is een uitzondering gemaakt.
  |
  |-----------------------------------------------------*/
  body.addEventListener('click', function (e) {
    var t = e.target;
    var knop = kzVindKnop(t, 'knop');

    if (knop) {
      e.preventDefault();
      if (!knop.hasAttribute('data-kz-func') || knop.className.indexOf('invalide') !== -1) return;
      var funcAttr = knop.getAttribute('data-kz-func').trim();

      if (!funcAttr || typeof funcAttr === 'undefined') {
        console.error('funcAttr undefined');
        console.log(knop);
        return false;
      } //zijn het er één of meer?


      var funcs = [];

      if (funcAttr.indexOf(' ') !== '') {
        funcs = funcAttr.split(' ');
      } else {
        funcs = [funcAttr];
      }

      for (var i = 0; i < funcs.length; i++) {
        var funcNaam = naarCamelCase(funcs[i]);

        if (knoppenFuncs[funcNaam]) {
          // console.log('dispatch '+funcNaam);
          knoppenFuncs[funcNaam](knop);
        } else {
          console.log('geen knop func gedefinieerd', funcNaam);
        }
      }
    } else {//kan ieder willekeurig ander element zijn geweest.
    }
  });
}

var knoppenFuncs = {
  // zie knoppendispatcher
  toonStap: function toonStap(knop) {
    var n = knop.hasAttribute('href') ? knop.href.split('#')[1] : knop.getAttribute('data-href').split('#')[1];
    kzRouting.ga(n);
  },
  animeer: function animeer(knop) {
    kzAnimeerKnoppen(knop);
  },
  stapTerug: function stapTerug(knop) {
    kzRouting.stapTerug();
  },
  leegKeuzehulp: function leegKeuzehulp() {
    sessionStorage.setItem('kz-keuzehulp', JSON.stringify({}));
  },
  zetNiveauKnop: function zetNiveauKnop(knop) {
    kzZetNiveauKnop(knop);
  },
  zetSituatie: function zetSituatie(knop) {
    var s = knop.getAttribute('data-kz-situatie-keuze');
    keuzehulpGeneriek(knop, 'data-kz-situatie-keuze', 'situatie', function () {
      body.setAttribute('data-kz-situatie-keuze', s);
    });
    kzSluitRoutesUit(naarCamelCase(s)); // dit is de eerste keuze waar je langs komt als je
    // van IWWIW komt en vervolgens naar de keuzehulp gaat.
    // in het aanmeldformulier is het bestaan van die sleutel en test of je daarvandaan komt
    // dus hier weghalen

    var kh = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

    if ('ik-weet-wat-ik-wil' in kh) {
      delete kh['ik-weet-wat-ik-wil'];
      sessionStorage.setItem('kz-keuzehulp', JSON.stringify(kh));
    }
  },
  haalZakelijkFormulier: function haalZakelijkFormulier() {
    var gebiedscode = JSON.parse(sessionStorage.getItem('kz-adres')).gebiedscode;
    kzAjaxKleineFormulieren('keuzehulp_haal_zakelijk_formulier', 'print-zakelijk-formulier', {
      gebiedscode: gebiedscode
    });
  },
  zetKeuzeInternet: function zetKeuzeInternet(knop) {
    keuzehulpGeneriek(knop, 'data-kz-internet-keuze', 'internet');
  },
  zetNummersConsequentie: function zetNummersConsequentie(knop) {
    var k = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

    if ('situatie' in k) {
      if (k['situatie'] === 'kleinZakelijk') {
        kzSluitRoutesUit('nummersZakelijk');
      } else {
        kzSluitRoutesUit('nummersParticulier');
      }
    } else {
      kzSluitRoutesUit('nummersParticulier');
    }
  },
  zetKeuzeBellen: function zetKeuzeBellen(knop) {
    keuzehulpGeneriek(knop, 'data-kz-bellen-keuze', 'bellen');
  },
  zetKeuzeNummers: function zetKeuzeNummers(knop) {
    keuzehulpGeneriek(knop, 'data-kz-nummers-keuze', 'nummers');
  },
  zetKeuzeTelevisie: function zetKeuzeTelevisie(knop) {
    keuzehulpGeneriek(knop, 'data-kz-televisie-keuze', 'televisie');
    /*		//als interactieve TV, sla dan kabelstap over en sla op dat keuze kabels is UTP.
    		var tvOptiesVerderKnop = doc.querySelector('.kz-navigatie-binnen a[data-keuzehulp-stap="9"]');
    
    		if (knop.getAttribute('data-kz-televisie-keuze') == 3) {
    			tvOptiesVerderKnop.setAttribute('href', '#11');
    
    			var kh = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
    			kh.bekabeling = "2";
    			sessionStorage.setItem('kz-keuzehulp', JSON.stringify(kh));
    
    		} else if (knop.getAttribute('data-kz-televisie-keuze') == 2)  {
    			tvOptiesVerderKnop.setAttribute('href', '#10');
    		}*/
  },
  zetKeuzeTelevisieOpties: function zetKeuzeTelevisieOpties(knop) {
    keuzehulpGeneriek(knop, 'data-kz-televisie-opties-keuze', 'televisie-opties');
  },
  zetKeuzeBekabeling: function zetKeuzeBekabeling(knop) {
    keuzehulpGeneriek(knop, 'data-kz-bekabeling-keuze', 'bekabeling');
  },
  zetKeuzeInstallatie: function zetKeuzeInstallatie(knop) {
    keuzehulpGeneriek(knop, 'data-kz-installatie-keuze', 'installatie');
  },
  zetKeuzeIkWeetWatIkWil: function zetKeuzeIkWeetWatIkWil(knop) {
    keuzehulpGeneriek(knop, 'data-kz-ik-weet-wat-ik-wil-keuze', 'ik-weet-wat-ik-wil');
  },
  laadIkWeetWatIkWilPakketten: function laadIkWeetWatIkWilPakketten() {
    ikWeetWatIkWilPakkettenAjax();
  },
  vergelijking: function vergelijking() {
    vergelijkingAjax();
  },
  aanmeldformulier: function aanmeldformulier(knop) {
    // aanmeldformulier.js
    haalPrintAanmeldformulier(knop);
  },
  zakelijkFormulier: function zakelijkFormulier() {
    kzHaalZakelijkFormulieren();
  },
  aanmeldingSchakel: function aanmeldingSchakel(knop) {
    if (knop.className.indexOf('radio') !== -1) {
      // aanmeldformulier.js
      kzSchakelRadio(knop);
    } else if (knop.className.indexOf('checkbox') !== -1) {
      // aanmeldformulier.js
      kzSchakelCheckbox(knop);
    } else if (knop.hasAttribute('type') && knop.getAttribute('type') === 'number') {
      // aanmeldformulier.js
      kzSchakelNumber(knop);
    } else {
      console.warn('formulier schakel func onbekend');
    } //kzUpdatePrijzen();

  },
  belpakketten: function belpakketten(knop) {
    // aanmeldformulier.js
    kzBelpakketten(knop);
  },
  extraVastNummer: function extraVastNummer(knop) {
    // aanmeldformulier.js
    kzExtraVastNummer(knop);
  },
  foxSports: function foxSports(knop) {
    // aanmeldformulier.js
    kzFoxSchakel(knop);
  },
  updateHidden: function updateHidden() {
    // aanmeldformulier.js
    kzUpdateHidden();
  },
  verwijderModal: function verwijderModal() {
    kzVerwijderModal();
  },
  toonMeerPakket: function toonMeerPakket() {
    var secties = doc.getElementById('print-vergelijking').getElementsByClassName('kz-form-sectie');

    for (var i = 1; i < secties.length; i++) {
      //tweede sectie verwijderen
      if (i === 1) {
        secties[i].parentNode.removeChild(secties[i]);
      } else {
        secties[i].style.display = "block";
      }
    }

    $(".Aanvullende-informatie").css({
      'display': 'flex'
    });
  },
  telefonieModal: function telefonieModal(knop) {
    kzTelefonieModal(knop);
  },
  aantalZendersModal: function aantalZendersModal(knop) {
    kzZendersModal(knop);
  },
  schakel: function schakel(knop) {
    if (!knop.hasAttribute('data-doel')) {
      console.error(new Error("schakel ".concat(knop.id, " (").concat(knop.className, ") heeft geen doel")));
    }

    var doel = document.querySelectorAll(knop.getAttribute("data-doel"));

    if (!doel) {
      console.error(new Error("doel van ".concat(knop.id, " (").concat(knop.className, ") niet gevonden.")));
    }

    Array.from(doel).forEach(function (doelEl) {
      return doelEl.classList.toggle('actief');
    });

    if (knop.hasAttribute('data-scroll')) {
      $([document.documentElement, document.body]).animate({
        scrollTop: $(knop.getAttribute("data-scroll")).offset().top - 20
      }, 400);
    }
  },
  tooltip: function tooltip(knop) {
    var status = JSON.parse(sessionStorage.getItem('kz-adres')).status;
    var tekst = null;

    if (!knop.classList.contains('status-tooltip')) {
      tekst = knop.getAttribute('data-tooltip-tekst');
    } else {
      tekst = knop.getAttribute("data-tooltip-status-".concat(status));

      if (!tekst.trim() && knop.getAttribute('data-tooltip-tekst')) {
        tekst = knop.getAttribute('data-tooltip-tekst');
      }
    }

    kzModal({
      kop: knop.getAttribute('data-tooltip-titel'),
      torso: tekst
    });
  },
  aantalTvsPlus: function aantalTvsPlus() {
    KzAantalTvs(true);
  },
  aantalTvsMin: function aantalTvsMin() {
    KzAantalTvs(false);
  },
  stappenNav: function stappenNav(knop) {
    doc.getElementById('keuze-menu-lijst').classList.remove('actief');
    kzRouting.ga(knop.id.replace('stappen-links-', ''));
  }
};
/* eslint-enable */
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren, naarCamelCase  */
function kzNormaliseerGeheugen(str) {
  var isJSON = sessionStorage.getItem(str);
  var geheugenObj;

  if (isJSON) {
    geheugenObj = JSON.parse(isJSON);
  } else {
    geheugenObj = {};
  }

  return geheugenObj;
}

function keuzehulpGeneriek(knop, dataAttrNaam, keuzeSleutel, callback) {
  var dezeKeuze = naarCamelCase(knop.getAttribute(dataAttrNaam)),
      keuzehulpGeheugen = kzNormaliseerGeheugen('kz-keuzehulp');

  if (knop.className.indexOf('multiselect') !== -1) {
    // als multiselect, sla op in array, en controleer of deze in array, verwijderen zo ja etc.
    if (keuzeSleutel in keuzehulpGeheugen) {
      // als deze waarde al in array, dan verwijderen, anders toevoegen
      var dki = keuzehulpGeheugen[keuzeSleutel].indexOf(dezeKeuze);

      if (dki !== -1) {
        keuzehulpGeheugen[keuzeSleutel].splice(dki, 1);
      } else {
        keuzehulpGeheugen[keuzeSleutel].push(dezeKeuze);
      }
    } else {
      keuzehulpGeheugen[keuzeSleutel] = [dezeKeuze];
    }
  } else {
    // normaal opslaan is direct opslaan / overschrijven
    keuzehulpGeheugen[keuzeSleutel] = dezeKeuze;
  }

  sessionStorage.setItem('kz-keuzehulp', JSON.stringify(keuzehulpGeheugen));

  if (typeof callback === 'function') {
    callback();
  }
}
function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren, iwwiwProcedure, VerrijktPakket  */
function ikWeetWatIkWilPakkettenAjax() {
  /*------------------------------------------------------
  |
  |	Haalt pakketten op van achterkant adhv type (internet, interet&bellen etc)
  | 	Laat het op prijs sorteren
  | 	Print die vervolgens een voor een per provider, per pakket.
  | 	zie afzonderlijke functies
  |
  |-----------------------------------------------------*/
  // keuzehulp vullen met data installatie
  var keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
      adres = JSON.parse(sessionStorage.getItem('kz-adres'));
  keuzehulp.installatie = '1';
  sessionStorage.setItem('kz-keuzehulp', JSON.stringify(keuzehulp));
  document.getElementById('print-provider-pakketten').innerHTML = '<p><br>Moment geduld a.u.b.</p>';
  var ajf = new KzAjax({
    ajaxData: {
      action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
      data: {
        keuzehulp: keuzehulp,
        adres: adres
      }
    },
    terugval: function terugval(optie) {
      var _this = this;

      /*------------------------------------------------------
      |
      |	Wordt aangeroepen als er geen pakketten zijn voor b.v. alleen internet
      | 	Dan wordt voor alle typen pakketten apart ge-ajaxt via deze functie.
      |
      |-----------------------------------------------------*/
      var adres = JSON.parse(sessionStorage.getItem('kz-adres'));
      var printProviderPakketten = document.getElementById('print-provider-pakketten');
      jQuery.post("".concat(location.origin, "/wp-admin/admin-ajax.php"), {
        action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
        data: {
          keuzehulp: {
            installatie: '1',
            'ik-weet-wat-ik-wil': optie
          },
          adres: adres
        }
      }, function (response) {
        var rr = JSON.parse(response);

        if (!rr.error) {
          //@TODO dubbel op met vergelijkbare procedure in reguliere functie
          var printPakketten = '';
          Object.entries(rr.providers).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                provider = _ref2[0],
                providerBundel = _ref2[1];

            // maak de rekenklassen
            // stel laagste snelheid in als gekozen pakket
            var pakketten = providerBundel.map(function (pakket) {
              return new VerrijktPakket(pakket);
            }).map(function (pakket) {
              return iwwiwProcedure(pakket);
            }),
                // maak array met maandTotalen en zoek laagste op.
            providersLaagste = pakketten.map(function (pakket) {
              return pakket.maandelijksTotaal();
            }).reduce(function (nieuweWaarde, huidigeWaarde) {
              return nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde;
            }, 1000000); // per provider aantal pakketten, zoals DTV, ITV. Vaak maar één.

            printPakketten += "<section class='provider-pakketten'>\n\n\t\t\t\t\t\t\t<header class='provider-pakketten-header'>\n\n\t\t\t\t\t\t\t\t<span class='provider-logo-contain'>".concat(pakketten[0].eigenschappen.provider_meta.thumb, "</span>\n\n\t\t\t\t\t\t\t\t").concat(pakketten.length !== 1 ? "<span class='provider-pakketten-header-pakkettental'>".concat(pakketten.length, " pakketten</span>") : '', "\n\n\t\t\t\t\t\t\t\t<span class='provider-pakketten-header-prijs prijs-bolletje iwwiw-bolletje'>\n\t\t\t\t\t\t\t\t\t<span class='provider-pakketten-header-prijs-bedrag '>\n\t\t\t\t\t\t\t\t\t\t<span>&euro;</span>").concat(providersLaagste.toFixed(2).replace('.', ','), "\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class='provider-pakketten-header-prijs-vanaf'>Vanaf</span>\n\t\t\t\t\t\t\t\t</span>\n\n\t\t\t\t\t\t\t</header>\n\n\t\t\t\t\t\t\t<ul class='provider-pakketten-lijst'>\n\t\t\t\t\t\t\t\t").concat(pakketten.reduce(_this.printPakkettenLijst, ''), "\n\t\t\t\t\t\t\t</ul>\n\n\t\t\t\t\t\t</section>");
          });
          printProviderPakketten.innerHTML = printProviderPakketten.innerHTML + printPakketten;
        }
      });
    },
    cb: function cb(r) {
      var _this2 = this;

      /*------------------------------------------------------
      |
      | 	callback van de Ajaxclass instance
      |	als er providers zijn, dan printen, zo niet, terugval.
      | 	sorteert op prijs
      | 	Dit is de providerlijst.
      | 	pakketten worden uitgedraaid via printPakkettenlijst reducer.
      |
      |-----------------------------------------------------*/
      var printProviderPakketten = document.getElementById('print-provider-pakketten');
      var printPakketten = '';

      if (!r.providers || !Object.entries(r.providers).length) {
        kzModal(kzTekst('alternatieve_pakketten'), 2000);
        r.providers = {};

        var _keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

        var teller = 0;
        this.terugval('1');
        this.terugval('2');
        this.terugval('3');
        this.terugval('4');
      } // @TODO gaat dit goed omdat de ajax hierna gerenderd pas wordt? Waarom 
      // staat dit niet in een else


      printProviderPakketten.innerHTML = Object.entries(r.providers).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            provider = _ref4[0],
            providerBundel = _ref4[1];

        var pakketten = providerBundel.map(function (pakket) {
          return new VerrijktPakket(pakket);
        }).map(function (pakket) {
          return iwwiwProcedure(pakket);
        }),
            // maak array met maandTotalen en zoek laagste op.
        providersLaagste = pakketten.map(function (pakket) {
          return pakket.maandelijksTotaal();
        }).reduce(function (nieuweWaarde, huidigeWaarde) {
          return nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde;
        }, 1000000);
        return {
          provider: provider,
          providersLaagste: providersLaagste,
          pakketten: pakketten
        };
      }).sort(kzProvidersLaagNaarHoog).map(function (_ref5) {
        var pakketten = _ref5.pakketten,
            providersLaagste = _ref5.providersLaagste;
        //providerInfoBundel
        return "<section class='provider-pakketten'>\n\n\t\t\t\t\t<header class='provider-pakketten-header'>\n\n\t\t\t\t\t\t<span class='provider-logo-contain'>".concat(pakketten[0].eigenschappen.provider_meta.thumb, "</span>\n\n\t\t\t\t\t\t").concat(pakketten.length !== 1 ? "<span class='provider-pakketten-header-pakkettental'>".concat(pakketten.length, " pakketten</span>") : '', "\n\n\t\t\t\t\t\t<span class='provider-pakketten-header-prijs prijs-bolletje iwwiw-bolletje'>\n\t\t\t\t\t\t\t<span class='provider-pakketten-header-prijs-bedrag '>\n\t\t\t\t\t\t\t\t<span>&euro;</span>").concat(providersLaagste.toFixed(2).replace('.', ','), "\n\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t<span class='provider-pakketten-header-prijs-vanaf'>Vanaf</span>\n\t\t\t\t\t\t</span>\n\n\t\t\t\t\t</header>\n\n\t\t\t\t\t<ul class='provider-pakketten-lijst'>\n\t\t\t\t\t\t").concat(pakketten.reduce(_this2.printPakkettenLijst, ''), "\n\t\t\t\t\t</ul>\n\n\t\t\t\t</section>");
      }).join('');
    },
    draaiDoorProviders: function draaiDoorProviders(providers) {//@OTODO ongebruikt?
    },
    helemaalFout: function helemaalFout() {//@OTODO ongebruikt?

      /*				kzRouting.ga(21); // .
      
      				const ajf2 = new KzAjax({
      					ajaxData: {
      						action: 'kz_schrijf_fout',
      						data: {
      							aType: 'geen pakketten gevonden',
      							keuzehulp,
      							adres
      						},
      					},
      					cb: function(){ console.warn('geen pakketten gevonden. Gerapporteerd.'); },
      				});
      
      				ajf2.doeAjax();				
      				return;		*/
    },
    printPakkettenLijst: function printPakkettenLijst(pakketHTMLvoorraad, nieuwPakket) {
      /*------------------------------------------------------
      |
      | 	reducer.
      |	iedere iteratie is een pakket. 
      |
      |-----------------------------------------------------*/
      return "".concat(pakketHTMLvoorraad, "\n\t\t\t\t<li class='provider-pakketten-pakket'>\n\t\t\t\t\t<div class='provider-pakketten-pakket-links'>\n\t\t\t\t\t\t<h3 class='provider-pakketten-pakket-titel'><span class='provider-pakketten-pakket-titel_naam'>").concat(nieuwPakket.eigenschappen.pakket_type.includes('eigenlijk alleen tv') ? nieuwPakket.provider + " alleen TV " : nieuwPakket.naam_composiet, " ").concat(nieuwPakket.eigenschappen.pakket_type.includes('Internet en TV') || nieuwPakket.eigenschappen.pakket_type.includes('Alles in 1') ? ' - ' + nieuwPakket.eigenschappen.tv_type : "", "</span>\n\t\t\t\t\t\t<span class='provider-pakketten-pakket-titel_usp'>").concat(nieuwPakket.eigenschappen.teksten.usps, "</span>\n\t\t\t\t\t\t</h3>\n\t\t\t\t\t\t<span class='provider-pakketten-pakket-links-onder'>\n\n\t\t\t\t\t\t<strong>Beschikbare snelheden:</strong>\n\t\t\t\t\t\t").concat(nieuwPakket.eigenschappen.snelheden.reduce(function (snelheidPrijsHTMLvoorraad, nweSnelheid) {
        return "".concat(snelheidPrijsHTMLvoorraad, "\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t<span class='provider-pakketten-pakket-links-onder_snelheid'>\n\t\t\t\t\t\t\t\t<span class='provider-pakketten-pakket-snelheid'>\n\t\t\t\t\t\t\t\t\t").concat(Number(nweSnelheid) < 1 ? "alleen TV" : "".concat(nweSnelheid, " Mb/s "), "\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t<span class='provider-pakketten-pakket-prijs'>\n\t\t\t\t\t\t\t\t\tvoor ").concat(nieuwPakket.geefMaandtotaalVoorSnelheid(nweSnelheid), "\n\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t");
      }, ''), "\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class='provider-pakketten-pakket-rechts'>\n\t\t\t\t\t\t<a\n\t\t\t\t\t\t\tclass='knop blauwe-knop kz-bestelknop'\n\t\t\t\t\t\t\tdata-kz-func='toon-stap animeer aanmeldformulier'\n\t\t\t\t\t\t\thref='#100'\n\t\t\t\t\t\t\tkz-data-pakket-id='").concat(nieuwPakket.ID, "'\n\t\t\t\t\t\t\t>\n\n\t\t\t\t\t\t\t<svg version=\"1.1\" class='bestel-svg' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t\t\t\t\t\t\t\t viewBox=\"0 0 100 100\" style=\"enable-background:new 0 0 100 100;\" xml:space=\"preserve\">\n\t\t\t\t\t\t\t<path style=\"fill:#FFFFFF;\" d=\"M56.993,65.162L42.618,50.631L56.993,36.1c1.25-1.146,1.276-2.292,0.078-3.438\n\t\t\t\t\t\t\t\tc-1.198-1.146-2.37-1.146-3.516,0l-16.25,16.25c-0.521,0.417-0.781,0.99-0.781,1.719c0,0.729,0.26,1.302,0.781,1.719l16.25,16.25\n\t\t\t\t\t\t\t\tc1.146,1.146,2.318,1.146,3.516,0C58.269,67.454,58.243,66.308,56.993,65.162z\"/>\n\t\t\t\t\t\t\t</svg>\n\n\t\t\t\t\t\t</a>\n\t\t\t\t\t</div>\n\t\t\t\t</li>");
    }
  });
  ajf.doeAjax();
}
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */

/* LEGACY NAAM! */
function kzZetNiveauKnop(knop) {
  /*--------------------------------------------------
  |
  |	knoppen zijn keuzenmenuknoppen.
  | 	de secties zijn de pagina's van de keuzehulp
  | 	zodra naar een niveau wordt gegaan wordt de knop in de navigatie actief / klikbaar en krijgt
  | 	het de waarde van de keuze eronder geprint.
  |
  |**************************************************/
  var kzSectie = kzVindSectie(knop);
  var stap = kzSectie.dataset.keuzehulpStap; // uitsluiten bepaalde
  // als array zodat makkelijk meer kunnen worden toegevoegd

  if (['2'].includes(stap)) return;
  var stappenLinksStap = doc.getElementById("stappen-links-".concat(stap));
  stappenLinksStap.parentNode.style.display = "block";
  stappenLinksStap.classList.remove('invalide');
  stappenLinksStap.getElementsByClassName('stappen-links_klaar')[0].style.display = "inline-block";
  stappenLinksStap.getElementsByClassName('stappen-links_niet-klaar')[0].style.display = "none";
  stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.opacity = "1";
  stappenLinksStap.getElementsByClassName('stappen-links_originele-tekst')[0].style.fontWeight = "600";
  var print = stappenLinksStap.getElementsByClassName('stappen-links_vervangende-tekst')[0];
  print.style.display = "block";
  print.innerHTML = Array.from(kzSectie.querySelectorAll('.actief.knop'), function (knop) {
    var combiKnop = kzVindCombiKnop(knop);
    var s = combiKnop.querySelector('.kz-knop-combi_rechts-boven span');
    var ss = s.getElementsByTagName('strong');
    var html;

    if (ss.length) {
      // strong aanwezig? dan html uit strong halen. 
      html = ss[0].innerHTML;
    } else {
      html = s.innerHTML;
    }

    return "<span>".concat(html, "</span>");
  }).join('<br>');
}
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren, knoppenDispatcher, controleerPostcode, opSubmitDisable, ankerRedirect, generiekeValidatie  */
var doc = document,
    body = doc.body;
var $ = null;

function ankerRedirect() {
  /*------------------------------------------------------
  |
  | 	Indien iemand afkomstig is van een campagnepagina, dan worden links aangepast.
  |
  |-----------------------------------------------------*/
  // legacy ? 

  /*
  	var ankers = doc.querySelectorAll("a[href^='https://iedereenglasvezel']");
  	var ankers2 = doc.querySelectorAll("a[href^='https://e-fiber']");
  
  	if (location.search && location.search.indexOf('ref') !== -1) {
  
  		var gaNaar = location.search.replace('?ref=', '');
  
  		for (var i = ankers.length - 1; i >= 0; i--) {
  			ankers[i].href = ankers[i].href.replace('iedereenglasvezel', gaNaar);
  		}
  		for (var i = ankers2.length - 1; i >= 0; i--) {
  			ankers2[i].href = ankers2[i].href.replace('e-fiber', gaNaar);
  		}
  
  	} else {
  
  		for (var i = ankers.length - 1; i >= 0; i--) {
  			ankers[i].style.visibility = "hidden";
  		}
  
  	}	*/
}

function kzInit() {
  /*------------------------------------------------------
  |
  | 	Deze functie start alles op!
  |
  |-----------------------------------------------------*/
  $ = jQuery; // afhandeling van navigatie

  kzRouting.init(); // dispatcher zit op de body te luisteren en stuurt functies aan.

  knoppenDispatcher(); // viewlogica eerste scherm

  controleerPostcode(); // zie onder

  opSubmitDisable(); // terugsturen naar actiepagina of kz op anker

  ankerRedirect(); // generieke validatie zoals input alleen getallen

  generiekeValidatie();
  scrollCheck();
}

window.onload = function () {
  kzInit();
};

function generiekeValidatie() {
  /*------------------------------------------------------
  |
  | 	Geen letters in nummervelden.
  |
  |-----------------------------------------------------*/
  document.body.addEventListener('keydown', function (e) {
    var t = e.target,
        idAr = ['huidige-nummer', 'huidige-extra-nummer', 'input_1_21', 'huisnummer'],
        ekc = Number(e.keyCode);

    if (idAr.indexOf(e.target.id) !== -1) {
      if ($.inArray(ekc, [46, 8, 9, 27, 13, 110, 190]) !== -1 || ekc === 65 && (e.ctrlKey === true || e.metaKey === true) || ekc === 67 && (e.ctrlKey === true || e.metaKey === true) || ekc === 88 && (e.ctrlKey === true || e.metaKey === true) || ekc >= 35 && e.keyCode <= 39) {
        // let it happen, don't do anything
        return;
      }

      if ((e.shiftKey || ekc < 48 || ekc > 57) && (ekc < 96 || ekc > 105)) {
        e.preventDefault();
      }
    }
  });
}

function opSubmitDisable() {
  /*------------------------------------------------------
  |
  |	voorkomt dubbele verzending van Gravity Forms
  |	moet vanuit body luisteren omdat formulieren ingeajaxt worden.
  |
  |-----------------------------------------------------*/
  doc.body.addEventListener('submit', function (e) {
    if (e.target.id.indexOf('gform') !== -1) e.target.querySelector("[type='submit']").setAttribute('disabled', 'disabled');
  });
}

function kzSorteerIWWIW(pakketten) {
  /*------------------------------------------------------
  |
  |	neemt een hoeveelheid pakketten en sorteert die op prijs
  | 	gebruikt in IWWIW
  |
  |-----------------------------------------------------*/
  // maak verzameling met bedragen aan
  var bedragen = pakketten.map(function (w) {
    return Number(w.eigenschappen.financieel.maandelijks);
  }),
      // kopieer de verzameling tbv sortering en sorteer
  bedragenSort = bedragen.map(function (w) {
    return w;
  }).sort(); // zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
  // als er een dubbele prijs is, dan zit deze index al in indicesvolgorde.
  // indexof werkt niet aangezien die alleen tot eerste index zoekt
  // een gewone map functie werkt hier niet omdat je het product moet kunnen uitlezen

  var ii, w, j;
  var indicesVolgorde = [];

  for (j = 0; j < bedragenSort.length; j++) {
    w = bedragenSort[j];

    for (ii = 0; ii < bedragen.length; ii++) {
      if (w === bedragen[ii]) {
        // zoek nu of deze index nog niet voorkomt.
        // zo ja, push waarde en break for.
        if (indicesVolgorde.indexOf(ii) === -1) {
          indicesVolgorde.push(ii);
          break;
        }
      }
    }
  }

  var pakkettenKopie = pakketten.map(function (ww) {
    return ww;
  });
  pakketten = []; // per rij, volgorde aanpassen adhv indicesvolgorde.

  for (var i = 0; i < pakkettenKopie.length; i++) {
    pakketten.push(pakkettenKopie[indicesVolgorde[i]]);
  }

  return pakketten;
}

function scrollCheck() {
  setInterval(function () {
    if (Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) > 300) {
      if (!document.body.classList.contains('voorbij-350')) document.body.classList.add('voorbij-350');
    } else {
      if (document.body.classList.contains('voorbij-350')) document.body.classList.remove('voorbij-350');
    }
  }, 100);
}
function kzAnimeerKnoppen(knop) {
  /*------------------------------------------------------
  |
  | 	schakelt de klasse actief heen en weer voor knoppen
  | 	verschil tussen of knoppen multiselect zijn of niet. 
  |
  |-----------------------------------------------------*/
  var sectie = kzVindSectie(knop);
  var dezeID = knop.dataset.knopId; // is dit multiselect? alleen deze knop actief togglen.

  if (knop.classList.contains('multiselect')) {
    knop.classList.toggle('actief');
  } else if (knop.classList.contains('actief')) {
    // is deze al actief? dan is het een bevestiging van een keuze. 
    // niets doen.
    return;
  } else {
    // is er een actieve knop? 
    // actieve knop in deze sectie op inactief zetten
    // dan deze knop op actief zetten.
    var actief = sectie.getElementsByClassName('actief');

    if (actief.length) {
      actief[0].classList.remove('actief');
    }

    knop.classList.add('actief');
  }
}
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
//@TODO dit hoort niet in modal js
window.onload = function () {
  kzInit();
};

function kzTekst(snede, invoeging) {
  /*------------------------------------------------------
  |
  | 	kzModalTeksten is een global die PHP in de footer uitdraait
  | 	invoeging wordt zoek-vervang op %s gedaan als het één waarde, als een string, is. 
  | 	invoeging wordt recursief op %s1, %s2 etc gedaan als het een array is.
  |
  |-----------------------------------------------------*/
  if (!(snede in kzModalTeksten)) {
    console.error("".concat(snede, " komt niet voor in kzModalTeksten"));
    return '';
  }

  if (!invoeging) {
    return kzModalTeksten[snede];
  } // console.log('modal '+snede);


  if (typeof invoeging === 'string') {
    return kzModalTeksten[snede].replace('%s', invoeging);
  }

  var r = kzModalTeksten[snede];
  invoeging.forEach(function (invoeg, index) {
    r = r.replace("%s".concat(index), invoeg);
  });
  return r;
}

function kzModal(tekst) {
  var tijd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  /*------------------------------------------------------
  |
  | 	maakt de HTML van de modal en plakt die achteraan de body.
  | 	schrijft klasse naar body
  | 	accepteert tekst als string of als object. 
  | 	string -> modal zonder kop
  | 	object -> verwacht keys kop en torso.
  |	tijd variabele kan de modal automatisch laten verwijderen via kzVerwijderModal
  |
  |-----------------------------------------------------*/
  doc.body.className = "".concat(doc.body.className, " kz-modal-open");
  $modal = jQuery("<div class='kz-modal'></div>");
  $modalBinnen = jQuery("<div class='kz-modal-binnen'></div>");

  if (typeof tekst !== 'string') {
    // object met kop en torso
    if ('kop' in tekst) {
      $modalBinnen.append(jQuery("<header><h3>".concat(tekst.kop, "</h3></header>")));
    }

    if ('torso' in tekst) {
      $modalBinnen.append(jQuery("<span>".concat(tekst.torso, "</span>")));
    }
  } else {
    $modalBinnen.append(jQuery("<span>".concat(tekst, "</span>")));
  }

  var $sluiten = jQuery("<a href='#' class='knop kz-modal-sluiten' data-kz-func='verwijder-modal'>X</a>");
  $modalBinnen.append($sluiten);
  $modal.append($modalBinnen);
  var $modalAchtergrond = $("<div class='kz-modal-achtergrond' ><div class='kz-modal-achtergrond-binnen knop' data-kz-func='verwijder-modal'></div></div>");
  $modalAchtergrond.append($modal);
  $('body').append($modalAchtergrond);
  $modal.show().fadeIn(300);

  if (tijd) {
    setTimeout(function () {
      kzVerwijderModal();
    }, tijd);
  }
}

function kzVerwijderModal() {
  /*------------------------------------------------------
  |
  |	Verwijderd alle modals en de bijbehorende klassen op body.
  |
  |-----------------------------------------------------*/
  jQuery('.kz-modal-achtergrond').fadeOut(300, function () {
    jQuery('.kz-modal-achtergrond').remove();
  }); // in rare situaties kunnen er meerdere modals geopend zijn.

  do {
    doc.body.className = doc.body.className.replace('kz-modal-open', '').trim();
  } while (doc.body.className.indexOf('kz-modal-open') !== -1);
}

document.onkeydown = function (evt) {
  /*------------------------------------------------------
  |
  |	Op escape en enter, verwijder modals.
  |
  |-----------------------------------------------------*/
  evt = evt || window.event;

  if (evt.keyCode == 27 || evt.keyCode == 13) {
    kzVerwijderModal();
  }
};
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function kzPluginRelURL() {
  return "/wp-content/plugins/kz";
}

function naarCamelCase(str) {
  /*---------------------------------
  |
  |	Wat binnen komt als streep-case
  | 	Gaat er uit als camelCase
  |
  |---------------------------------*/
  var split = str.split('-');

  if (split.length > 1) {
    for (var i = 1; i < split.length; i++) {
      split[i] = split[i][0].toUpperCase() + split[i].substring(1);
    }
  }

  return split.join('');
}

function naarStreepCase(snede) {
  /*----------------------------------
  |
  |	Wat binnen komt als combinatie van
  |	woorden, spaties en &@#^&* en ;'etc
  | 	komt-er-uit-als-streep-case
  |
  |---------------------------------*/
  return snede.replace(/([A-Z])/g, '-$1').replace(/^./, function (str) {
    return str.toUpperCase();
  }).toLowerCase();
}

function uniek(waarde, index, lijst) {
  /*------------------------------------------------------
  |
  |	Te gebruiken als array.filter(uniek)
  | 	Geeft alleen unieke waarden terug
  |
  |-----------------------------------------------------*/
  return lijst.indexOf(waarde) === index;
}

function kzProvidersLaagNaarHoog(a, b) {
  /*------------------------------------------------------
  |
  | 	Wordt gebruikt in vergelijking en in iwwiw
  |
  |-----------------------------------------------------*/
  if (a.providersLaagste < b.providersLaagste) return -1;
  if (a.providersLaagste > b.providersLaagste) return 1;
  return 0;
}

function kzVindKnop(t, klasse) {
  /*----------------------------------
  |
  |	Gebruikt in het aanmeldformulier
  | 	Om de eigenlijke .knop te vinden
  |	Had wel met een while-loop gemogen
  |
  |---------------------------------*/
  var k = t; // zitten we in een SVG?
  // svg nodes hebben andere dom properties

  while (typeof k.className !== 'string') {
    k = k.parentNode;
  }

  if (k.classList.contains('knop')) return k;

  do {
    k = k.parentNode;
  } while (!k.classList.contains('knop') && !k.classList.contains('keuzehulp')); // niet doorgaan na body


  if (k.classList.contains('keuzehulp')) {
    return false;
  } else {
    return k;
  }
}

function kzEuro(bedrag) {
  /*----------------------------------
  |
  | 	Formateert bedragen:
  | 	0 => inclusief
  | 	ander geldig bedrag => euroteken + xx,xx
  | 	false => '-'
  |
  |---------------------------------*/
  if (bedrag && typeof bedrag !== 'boolean') {
    if (bedrag == 0) {
      return 'inclusief';
    }

    return "&euro; ".concat(Number(bedrag).toFixed(2).toString().replace('.', ','));
  }

  return '-'; // als false oid
}

function kzNietMin1ReturnZelfOfFalse(a) {
  /*----------------------------------
  |
  | 	@LEGACY
  |	Onderdeel van het normaliseren van
  | 	data in de tabelmiddelware
  |
  |---------------------------------*/
  return a !== '-1' ? a : false;
}

function kzMaakBestelKnop(pakket, eigenschappen, tekst) {
  /*----------------------------------
  |
  | 	@LEGACY	
  |	Deze functie zou niet mogen bestaan.
  |
  |---------------------------------*/
  if (typeof tekst === 'undefined') {
    tekst = 'Bestel';
  } // we slaan de pakket + opties info op in sessionStorage
  // zodat die weldra via referentie naar een andere functie gestuurd kan worden
  // @TODO combineren van deze twee acties is WAANZIN... html genereren en geheugen schrijven :(


  sessionStorage.setItem("pakket-".concat(pakket.ID), JSON.stringify(arguments));
  this.HTML = "<a class='knop geen-ikoon kz-bestelknop' data-kz-func='toon-stap animeer aanmeldformulier' href='#100' kz-data-pakket-id='".concat(pakket.ID, "'>").concat(tekst, "</a>");
}

function kzVindCombiKnop(knop) {
  /*----------------------------------
  |
  | 	Itereert omhoog in de HTML totdat de combiknop is gevonden. 
  |
  |---------------------------------*/
  var k = knop;
  if (k.classList.contains('kz-knop-combi')) return k;

  do {
    k = k.parentNode;
  } while (!k.classList.contains('kz-knop-combi') && !k.classList.contains('keuzehulp')); // niet doorgaan na body


  if (k.classList.contains('keuzehulp')) {
    console.error(new Error('doorgezocht naar body maar geen combiknop gevonden'));
    return;
  } else {
    return k;
  }
}

function kzVindSectie(knop) {
  /*----------------------------------
  |
  | 	Itereert omhoog in de HTML totdat keuzehulp sectie gevonden is. 
  |
  |---------------------------------*/
  var w = knop.parentNode;

  do {
    w = w.parentNode;
  } while (!w.hasAttribute('data-keuzehulp-stap') && !w.classList.contains('keuzehulp')); // niet voorbij body


  if (w.classList.contains('keuzehulp')) {
    return new Error('sectie niet gevonden');
  } else {
    return w;
  }
}

function kzVindRij(knop) {
  /*----------------------------------
  |
  | 	Itereert omhoog in de HTML totdat de rij gevonden is. 
  |
  |---------------------------------*/
  var w = knop.parentNode;

  do {
    w = w.parentNode;
  } while (!w.classList.contains('rij') && !w.classList.contains('keuzehulp')); // niet voorbij body


  if (w.classList.contains('keuzehulp')) {
    return new Error('sectie niet gevonden');
  } else {
    return w;
  }
}
function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

/* globals doc, location, uniek, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function kzPakPakket(getal) {
  /*----------------------------------
  |
  | 	Wordt nergens gebruikt - louter voor tijdens debuggen direct in console
  |
  |---------------------------------*/
  return window["kz-pakket-".concat(getal)];
}

function VerrijktPakket(p) {
  var _this = this;

  /*------------------------------------------------------
  |
  | 	Wat binnenkort is een bewerkt post-object
  | 	Maakt er een soort kassasysteem van.
  |
  |-----------------------------------------------------*/
  Object.entries(p).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        w = _ref2[1];

    _this[k] = w;
  });

  this.generiekTotaal = function (soortTotaal) {
    var formatteren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    /*------------------------------------------------------
    |
    | 	Geeft totalen terug van eenmalige of maandelijkse kosten
    | 	Al dan niet geformatteerd of als getal.
    |
    |-----------------------------------------------------*/
    var t = Object.entries(_this.eigenschappen[soortTotaal]).map(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          optieNaam = _ref4[0],
          optieWaarde = _ref4[1];

      return optieWaarde;
    }).reduce(function (totaal, optie) {
      return totaal + optie.aantal * optie.prijs;
    }, 0);
    return formatteren ? _this.formatteerPrijs(t) : t;
  }; // Voorkant voor generiektotaal


  this.eenmaligTotaal = function (formatteren) {
    return _this.generiekTotaal('eenmalig', formatteren);
  }; // Voorkant voor generiektotaal


  this.maandelijksTotaal = function (formatteren) {
    return _this.generiekTotaal('maandelijks', formatteren);
  }; // Voorkant voor borgtotaal


  this.borgTotaal = function (formatteren) {
    return _this.generiekTotaal('borg', formatteren);
  }; // Maakt van Amerikaans getal europese prijs.
  // @TODO als 0 dan 'gratis' of 'inclusief'


  this.formatteerPrijs = function (prijs) {
    return "<span class='euro'>&euro;</span>".concat(Number(prijs).toFixed(2).replace('.', ','));
  };

  this.printPrijzen = function () {
    var formatteer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    /*------------------------------------------------------
    |
    | 	Geeft totalen terug van eenmalige of maandelijkse kosten
    | 	Al dan niet geformatteerd of als getal.
    |
    |-----------------------------------------------------*/
    ['maandelijks', 'eenmalig', 'borg'].forEach(function (prijsCat) {
      var printHier = document.getElementsByClassName("".concat(prijsCat, "-totaal"));
      Array.from(printHier).forEach(function (printPlek) {
        printPlek.innerHTML = _this.generiekTotaal(prijsCat, formatteer);
      });
    });
  }; // Ongerefereerde huidige snelheid.


  this.pakHuidigeSnelheid = function () {
    return Number(String(_this.huidige_snelheid));
  }; // Ongerefereerde huidige snelheid.


  this.pakHuidigeUploadSnelheid = function () {
    return _this.eigenschappen.down_up[String(_this.huidige_snelheid)];
  };

  this.veranderSnelheid = function (nweSnelheid) {
    /*------------------------------------------------------
    |
    | 	Veranderd niet alleen de snelheid (snelheid-50.aantal = 1 -> snelheid-1000.aantal = 1)
    | 	Maar probeert dat ook te doen voor snelheidsbepaalde pakketten zoals de TV pakketten.
    |
    |-----------------------------------------------------*/
    var vorigeSnelheid = _this.pakHuidigeSnelheid();

    if (vorigeSnelheid === nweSnelheid) return; // kan zijn dat uberhaupt nog geen snelheid is ingesteld.

    _this.mutatie("snelheid-".concat(nweSnelheid), 1);

    ['maandelijks', 'eenmalig'].forEach(function (prijsCat) {
      // voor iedere optie in eigenschappen.eenmalig en eigenschappen.maandelijks
      Object.entries(_this.eigenschappen[prijsCat]).forEach(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            optieNaam = _ref6[0],
            optieWaarden = _ref6[1];

        // selectie op 1) snelheidsafhankelijk 2) vorige snelheid
        if (optieWaarden.snelheid && optieWaarden.snelheid === vorigeSnelheid) {
          var oudeHoeveelheid = optieWaarden.aantal; // nu zet je de oude snelheid op aantal 0

          _this.mutatie(optieNaam, 0); // hier maak je van film1-film1-500 film1-film1-1000


          var nweOptie = optieNaam.replace(vorigeSnelheid, nweSnelheid); // bestaat de optie? oude hoeveelheid schrijven.

          if (_this.optieBestaat(nweOptie)) _this.mutatie(nweOptie, oudeHoeveelheid);
        }
      });
    });
    _this.huidige_snelheid = nweSnelheid;
  };

  this.geefMaandtotaalVoorSnelheid = function (proefSnelheid) {
    /*------------------------------------------------------
    |
    | 	Zet pakket tijdelijk in een andere snelheidsstand
    | 	Geeft maandtotale voor die stand
    | 	Zet pakket weer terug in snelheidsstand.
    |
    |-----------------------------------------------------*/
    var huidigeSnelheid = _this.pakHuidigeSnelheid();

    _this.veranderSnelheid(proefSnelheid);

    var r = _this.formatteerPrijs(_this.maandelijksTotaal());

    _this.veranderSnelheid(huidigeSnelheid);

    return r;
  };

  this.mutatie = function (optie, aantal) {
    /*------------------------------------------------------
    |
    | 	Werkpaard!
    | 	Schrijft absoluut een nieuw aantal weg voor één optie
    | 	Zowel in de eenmalige als de maandelijkse opties.
    |
    |-----------------------------------------------------*/
    var e = _this.eigenschappen;
    if (e.eenmalig[optie]) e.eenmalig[optie].aantal = aantal;
    if (e.maandelijks[optie]) e.maandelijks[optie].aantal = aantal;
  };

  this.vindOptie = function (zoek) {
    var antwoord = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'alles';

    /*------------------------------------------------------
    |
    | 	WAT EEN MOOIE FUNCTIE
    | 	Zoekt door de **maandelijkse** opties en geeft de
    | 	eerste hit terug die matcht op alle meegegeven 
    | 	sleutels. Alle sleutels zijn facultatief.
    | 	snelheid is niet hard op type omdat die niet consequent aan de 
    | 	pakketten is meegegeven.
    | 	tv type is ook facultatief, maar kan ook stomweg null zijn en dient in beide gevallen true
    | 	te zijn. Als het niet null is dan is het ITV, DTV of DTV-ITV.
    |
    |-----------------------------------------------------*/
    var naam = zoek.naam,
        optietype = zoek.optietype,
        suboptietype = zoek.suboptietype,
        snelheid = zoek.snelheid,
        tvType = zoek.tvType,
        aantal = zoek.aantal; //als zoekopdracht niet meegegegeven, altijd ok.

    var r = Object.entries(_this.eigenschappen.maandelijks).find(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          sleutel = _ref8[0],
          optie = _ref8[1];

      return ![!naam || optie.naam === naam, !optietype || optie.optietype === optietype, !suboptietype || optie.suboptietype === suboptietype, !aantal || optie.aantal == aantal, !snelheid || optie.snelheid == snelheid, !tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)].includes(false);
    });

    if (!r) {
      //console.warn(`geen optiesleutel in ${this.provider} ${this.naam_composiet} gevonden met:`);
      //console.table(zoek);
      return false;
    }

    if (antwoord === 'alles') {
      return r;
    } else if (antwoord === 'sleutel') {
      return r[0]; // de sleutel		
    } else {
      return r[1];
    }
  }; // oei dubbel op //


  this.vindOpties = function (zoek) {
    /*------------------------------------------------------
    |
    | 	WAT EEN MOOIE FUNCTIE
    | 	Zoekt door de **maandelijkse** opties en geeft de
    | 	eerste hit terug die matcht op alle meegegeven 
    | 	sleutels. Alle sleutels zijn facultatief.
    | 	snelheid is niet hard op type omdat die niet consequent aan de 
    | 	pakketten is meegegeven.
    | 	tv type is ook facultatief, maar kan ook stomweg null zijn en dient in beide gevallen true
    | 	te zijn. Als het niet null is dan is het ITV, DTV of DTV-ITV.
    |
    |-----------------------------------------------------*/
    var naam = zoek.naam,
        aantal = zoek.aantal,
        optietype = zoek.optietype,
        suboptietype = zoek.suboptietype,
        snelheid = zoek.snelheid,
        tvType = zoek.tvType; //als zoekopdracht niet meegegegeven, altijd ok.

    var r = Object.entries(_this.eigenschappen.maandelijks).filter(function (_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          sleutel = _ref10[0],
          optie = _ref10[1];

      return ![!naam || optie.naam === naam, !optietype || optie.optietype === optietype, !suboptietype || optie.suboptietype === suboptietype, !snelheid || optie.snelheid == snelheid, !aantal || optie.aantal == aantal, !tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)].includes(false);
    });

    if (!r) {
      console.warn('geen optiesleutel gevonden met:');
      console.table(zoek);
      return false;
    }

    return r;
  };

  this.vindOptieSleutel = function (zoek) {
    return _this.vindOptie(zoek, 'sleutel');
  };

  this.vindOptieZelf = function (zoek) {
    return _this.vindOptie(zoek, 'optie');
  };
  /*	this.vindOptieSleutel = zoek => {
  		let {naam, optietype, suboptietype, snelheid, tvType} = zoek;
  		//als zoekopdracht niet meegegegeven, altijd ok.
  		const r = Object.entries(this.eigenschappen.maandelijks)
  			.find( ([sleutel, optie]) => {
  			return ![
  				!naam || optie.naam === naam,
  				!optietype || optie.optietype === optietype,
  				!suboptietype || optie.suboptietype === suboptietype,
  				!snelheid || optie.snelheid == snelheid,
  				!tvType || !optie.tv_typen || optie.tv_typen.includes(tvType)
  			].includes(false);
  		});
  		if (!r) {
  			console.warn('geen optiesleutel gevonden met:');
  			console.table(zoek);
  			return false;
  		} 
  			return r[0]; // de sleutel
  	};*/
  // doet niet meer dat de naam aangeeft.


  this.optieBestaat = function () {
    var optie = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return !!(_this.eigenschappen.eenmalig[optie] || _this.eigenschappen.maandelijks[optie]);
  };

  this.optieAantal = function () {
    var optie = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    /*------------------------------------------------------
    |
    |	Geeft het aantal terug uit OF maandelijks OF eenmalig
    | 	Aanname: aantal is aldaar gelijk. Anders bugt iets ook.
    | 	Als de optie niet bestaat word 0 / falsy teruggegeven.
    |
    |-----------------------------------------------------*/
    var e = _this.eigenschappen;
    if (e.eenmalig[optie]) return Number(e.eenmalig[optie].aantal);
    if (e.maandelijks[optie]) return Number(e.maandelijks[optie].aantal);
    return 0;
  };

  this.zoekSubOptie = function () {
    var suboptietype = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var mOpties = Object.entries(_this.eigenschappen.maandelijks).filter(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
          sleutel = _ref12[0],
          optie = _ref12[1];

      return optie.suboptietype === suboptietype;
    }).map(function (_ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
          sleutel = _ref14[0],
          optie = _ref14[1];

      return Object.assign({
        sleutel: sleutel
      }, optie);
    }),
        eOpties = Object.entries(_this.eigenschappen.eenmalig).filter(function (_ref15) {
      var _ref16 = _slicedToArray(_ref15, 2),
          sleutel = _ref16[0],
          optie = _ref16[1];

      return optie.suboptietype === suboptietype;
    }).map(function (_ref17) {
      var _ref18 = _slicedToArray(_ref17, 2),
          sleutel = _ref18[0],
          optie = _ref18[1];

      return Object.assign({
        sleutel: sleutel
      }, optie);
    });
    return {
      bestaat: mOpties.length || eOpties.length,
      mOpties: mOpties,
      eOpties: eOpties
    };
  };

  this.zoekOptieType = function () {
    var optietype = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var mOpties = Object.entries(_this.eigenschappen.maandelijks).filter(function (_ref19) {
      var _ref20 = _slicedToArray(_ref19, 2),
          sleutel = _ref20[0],
          optie = _ref20[1];

      return optie.optietype === optietype;
    }).map(function (_ref21) {
      var _ref22 = _slicedToArray(_ref21, 2),
          sleutel = _ref22[0],
          optie = _ref22[1];

      return Object.assign({
        sleutel: sleutel
      }, optie);
    }),
        eOpties = Object.entries(_this.eigenschappen.eenmalig).filter(function (_ref23) {
      var _ref24 = _slicedToArray(_ref23, 2),
          sleutel = _ref24[0],
          optie = _ref24[1];

      return optie.optietype === optietype;
    }).map(function (_ref25) {
      var _ref26 = _slicedToArray(_ref25, 2),
          sleutel = _ref26[0],
          optie = _ref26[1];

      return Object.assign({
        sleutel: sleutel
      }, optie);
    });
    return {
      bestaat: mOpties.length || eOpties.length,
      mOpties: mOpties,
      eOpties: eOpties
    };
  }; // zoekt in maandelijks en eenmalig en geeft prijs terug.
  // als samengestelde prijs geeft het een object terug


  this.optiePrijs = function () {
    var optie = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var formatteer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var e = _this.eigenschappen,
        ep = e.eenmalig[optie] ? e.eenmalig[optie].prijs : false,
        mp = e.maandelijks[optie] ? e.maandelijks[optie].prijs : false; // let wel, 0 is dus falsy maar OK.

    if ((ep || ep === 0) && !mp && mp !== 0) {
      return formatteer ? _this.formatteerPrijs(ep) : ep;
    }

    if (!ep && ep !== 0 && (mp || mp === 0)) {
      return formatteer ? _this.formatteerPrijs(mp) : mp;
    }

    if ((ep || ep === 0) && (mp || mp === 0)) {
      return formatteer ? {
        ep: _this.formatteerPrijs(ep),
        mp: _this.formatteerPrijs(mp)
      } : {
        ep: ep,
        mp: mp
      };
    }

    console.warn("rare fok op in pakket optieprijs van ".concat(optie));
    console.trace();
    return 0;
  }; // dev dingetje


  this.rapporteerOptie = function (optie) {
    return "\n\t\t".concat(optie, " van ").concat(_this.naam_composiet, " is nu ").concat(_this.optieAantal(optie), "\n\t\tmaandelijksTotaal ").concat(_this.maandelijksTotaal(), "\n\t\teenmaligTotaal ").concat(_this.eenmaligTotaal(), "\n\t");
  };

  this.tabelletje = function (eigenschap) {
    return console.table(_this.eigenschappen[eigenschap]);
  };

  this.huidigeTelefonieBundel = function () {
    var actieveOptie = _this.vindOptie({
      aantal: 1,
      optietype: 'telefonie-bundel'
    });

    if (!actieveOptie || !actieveOptie[1]) {
      return false;
    }

    var actieveOptieData = actieveOptie[1];

    var gevondenBundel = _this.eigenschappen.telefonie_bundels[actieveOptieData.suboptietype].find(function (bundel) {
      return bundel.slug === actieveOptieData.naam;
    });

    return gevondenBundel;
  };

  this.heeftTelefonieBereik = function (bereik) {
    return !!_this.vindOptie({
      optietype: 'telefonie-bundel',
      snelheid: _this.huidige_snelheid,
      suboptietype: bereik
    });
  };

  this.alleTelefonieBundelsUit = function () {
    Object.entries(_this.eigenschappen.maandelijks).forEach(function (_ref27) {
      var _ref28 = _slicedToArray(_ref27, 2),
          optieNaam = _ref28[0],
          optieWaarden = _ref28[1];

      if (optieWaarden.optietype === 'telefonie-bundel') {
        _this.mutatie(optieNaam, 0);
      }
    });
  };

  this.zetTelefonieBereikAan = function (bereik) {
    // voorkantje voor mutatie functie voor in vergelijkingsprocedure.
    // alles eerst uitzetten
    _this.alleTelefonieBundelsUit(); // console.log(this.huidige_snelheid, bereik);


    var telBundelSleutel = _this.vindOptie({
      optietype: 'telefonie-bundel',
      snelheid: _this.huidige_snelheid,
      suboptietype: bereik
    })[0];

    if (!telBundelSleutel) {
      console.error('type telefonie bundel bestaat niet ', bereik);
      return false;
    }

    _this.mutatie(telBundelSleutel, 1);
  };

  this.maakTelefonieTarievenLijst = function () {// JE BENT HIER!!!!

    /*const huiData = (this.huidigeTelefonieBundel()).data;
    const maandBedrag = ``;
    const maxMinuten = ``;
    const tarieven = Object.entries(huiData).filter([]).map( ARG => {
    		}).join('') ;*/
  };

  this.pakZenders = function () {
    var aantalUniekeZenderPakketten = Object.entries(_this.eigenschappen).filter(function (_ref29) {
      var _ref30 = _slicedToArray(_ref29, 2),
          sleutel = _ref30[0],
          object = _ref30[1];

      return sleutel.includes('zender');
    }).map(function (_ref31) {
      var _ref32 = _slicedToArray(_ref31, 2),
          s = _ref32[0],
          o = _ref32[1];

      return o.totaal + o.hd;
    }).filter(uniek).length;
    return Object.assign(_this.eigenschappen["zenders-".concat(_this.huidige_snelheid)], {
      snelheid: _this.huidige_snelheid,
      aantalUniekeZenderPakketten: aantalUniekeZenderPakketten
    });
  };

  this.pakTypeTV = function () {
    return _this.eigenschappen.tv_type === 'ITV' ? 'Interactief' : 'Digitaal';
  }; // geeft tekst terug.


  this.tekst = function (tekstSleutel) {
    return _this.eigenschappen.teksten[tekstSleutel];
  }; // object kan via JSON verzonden worden naar achter kan maar dan zonder functies.


  this.bereidJSONverzendingVoor = function () {
    var verz = {}; // wat je daadwerkelijk verstuurd

    for (var s in _this) {
      if (typeof _this[s] !== 'function') verz[s] = _this[s];
    }

    _this.klaarVoorJSON = verz;
  };
}
function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function iwwiwProcedure(pakket) {
  // zet opties voor in iwwiwprocedure
  // omdat bv geen snelheidskeuze bekend is,
  // stellen we hier de laagste standaard in.
  // idem installatie
  var laagsteSnelheid = pakket.eigenschappen.snelheden.reduce(function (nieuweWaarde, huidigeWaarde) {
    return nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde;
  }, 1000000);
  pakket.mutatie("snelheid-".concat(laagsteSnelheid), 1);
  pakket.huidige_snelheid = laagsteSnelheid;
  var installatieStr = pakket.eigenschappen.eenmalig['installatie-dhz'] ? 'dhz' : pakket.eigenschappen.eenmalig['installatie-basis'] ? 'basis' : 'volledig';
  pakket.mutatie("installatie-".concat(installatieStr), 1); // zitten we op een belpakket? dan basis aanzetten.

  var kz = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
      isBelKeuze = kz['ik-weet-wat-ik-wil'] === '2' || kz['ik-weet-wat-ik-wil'] === '4';

  if (isBelKeuze && pakket.heeftTelefonieBereik('basis')) {
    pakket.alleTelefonieBundelsUit();
    pakket.zetTelefonieBereikAan('basis', 1);
  } // zet pakketten in window om later te laden.


  window["kz-pakket-".concat(pakket.ID)] = pakket;
  return pakket;
}

function vergelijkingsProcedure(pakket, keuzehulp) {
  if (typeof keuzehulp === 'undefined') {
    console.warn('keuzehulp undefined!');
    keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
  } // schrijf de snelheid naar het pakket.


  var snelheden = pakket.eigenschappen.snelheden;
  var gekozenSnelheid = false;
  snelheden.forEach(function (snelheid) {
    var s = Number(snelheid);

    if (!gekozenSnelheid) {
      if (keuzehulp.internet === '1' && s < 251 || keuzehulp.internet === '2' && s < 501 || (keuzehulp.internet === '3' || keuzehulp.internet === '4') && s > 501) {
        gekozenSnelheid = snelheid;
      }
    }
  }); // dan met de hand toewijzen.

  if (!gekozenSnelheid) {
    if (keuzehulp.internet.includes('1')) {
      gekozenSnelheid = snelheden[0];
    } else if (keuzehulp.internet.includes('2')) {
      if (snelheden.length > 1) {
        gekozenSnelheid = snelheden[1];
      } else {
        gekozenSnelheid = snelheden[0];
      }
    } else {
      gekozenSnelheid = snelheden[snelheden.length - 1];
    }
  }

  var ss = gekozenSnelheid.toString();
  pakket.veranderSnelheid(ss); // schrijf de bel & nummer keuze.
  // bellen = 1 							-> niet bellen.
  // bellen = 2 							-> basispakket.
  // bellen = 3 							-> NL pakket.
  // bellen = 3 + '2' in nummers-array 	-> Internationaal pakket.

  if (keuzehulp.bellen === '1') {
    pakket.alleTelefonieBundelsUit();
  } else if (keuzehulp.bellen === '2') {
    // zou altijd basispakket moeten hebben,
    // anders zijn verkeerde pakketten in PHP meegegeven!
    if (pakket.heeftTelefonieBereik('basis')) {
      pakket.zetTelefonieBereikAan('basis');
    }
  } else if (keuzehulp.bellen === '3') {
    if (keuzehulp.nummers && keuzehulp.nummers.indexOf('2') !== -1) {
      if (pakket.heeftTelefonieBereik('internationaal')) {
        pakket.zetTelefonieBereikAan('internationaal');
      } else if (pakket.heeftTelefonieBereik('nederland')) {
        pakket.zetTelefonieBereikAan('nederland');
      } else if (pakket.heeftTelefonieBereik('basis')) {
        pakket.zetTelefonieBereikAan('basis');
      }
    } else if (pakket.heeftTelefonieBereik('nederland')) {
      pakket.zetTelefonieBereikAan('nederland');
    } else if (pakket.heeftTelefonieBereik('basis')) {
      pakket.zetTelefonieBereikAan('basis');
    }
  } else {
    console.warn('onvoorziene situatie telefonie afhandeling vergelijkingsprocedure');
    pakket.alleTelefonieBundelsUit();
  }

  if (keuzehulp.nummers && keuzehulp.nummers.indexOf('1') !== -1) {
    pakket.mutatie('extra-vast-nummer', 1);
  } else {
    pakket.mutatie('extra-vast-nummer', 0);
  } // schrijf TV opties.


  if (keuzehulp['televisie-opties']) {
    var telOpts = keuzehulp['televisie-opties'],
        film1Fam = pakket.vindOpties({
      suboptietype: 'Film1',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    }),
        PlusFam = pakket.vindOpties({
      suboptietype: 'Plus',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    }),
        ZiggoSportFam = pakket.vindOpties({
      suboptietype: 'ZiggoSportTotaal',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    });
    var fsEdOptieFam = pakket.vindOpties({
      suboptietype: 'FoxSportsEredivisie',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    }),
        fsIntOptieFam = pakket.vindOpties({
      suboptietype: 'FoxSportsInternationaal',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    }),
        fsComplOptieFam = pakket.vindOpties({
      suboptietype: 'FoxSportsCompleet',
      tvType: pakket.eigenschappen.tv_type,
      snelheid: gekozenSnelheid
    });
    var telOptMap = [fsEdOptieFam, ZiggoSportFam, fsIntOptieFam, PlusFam, film1Fam]; // aanname: alleen maandelijks

    telOptMap.forEach(function (familie, nummer) {
      var telOptNr = nummer + 1;

      if (telOpts.includes(telOptNr.toString())) {
        familie.forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              sleutel = _ref2[0],
              optie = _ref2[1];

          return pakket.mutatie(sleutel, 1);
        }); //familie.mOpties.forEach(optie => pakket.mutatie(optie.sleutel, 1));
      }
    });

    if (pakket.optieBestaat('extra-tv-ontvangers')) {
      var etoPrijs = pakket.optiePrijs('extra-tv-ontvangers');

      if (telOpts.includes('6') && (etoPrijs.mp || etoPrijs.ep)) {
        pakket.mutatie('extra-tv-ontvangers', 1);
      }
    } // fox sport compleet?
    // als allebei gekozen & foxsportscompleet bestaat...
    // aanname: maar één opties binnen al die pakketten.


    if (fsEdOptieFam.length && fsIntOptieFam.length && fsComplOptieFam.length) {
      if (fsEdOptieFam[0][1].aantal && fsIntOptieFam[0][1].aantal) {
        pakket.mutatie(fsEdOptieFam[0][0], 0);
        pakket.mutatie(fsIntOptieFam[0][0], 0);
        pakket.mutatie(fsComplOptieFam[0][0], 1);
      }
    }
  }

  if (keuzehulp.televisie === '3') {
    pakket.mutatie('opnemen', 1);
    pakket.mutatie('replay', 1);
    pakket.mutatie('begin-gemist', 1);
    pakket.mutatie('opnemen-replay-begin-gemist-samen', 1);
  }

  var inst = keuzehulp.installatie;

  if (inst === '3') {
    if (pakket.optieBestaat('installatie-volledig')) {
      pakket.mutatie('installatie-volledig', 1);
    } else if (pakket.optieBestaat('installatie-basis')) {
      pakket.mutatie('installatie-basis', 1);
    } else {
      pakket.mutatie('installatie-dhz', 1);
    }
  } else if (inst === '2') {
    if (pakket.optieBestaat('installatie-basis')) {
      pakket.mutatie('installatie-basis', 1);
    } else if (pakket.optieBestaat('installatie-volledig')) {
      pakket.mutatie('installatie-volledig', 1);
    } else {
      pakket.mutatie('installatie-dhz', 1);
    }
  } else if (pakket.optieBestaat('installatie-dhz')) {
    pakket.mutatie('installatie-dhz', 1);
  } else if (pakket.optieBestaat('installatie-basis')) {
    pakket.mutatie('installatie-basis', 1);
  } else {
    pakket.mutatie('installatie-volledig', 1);
  } // zet pakketten in window om later te laden.


  window["kz-pakket-".concat(pakket.ID)] = pakket;
  return pakket;
}
// FIND
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


      var thisArg = arguments[1]; // 5. Let k be 0.

      var k = 0; // 6. Repeat, while k < len

      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];

        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        } // e. Increase k by 1.


        k++;
      } // 7. Return undefined.


      return undefined;
    }
  });
} // OBJECT ENTRTIES


if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
} // POLYFILL
// https://tc39.github.io/ecma262/#sec-array.prototype.includes


if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function value(searchElement, fromIndex) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

      var len = o.length >>> 0; // 3. If len is 0, return false.

      if (len === 0) {
        return false;
      } // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)


      var n = fromIndex | 0; // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.

      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0); // 7. Repeat, while k < len

      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if (o[k] === searchElement) {
          return true;
        }

        k++;
      } // 8. Return false


      return false;
    }
  });
} // Production steps of ECMA-262, Edition 6, 22.1.2.1


if (!Array.from) {
  Array.from = function () {
    var toStr = Object.prototype.toString;

    var isCallable = function isCallable(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };

    var toInteger = function toInteger(value) {
      var number = Number(value);

      if (isNaN(number)) {
        return 0;
      }

      if (number === 0 || !isFinite(number)) {
        return number;
      }

      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };

    var maxSafeInteger = Math.pow(2, 53) - 1;

    var toLength = function toLength(value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    }; // The length property of the from method is 1.


    return function from(arrayLike
    /*, mapFn, thisArg */
    ) {
      // 1. Let C be the this value.
      var C = this; // 2. Let items be ToObject(arrayLike).

      var items = Object(arrayLike); // 3. ReturnIfAbrupt(items).

      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      } // 4. If mapfn is undefined, then let mapping be false.


      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;

      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        } // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.


        if (arguments.length > 2) {
          T = arguments[2];
        }
      } // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).


      var len = toLength(items.length); // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method 
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).

      var A = isCallable(C) ? Object(new C(len)) : new Array(len); // 16. Let k be 0.

      var k = 0; // 17. Repeat, while k < len… (also steps a - h)

      var kValue;

      while (k < len) {
        kValue = items[k];

        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }

        k += 1;
      } // 18. Let putStatus be Put(A, "length", len, true).


      A.length = len; // 20. Return A.

      return A;
    };
  }();
}
/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
// hierin staan gedefinieerd, per stap
// welkle opties wèl getoond worden.
// let op: het veranderen van de volgorde van de knoppen heeft consequenties.
keuzeConsequenties = {
  kleinHuishouden: {
    internet: [1, 2, 3]
  },
  gezin: {
    internet: [2, 3]
  },
  kleinZakelijk: {
    internet: [1, 2, 4]
  },
  bedrijf: {},
  nummersParticulier: {
    nummers: [2]
  },
  nummersZakelijk: {
    nummers: [1, 2]
  }
};

function kzSluitRoutesUit(keuze) {
  if (!(keuze in keuzeConsequenties)) {
    console.error('keuze consequentie onbekend');
    console.trace();
    return;
  }

  var consequentie = keuzeConsequenties[keuze];
  var config, i, sectie, sectieTitel, selector, titelNormaleSpelling;

  for (sectieTitel in consequentie) {
    // internet, bellen, televisie etc
    titelNormaleSpelling = naarStreepCase(sectieTitel); // dit pakt de knoppen op volgorde van links naar rechts in de secties;
    // zo komt het overeen met het plan van Gaby en evt. aanpassingen daarin.

    selector = "[data-kz-".concat(titelNormaleSpelling, "-keuze]");
    sectieKnoppen = doc.querySelectorAll(selector);

    if (sectieKnoppen.length) {
      // alles op display none
      for (i = 0; i < sectieKnoppen.length; i++) {
        kzVindCombiKnop(sectieKnoppen[i]).style.display = 'none';
      }

      config = consequentie[titelNormaleSpelling];

      for (i = 0; i < config.length; i++) {
        var sel = "[data-kz-".concat(titelNormaleSpelling, "-keuze='").concat(config[i], "']");
        var knop = doc.querySelector(sel);

        if (knop) {
          kzVindCombiKnop(knop).style.display = 'flex';
        } else {
          console.log(new Error('niet gevonden op index ', config[i]));
        }
      }
    } else {
      console.error("sectie niet gevonden ".concat(sectieTitel));
    }
  }
}
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
// ROUTING
var kzRouting = {
  /*------------------------------------------------------
  |
  | 	Dit object doet de 'routing' via hide/show
  | 	op basis van niveau nummers...die corresponderen met een data-keuzehulp-stap waarde
  | 	Navigatie wordt opgeslagen in een geschiedenis en geschreven naar de URL-balk
  | 	Naar een eerdere stap kan teruggenavigeerd worden via stapTerug functie
  | 	Niet consequent gebouwd in opvatting van wat een niveau nu is.
  | 	Wordt opgelost door te zoeken, achteraf, naar het niveau als het niet gevonden is.
  | 	De uitzonderingsmogelijkheid, om hier nog routing bij te sturen,
  |	is uitaard misbruikt voor andere doeleinden.
  |
  |-----------------------------------------------------*/
  // 1  : postcode controle
  // 2  : keuzehulp of niet
  // 3  : situatie
  // 4  : klein zakelijk bedrijf of niet
  // 5  : internet
  // 6  : bellen
  // 7  : nummers
  // 8  : televisie
  // 9  : televisie opties
  // 10 : kabel opties
  // 11 : aansluiting
  // 20 : pakketkeuze
  // 21 : pakketkeuze selectie
  // 30 : vergelijking
  // 50 : contactform zakelijk
  // 51 : contactform lead
  // 100: aanmeldformulier
  init: function init() {
    var _this = this;

    this.stappen = doc.querySelectorAll('[data-keuzehulp-stap]');
    window.addEventListener('popstate', function (e) {
      e.preventDefault(); // apple heeft een andere implementatie van popstate.
      // ook laden v/d pagina is popstate
      // als gs nog length 1 dan is pagina net geladen en is deze popstate van apple.

      if (_this.gs.length > 1) {
        _this.stapTerug();
      }
    }, false);
    this.schrijfStapNaarBody(0);
  },
  gs: [1],
  // initiele waarde.
  laatsteInGs: function laatsteInGs() {
    return kzRouting.gs[kzRouting.gs.length - 1];
  },
  stapTerug: function stapTerug() {
    // laatste eraf
    this.gs.pop();
    this.ga(this.laatsteInGs());
  },
  // als stapNr in deze array, dan draait de code bij die 'case'
  uitzonderingen: [7, 2],
  // bellen -> nummers
  verwerkUitzondering: function verwerkUitzondering(stapNr) {
    // bedoelt als bewerker van het stapNr.
    switch (stapNr) {
      case 2:
        // @TODO dit hoort hier niet thuis
        sessionStorage.setItem('kz-keuzehulp', JSON.stringify({}));
        break;

      case 7:
        // als gekozen voor 'ik bel alleen mobiel' cq telefoon = 1
        // dan niet door naar nummerkeuze.
        if (JSON.parse(sessionStorage.getItem('kz-keuzehulp')).bellen === '1') {
          stapNr = 8;
        }

        break;

      default:
        console.warn('uitzondering verwerk naar nummer niet gevonden');
        break;
    }

    return stapNr;
  },
  ga: function ga(stap) {
    // als de stap als nummer wordt gegeven,
    // worden alle stappen als literal array genomen en wordt gegaan naar de index.
    // als de stap als string wordt gegeven wordt gekeken naar het
    // data-keuzehulp-stap attribuut.
    // controle
    if (!this.stappen) this.init();
    var _s = this.stappen;
    var dezeStap = doc.querySelector("[data-keuzehulp-stap=\"".concat(stap, "\"]")); // dit is de section

    if (!dezeStap) {
      console.error('stap onbekend', dezeStap, "stap ".concat(stap), _typeof(stap));
      console.trace();
      return false;
    }

    var nummerDezeStap = Number(dezeStap.getAttribute('data-keuzehulp-stap')); // is er een uitzonderingssituatie?
    // mogelijk door naar andere stap.

    if (this.uitzonderingen.indexOf(nummerDezeStap) !== -1) {
      nummerDezeStap = this.verwerkUitzondering(nummerDezeStap);
      dezeStap = doc.querySelector("[data-keuzehulp-stap=\"".concat(nummerDezeStap, "\"]"));
    } // zet alle stappen op none en de komende op block


    for (var i = 0; i < _s.length; i++) {
      _s[i].style.display = 'none';
    }

    dezeStap.style.display = 'block'; // ook de evt. knop in de navigatie onderaan schakelen.

    var knopOnder = doc.querySelector(".kz-navigatie-binnen [data-keuzehulp-stap=\"".concat(stap, "\"]"));

    if (knopOnder) {
      knopOnder.style.display = 'inline-block';
    } // zet in geschiedenis array, als niet reeds laatste


    if (this.laatsteInGs() !== nummerDezeStap) {
      this.gs.push(nummerDezeStap);
    } // zet op body el


    this.schrijfStapNaarBody(nummerDezeStap); // en trigger history

    this.zetHistory(dezeStap, nummerDezeStap); // @TODO scroll functie

    $('html, body').animate({
      scrollTop: $(dezeStap).offset().top - 50
    }, 100);
    return true;
  },
  schrijfStapNaarBody: function schrijfStapNaarBody() {
    var stap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var s = Number(stap),
        r = [{
      stappen: [0, 1],
      schrijf: 'begin postcode-check'
    }, {
      stappen: [2],
      schrijf: 'begin pad-keuze'
    }, {
      stappen: [3],
      schrijf: 'hoofd samenstellen nog-geen-niveau'
    }, {
      stappen: [3, 4, 5, 6, 7, 8, 9, 10, 11],
      schrijf: 'hoofd samenstellen'
    }, {
      stappen: [20],
      schrijf: 'pakkettenkeuze pad-keuze'
    }, {
      stappen: [21],
      schrijf: 'pakkettenkeuze vergelijken'
    }, {
      stappen: [30, 31],
      schrijf: 'hoofd vergelijken'
    }, {
      stappen: [50, 51],
      schrijf: 'hoofd formulier'
    }, {
      stappen: [100],
      schrijf: 'hoofd bestellen'
    }].find(function (conf) {
      return conf.stappen.indexOf(s) !== -1;
    });
    body.setAttribute('data-kz-stap', "".concat(r.schrijf, " stap-").concat(stap));
  },
  zetHistory: function zetHistory(dezeStap, nummerDezeStap) {
    // dit is een afgeleide... het zou opgehaald kunnen worden via laatsteInGs?
    // stabieler? dit is sneller...
    var titel = dezeStap.getElementsByTagName('header')[0].getElementsByTagName('h2')[0].textContent.trim(),
        url = "/".concat(encodeURI(titel.replace(/[\W_]+/g, '-')).toLowerCase());
    history.pushState(null, titel, url);
  }
};
var _this2 = this;

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
function vergelijkingAjax() {
  var keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
      adres = JSON.parse(sessionStorage.getItem('kz-adres'));
  doc.getElementById('print-vergelijking').innerHTML = '<p>Uw pakketten worden opgehaald en vergeleken.</p>';
  new KzAjax({
    ajaxData: {
      action: 'keuzehulp_vergelijking',
      data: {
        adres: adres,
        keuzehulp: keuzehulp
      }
    },
    cb: function cb(r) {
      return kzRenderVergelijking.hoofd(r, keuzehulp);
    }
  }).doeAjax();
} // vergelijking ajax


var kzRenderVergelijking = {
  hoofd: function hoofd(r, keuzehulp) {
    var _this = this;

    this.keuzehulp = keuzehulp;
    this.providers = r.providers;
    doc.getElementById('print-vergelijking').innerHTML = '';

    if (this.erIsWatTePrinten()) {
      var printVergelijking = doc.getElementById('print-vergelijking');

      if (Object.entries(r.providers).length < 3) {
        printVergelijking.classList.add("minder-dan-drie");
      }

      printVergelijking.innerHTML = Object.entries(r.providers).map(this.hoofdMap1).sort(kzProvidersLaagNaarHoog).map(function (_ref, providerTal) {
        var pakketten = _ref.pakketten,
            providersLaagste = _ref.providersLaagste;
        //providerInfoBundel
        var pakketClasses = pakketten.map(function (pakket) {
          return "pakketten-section-".concat(pakket.ID);
        }).join(' ');
        return "\n\t\t\t\t\t".concat(providerTal === 3 ? "\n\t\t\t\t\t\t\t<div class='provider-pakketten-break'>\n\t\t\t\t\t\t\t\t<h2>Overige selectie pakketten die goed bij jouw voorkeuren passen</h2>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t" : '', "\n\n\t\t\t\t<section class='provider-pakketten vergelijking ").concat(pakketClasses, "'>\n\n\t\t\t\t\t<header class='provider-pakketten-header'>\n\n\t\t\t\t\t\t<div class='provider-logo-contain'>").concat(pakketten[0].eigenschappen.provider_meta.thumb, "</div>\n\n\t\t\t\t\t\t").concat(providerTal < 3 ? "<span class='prijs-bolletje provider-pakketten-header-prijs'><span>".concat(pakketten[0].maandelijksTotaal(true), "</span><span>p/m</span></span>") : '', "\n\n\t\t\t\t\t</header>\n\n\n\t\t\t\t\t<ul class='provider-pakketten-lijst'>\n\t\t\t\t\t\t").concat(pakketten.map(function (pakket) {
          return _this.printPakkettenLijst(pakket, providerTal);
        }).join(''), "\n\t\t\t\t\t</ul>\n\n\t\t\t\t</section>\n\n\t\t\t\t");
      }).join('');
    } else {
      // door naar pakketoverzicht voor alternatieven
      kzRouting.ga(21);

      var _keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

      if (_keuzehulp.bellen === '2' || _keuzehulp.bellen === '3') {
        if (_keuzehulp.televisie === '2' || _keuzehulp.televisie === '3') {
          _keuzehulp['ik-weet-wat-ik-wil'] = '4';
        } else {
          _keuzehulp['ik-weet-wat-ik-wil'] = '2';
        }
      } else if (_keuzehulp.televisie === '2' || _keuzehulp.televisie === '3') {
        _keuzehulp['ik-weet-wat-ik-wil'] = '3';
      } else {
        _keuzehulp['ik-weet-wat-ik-wil'] = '1';
      }

      sessionStorage.setItem('kz-keuzehulp', JSON.stringify(_keuzehulp));
      ikWeetWatIkWilPakkettenAjax();
    } // als r cq response

  },
  hoofdMap1: function hoofdMap1(_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        provider = _ref3[0],
        providerBundel = _ref3[1];

    var pakketten = providerBundel.map(function (pakket) {
      return new VerrijktPakket(pakket);
    }).map(function (pakket) {
      return vergelijkingsProcedure(pakket, _this2.keuzehulp);
    }),
        // maak array met maandTotalen en zoek laagste op.
    providersLaagste = pakketten.map(function (pakket) {
      return pakket.maandelijksTotaal();
    }).reduce(function (nieuweWaarde, huidigeWaarde) {
      return nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde;
    }, 1000000);
    return {
      provider: provider,
      providersLaagste: providersLaagste,
      pakketten: pakketten
    };
  },
  erIsWatTePrinten: function erIsWatTePrinten() {
    // KAN ALS ARRAY EN ALS OBJECT BINNENKOMEN :o
    if (this.providers.hasOwnProperty('length')) {
      return !!this.providers.length;
    }

    return !!Object.entries(this.providers);
  },
  printPakkettenLijst: function printPakkettenLijst(pakket, providerTal) {
    // hallo opvolger!
    // ze wilden niet luisteren toen ik zei: dit loopt helemaal uit de hand
    // doe het niet.
    this.pakket = pakket;
    var ds = pakket.pakHuidigeSnelheid(),
        us = pakket.pakHuidigeUploadSnelheid();
    return "\n\t\t<li class='provider-pakketten-pakket'>\n\n\t\t\t<header>\n\t\t\t\t<h3 class='provider-pakketten-pakket-titel'><span class='provider-pakketten-pakket-titel_naam'>".concat(pakket.naam_composiet, "</span><span class='provider-pakketten-pakket-titel_usp'>").concat(pakket.eigenschappen.teksten.usps, "</span></h3>\n\n\t\t\t\t<div class='flex'>\n\n\t\t\t\t\t").concat(ds && ds === us ? "<div class='provider-pakketten-pakket-links'>\n\t\t\t\t\t\t\t<h4>Snelheid</h4>\n\t\t\t\t\t\t\t<strong>".concat(ds, " Mb/s</strong>\n\t\t\t\t\t\t</div>") : ds && ds !== us ? "<div class='provider-pakketten-pakket-links'>\n\t\t\t\t\t\t\t\t<h4>Down- en uploadsnelheid</h4>\n\t\t\t\t\t\t\t\t<strong>".concat(ds, " / ").concat(us, " Mb/s</strong>\n\t\t\t\t\t\t\t</div>") : "", "\n\n\t\t\t\t\t").concat(providerTal > 2 ? "<div class='provider-pakketten-pakket-midden'>\n\t\t\t\t\t\t\t<h4>Maandelijks totaal</h4>\n\t\t\t\t\t\t\t<strong>".concat(pakket.maandelijksTotaal(true), "</strong>\n\t\t\t\t\t\t</div>") : '', "\n\n\t\t\t\t\t<div class='provider-pakketten-pakket-rechts'>\n\t\t\t\t\t\t<h4>Eenmalige kosten</h4>\n\t\t\t\t\t\t<strong>").concat(pakket.eenmaligTotaal(true), "</strong>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<a\n\t\t\t\t\tclass='knop blauwe-knop'\n\t\t\t\t\thref='#'\n\t\t\t\t\tdata-doel='#provider-pakketten-vergelijking-hoofd-").concat(pakket.ID, ", .pakketten-section-").concat(pakket.ID, ", .pakketten-section-").concat(pakket.ID, " .provider-pakketten_footer'\n\t\t\t\t\tdata-kz-func='schakel'\n\t\t\t\t\tdata-scroll='.pakketten-section-").concat(pakket.ID, "'\n\t\t\t\t\t><span class='als-niet-actief'>bekijken</span><span class='als-actief'>dichtvouwen</span><svg class='svg-dichtklappen' xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><style>.cc94da39-046e-4f53-b263-e21794d5c601{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class=\"cc94da39-046e-4f53-b263-e21794d5c601\" d=\"M35.47,59.76,50,45.38,64.53,59.76C65.68,61,66.82,61,68,59.83a2.23,2.23,0,0,0,0-3.51L51.72,40.07a2.29,2.29,0,0,0-3.44,0L32,56.32a2.23,2.23,0,0,0,0,3.51C33.18,61,34.32,61,35.47,59.76Z\"/></svg>\n\t\t\t\t</a>\n\n\t\t\t</header>\n\n\t\t\t<div class='provider-pakketten-vergelijking-hoofd' id='provider-pakketten-vergelijking-hoofd-").concat(pakket.ID, "'>\n\n\t\t\t\t").concat(this.telefonieSectie(), "\n\n\t\t\t\t").concat(this.televisieSectie(), "\n\n\t\t\t\t").concat(this.installatieSectie(), "\n\n\t\t\t\t").concat(this.kostenSectie(), "\n\n\t\t\t\t").concat(this.aanvullendeSectie(), "\n\n\t\t\t</div>\n\n\t\t\t<footer class='provider-pakketten_footer'>\n\t\t\t\t<a\n\t\t\t\t\tclass='knop blauwe-knop geen-ikoon kz-bestelknop'\n\t\t\t\t\tdata-kz-func='toon-stap animeer aanmeldformulier'\n\t\t\t\t\thref='#100'\n\t\t\t\t\tkz-data-pakket-id='").concat(pakket.ID, "'\n\t\t\t\t\t>Bestellen\n\t\t\t\t</a>\n\t\t\t</footer>\n\t\t</li>");
  },
  telefonieSectiePrijsTD: function telefonieSectiePrijsTD(a) {
    return isNaN(Number(a)) ? a : this.pakket.formatteerPrijs(a);
  },
  telefonieSectie: function telefonieSectie() {
    var telBundel = this.pakket.huidigeTelefonieBundel();

    if (!telBundel) {
      return '';
    }

    if (!telBundel.data.vast) {
      console.warn("telefoniebundel invullen ".concat(this.pakket.naam_composiet));
      console.log(telBundel);
      return;
    }

    var tb = this.pakket.vindOptie({
      aantal: 1,
      optietype: 'telefonie-bundel'
    })[1];
    var maandPrijsTelBundel = this.pakket.formatteerPrijs(tb.prijs);
    return "\n\t\t\t<div class='provider-pakketten-vergelijking-sectie'>\n\n\t\t\t\t<header>\n\t\t\t\t\t<svg class='svg-bellen' xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><style>.e97ef855-384b-4714-91e0-2d37881c1420{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class=\"e97ef855-384b-4714-91e0-2d37881c1420\" d=\"M70.94,58.25a7.15,7.15,0,0,0-5.18-2.38,7.43,7.43,0,0,0-5.24,2.36l-4.84,4.83-1.18-.61c-.55-.28-1.07-.54-1.52-.81a52.83,52.83,0,0,1-12.61-11.5,30.92,30.92,0,0,1-4.13-6.52c1.25-1.15,2.42-2.35,3.55-3.5.43-.42.86-.87,1.29-1.3,3.22-3.21,3.22-7.38,0-10.6L36.9,24c-.48-.48-1-1-1.43-1.46-.92-.95-1.88-1.93-2.88-2.85a7.24,7.24,0,0,0-5.13-2.25,7.5,7.5,0,0,0-5.21,2.25l0,0L17,25a11.18,11.18,0,0,0-3.32,7.12,26.84,26.84,0,0,0,2,11.37A65.89,65.89,0,0,0,27.37,63.06a72.09,72.09,0,0,0,24,18.8,37.2,37.2,0,0,0,13.48,4l1,0a11.54,11.54,0,0,0,8.84-3.8s0,0,.06-.07a34.89,34.89,0,0,1,2.69-2.78c.65-.62,1.33-1.28,2-2A7.68,7.68,0,0,0,81.71,72a7.36,7.36,0,0,0-2.36-5.26Zm5.48,16.13s0,0,0,0c-.59.65-1.21,1.23-1.86,1.87a39.39,39.39,0,0,0-3,3.07,7.4,7.4,0,0,1-5.76,2.43h-.71a33.14,33.14,0,0,1-11.95-3.59A68.15,68.15,0,0,1,30.57,60.44a62.05,62.05,0,0,1-11-18.37,21.8,21.8,0,0,1-1.72-9.59,7,7,0,0,1,2.12-4.55l5.22-5.23a3.5,3.5,0,0,1,2.33-1.08,3.27,3.27,0,0,1,2.24,1.07l0,0c.94.87,1.83,1.77,2.76,2.74L34,27l4.18,4.19c1.62,1.62,1.62,3.12,0,4.75-.45.44-.87.88-1.32,1.31C35.56,38.53,34.34,39.76,33,41c0,0-.07,0-.08.08a3.14,3.14,0,0,0-.8,3.48l0,.13a33.61,33.61,0,0,0,5,8.08h0A56.22,56.22,0,0,0,50.75,65.11c.63.4,1.27.72,1.88,1s1.07.54,1.52.81l.18.11a3.32,3.32,0,0,0,1.52.38,3.29,3.29,0,0,0,2.33-1l5.24-5.24A3.43,3.43,0,0,1,65.73,60a3.14,3.14,0,0,1,2.21,1.11l0,0,8.44,8.44C78,71.15,78,72.76,76.42,74.38Z\"/><path class=\"e97ef855-384b-4714-91e0-2d37881c1420\" d=\"M52.8,30.55A19.72,19.72,0,0,1,68.86,46.61a2,2,0,0,0,2,1.71,2.19,2.19,0,0,0,.36,0A2.08,2.08,0,0,0,73,45.9,23.88,23.88,0,0,0,53.52,26.47a2.09,2.09,0,0,0-2.39,1.69A2,2,0,0,0,52.8,30.55Z\"/><path class=\"e97ef855-384b-4714-91e0-2d37881c1420\" d=\"M86.08,45.3a39.3,39.3,0,0,0-32-32,2.07,2.07,0,1,0-.68,4.08A35.07,35.07,0,0,1,82,46a2.07,2.07,0,0,0,4.08-.68Z\"/></svg>\n\t\t\t\t\t<h3>Bellen</h3>\n\t\t\t\t</header>\n\n\t\t\t\t<table>\n\t\t\t\t\t<thead>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<th>".concat(telBundel.naam, "</th>\n\t\t\t\t\t\t\t<th>").concat(maandPrijsTelBundel, "</th\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<th>Bundeltype: ").concat(telBundel.bereik, "</th>\n\t\t\t\t\t\t\t<th></th>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</thead>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td>Start vast</td>\n\t\t\t\t\t\t\t<td>").concat(this.telefonieSectiePrijsTD(telBundel.data.vast.nederland.start), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td>Vast p/m</td>\n\t\t\t\t\t\t\t<td>").concat(this.telefonieSectiePrijsTD(telBundel.data.vast.nederland.per_minuut), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td>Mobiel start</td>\n\t\t\t\t\t\t\t<td>").concat(this.telefonieSectiePrijsTD(telBundel.data.mobiel.nederland.start), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td>Mobiel p/m</td>\n\t\t\t\t\t\t\t<td>").concat(this.telefonieSectiePrijsTD(telBundel.data.mobiel.nederland.per_minuut), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t").concat(this.pakket.optieAantal('extra-vast-nummer') ? "<tr>\n\t\t\t\t\t\t\t\t\t\t<td>Extra vast nummer</td>\n\t\t\t\t\t\t\t\t\t\t<td>".concat(this.pakket.optiePrijs('extra-vast-nummer', true), "</td>\n\t\t\t\t\t\t\t\t\t</td>") : '', "\n\t\t\t\t\t<tbody>\n\n\t\t\t\t</table>\n\n\t\t\t\t<footer class='provider-pakketten-vergelijking-sectie_footer'>\n\t\t\t\t\t<a href='#' class='knop blauwe-knop' data-kz-func='telefonie-modal' data-pakket-id='").concat(this.pakket.ID, "'>Meer over deze telefoniebundel</a>\n\t\t\t\t</footer>\n\n\t\t\t</div>\n\t\t");
  },
  televisieSectieTD: function televisieSectieTD(sleutel, naam) {
    return this.pakket.optieAantal(sleutel) ? "<tr><td>".concat(naam, "</td><td>").concat(this.pakket.optiePrijs(sleutel, true), "</td>") : '';
  },
  televisieSectie: function televisieSectie() {
    var z = this.pakket.pakZenders();

    if (!z.totaal) {
      return '';
    }

    var tooltipHTML = "<a href='#' class='knop' data-kz-func='tooltip'\n\t\t\t\t\t\t\t\tdata-tooltip-titel='Snelheidsafhankelijke zenderpakketten'\n\t\t\t\t\t\t\t\tdata-tooltip-tekst='Bij ".concat(this.pakket.provider, " zijn er verschillende zenderpakketten beschikbaar, afhankelijk van de snelheid van uw internetverbinding. Dit zenderoverzicht hoort bij de snelheid ").concat(z.snelheid, " Mb/s.'>\n\t\t\t\t\t\t\t\t<svg class='svg-info' xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><style>.f7f0e9f1-f859-4dfe-95fb-3d086fc32618{fill:#159a3c;}</style></defs><circle class=\"f7f0e9f1-f859-4dfe-95fb-3d086fc32618\" cx=\"49.91\" cy=\"71.51\" r=\"4.36\"/><path class=\"f7f0e9f1-f859-4dfe-95fb-3d086fc32618\" d=\"M49.91,5.52A44.64,44.64,0,1,0,94.54,50.15,44.61,44.61,0,0,0,49.91,5.52Zm0,82.29A37.66,37.66,0,1,1,87.57,50.15,37.63,37.63,0,0,1,49.91,87.81Z\"/><path class=\"f7f0e9f1-f859-4dfe-95fb-3d086fc32618\" d=\"M49.91,27.92A14,14,0,0,0,36,41.87a3.49,3.49,0,1,0,7,0,7,7,0,1,1,7,7,3.49,3.49,0,0,0-3.49,3.49v8.72a3.49,3.49,0,0,0,7,0V55.38a14,14,0,0,0-3.49-27.46Z\"/></svg>\n\t\t\t\t\t\t\t </a>");
    return "\n\t\t\t<div class='provider-pakketten-vergelijking-sectie'>\n\n\t\t\t\t<header>\n\t\t\t\t\t<svg\n\t\t\t\t\t\tclass='svg-tv'\n\t\t\t\t\t\txmlns=\"http://www.w3.org/2000/svg\"\n\t\t\t\t\t\tviewBox=\"0 0 100 100\">\n\t\t\t\t\t\t\t<defs>\n\t\t\t\t\t\t\t\t<style>.25a40c2a-e21f-4ff6-8508-46524cd51bfe{fill:#159a3c;}\n\t\t\t\t\t\t\t\t</style>\n\t\t\t\t\t\t\t</defs>\n\t\t\t\t\t\t\t<title>Rekam icons groen</title>\n\t\t\t\t\t\t\t<path class=\"25a40c2a-e21f-4ff6-8508-46524cd51bfe\" d=\"M86.9,15.56v-.12H13.05v.12A4.89,4.89,0,0,0,8.6,19.94V68.47a4.71,4.71,0,0,0,.65,2.43,4.53,4.53,0,0,0,4.21,2.47H40.12V80.1H35.05a2.23,2.23,0,1,0,0,4.46H64.91a2.23,2.23,0,1,0,0-4.46H59.84V73.37H86.5a4.52,4.52,0,0,0,4.21-2.47,4.86,4.86,0,0,0,.69-2.43V19.94A5,5,0,0,0,86.9,15.56Zm0,4.78V68.47c0,.29-.12.41-.4.41h-73c-.28,0-.41-.12-.41-.41V19.94H86.9v.4Z\"/></svg>\n\t\t\t\t\t<h3>Televisie</h3>\n\t\t\t\t</header>\n\n\t\t\t\t<table>\n\t\t\t\t\t<thead>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<th>Type TV</th>\n\t\t\t\t\t\t\t<th>".concat(this.pakket.pakTypeTV(), "</th\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<th>Aantal zenders</th>\n\t\t\t\t\t\t\t<th>").concat(z.totaal, "  ").concat(z.aantalUniekeZenderPakketten > 1 ? tooltipHTML : '', "</th\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<th>Aantal HD zenders</th>\n\t\t\t\t\t\t\t<th>").concat(z.hd, "</th\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</thead>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t").concat(this.televisieSectieTD('app', 'App'), "\n\t\t\t\t\t\t").concat(this.televisieSectieTD('opnemen', 'Opnemen'), "\n\t\t\t\t\t\t").concat(this.televisieSectieTD('replay', 'Replay'), "\n\t\t\t\t\t\t").concat(this.televisieSectieTD('begin-gemist', 'Begin gemist'), "\n\t\t\t\t\t\t").concat(this.televisieSectieTD('opnemen-replay-begin-gemist-samen', 'Opnemen, terugkijken, begin gemist'), "\n\t\t\t\t\t\t").concat(this.televisieBundels(), "\n\t\t\t\t\t<tbody>\n\n\t\t\t\t</table>\n\n\t\t\t\t<!--<footer class='provider-pakketten-vergelijking-sectie_footer'>\n\t\t\t\t\t<a href='#' class='blauwe-knop knop' data-kz-func='aantal-zenders-modal' data-pakket-id='").concat(this.pakket.ID, "'>meer over deze televisiebundel</a>\n\t\t\t\t</footer>-->\n\n\t\t\t</div>\n\t\t");
  },
  televisieBundels: function televisieBundels() {
    var _this3 = this;

    return this.pakket.vindOpties({
      optietype: 'televisie-bundel',
      snelheid: this.pakket.pakHuidigeSnelheid(),
      tvType: this.pakket.eigenschappen.tv_type,
      aantal: 1
    }).map(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          sleutel = _ref5[0],
          _ref5$ = _ref5[1],
          naam = _ref5$.naam,
          prijs = _ref5$.prijs;

      return "<tr><td>".concat(naam, "</td><td>").concat(_this3.pakket.formatteerPrijs(prijs), "</td></tr>");
    }).join('');
  },
  installatieSectieTD: function installatieSectieTD(sleutel, naam) {
    return this.pakket.optieAantal(sleutel) ? "<tr><td>".concat(naam, "</td><td>").concat(this.pakket.optiePrijs(sleutel, true), "</td></tr>") : '';
  },
  installatieSectie: function installatieSectie() {
    return "\n\t\t\t<div class='provider-pakketten-vergelijking-sectie'>\n\n\t\t\t\t<header>\n\t\t\t\t\t<svg class='svg-installatie'  xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><style>.bc3ed8cd-2d3b-4536-a97d-59b790106817{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class=\"bc3ed8cd-2d3b-4536-a97d-59b790106817\" d=\"M51.54,90.63l4.31-1.78A4.52,4.52,0,0,0,58.3,83l-1.11-2.68a27.65,27.65,0,0,0,5.67-5.66l2.67,1.1a4.52,4.52,0,0,0,5.9-2.44L73.23,69a4.52,4.52,0,0,0-2.45-5.9l-4-1.63a1.74,1.74,0,0,0-1.32,3.22l4,1.64A1,1,0,0,1,70,67.63L68.23,72a1.08,1.08,0,0,1-.57.56,1,1,0,0,1-.79,0l-4-1.64a1.74,1.74,0,0,0-2.11.64,23.92,23.92,0,0,1-6.71,6.7,1.75,1.75,0,0,0-.65,2.12l1.63,4a1,1,0,0,1-.56,1.36L50.2,87.42a1,1,0,0,1-.8,0,1.06,1.06,0,0,1-.56-.56l-1.64-4a1.7,1.7,0,0,0-2-1,24.15,24.15,0,0,1-9.47,0,1.77,1.77,0,0,0-2,1l-1.63,4a1,1,0,0,1-1.36.56l-4.31-1.79a1.06,1.06,0,0,1-.57-.57,1.08,1.08,0,0,1,0-.79l1.64-4A1.74,1.74,0,0,0,27,78.2a23.82,23.82,0,0,1-6.71-6.71,1.75,1.75,0,0,0-2.12-.65l-4,1.63a1,1,0,0,1-.79,0,1,1,0,0,1-.56-.56L11,67.6a1,1,0,0,1,0-.79,1,1,0,0,1,.56-.57l4-1.64a1.72,1.72,0,0,0,1-1.95,24.34,24.34,0,0,1,0-9.47,1.77,1.77,0,0,0-1-2l-4-1.63A1,1,0,0,1,11,48.23l1.79-4.31a1.05,1.05,0,0,1,1.36-.57l4,1.64a1.73,1.73,0,0,0,2.11-.63A24,24,0,0,1,27,37.65a1.75,1.75,0,0,0,.65-2.12l-1.63-4a1,1,0,0,1,.56-1.35l4.31-1.78a1,1,0,0,1,.8,0,1.06,1.06,0,0,1,.56.56l1.64,4a1.74,1.74,0,0,0,3.22-1.32l-1.64-4A4.53,4.53,0,0,0,33,25.23a4.43,4.43,0,0,0-3.45,0L25.23,27a4.52,4.52,0,0,0-2.45,5.9l1.11,2.68a27.45,27.45,0,0,0-5.67,5.67l-2.67-1.11a4.51,4.51,0,0,0-5.9,2.45L7.83,46.91a4.52,4.52,0,0,0,2.45,5.9L13,53.92a27.57,27.57,0,0,0,0,8L10.28,63a4.54,4.54,0,0,0-2.45,2.44,4.6,4.6,0,0,0,0,3.46l1.78,4.31a4.53,4.53,0,0,0,2.45,2.45,4.58,4.58,0,0,0,3.45,0l2.68-1.11a27.45,27.45,0,0,0,5.67,5.67l-1.11,2.67a4.48,4.48,0,0,0,0,3.45,4.54,4.54,0,0,0,2.44,2.45l4.32,1.8a4.51,4.51,0,0,0,5.9-2.45l1.11-2.68a27.57,27.57,0,0,0,8,0l1.11,2.68a4.51,4.51,0,0,0,5.9,2.45Z\"/><path class=\"bc3ed8cd-2d3b-4536-a97d-59b790106817\" d=\"M26.36,58A14.19,14.19,0,0,0,40.53,72.11h.11A14.19,14.19,0,0,0,54.72,57.83,1.74,1.74,0,0,0,53,56.1h0a1.72,1.72,0,0,0-1.72,1.76,10.69,10.69,0,0,1-3.09,7.59,10.58,10.58,0,0,1-7.53,3.19h-.07a10.7,10.7,0,0,1-.07-21.4,1.72,1.72,0,0,0,1.72-1.76,1.74,1.74,0,0,0-1.74-1.72h0A14.18,14.18,0,0,0,26.36,58Z\"/><path class=\"bc3ed8cd-2d3b-4536-a97d-59b790106817\" d=\"M70,5.48h-3.4a3.77,3.77,0,0,0-3.76,3.77V11A20.22,20.22,0,0,0,58,13l-1.23-1.24a3.77,3.77,0,0,0-2.66-1.1,3.7,3.7,0,0,0-2.66,1.1L49,14.16a3.74,3.74,0,0,0,0,5.32l1.23,1.23a20,20,0,0,0-2,4.82H46.5a3.77,3.77,0,0,0-3.77,3.77v3.4a3.77,3.77,0,0,0,3.77,3.77h1.74a20,20,0,0,0,2,4.82L49,42.52a3.75,3.75,0,0,0-1.11,2.66A3.68,3.68,0,0,0,49,47.84l2.39,2.4a3.8,3.8,0,0,0,2.66,1.11,3.7,3.7,0,0,0,2.66-1.11L58,49a20.22,20.22,0,0,0,4.83,2v1.74a3.77,3.77,0,0,0,3.76,3.77H70a3.77,3.77,0,0,0,3.77-3.77V51a20.22,20.22,0,0,0,4.83-2l1.23,1.24a3.76,3.76,0,0,0,2.66,1.11,3.67,3.67,0,0,0,2.65-1.11l2.4-2.4a3.78,3.78,0,0,0,0-5.32l-1.23-1.23a19.56,19.56,0,0,0,2-4.82H90a3.77,3.77,0,0,0,3.77-3.77V29.3A3.77,3.77,0,0,0,90,25.53H88.26a19.56,19.56,0,0,0-2-4.82l1.23-1.23a3.78,3.78,0,0,0,0-5.32l-2.4-2.4a3.75,3.75,0,0,0-2.65-1.1,3.67,3.67,0,0,0-2.66,1.1L78.55,13a20.22,20.22,0,0,0-4.83-2V9.25A3.8,3.8,0,0,0,70,5.48Zm7.87,11.16a1.76,1.76,0,0,0,1,.3A1.69,1.69,0,0,0,80,16.43l2.2-2.2a.31.31,0,0,1,.2-.09.27.27,0,0,1,.19.09L85,16.62A.29.29,0,0,1,85,17l-2.2,2.2a1.73,1.73,0,0,0-.22,2.2,17,17,0,0,1,2.58,6.2A1.74,1.74,0,0,0,86.87,29H90a.27.27,0,0,1,.28.28v3.4A.27.27,0,0,1,90,33H86.87a1.72,1.72,0,0,0-1.7,1.41,17,17,0,0,1-2.58,6.2,1.76,1.76,0,0,0,.22,2.2L85,45a.29.29,0,0,1,0,.39l-2.4,2.39a.27.27,0,0,1-.19.09.31.31,0,0,1-.2-.09L80,45.54a1.73,1.73,0,0,0-2.2-.22,17.13,17.13,0,0,1-6.19,2.58,1.74,1.74,0,0,0-1.41,1.7v3.12a.28.28,0,0,1-.28.28h-3.4a.27.27,0,0,1-.28-.28V49.6a1.73,1.73,0,0,0-1.41-1.7,17.1,17.1,0,0,1-6.2-2.58,1.75,1.75,0,0,0-2.2.22l-2.2,2.2a.26.26,0,0,1-.2.08.25.25,0,0,1-.19-.08l-2.39-2.4a.24.24,0,0,1-.09-.19.27.27,0,0,1,.09-.2l2.2-2.2a1.74,1.74,0,0,0,.21-2.2,16.93,16.93,0,0,1-2.57-6.19A1.75,1.75,0,0,0,49.6,33H46.48a.28.28,0,0,1-.28-.29V29.27a.28.28,0,0,1,.28-.29H49.6a1.74,1.74,0,0,0,1.71-1.4,16.91,16.91,0,0,1,2.57-6.2,1.75,1.75,0,0,0-.21-2.2L51.47,17a.24.24,0,0,1-.09-.2.24.24,0,0,1,.09-.19l2.39-2.4a.25.25,0,0,1,.19-.08.26.26,0,0,1,.2.08l2.2,2.21a1.74,1.74,0,0,0,2.2.21A16.91,16.91,0,0,1,64.85,14a1.75,1.75,0,0,0,1.41-1.71V9.25A.27.27,0,0,1,66.54,9h3.4a.28.28,0,0,1,.28.28v3.11a1.74,1.74,0,0,0,1.41,1.71A16.93,16.93,0,0,1,77.82,16.64Z\"/><path class=\"bc3ed8cd-2d3b-4536-a97d-59b790106817\" d=\"M57.91,31A10.36,10.36,0,1,0,68.26,20.62,10.37,10.37,0,0,0,57.91,31Zm17.2,0a6.87,6.87,0,1,1-6.87-6.86A6.88,6.88,0,0,1,75.11,31Z\"/></svg>\n\t\t\t\t\t<h3>Installatie</h3>\n\t\t\t\t</header>\n\n\t\t\t\t<table>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t".concat(this.installatieSectieTD('installatie-dhz', 'Doe het zelf'), "\n\t\t\t\t\t\t").concat(this.installatieSectieTD('installatie-basis', 'Basisinstallatie'), "\n\t\t\t\t\t\t").concat(this.installatieSectieTD('installatie-volledig', 'Volledige installatie'), "\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\n\t\t\t</div>\n\t\t");
  },
  kostenSectie: function kostenSectie() {
    return "\n\t\t\t<div class='provider-pakketten-vergelijking-sectie'>\n\n\t\t\t\t<header>\n\t\t\t\t\t<svg\n\t\t\t\t\t\tclass='svg-kosten'\n\t\t\t\t\t\txmlns=\"http://www.w3.org/2000/svg\"\n\t\t\t\t\t\tviewBox=\"0 0 100 100\"><defs><style>.90a4297-b0d6-49b3-bfa6-51cb9d624468{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class=\"390a4297-b0d6-49b3-bfa6-51cb9d624468\" d=\"M64.64,54.26a2.18,2.18,0,0,0-.59,1.61,2.38,2.38,0,1,0,2.34-2.34A2.36,2.36,0,0,0,64.64,54.26Zm-5.27,8.63v-14H82.79v14ZM29.66,25.43l41.27-6.74,1,6.74ZM17.21,30.11H78.1v14H59.37a4.75,4.75,0,0,0-4.69,4.68v14a4.75,4.75,0,0,0,4.69,4.69H78.1v14H17.21Zm65.58,14v-14a4.75,4.75,0,0,0-4.69-4.68H76.64l-1.47-9.81a2.17,2.17,0,0,0-1-1.46,2.39,2.39,0,0,0-1.83-.44L21.46,22.06a2.3,2.3,0,0,0-1.46.88,2.18,2.18,0,0,0-.44,1.75l.14.74H17.21a4.5,4.5,0,0,0-3.29,1.39,4.47,4.47,0,0,0-1.39,3.29V81.63a4.47,4.47,0,0,0,1.39,3.29,4.5,4.5,0,0,0,3.29,1.39H78.1a4.75,4.75,0,0,0,4.69-4.68v-14a4.75,4.75,0,0,0,4.68-4.69v-14a4.75,4.75,0,0,0-4.68-4.68Z\"/></svg>\n\t\t\t\t\t<h3>Kosten</h3>\n\t\t\t\t</header>\n\n\t\t\t\t<table>\n\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td><strong>Borg apparatuur</strong></td>\n\t\t\t\t\t\t\t<td>".concat(this.pakket.formatteerPrijs(this.pakket.eigenschappen.borg.basis_borg.prijs), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td><strong>Eenmalige kosten</strong></td>\n\t\t\t\t\t\t\t<td>").concat(this.pakket.eenmaligTotaal(true), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td><strong>Maandelijks totaal</strong></td>\n\t\t\t\t\t\t\t<td>").concat(this.pakket.maandelijksTotaal(true), "</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t<tbody>\n\n\t\t\t\t</table>\n\n\t\t\t</div>\n\t\t");
  },
  aanvullendeSectie: function aanvullendeSectie() {
    if (!this.pakket.eigenschappen.teksten.aanvullende_informatie) return '';
    return "\n\t\t\t<div class='provider-pakketten-vergelijking-sectie'>\n\n\t\t\t\t<header>\n\t\t\t\t\t<svg class='svg-waarschuwing' xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><style>.a500d6e8-b1bb-4ff1-a8d3-eea033bce877{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><g id=\"85b84290-0c60-4141-b983-6425040e3dda\" data-name=\"Attention\"><path class=\"a500d6e8-b1bb-4ff1-a8d3-eea033bce877\" d=\"M86.49,73.85,55.39,20a6.22,6.22,0,0,0-10.78,0l-31.1,53.9a6.23,6.23,0,0,0,5.4,9.32H81.09a6.23,6.23,0,0,0,5.4-9.32ZM18.9,77,50,23.05h0L81.09,77ZM50,62.44a4.15,4.15,0,1,0,4.15,4.14A4.15,4.15,0,0,0,50,62.44ZM45.85,43.78a4,4,0,0,0,.06.7l2,12.09a2.08,2.08,0,0,0,4.09,0l2.05-12.09a4,4,0,0,0,.06-.7,4.15,4.15,0,0,0-8.3,0Z\"/></g></svg>\n\t\t\t\t\t<h3>Aanvullende informatie</h3>\n\t\t\t\t</header>\n\n\t\t\t\t<p>".concat(this.pakket.eigenschappen.teksten.aanvullende_informatie, "</p>\n\n\t\t\t</div>\n\t\t");
  }
};

function kzTelefonieModal(knop) {
  var pakket = window["kz-pakket-".concat(knop.getAttribute('data-pakket-id'))],
      belPakket = pakket.huidigeTelefonieBundel();

  this.cel = function (prijs) {
    return isNaN(Number(prijs)) ? prijs : pakket.formatteerPrijs(prijs);
  };

  var html = "\n\n\t\t<p>".concat(isNaN(Number(belPakket.data.maandbedrag)) ? belPakket.data.maandbedrag : "Abonnementsprijs: ".concat(pakket.formatteerPrijs(belPakket.data.maandbedrag)), "</p>\n\n\t\t<p><strong>Maximum minuten binnen bundel: </strong> ").concat(belPakket.data.maximum_minuten ? belPakket.data.maximum_minuten : 'geen', "</p>\n\n\t\t<table>\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th></th>\n\t\t\t\t\t<th>Start</th>\n\t\t\t\t\t<th>Minuut</th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>NL</td>\n\t\t\t\t\t<td>Vast</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.vast.nederland.start), "</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.vast.nederland.per_minuut), "</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>NL</td>\n\t\t\t\t\t<td>Mobiel</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.mobiel.nederland.start), "</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.mobiel.nederland.per_minuut), "</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>Buitenland</td>\n\t\t\t\t\t<td>Vast</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.vast.buitenland.start), "</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.vast.buitenland.per_minuut), "</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td>Buitenland</td>\n\t\t\t\t\t<td>Mobiel</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.mobiel.buitenland.start), "</td>\n\t\t\t\t\t<td>").concat(this.cel(belPakket.data.mobiel.buitenland.per_minuut), "</td>\n\t\t\t\t</tr>\n\n\t\t\t</tbody>\n\t\t</table>\n\t");
  kzModal({
    kop: belPakket.naam,
    torso: html
  });
}

function kzZendersModal(knop) {
  var pakket = window["kz-pakket-".concat(knop.getAttribute('data-pakket-id'))],
      zenderInfo = pakket.pakZenders(),
      html = "\n\t\tZenders totaal: ".concat(zenderInfo.totaal, "<br>\n\t\tZenders HD: ").concat(zenderInfo.hd, "<br>\n\t\t").concat(zenderInfo.zenderlijst, "\n\t");
  kzModal({
    kop: pakket.naam_composiet,
    torso: html
  });
}

function kzVergelijkingstabelOpVolgorde(tabel) {
  // maak verzameling met bedragen als getallen
  var bedragen = tabel.maandelijksTotaal.map(function (waarde, index) {
    return Number(waarde.replace('&euro; ', '').replace(',', '.'));
  }),
      // kopieer de verzameling tbv sortering en sorteer
  bedragenSort = bedragen.map(function (w) {
    return w;
  }).sort(),
      // zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
  indicesVolgorde = bedragenSort.map(function (w) {
    return bedragen.indexOf(w);
  });
  var rijNaam, rijKopie, i; // per rij, volgorde aanpassen adhv indicesvolgorde.

  for (rijNaam in tabel) {
    rijKopie = tabel[rijNaam].map(function (w) {
      return w;
    });
    tabel[rijNaam] = [];

    for (i = 0; i < rijKopie.length; i++) {
      tabel[rijNaam].push(rijKopie[indicesVolgorde[i]]);
    }
  }

  return tabel;
}
