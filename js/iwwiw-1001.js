/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren, iwwiwProcedure, VerrijktPakket  */
function ikWeetWatIkWilPakkettenAjax() {
	/*------------------------------------------------------
	|
	|	Haalt pakketten op van achterkant adhv type (internet, interet&bellen etc)
	| 	Laat het op prijs sorteren
	| 	Print die vervolgens een voor een per provider
	|
	|-----------------------------------------------------*/


	// keuzehulp vullen met data installatie
	const keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp')),
	adres = JSON.parse(sessionStorage.getItem('efiber-adres'));
	keuzehulp.installatie = '1';
	sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(keuzehulp));

	document.getElementById('print-provider-pakketten').innerHTML = '<p><br>Moment geduld a.u.b.</p>';

	const ajf = new EfiberAjax({
		ajaxData: {
			action: 'efiber_ik_weet_wat_ik_wil_pakketten',
			data: {
				keuzehulp,
				adres
			},
		},
		cb(r) {
			const printProviderPakketten = document.getElementById('print-provider-pakketten');

			let printPakketten = '';

			if (!r.providers || !Object.entries(r.providers).length) {
				efiberModal(efiberTekst('geenPakkettenGevonden'), 2000);
				efiberRouting.ga(1); // terug naar de voorpagina.

				const ajf2 = new EfiberAjax({
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
				return;				
			}

			Object.entries(r.providers).forEach(([provider, providerBundel]) => {
				// maak de rekenklassen
				// stel laagste snelheid in als gekozen pakket
				const pakketten = providerBundel.map(pakket => new VerrijktPakket(pakket))
				.map(pakket => iwwiwProcedure(pakket)),

				// maak array met maandTotalen en zoek laagste op.

				providersLaagste = pakketten
				.map(pakket => pakket.maandelijksTotaal())
				.reduce((nieuweWaarde, huidigeWaarde) => (
					nieuweWaarde < huidigeWaarde
					? nieuweWaarde
					: huidigeWaarde
				),
				1000000);

				// per provider aantal pakketten, zoals DTV, ITV. Vaak maar één.
				printPakketten += `<section class='provider-pakketten'>

					<header class='provider-pakketten-header'>

						${pakketten[0].eigenschappen.provider_meta.thumb}

						<span class='provider-pakketten-header-pakkettental'>
							${pakketten.length} pakket${(pakketten.length !== 1 ? 'ten' : '')}
						</span>

						<span class='provider-pakketten-header-prijs prijs-bolletje iwwiw-bolletje'>
							<span class='provider-pakketten-header-prijs-bedrag '>
								<span>&euro;</span>${providersLaagste.toFixed(2).replace('.', ',')}
							</span>
							<span class='provider-pakketten-header-prijs-vanaf'>Vanaf</span>
						</span>

					</header>

					<ul class='provider-pakketten-lijst'>
						${pakketten.reduce(this.printPakkettenLijst, '')}
					</ul>

				</section>`;
			});
			printProviderPakketten.innerHTML = printPakketten;
		},
		printPakkettenLijst: (pakketHTMLvoorraad, nieuwPakket) => `${pakketHTMLvoorraad}
			<li class='provider-pakketten-pakket'>
				<div class='provider-pakketten-pakket-links'>
					<h3 class='provider-pakketten-pakket-titel'>${nieuwPakket.naam_composiet}</h3>
					<span class='provider-pakketten-pakket-links-onder'>

					${nieuwPakket.eigenschappen.snelheden.reduce((snelheidPrijsHTMLvoorraad, nweSnelheid) => `${snelheidPrijsHTMLvoorraad}
						<span class='provider-pakketten-pakket-snelheid'>
							${nweSnelheid} Mb/s
						</span>
						<span class='provider-pakketten-pakket-prijs'>
							${nieuwPakket.geefMaandtotaalVoorSnelheid(nweSnelheid)}
						</span>`, '')}

					</span>
				</div>
				<div class='provider-pakketten-pakket-rechts'>
					<a
						class='knop blauwe-knop efiber-bestelknop'
						data-efiber-func='toon-stap animeer aanmeldformulier'
						href='#100'
						efiber-data-pakket-id='${nieuwPakket.ID}'
						>Bestellen 
					</a>
				</div>
			</li>`,

	});

	ajf.doeAjax();
}
