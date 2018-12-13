/* globals doc, location, KzAjax, kzModal, kzTekst, kzRouting, kzStickyKeuzes, teksten, KzAjaxKleineFormulieren  */
 function vergelijkingAjax() {
  	const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp')),
  	adres = JSON.parse(sessionStorage.getItem('kz-adres'));

  	doc.getElementById('print-vergelijking').innerHTML = '<p>Uw pakketten worden opgehaald en vergeleken.</p>';

	(new KzAjax({
		ajaxData: {
			action: 'keuzehulp_vergelijking',
			data: {
				adres,
				keuzehulp,
			},
		},
		cb: r => kzRenderVergelijking.hoofd(r, keuzehulp),
	})).doeAjax();
} // vergelijking ajax

const kzRenderVergelijking = {

	hoofd(r, keuzehulp) {
		this.keuzehulp = keuzehulp;
		this.providers = r.providers;
		doc.getElementById('print-vergelijking').innerHTML = '';

		if (this.erIsWatTePrinten()) { 

			const printVergelijking = doc.getElementById('print-vergelijking');
			if (Object.entries(r.providers).length < 3) {
				printVergelijking.classList.add("minder-dan-drie");
			}

			printVergelijking.innerHTML = Object.entries(r.providers)
			.map(this.hoofdMap1)
			.sort(kzProvidersLaagNaarHoog)
			.map(({pakketten, providersLaagste}, providerTal) => {
				//providerInfoBundel

				const pakketClasses = pakketten.map(pakket => `pakketten-section-${pakket.ID}`).join(' ');

				return `
					${(providerTal === 3)
						?`
							<div class='provider-pakketten-break'>
								<h2>Overige selectie pakketten die goed bij jouw voorkeuren passen</h2>
							</div>
							`
							: ''
					}

				<section class='provider-pakketten vergelijking ${pakketClasses}'>

					<header class='provider-pakketten-header'>

						<div class='provider-logo-contain'>${pakketten[0].eigenschappen.provider_meta.thumb}</div>

						${(providerTal < 3
							? `<span class='prijs-bolletje provider-pakketten-header-prijs'><span>${pakketten[0].maandelijksTotaal(true)}</span><span>p/m</span></span>`
							: ''
						)}

					</header>


					<ul class='provider-pakketten-lijst'>
						${pakketten.map(pakket => this.printPakkettenLijst(pakket, providerTal)).join('')}
					</ul>

				</section>

				`;				
			})
			.join('');

		} else {
			// door naar pakketoverzicht voor alternatieven

			kzRouting.ga(21);
			const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

			if (keuzehulp.bellen === '2' || keuzehulp.bellen === '3') {
				if (keuzehulp.televisie === '2' || keuzehulp.televisie === '3') {
					keuzehulp['ik-weet-wat-ik-wil'] = '4';
				} else {
					keuzehulp['ik-weet-wat-ik-wil'] = '2';
				}
			} else if (keuzehulp.televisie === '2' || keuzehulp.televisie === '3') {
					keuzehulp['ik-weet-wat-ik-wil'] = '3';
				} else {
					keuzehulp['ik-weet-wat-ik-wil'] = '1';
				}


		sessionStorage.setItem('kz-keuzehulp', JSON.stringify(keuzehulp));

		ikWeetWatIkWilPakkettenAjax();

		} // als r cq response
	},
	hoofdMap1: ([provider, providerBundel]) => {
		const pakketten = providerBundel.map(pakket => new VerrijktPakket(pakket))
		.map(pakket => vergelijkingsProcedure(pakket, this.keuzehulp)),

		// maak array met maandTotalen en zoek laagste op.
		providersLaagste = pakketten
		.map(pakket => pakket.maandelijksTotaal())
		.reduce((nieuweWaarde, huidigeWaarde) => (
			nieuweWaarde < huidigeWaarde
			? nieuweWaarde
			: huidigeWaarde
		),
		1000000);		

		return {
			provider,
			providersLaagste,
			pakketten
		};

	},
	erIsWatTePrinten() {
		// KAN ALS ARRAY EN ALS OBJECT BINNENKOMEN :o

		if (this.providers.hasOwnProperty('length')) {
			return !!this.providers.length; 
		}
			return !!Object.entries(this.providers);
	},
	printPakkettenLijst(pakket, providerTal) {

		// hallo opvolger!
		// ze wilden niet luisteren toen ik zei: dit loopt helemaal uit de hand
		// doe het niet.

		this.pakket = pakket;

		const ds = pakket.pakHuidigeSnelheid(),
		us = pakket.pakHuidigeUploadSnelheid();
		const keuzehulp = JSON.parse(sessionStorage.getItem('kz-keuzehulp'));

		return `
		<li class='provider-pakketten-pakket'>

			<header>
				<h3 class='provider-pakketten-pakket-titel'><span class='provider-pakketten-pakket-titel_naam'>${pakket.naam_composiet}</span><span class='provider-pakketten-pakket-titel_usp'>${pakket.eigenschappen.teksten.usps}</span></h3>

				<div class='flex'>

					${(ds && ds === us
						? `<div class='provider-pakketten-pakket-links'>
							<h4>Snelheid</h4>
							<strong>${ds} Mb/s</strong>
						</div>`
						: (ds && ds !== us 
							? `<div class='provider-pakketten-pakket-links'>
								<h4>Down- en uploadsnelheid</h4>
								<strong>${ds} / ${us} Mb/s</strong>
							</div>`
							: ``
							)
					)}

					${(providerTal > 2
						? `<div class='provider-pakketten-pakket-midden'>
							<h4>Maandelijks totaal</h4>
							<strong>${pakket.maandelijksTotaal(true)}</strong>
						</div>`
						: ''
					)}

					<div class='provider-pakketten-pakket-rechts'>
						<h4>Eenmalige kosten</h4>
						<strong>${pakket.eenmaligTotaal(true)}</strong>
					</div>
				</div>

				<a
					class='knop blauwe-knop'
					href='#'
					data-doel='#provider-pakketten-vergelijking-hoofd-${pakket.ID}, .pakketten-section-${pakket.ID}, .pakketten-section-${pakket.ID} .provider-pakketten_footer'
					data-kz-func='schakel'
					data-scroll='.pakketten-section-${pakket.ID}'
					><span class='als-niet-actief'>bekijken</span><span class='als-actief'>dichtvouwen</span><svg class='svg-dichtklappen' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><style>.cc94da39-046e-4f53-b263-e21794d5c601{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class="cc94da39-046e-4f53-b263-e21794d5c601" d="M35.47,59.76,50,45.38,64.53,59.76C65.68,61,66.82,61,68,59.83a2.23,2.23,0,0,0,0-3.51L51.72,40.07a2.29,2.29,0,0,0-3.44,0L32,56.32a2.23,2.23,0,0,0,0,3.51C33.18,61,34.32,61,35.47,59.76Z"/></svg>
				</a>

			</header>

			<div class='provider-pakketten-vergelijking-hoofd' id='provider-pakketten-vergelijking-hoofd-${pakket.ID}'>

				${this.telefonieSectie()}

				${
					keuzehulp.televisie == 3 
					|| keuzehulp.televisie == 2
						? this.televisieSectie()
						: ''
				}

				${this.installatieSectie()}

				${this.kostenSectie()}

				${this.aanvullendeSectie()}

			</div>

			<footer class='provider-pakketten_footer'>
				<a
					class='knop blauwe-knop geen-ikoon kz-bestelknop'
					data-kz-func='toon-stap animeer aanmeldformulier'
					href='#100'
					kz-data-pakket-id='${pakket.ID}'
					>Bestellen
				</a>
			</footer>
		</li>`;
	},
	telefonieSectiePrijsTD(a) { return (isNaN(Number(a)) ? a : this.pakket.formatteerPrijs(a)); },
	telefonieSectie() {

		const telBundel = this.pakket.huidigeTelefonieBundel();

		if (!telBundel) {
			return '';
		}

		if (!telBundel.data.vast) {
			console.warn(`telefoniebundel invullen ${this.pakket.naam_composiet}`);
			console.log(telBundel);
			return;
		}

		const tb = this.pakket.vindOptie({
			aantal: 1,
			optietype: 'telefonie-bundel',
		})[1]

		const maandPrijsTelBundel = this.pakket.formatteerPrijs(tb.prijs);

		return `
			<div class='provider-pakketten-vergelijking-sectie'>

				<header>
					<svg class='svg-bellen' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><style>.e97ef855-384b-4714-91e0-2d37881c1420{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class="e97ef855-384b-4714-91e0-2d37881c1420" d="M70.94,58.25a7.15,7.15,0,0,0-5.18-2.38,7.43,7.43,0,0,0-5.24,2.36l-4.84,4.83-1.18-.61c-.55-.28-1.07-.54-1.52-.81a52.83,52.83,0,0,1-12.61-11.5,30.92,30.92,0,0,1-4.13-6.52c1.25-1.15,2.42-2.35,3.55-3.5.43-.42.86-.87,1.29-1.3,3.22-3.21,3.22-7.38,0-10.6L36.9,24c-.48-.48-1-1-1.43-1.46-.92-.95-1.88-1.93-2.88-2.85a7.24,7.24,0,0,0-5.13-2.25,7.5,7.5,0,0,0-5.21,2.25l0,0L17,25a11.18,11.18,0,0,0-3.32,7.12,26.84,26.84,0,0,0,2,11.37A65.89,65.89,0,0,0,27.37,63.06a72.09,72.09,0,0,0,24,18.8,37.2,37.2,0,0,0,13.48,4l1,0a11.54,11.54,0,0,0,8.84-3.8s0,0,.06-.07a34.89,34.89,0,0,1,2.69-2.78c.65-.62,1.33-1.28,2-2A7.68,7.68,0,0,0,81.71,72a7.36,7.36,0,0,0-2.36-5.26Zm5.48,16.13s0,0,0,0c-.59.65-1.21,1.23-1.86,1.87a39.39,39.39,0,0,0-3,3.07,7.4,7.4,0,0,1-5.76,2.43h-.71a33.14,33.14,0,0,1-11.95-3.59A68.15,68.15,0,0,1,30.57,60.44a62.05,62.05,0,0,1-11-18.37,21.8,21.8,0,0,1-1.72-9.59,7,7,0,0,1,2.12-4.55l5.22-5.23a3.5,3.5,0,0,1,2.33-1.08,3.27,3.27,0,0,1,2.24,1.07l0,0c.94.87,1.83,1.77,2.76,2.74L34,27l4.18,4.19c1.62,1.62,1.62,3.12,0,4.75-.45.44-.87.88-1.32,1.31C35.56,38.53,34.34,39.76,33,41c0,0-.07,0-.08.08a3.14,3.14,0,0,0-.8,3.48l0,.13a33.61,33.61,0,0,0,5,8.08h0A56.22,56.22,0,0,0,50.75,65.11c.63.4,1.27.72,1.88,1s1.07.54,1.52.81l.18.11a3.32,3.32,0,0,0,1.52.38,3.29,3.29,0,0,0,2.33-1l5.24-5.24A3.43,3.43,0,0,1,65.73,60a3.14,3.14,0,0,1,2.21,1.11l0,0,8.44,8.44C78,71.15,78,72.76,76.42,74.38Z"/><path class="e97ef855-384b-4714-91e0-2d37881c1420" d="M52.8,30.55A19.72,19.72,0,0,1,68.86,46.61a2,2,0,0,0,2,1.71,2.19,2.19,0,0,0,.36,0A2.08,2.08,0,0,0,73,45.9,23.88,23.88,0,0,0,53.52,26.47a2.09,2.09,0,0,0-2.39,1.69A2,2,0,0,0,52.8,30.55Z"/><path class="e97ef855-384b-4714-91e0-2d37881c1420" d="M86.08,45.3a39.3,39.3,0,0,0-32-32,2.07,2.07,0,1,0-.68,4.08A35.07,35.07,0,0,1,82,46a2.07,2.07,0,0,0,4.08-.68Z"/></svg>
					<h3>Bellen</h3>
				</header>

				<table>
					<thead>
						<tr>
							<th>${telBundel.naam}</th>
							<th>${maandPrijsTelBundel}</th
						</tr>
						<tr>
							<th>Bundeltype: ${telBundel.bereik}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Start vast</td>
							<td>${this.telefonieSectiePrijsTD(telBundel.data.vast.nederland.start)}</td>
						</tr>
						<tr>
							<td>Vast p/m</td>
							<td>${this.telefonieSectiePrijsTD(telBundel.data.vast.nederland.per_minuut)}</td>
						</tr>
						<tr>
							<td>Mobiel start</td>
							<td>${this.telefonieSectiePrijsTD(telBundel.data.mobiel.nederland.start)}</td>
						</tr>
						<tr>
							<td>Mobiel p/m</td>
							<td>${this.telefonieSectiePrijsTD(telBundel.data.mobiel.nederland.per_minuut)}</td>
						</tr>
						${
							this.pakket.optieAantal('extra-vast-nummer')
								?									`<tr>
										<td>Extra vast nummer</td>
										<td>${this.pakket.optiePrijs('extra-vast-nummer', true)}</td>
									</td>`
								: ''
						}
					<tbody>

				</table>

				<footer class='provider-pakketten-vergelijking-sectie_footer'>
					<a href='#' class='knop blauwe-knop' data-kz-func='telefonie-modal' data-pakket-id='${this.pakket.ID}'>Meer over deze telefoniebundel</a>
				</footer>

			</div>
		`;
	},
	televisieSectieTD(sleutel, naam) {
		return this.pakket.optieAantal(sleutel)
			? `<tr><td>${naam}</td><td>${this.pakket.optiePrijs(sleutel, true)}</td>`
			: '';
	},
	televisieSectie() {



		const z = this.pakket.pakZenders();

		if (!z.totaal) {
			return '';
		}

		const tooltipHTML = `<a href='#' class='knop' data-kz-func='tooltip'
								data-tooltip-titel='Snelheidsafhankelijke zenderpakketten'
								data-tooltip-tekst='Bij ${this.pakket.provider} zijn er verschillende zenderpakketten beschikbaar, afhankelijk van de snelheid van uw internetverbinding. Dit zenderoverzicht hoort bij de snelheid ${z.snelheid} Mb/s.'>
								<svg class='svg-info' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><style>.f7f0e9f1-f859-4dfe-95fb-3d086fc32618{fill:#159a3c;}</style></defs><circle class="f7f0e9f1-f859-4dfe-95fb-3d086fc32618" cx="49.91" cy="71.51" r="4.36"/><path class="f7f0e9f1-f859-4dfe-95fb-3d086fc32618" d="M49.91,5.52A44.64,44.64,0,1,0,94.54,50.15,44.61,44.61,0,0,0,49.91,5.52Zm0,82.29A37.66,37.66,0,1,1,87.57,50.15,37.63,37.63,0,0,1,49.91,87.81Z"/><path class="f7f0e9f1-f859-4dfe-95fb-3d086fc32618" d="M49.91,27.92A14,14,0,0,0,36,41.87a3.49,3.49,0,1,0,7,0,7,7,0,1,1,7,7,3.49,3.49,0,0,0-3.49,3.49v8.72a3.49,3.49,0,0,0,7,0V55.38a14,14,0,0,0-3.49-27.46Z"/></svg>
							 </a>`;

		return `
			<div class='provider-pakketten-vergelijking-sectie'>

				<header>
					<svg
						class='svg-tv'
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 100 100">
							<defs>
								<style>.25a40c2a-e21f-4ff6-8508-46524cd51bfe{fill:#159a3c;}
								</style>
							</defs>
							<title>Rekam icons groen</title>
							<path class="25a40c2a-e21f-4ff6-8508-46524cd51bfe" d="M86.9,15.56v-.12H13.05v.12A4.89,4.89,0,0,0,8.6,19.94V68.47a4.71,4.71,0,0,0,.65,2.43,4.53,4.53,0,0,0,4.21,2.47H40.12V80.1H35.05a2.23,2.23,0,1,0,0,4.46H64.91a2.23,2.23,0,1,0,0-4.46H59.84V73.37H86.5a4.52,4.52,0,0,0,4.21-2.47,4.86,4.86,0,0,0,.69-2.43V19.94A5,5,0,0,0,86.9,15.56Zm0,4.78V68.47c0,.29-.12.41-.4.41h-73c-.28,0-.41-.12-.41-.41V19.94H86.9v.4Z"/></svg>
					<h3>Televisie</h3>
				</header>

				<table>
					<thead>
						<tr>
							<th>Type TV</th>
							<th>${this.pakket.pakTypeTV()}</th
						</tr>
						<tr>
							<th>Aantal zenders</th>
							<th>${z.totaal}  ${(z.aantalUniekeZenderPakketten > 1 ? tooltipHTML : '')}</th
						</tr>
						<tr>
							<th>Aantal HD zenders</th>
							<th>${z.hd}</th
						</tr>
					</thead>
					<tbody>
						${this.televisieSectieTD('app', 'App')}
						${this.televisieSectieTD('opnemen', 'Opnemen')}
						${this.televisieSectieTD('replay', 'Replay')}
						${this.televisieSectieTD('begin-gemist', 'Begin gemist')}
						${this.televisieSectieTD('opnemen-replay-begin-gemist-samen', 'Opnemen, terugkijken, begin gemist')}
						${this.televisieBundels()}
					<tbody>

				</table>

				<!--<footer class='provider-pakketten-vergelijking-sectie_footer'>
					<a href='#' class='blauwe-knop knop' data-kz-func='aantal-zenders-modal' data-pakket-id='${this.pakket.ID}'>meer over deze televisiebundel</a>
				</footer>-->

			</div>
		`;
	},
	televisieBundels() {
		return this.pakket.vindOpties({
			optietype: 'televisie-bundel',
			snelheid: this.pakket.pakHuidigeSnelheid(),
			tvType: this.pakket.eigenschappen.tv_type,
			aantal: 1
		}).map(([sleutel, {naam, prijs}]) => {
			return `<tr><td>${naam}</td><td>${this.pakket.formatteerPrijs(prijs)}</td></tr>`
		}).join('');
	},
	installatieSectieTD(sleutel, naam) {
		return this.pakket.optieAantal(sleutel)
			? `<tr><td>${naam}</td><td>${this.pakket.optiePrijs(sleutel, true)}</td></tr>`
			: '';
	},
	installatieSectie() {
		return `
			<div class='provider-pakketten-vergelijking-sectie'>

				<header>
					<svg class='svg-installatie'  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><style>.bc3ed8cd-2d3b-4536-a97d-59b790106817{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class="bc3ed8cd-2d3b-4536-a97d-59b790106817" d="M51.54,90.63l4.31-1.78A4.52,4.52,0,0,0,58.3,83l-1.11-2.68a27.65,27.65,0,0,0,5.67-5.66l2.67,1.1a4.52,4.52,0,0,0,5.9-2.44L73.23,69a4.52,4.52,0,0,0-2.45-5.9l-4-1.63a1.74,1.74,0,0,0-1.32,3.22l4,1.64A1,1,0,0,1,70,67.63L68.23,72a1.08,1.08,0,0,1-.57.56,1,1,0,0,1-.79,0l-4-1.64a1.74,1.74,0,0,0-2.11.64,23.92,23.92,0,0,1-6.71,6.7,1.75,1.75,0,0,0-.65,2.12l1.63,4a1,1,0,0,1-.56,1.36L50.2,87.42a1,1,0,0,1-.8,0,1.06,1.06,0,0,1-.56-.56l-1.64-4a1.7,1.7,0,0,0-2-1,24.15,24.15,0,0,1-9.47,0,1.77,1.77,0,0,0-2,1l-1.63,4a1,1,0,0,1-1.36.56l-4.31-1.79a1.06,1.06,0,0,1-.57-.57,1.08,1.08,0,0,1,0-.79l1.64-4A1.74,1.74,0,0,0,27,78.2a23.82,23.82,0,0,1-6.71-6.71,1.75,1.75,0,0,0-2.12-.65l-4,1.63a1,1,0,0,1-.79,0,1,1,0,0,1-.56-.56L11,67.6a1,1,0,0,1,0-.79,1,1,0,0,1,.56-.57l4-1.64a1.72,1.72,0,0,0,1-1.95,24.34,24.34,0,0,1,0-9.47,1.77,1.77,0,0,0-1-2l-4-1.63A1,1,0,0,1,11,48.23l1.79-4.31a1.05,1.05,0,0,1,1.36-.57l4,1.64a1.73,1.73,0,0,0,2.11-.63A24,24,0,0,1,27,37.65a1.75,1.75,0,0,0,.65-2.12l-1.63-4a1,1,0,0,1,.56-1.35l4.31-1.78a1,1,0,0,1,.8,0,1.06,1.06,0,0,1,.56.56l1.64,4a1.74,1.74,0,0,0,3.22-1.32l-1.64-4A4.53,4.53,0,0,0,33,25.23a4.43,4.43,0,0,0-3.45,0L25.23,27a4.52,4.52,0,0,0-2.45,5.9l1.11,2.68a27.45,27.45,0,0,0-5.67,5.67l-2.67-1.11a4.51,4.51,0,0,0-5.9,2.45L7.83,46.91a4.52,4.52,0,0,0,2.45,5.9L13,53.92a27.57,27.57,0,0,0,0,8L10.28,63a4.54,4.54,0,0,0-2.45,2.44,4.6,4.6,0,0,0,0,3.46l1.78,4.31a4.53,4.53,0,0,0,2.45,2.45,4.58,4.58,0,0,0,3.45,0l2.68-1.11a27.45,27.45,0,0,0,5.67,5.67l-1.11,2.67a4.48,4.48,0,0,0,0,3.45,4.54,4.54,0,0,0,2.44,2.45l4.32,1.8a4.51,4.51,0,0,0,5.9-2.45l1.11-2.68a27.57,27.57,0,0,0,8,0l1.11,2.68a4.51,4.51,0,0,0,5.9,2.45Z"/><path class="bc3ed8cd-2d3b-4536-a97d-59b790106817" d="M26.36,58A14.19,14.19,0,0,0,40.53,72.11h.11A14.19,14.19,0,0,0,54.72,57.83,1.74,1.74,0,0,0,53,56.1h0a1.72,1.72,0,0,0-1.72,1.76,10.69,10.69,0,0,1-3.09,7.59,10.58,10.58,0,0,1-7.53,3.19h-.07a10.7,10.7,0,0,1-.07-21.4,1.72,1.72,0,0,0,1.72-1.76,1.74,1.74,0,0,0-1.74-1.72h0A14.18,14.18,0,0,0,26.36,58Z"/><path class="bc3ed8cd-2d3b-4536-a97d-59b790106817" d="M70,5.48h-3.4a3.77,3.77,0,0,0-3.76,3.77V11A20.22,20.22,0,0,0,58,13l-1.23-1.24a3.77,3.77,0,0,0-2.66-1.1,3.7,3.7,0,0,0-2.66,1.1L49,14.16a3.74,3.74,0,0,0,0,5.32l1.23,1.23a20,20,0,0,0-2,4.82H46.5a3.77,3.77,0,0,0-3.77,3.77v3.4a3.77,3.77,0,0,0,3.77,3.77h1.74a20,20,0,0,0,2,4.82L49,42.52a3.75,3.75,0,0,0-1.11,2.66A3.68,3.68,0,0,0,49,47.84l2.39,2.4a3.8,3.8,0,0,0,2.66,1.11,3.7,3.7,0,0,0,2.66-1.11L58,49a20.22,20.22,0,0,0,4.83,2v1.74a3.77,3.77,0,0,0,3.76,3.77H70a3.77,3.77,0,0,0,3.77-3.77V51a20.22,20.22,0,0,0,4.83-2l1.23,1.24a3.76,3.76,0,0,0,2.66,1.11,3.67,3.67,0,0,0,2.65-1.11l2.4-2.4a3.78,3.78,0,0,0,0-5.32l-1.23-1.23a19.56,19.56,0,0,0,2-4.82H90a3.77,3.77,0,0,0,3.77-3.77V29.3A3.77,3.77,0,0,0,90,25.53H88.26a19.56,19.56,0,0,0-2-4.82l1.23-1.23a3.78,3.78,0,0,0,0-5.32l-2.4-2.4a3.75,3.75,0,0,0-2.65-1.1,3.67,3.67,0,0,0-2.66,1.1L78.55,13a20.22,20.22,0,0,0-4.83-2V9.25A3.8,3.8,0,0,0,70,5.48Zm7.87,11.16a1.76,1.76,0,0,0,1,.3A1.69,1.69,0,0,0,80,16.43l2.2-2.2a.31.31,0,0,1,.2-.09.27.27,0,0,1,.19.09L85,16.62A.29.29,0,0,1,85,17l-2.2,2.2a1.73,1.73,0,0,0-.22,2.2,17,17,0,0,1,2.58,6.2A1.74,1.74,0,0,0,86.87,29H90a.27.27,0,0,1,.28.28v3.4A.27.27,0,0,1,90,33H86.87a1.72,1.72,0,0,0-1.7,1.41,17,17,0,0,1-2.58,6.2,1.76,1.76,0,0,0,.22,2.2L85,45a.29.29,0,0,1,0,.39l-2.4,2.39a.27.27,0,0,1-.19.09.31.31,0,0,1-.2-.09L80,45.54a1.73,1.73,0,0,0-2.2-.22,17.13,17.13,0,0,1-6.19,2.58,1.74,1.74,0,0,0-1.41,1.7v3.12a.28.28,0,0,1-.28.28h-3.4a.27.27,0,0,1-.28-.28V49.6a1.73,1.73,0,0,0-1.41-1.7,17.1,17.1,0,0,1-6.2-2.58,1.75,1.75,0,0,0-2.2.22l-2.2,2.2a.26.26,0,0,1-.2.08.25.25,0,0,1-.19-.08l-2.39-2.4a.24.24,0,0,1-.09-.19.27.27,0,0,1,.09-.2l2.2-2.2a1.74,1.74,0,0,0,.21-2.2,16.93,16.93,0,0,1-2.57-6.19A1.75,1.75,0,0,0,49.6,33H46.48a.28.28,0,0,1-.28-.29V29.27a.28.28,0,0,1,.28-.29H49.6a1.74,1.74,0,0,0,1.71-1.4,16.91,16.91,0,0,1,2.57-6.2,1.75,1.75,0,0,0-.21-2.2L51.47,17a.24.24,0,0,1-.09-.2.24.24,0,0,1,.09-.19l2.39-2.4a.25.25,0,0,1,.19-.08.26.26,0,0,1,.2.08l2.2,2.21a1.74,1.74,0,0,0,2.2.21A16.91,16.91,0,0,1,64.85,14a1.75,1.75,0,0,0,1.41-1.71V9.25A.27.27,0,0,1,66.54,9h3.4a.28.28,0,0,1,.28.28v3.11a1.74,1.74,0,0,0,1.41,1.71A16.93,16.93,0,0,1,77.82,16.64Z"/><path class="bc3ed8cd-2d3b-4536-a97d-59b790106817" d="M57.91,31A10.36,10.36,0,1,0,68.26,20.62,10.37,10.37,0,0,0,57.91,31Zm17.2,0a6.87,6.87,0,1,1-6.87-6.86A6.88,6.88,0,0,1,75.11,31Z"/></svg>
					<h3>Installatie</h3>
				</header>

				<table>
					<tbody>
						${this.installatieSectieTD('installatie-dhz', 'Doe het zelf')}
						${this.installatieSectieTD('installatie-basis', 'Basisinstallatie')}
						${this.installatieSectieTD('installatie-volledig', 'Volledige installatie')}
					</tbody>
				</table>

			</div>
		`;
	},
	kostenSectie() {
		return `
			<div class='provider-pakketten-vergelijking-sectie'>

				<header>
					<svg
						class='svg-kosten'
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 100 100"><defs><style>.90a4297-b0d6-49b3-bfa6-51cb9d624468{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><path class="390a4297-b0d6-49b3-bfa6-51cb9d624468" d="M64.64,54.26a2.18,2.18,0,0,0-.59,1.61,2.38,2.38,0,1,0,2.34-2.34A2.36,2.36,0,0,0,64.64,54.26Zm-5.27,8.63v-14H82.79v14ZM29.66,25.43l41.27-6.74,1,6.74ZM17.21,30.11H78.1v14H59.37a4.75,4.75,0,0,0-4.69,4.68v14a4.75,4.75,0,0,0,4.69,4.69H78.1v14H17.21Zm65.58,14v-14a4.75,4.75,0,0,0-4.69-4.68H76.64l-1.47-9.81a2.17,2.17,0,0,0-1-1.46,2.39,2.39,0,0,0-1.83-.44L21.46,22.06a2.3,2.3,0,0,0-1.46.88,2.18,2.18,0,0,0-.44,1.75l.14.74H17.21a4.5,4.5,0,0,0-3.29,1.39,4.47,4.47,0,0,0-1.39,3.29V81.63a4.47,4.47,0,0,0,1.39,3.29,4.5,4.5,0,0,0,3.29,1.39H78.1a4.75,4.75,0,0,0,4.69-4.68v-14a4.75,4.75,0,0,0,4.68-4.69v-14a4.75,4.75,0,0,0-4.68-4.68Z"/></svg>
					<h3>Kosten</h3>
				</header>

				<table>

					<tbody>
						<tr>
							<td><strong>Borg apparatuur</strong></td>
							<td>${this.pakket.formatteerPrijs(this.pakket.eigenschappen.borg.basis_borg.prijs)}</td>
						</tr>
						<tr>
							<td><strong>Eenmalige kosten</strong></td>
							<td>${this.pakket.eenmaligTotaal(true)}</td>
						</tr>
						<tr>
							<td><strong>Maandelijks totaal</strong></td>
							<td>${this.pakket.maandelijksTotaal(true)}</td>
						</tr>
					<tbody>

				</table>

			</div>
		`;
	},
	aanvullendeSectie() {
		if (!this.pakket.eigenschappen.teksten.aanvullende_informatie) return '';

		return `
			<div class='provider-pakketten-vergelijking-sectie'>

				<header>
					<svg class='svg-waarschuwing' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><style>.a500d6e8-b1bb-4ff1-a8d3-eea033bce877{fill:#159a3c;}</style></defs><title>Rekam icons groen</title><g id="85b84290-0c60-4141-b983-6425040e3dda" data-name="Attention"><path class="a500d6e8-b1bb-4ff1-a8d3-eea033bce877" d="M86.49,73.85,55.39,20a6.22,6.22,0,0,0-10.78,0l-31.1,53.9a6.23,6.23,0,0,0,5.4,9.32H81.09a6.23,6.23,0,0,0,5.4-9.32ZM18.9,77,50,23.05h0L81.09,77ZM50,62.44a4.15,4.15,0,1,0,4.15,4.14A4.15,4.15,0,0,0,50,62.44ZM45.85,43.78a4,4,0,0,0,.06.7l2,12.09a2.08,2.08,0,0,0,4.09,0l2.05-12.09a4,4,0,0,0,.06-.7,4.15,4.15,0,0,0-8.3,0Z"/></g></svg>
					<h3>Aanvullende informatie</h3>
				</header>

				<p>${this.pakket.eigenschappen.teksten.aanvullende_informatie}</p>

			</div>
		`;
	},

};


function kzTelefonieModal(knop) {
	const pakket = window[`kz-pakket-${knop.getAttribute('data-pakket-id')}`],

	 belPakket = pakket.huidigeTelefonieBundel();

	 // lokale nutsfunctie; printen als string ('gratis') of prijs 
	this.cel = prijs => (isNaN(Number(prijs))
			? prijs
			: pakket.formatteerPrijs(prijs));


	const html = `

		<p>${isNaN(Number(belPakket.optieData.prijs))
			? belPakket.data.maandbedrag
			: `Abonnementsprijs: ${pakket.formatteerPrijs(belPakket.optieData.prijs)}`
		}</p>

		<p><strong>Maximum minuten binnen bundel: </strong> ${belPakket.data.maximum_minuten ? belPakket.data.maximum_minuten : 'geen'}</p>

		<table>
			<thead>
				<tr>
					<th></th>
					<th></th>
					<th>Start</th>
					<th>Minuut</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>NL</td>
					<td>Vast</td>
					<td>${this.cel(belPakket.data.vast.nederland.start)}</td>
					<td>${this.cel(belPakket.data.vast.nederland.per_minuut)}</td>
				</tr>
				<tr>
					<td>NL</td>
					<td>Mobiel</td>
					<td>${this.cel(belPakket.data.mobiel.nederland.start)}</td>
					<td>${this.cel(belPakket.data.mobiel.nederland.per_minuut)}</td>
				</tr>
				<tr>
					<td>Buitenland</td>
					<td>Vast</td>
					<td>${this.cel(belPakket.data.vast.buitenland.start)}</td>
					<td>${this.cel(belPakket.data.vast.buitenland.per_minuut)}</td>
				</tr>
				<tr>
					<td>Buitenland</td>
					<td>Mobiel</td>
					<td>${this.cel(belPakket.data.mobiel.buitenland.start)}</td>
					<td>${this.cel(belPakket.data.mobiel.buitenland.per_minuut)}</td>
				</tr>

			</tbody>
		</table>
	`;

	kzModal({
		kop: belPakket.naam,
		torso: html,
	});
}

function kzZendersModal(knop) {
	const pakket = window[`kz-pakket-${knop.getAttribute('data-pakket-id')}`],

	 zenderInfo = pakket.pakZenders(),

	 html = `
		Zenders totaal: ${zenderInfo.totaal}<br>
		Zenders HD: ${zenderInfo.hd}<br>
		${zenderInfo.zenderlijst}
	`;

	kzModal({
		kop: pakket.naam_composiet,
		torso: html,
	});
}

function kzVergelijkingstabelOpVolgorde(tabel) {
	// maak verzameling met bedragen als getallen
	const bedragen = tabel.maandelijksTotaal.map((waarde, index) => Number(waarde.replace('&euro; ', '').replace(',', '.'))),

	// kopieer de verzameling tbv sortering en sorteer
	bedragenSort = (bedragen.map(w => w)).sort(),

	// zoek de posities op in de bedragenverzameling; dit is de printvolgorde.
	indicesVolgorde = bedragenSort.map(w => bedragen.indexOf(w));

	let rijNaam,
rijKopie,
i;

	// per rij, volgorde aanpassen adhv indicesvolgorde.
	for (rijNaam in tabel) {
		rijKopie = tabel[rijNaam].map(w => w);
		tabel[rijNaam] = [];

		for (i = 0; i < rijKopie.length; i++) {
			tabel[rijNaam].push(rijKopie[ (indicesVolgorde[i]) ]);
		}
	}

	return tabel;
}
