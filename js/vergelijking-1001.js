/* globals doc, location, EfiberAjax, efiberModal, efiberTekst, efiberRouting, efiberStickyKeuzes, teksten, EfiberAjaxKleineFormulieren  */
 function vergelijkingAjax() {
  	const keuzehulp = JSON.parse(sessionStorage.getItem('efiber-keuzehulp')),
  	adres = JSON.parse(sessionStorage.getItem('efiber-adres'));

  	doc.getElementById('print-vergelijking').innerHTML = '<p>Uw pakketten worden opgehaald en vergeleken.</p>';

	const ajf = new EfiberAjax({
		ajaxData: {
			action: 'efiber_vergelijking',
			data: {
				adres,
				keuzehulp,
			},
		},
		cb(r) {
			doc.getElementById('print-vergelijking').innerHTML = '';

			if (r.providers) {
				const printVergelijking = doc.getElementById('print-vergelijking');
				let printPakketten = '';

				for (const provider in r.providers) {
					// maak de rekenklassen
					// stel laagste snelheid in als gekozen pakket
					const pakketten = r.providers[provider]
						.map(pakket => new VerrijktPakket(pakket))
						.map(pakket => vergelijkingsProcedure(pakket, keuzehulp)),

					 p1 = pakketten[0];

					// per provider aantal pakketten, zoals DTV, ITV. Vaak maar één.

					printPakketten += `<section class='provider-pakketten vergelijking'>

						<header class='provider-pakketten-header'>

							${p1.eigenschappen.provider_meta.thumb}

							<span class='provider-pakketten-header-prijs'>
									${p1.maandelijksTotaal(true)} bij snelheid ${p1.huidige_snelheid}
							</span>

							<a
								href='#'
								class='knop provider-pakketten-header-open'
								data-efiber-func='open-provider-pakketten'
								>bekijk verschillende pakketten
							</a>

						</header>


						<ul class='provider-pakketten-lijst'>
							${pakketten.map(pakket => this.printPakkettenLijst(pakket)).join('')}
						</ul>

					</section>
					
					<div style='border-bottom:10px solid black'></div>

					`;
				} // for provider

				printVergelijking.innerHTML = printPakketten;
			} else {
			
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
			
			} // als r cq response
		},
		telefonieSectie(pakket) {
			const telBundel = pakket.huidigeTelefonieBundel();

			if (!telBundel) {
				console.warn('print telefonie sectie maar geen bundel gevonden.');
				return '';
			}

			return `
				<div class='provider-pakketten-vergelijking-sectie'>

					<header>
						<img src='#' alt='bel-ikoon' width='10' height='10' />
						<h3>Bellen</h3>
						<p>${pakket.optiePrijs(telBundel.slug, true)}</p>
					</header>

					<table>
						<thead>
							<th>
								${telBundel.naam} - Bundeltype: ${telBundel.bereik} 
							</th>
						</thead>
						<tbody>
							<tr>
								<td>Start vast</td>
								<td>
									${	isNaN(Number(telBundel.data.starttarief_vast_nl_binnen_bundel.tarief))
										? telBundel.data.starttarief_vast_nl_binnen_bundel.tarief 
										: pakket.formatteerPrijs(telBundel.data.starttarief_vast_nl_binnen_bundel.tarief)
									}
								</td>
							</tr>
							<tr>
								<td>Vast p/m</td>
								<td>
									${	isNaN(Number(telBundel.data.minuuttarief_vast_nl_binnen_bundel.tarief))
										? telBundel.data.minuuttarief_vast_nl_binnen_bundel.tarief 
										: pakket.formatteerPrijs(telBundel.data.minuuttarief_vast_nl_binnen_bundel.tarief)
									}
								</td>
							</tr>
							<tr>
								<td>Mobiel start</td>
								<td>
									${	isNaN(Number(telBundel.data.starttarief_mobiel_nl_binnen_bundel.tarief)) 
										? telBundel.data.starttarief_mobiel_nl_binnen_bundel.tarief 
										: pakket.formatteerPrijs(telBundel.data.starttarief_mobiel_nl_binnen_bundel.tarief)
									}
								</td>
							</tr>																					
							<tr>
								<td>Mobiel p/m</td>
								<td>
									${	isNaN(Number(telBundel.data.minuuttarief_mobiel_nl_binnen_bundel.tarief)) 
										? telBundel.data.minuuttarief_mobiel_nl_binnen_bundel.tarief 
										: pakket.formatteerPrijs(telBundel.data.minuuttarief_mobiel_nl_binnen_bundel.tarief)
									}
								</td>
							</tr>																												
						<tbody>

					</table>

					<a href='#' class='knop' data-efiber-func='telefonie-modal' data-pakket-id='${pakket.id}'>Meer over deze telefoniebundel</a>

					<p>${pakket.optieAantal('extra-vast-nummer') ? `Extra vast nummer: ${pakket.optiePrijs('extra-vast-nummer', true)}` : ''}</p>

				</div>			
			`;
		},

		televisieSectie(pakket) {
			const z = pakket.pakZenders();

			if (!z) {
				console.warn('geen zenders gevonden, wel televisiesectie?');
				return '';
			}

			return `
				<div class='provider-pakketten-vergelijking-sectie'>

					<header>
						<img src='#' alt='tv-ikoon' width='10' height='10' />
						<h3>Televisie</h3>
					</header>

					<p>Aantal zenders ${z.totaal}<a href='#' class='i-tje' data-efiber-func='aantal-zenders-modal' data-pakket-id='${pakket.id}'>i</a></p>
					<p>Aantal HD zenders ${z.hd}</p>
					<p>Type TV ${pakket.pakTypeTV()}</p>

					<p>${pakket.optieAantal('app') ? `App: ${pakket.optiePrijs('app', true)}` : ''}</p>
					<p>${pakket.optieAantal('opnemen') ? `Opnemen: ${pakket.optiePrijs('opnemen', true)}` : ''}</p>
					<p>${pakket.optieAantal('replay') ? `Terugkijken: ${pakket.optiePrijs('replay', true)}` : ''}</p>
					<p>${pakket.optieAantal('begin-gemist') ? `Begin gemist: ${pakket.optiePrijs('begin-gemist', true)}` : ''}</p>
					<p>${pakket.optieAantal('opnemen-replay-begin-gemist-samen') ? `Opnemen, terugkijken, begin gemist: ${pakket.optiePrijs('opnemen-replay-begin-gemist-samen', true)}` : ''}</p>

					${this.televisieBundels(pakket)}

				</div>			
			`;
		},
		televisieBundels(pakket) {
			const s = String(pakket.pakHuidigeSnelheid()),
			 families = ['plus', 'erotiek', 'foxsportseredivisie', 'foxsportsinternationaal', 'foxsportscompleet', 'ziggosporttotaal', 'film1'],

			 ret = [];
			for (const optieNaam in pakket.eigenschappen.maandelijks) {
				families.forEach((fam) => {
					if (optieNaam.indexOf(fam) !== -1 && optieNaam.indexOf(s) !== -1) {
						let n = optieNaam.split('-');
						n.shift();
						n.pop();
						n = n.join(' ');
						n = n.charAt(0).toUpperCase() + n.slice(1);

						ret.push(`<p>${pakket.optieAantal(optieNaam) ? `${n}: ${pakket.optiePrijs(optieNaam, true)}` : ''}</p>`);
					}
				});
			}
			return ret.join('');
		},
		installatieSectie(pakket) {
			return `
				<div class='provider-pakketten-vergelijking-sectie'>

					<header>
						<img src='#' alt='installatie-ikoon' width='10' height='10' />
						<h3>Installatie</h3>
					</header>

					<p>${pakket.optieAantal('installatie-dhz') ? `Doe het zelf: ${pakket.optiePrijs('installatie-dhz', true)}` : ''}</p>
					<p>${pakket.optieAantal('installatie-basis') ? `Basisinstallatie: ${pakket.optiePrijs('installatie-basis', true)}` : ''}</p>
					<p>${pakket.optieAantal('installatie-volledig') ? `Volledige installatie: ${pakket.optiePrijs('installatie-volledig', true)}` : ''}</p>


				</div>			
			`;
		},
		printPakkettenLijst(pakket) {
			console.log(pakket);

			return `
			<li class='provider-pakketten-pakket'>

				<header>
					<h3 class='provider-pakketten-pakket-titel'>${pakket.naam_composiet}</h3>

						<div class='provider-pakketten-pakket-links'>
							<h4>Eenmalig totaal</h4>
							${pakket.eenmaligTotaal(true)}
						</div>

						<div class='provider-pakketten-pakket-rechts'>
							<a
								class='knop geen-ikoon '
								data-efiber-func='open-vergelijking'
								>bekijken >
							</a>
						</div>

				</header>

				<div class='provider-pakketten-vergelijking-hoofd'>

					${this.telefonieSectie(pakket)}

					${this.televisieSectie(pakket)}

					${this.installatieSectie(pakket)}

				</div>
				
				<footer>
					<a
						class='knop geen-ikoon efiber-bestelknop'
						data-efiber-func='toon-stap animeer aanmeldformulier'
						href='#100'
						efiber-data-pakket-id='${pakket.ID}'
						>Bestellen >
					</a>
				</footer>
			</li>`;
		},
	});

	ajf.doeAjax();
} // vergelijking ajax

function efiberVergelijkingstabelOpVolgorde(tabel) {
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
