function ikWeetWatIkWilPakkettenAjax() {


	/*------------------------------------------------------
	|
	|	Haalt pakketten op van achterkant adhv type (internet, interet&bellen etc)
	| 	Laat het op prijs sorteren
	| 	Print die vervolgens een voor een per provider
	|
	|-----------------------------------------------------*/


	// keuzehulp vullen met data installatie
	var keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
	keuzehulp.installatie = '1';
	sessionStorage.setItem('efiber-keuzehulp', JSON.stringify(keuzehulp));


	var ajf = new efiberAjax({
		ajaxData: {
			action: 'efiber_ik_weet_wat_ik_wil_pakketten',
			data: {
				keuzehulp: 	 keuzehulp,
				gebiedscode: sessionStorage.getItem('efiber-gebiedscode'),
			},
		},
		cb(r) {

			const printProviderPakketten = document.getElementById('print-provider-pakketten');
			
			var printPakketten = ``;

			for (let provider in r.providers) {

				// maak de rekenklassen
				// stel laagste snelheid in als gekozen pakket
				let pakketten = r.providers[provider]
					.map( pakket => new verrijktPakket(pakket) )
					.map( pakket => iwwiwProcedure(pakket));

				// maak array met maandTotalen en zoek laagste op.
				let providersLaagste = pakketten
					.map( pakket => pakket.maandelijksTotaal())
					.reduce((nieuweWaarde, huidigeWaarde) => 
						nieuweWaarde < huidigeWaarde ? nieuweWaarde : huidigeWaarde, 1000000
					);

				// per provider aantal pakketten, zoals DTV, ITV. Vaak maar één.
				printPakketten += `<section class='provider-pakketten'>

					<header class='provider-pakketten-header'>

						${pakketten[0]['eigenschappen']['provider_meta']['thumb']}

						<span class='provider-pakketten-header-pakkettental'>
							${pakketten.length} pakket${(pakketten.length !== 1 ? `ten` : ``)}
						</span>

						<a 
							href='#' 
							class='knop provider-pakketten-header-open' 
							data-efiber-func='open-provider-pakketten'
							>bekijk verschillende pakketten
						</a>

						<span class='provider-pakketten-header-prijs'>
							<span class='provider-pakketten-header-prijs-vanaf'>Vanaf</span>
							<span class='provider-pakketten-header-prijs-bedrag'>
								&euro;${providersLaagste.toFixed(2).replace('.', ',')}
							</span>
						</span>

					</header>

					<ul class='provider-pakketten-lijst'>
						${pakketten.reduce(this.printPakkettenLijst, '')}
					</ul>

				</section>`;

			} // for provider

			printProviderPakketten.innerHTML = printPakketten;

		},
		printPakkettenLijst: (pakketHTMLvoorraad, nieuwPakket) => {
			return `${pakketHTMLvoorraad}
			<li class='provider-pakketten-pakket'>
				<div class='provider-pakketten-pakket-links'>
					<h3 class='provider-pakketten-pakket-titel'>${nieuwPakket.naam_composiet}</h3>
					<span class='provider-pakketten-pakket-links-onder'>

					${nieuwPakket.eigenschappen.snelheden.reduce( (snelheidPrijsHTMLvoorraad, nweSnelheid) => {

						return `${snelheidPrijsHTMLvoorraad} 
						<span class='provider-pakketten-pakket-snelheid'>
							${nweSnelheid} Mb/s
						</span>
						<span class='provider-pakketten-pakket-prijs'>
							&euro; ${nieuwPakket.eigenschappen.maandelijks['snelheid-'+nweSnelheid].prijs.toFixed(2).replace('.', ',')}
						</span>`;

					}, '')}

					</span>
				</div>
				<div class='provider-pakketten-pakket-rechts'>
					<a 
						class='knop geen-ikoon efiber-bestelknop' 
						data-efiber-func='toon-stap animeer aanmeldformulier' 
						href='#100' 
						efiber-data-pakket-id='${nieuwPakket.ID}'
						>bekijken >
					</a>
				</div>
			</li>`;			
		}

	});

	ajf.doeAjax();

}
