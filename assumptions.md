# Antakelser og beslutninger

## 2026-11-20 – Steg 1: Vite + TypeScript

### Verktøyversjoner
- **Kontekst:** Ingen versjoner var bestemt utover abcjs 6.4.4 og Playwright 1.63.0.
- **Beslutning:** Siste stabile per i dag, låst eksakt (`-E`) som Playwright var: Vite 8.3.8, TypeScript 7.0.2, Vitest 4.1.12.
- **Konsekvens:** Vite 8 krever Node `^20.19.0 || >=22.12.0`. `engines` er oppdatert til det.

### Oppførsel som er endret med vilje (usynlig for brukeren)
- **Reservemeldingen når abcjs mangler** («Notearket kunne ikke vises …») er fjernet. abcjs er nå en del av bundelen og kan ikke mangle uten at hele appen mangler.
- **Første del bygges når modulen lastes** (`state.ts`), ikke ved første `setSection`. Det gjør at `state.sec`/`state.model` aldri er `null`. `setSection` kjører fortsatt ved oppstart, med samme rekkefølge som før.
- **`micFrame` returnerer hvis analysatoren mangler.** Kan ikke skje i praksis (den kjører bare når mikrofonen er på), men gjør typene ærlige.

### Kontroll av at oppførselen er uendret
- Alle 9 Playwright-tester er grønne mot `vite preview`, og fortsatt grønne mot prototypen.
- `build` og `toAbc` er sammenlignet direkte mot prototypens kode for alle 5 deler × 2 linjebredder × med/uten venstre hånd: identiske (engangstest, ikke sjekket inn).
- Skjermbilder ved 1366×900: like for øyet. Notearket har subpikselforskjeller i tekst. Bokstaver-visningen er 1 px høyere. Sannsynlig årsak er at abcjs nå kommer fra npm-pakken (`index.js`) i stedet for `abcjs_basic.min.js`.

### Funnet og rettet etterpå (fantes også i prototypen)
- **Notearket ble ikke skjult i «Bokstaver»-visningen.** abcjs med `responsive: 'resize'` setter `display: inline-block` inline på `#sheet`, og det overstyrte `[hidden]`.
- **Beslutning:** `display: none !important` på `.sheet[hidden]` og `.strip[hidden]`, både i `src/styles.css` og i prototypen. Prototypen fikk samme retting så den fortsatt kan brukes som referanse og består de samme testene. Dekkes av e2e-testen «bokstavvisningen skjuler notearket …».

### Bundle-størrelse
- Vite advarer om en chunk over 500 kB (abcjs er ca. 480 kB av den). Prototypen var like stor. Ikke håndtert nå. Vurderes når PWA-en lages i steg 3.

## 2026-11-20 – iPad-pakken

### Layout
- **Kontekst:** På stående iPad (744–1024 px) lå oppsettet øverst, og tastaturet havnet under skjermkanten.
- **Beslutning:** Under 1040 px kan oppsettet felles sammen til én linje med sammendrag. Fra 740 px står neste tone (260 px) og noter side om side, og statistikken legges i 2×2. Over 1040 px er alt som før (pikselidentisk med steg 1, sjekket).
- **Antakelse:** Oppsettet er åpent første gang, så man finner «Bruk mikrofon». Etter det huskes valget per enhet.
- **Målt med oppsettet skjult:** tastaturet slutter på 904 px (768×1024), 914 px (820×1180) og 903 px (1024×1366). I Safari med verktøylinje er 768×1024 tett, men det får plass. Som installert app er det god margin.
- **Ikke gjort:** notearket har fortsatt maks 318 px høyde, så store iPader har ledig plass nederst. Liggende iPad er ikke tilpasset.

### Skjermlås
- **Beslutning:** Skjermen holdes våken mens mikrofonen er på, MIDI er koblet til eller en runde spilles. Ellers kan den låse seg som normalt.
- **Begrensning:** Wake Lock krever Safari 16.4 eller nyere. Er den ikke støttet, gjør appen ingenting.

### PWA
- **Beslutning:** `vite-plugin-pwa` 2.0.0 med `autoUpdate`. Google Fonts mellomlagres ved første besøk, i stedet for å legge skriftene i repoet. Det gir én avhengighet mindre, men første besøk må skje med nett.
- **Ikon:** tegnet som SVG i appens farger og gjort om til PNG med Playwright (`scripts/make-icons.mjs`), så det ikke trengs et eget bildeverktøy.
- **Avhengigheter:** `npm audit` viser 4 moderate funn i `glob`/`minimatch` via `workbox-build`. De brukes bare under build. Produksjonsavhengighetene har ingen funn.

### Ikke testet
- Ekte iPad: mikrofon i Safari, skjermlås og «Legg til på Hjem-skjerm». Testene bruker Chromium med iPad-størrelser.
