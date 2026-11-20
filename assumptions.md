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

### Funnet, ikke rettet (eksisterer også i prototypen)
- **Notearket skjules ikke i «Bokstaver»-visningen.** abcjs med `responsive: 'resize'` setter `display: inline-block` inline på `#sheet`, og det overstyrer `[hidden]`. Begge visningene vises da samtidig.
- **Oppfølging:** Rett i et eget steg, for eksempel med `.sheet[hidden] { display: none !important; }`, eller ved å legge abcjs i et indre element.

### Bundle-størrelse
- Vite advarer om en chunk over 500 kB (abcjs er ca. 480 kB av den). Prototypen var like stor. Ikke håndtert nå. Vurderes når PWA-en lages i steg 3.
