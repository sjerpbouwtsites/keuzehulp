function uitsessionStorageZetKnoppenActief() {
	// gaat door het geheugen heen en zet de relevante knoppen op actief.

	const kh = JSON.parse(sessionStorage.getItem('efiber-keuzehulp'));
	let gs;

	if (kh) {
		for (const s in kh) {
			gs = kh[s];
			if (Array.isArray(gs)) {
				for (let i = gs.length - 1; i >= 0; i--) {
					uitsessionStorageZetKnoppenActiefHelper(s, gs[i]);
				}
			} else {
				uitsessionStorageZetKnoppenActiefHelper(s, gs);
			}
		}
	}
}
function uitsessionStorageZetKnoppenActiefHelper(s, keuze) {
	let el = doc.querySelector(`[data-efiber-${s}-keuze="${keuze}"]`);

	if (!el) {
		// opnieuw zoeken met streepcase
		const selector = `[data-efiber-${naarStreepCase(s)}-keuze="${naarStreepCase(keuze)}"]`;
		el = doc.querySelector(selector);
	}

	if (el) {
		el.className += ' actief';
		// en zet ze ook in de zijbalk
		efiberAppendNiveauKnop(el);
	} else {
		console.warn('el null', s, keuze);
	}
}