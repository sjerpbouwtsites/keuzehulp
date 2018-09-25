/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren, iwwiwProcedure, VerrijktPakket  */
function ikWeetWatIkWilPakkettenAjax() {
	/*------------------------------------------------------
	|
	|	Haalt pakketten op van achterkant adhv type (internet, interet&bellen etc)
	| 	Laat het op prijs sorteren
	| 	Print die vervolgens een voor een per provider
	|
	|-----------------------------------------------------*/


	// keuzehulp vullen met data installatie
	const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
	adres = JSON.parse(sessionStorage.getItem('kz-adres'));
	keuzehulp.installatie = '1';
	sessionStorage.setItem('kz-keuzehulp', JSON.stringify(keuzehulp));

	document.getElementById('print-provider-pakketten').innerHTML = '<p><br>Moment geduld a.u.b.</p>';

	const ajf = new KzAjax({
		ajaxData: {
			action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
			data: {
				keuzehulp,
				adres
			},
		},
		cb(r) {
			const printProviderPakketten = document.getElementById('print-provider-pakketten');

			let printPakketten = '';

			if (!r.providers || !Object.entries(r.providers).length) {
				kzModal(kzTekst('alternatieve_pakketten'), 2000);

				r.providers = {};
				let keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));
				let teller = 0;
	
				jQuery.post(`${location.origin}/wp-admin/admin-ajax.php`, 
					{
						action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
						data: {
							keuzehulp: {
								installatie: '1',
								'ik-weet-wat-ik-wil':"1"
							},
							adres
						},
					}, 
					(response) => {
						let rr = JSON.parse(response);
						if (!rr.error) {

						let printPakketten = '';
						Object.entries(rr.providers).forEach(([provider, providerBundel]) => {
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

									<span class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</span>

									${(pakketten.length !== 1 
										? `<span class='provider-pakketten-header-pakkettental'>${pakketten.length} pakketten</span>` 
										: ''
									)}

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
						printProviderPakketten.innerHTML = printProviderPakketten.innerHTML + printPakketten;

						}
					}
				);
	
				jQuery.post(`${location.origin}/wp-admin/admin-ajax.php`, 
					{
						action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
						data: {
							keuzehulp: {
								installatie: '1',
								'ik-weet-wat-ik-wil':"2"
							},
							adres
						},
					}, 
					(response) => {
						let rr = JSON.parse(response);
						if (!rr.error) {

						let printPakketten = '';
						Object.entries(rr.providers).forEach(([provider, providerBundel]) => {
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

									<span class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</span>

									${(pakketten.length !== 1 
										? `<span class='provider-pakketten-header-pakkettental'>${pakketten.length} pakketten</span>` 
										: ''
									)}

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
						printProviderPakketten.innerHTML = printProviderPakketten.innerHTML + printPakketten;

						}
					}
				);

				jQuery.post(`${location.origin}/wp-admin/admin-ajax.php`, 
					{
						action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
						data: {
							keuzehulp: {
								installatie: '1',
								'ik-weet-wat-ik-wil':"3"  
							},
							adres
						},
					}, 
					(response) => {
						let rr = JSON.parse(response);
						if (!rr.error) {

						let printPakketten = '';
						Object.entries(rr.providers).forEach(([provider, providerBundel]) => {
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

									<span class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</span>

									${(pakketten.length !== 1 
										? `<span class='provider-pakketten-header-pakkettental'>${pakketten.length} pakketten</span>` 
										: ''
									)}

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
						printProviderPakketten.innerHTML = printProviderPakketten.innerHTML + printPakketten;

						}
					}
				);

				jQuery.post(`${location.origin}/wp-admin/admin-ajax.php`, 
					{
						action: 'keuzehulp_ik_weet_wat_ik_wil_pakketten',
						data: {
							keuzehulp: {
								installatie: '1',
								'ik-weet-wat-ik-wil':"4"
							},
							adres
						},
					}, 
					(response) => {
						let rr = JSON.parse(response);
						if (!rr.error) {

						let printPakketten = '';
						Object.entries(rr.providers).forEach(([provider, providerBundel]) => {
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

									<span class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</span>

									${(pakketten.length !== 1 
										? `<span class='provider-pakketten-header-pakkettental'>${pakketten.length} pakketten</span>` 
										: ''
									)}

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
						printProviderPakketten.innerHTML = printProviderPakketten.innerHTML + printPakketten;

						}
					}
				);								
	
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

						<span class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</span>

						${(pakketten.length !== 1 
							? `<span class='provider-pakketten-header-pakkettental'>${pakketten.length} pakketten</span>` 
							: ''
						)}

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
		draaiDoorProviders: providers => {

		},
		helemaalFout: () =>  {

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
		printPakkettenLijst: (pakketHTMLvoorraad, nieuwPakket) => `${pakketHTMLvoorraad}
			<li class='provider-pakketten-pakket'>
				<div class='provider-pakketten-pakket-links'>
					<h3 class='provider-pakketten-pakket-titel'><span class='provider-pakketten-pakket-titel_naam'>${(
							nieuwPakket.eigenschappen.pakket_type.includes('eigenlijk alleen tv')
								? nieuwPakket.provider + " alleen TV "
								: nieuwPakket.naam_composiet
						)} ${
						nieuwPakket.eigenschappen.pakket_type.includes('Internet en TV')
						|| nieuwPakket.eigenschappen.pakket_type.includes('Alles in 1') 
							? ' - '+ nieuwPakket.eigenschappen.tv_type
							: ``
					}</span>
					<span class='provider-pakketten-pakket-titel_usp'>${nieuwPakket.eigenschappen.teksten.usps}</span>
					</h3>
					<span class='provider-pakketten-pakket-links-onder'>

					<strong>Beschikbare snelheden:</strong>
					${nieuwPakket.eigenschappen.snelheden.reduce((snelheidPrijsHTMLvoorraad, nweSnelheid) => `${snelheidPrijsHTMLvoorraad}
						
						<span class='provider-pakketten-pakket-links-onder_snelheid'>
							<span class='provider-pakketten-pakket-snelheid'>
								${(
									Number(nweSnelheid) < 1
									? `alleen TV`
									: `${nweSnelheid} Mb/s `
								)}
							</span>
							<span class='provider-pakketten-pakket-prijs'>
								voor ${nieuwPakket.geefMaandtotaalVoorSnelheid(nweSnelheid)}
							</span>
						</span>
						`
					,'')}
						
					</span>
				</div>
				<div class='provider-pakketten-pakket-rechts'>
					<a
						class='knop blauwe-knop kz-bestelknop'
						data-kz-func='toon-stap animeer aanmeldformulier'
						href='#100'
						kz-data-pakket-id='${nieuwPakket.ID}'
						>

						<svg version="1.1" class='bestel-svg' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
							 viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
						<path style="fill:#FFFFFF;" d="M56.993,65.162L42.618,50.631L56.993,36.1c1.25-1.146,1.276-2.292,0.078-3.438
							c-1.198-1.146-2.37-1.146-3.516,0l-16.25,16.25c-0.521,0.417-0.781,0.99-0.781,1.719c0,0.729,0.26,1.302,0.781,1.719l16.25,16.25
							c1.146,1.146,2.318,1.146,3.516,0C58.269,67.454,58.243,66.308,56.993,65.162z"/>
						</svg>

					</a>
				</div>
			</li>`,

	});

	ajf.doeAjax();
}
