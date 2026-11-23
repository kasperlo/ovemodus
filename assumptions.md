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

## 2026-11-20 – Notearket: farger og tilbakemelding

- **Farge for riktig spilt:** blå (`--done-ink: #1f5fd6` på notearket, `--done: #6ea8ff` på mørk bakgrunn) i stedet for grønn. Grunner: blå og oransje skilles også av fargeblinde, og blått passer appens farger. Grønt er beholdt for status og tilkobling.
- **Bjelker:** blir blå når alle notene under er spilt (også oransje). En bjelke over en note som er bom, forblir svart.
- **Timingmerker:** vises fra 30 ms avvik, samme grense som «Timingen sitter.». De står under tonenavnet, fordi de kolliderte med nabonoter da de stod ved siden av.
- **Spøkelsesnote:** bare i «Vent på meg». I takt-modus ville den blinket forbi for fort til å være nyttig. Når alle oktaver godtas, vises den i oktaven nærmest tonen man skulle spille. Ellers vises den der den ble spilt.
- **Lagdeling:** `notation/sheet.ts` bruker `timingClass` fra `practice/judge.ts`. Det er en ren funksjon, så avhengigheten er akseptert i stedet for å duplisere grensen.

## 2026-11-20 – Mikrofontest og kalibrering

- **Kontekst:** Kasper opplever at iPaden hører dårligere enn Macen. Det er ikke kjent om det skyldes nivå, at Safari slår på talebehandling, eller plasseringen.
- **Beslutning:** Bygge en diagnose som viser fakta (innstillingene nettleseren rapporterer, nivåer i dB, gjenkjenning) og en rapport som kan kopieres, før vi endrer tonegjenkjenningen.
- **Kalibrert grense:** maks av 3 × støy (median i 2 s stillhet) og 0,4 × svake toner (25. persentil av rammer med sikker tone), mellom 0,0008 og 0,03. På opptaket av del A blir grensen −53 dB, lavere enn «Høy» (−49 dB). Alle 26 tonene gjenkjennes uten bom (micdiag.spec.ts). Det dynamiske støygulvet (× 3) i mic.ts gjelder fortsatt, så grensen kan ikke havne under støyen i rommet.
- **Råd:** svake toner under −48 dB (0,004), støy over halvparten av svake toner, eller under 50 % gjenkjenning gir råd i klartekst.
- **Ikke verifisert:** hva Safari på iPad rapporterer og gjør. Det er hele poenget med testen. Kasper kjører den på iPaden og limer inn rapporten.

## 2026-11-20 – iPad-mikrofonen: måling og beslutning

- **Rapport fra iPaden** (keyboard på fullt volum, iPad liggende i notestativet): ekkofjerning av, støydemping og automatisk volum ikke oppgitt, 48 kHz. Stillhet −91 dB, svake toner −59 dB, 97 % gjenkjent, anbefalt grense −62 dB.
- **Konklusjon:** tonegjenkjenningen virker på iPaden. Lyden er for svak for de faste følsomhetene. «Høy» (−49 dB) ligger 10 dB over de svake tonene.
- **Gjenskapt:** del A dempet 17 dB gir samme målinger. «Høy» hører 1 av 26 toner, «Kalibrert» (−62 dB) hører 26 av 26 uten bom. Også dempet 20 og 23 dB gir 26/26 med kalibrert følsomhet.
- **Beslutning:** ikke senke minimumsgrensene i mic.ts (støygulv ≥ 0,0003, kalibrert grense ≥ 0,0008) eller endre anslagsgjenkjenningen. Målingene viser at det ikke trengs for del A, og tonegjenkjenningen er den mest følsomme delen av appen.
- **Oppfølging:** hvis fanfaren («C så C-dur», som trenger anslagsgjenkjenning) bommer på iPaden, er det faste hoppet på 0,001 (−60 dB) i anslagsgjenkjenningen neste mistenkte. Det bør gjøres relativt til grensen.
- **Rettet:** «Start kalibrering» gjorde ingenting hvis man trykket før mikrofonen var klar. Nå venter den.

## 2026-11-21 – Klassiske gameshow-lyder

- **Kilder:** melodiene er kontrollert mot partiturer uten opphavsrett, ikke skrevet etter hukommelsen.
  - Rossini: Boosey vokalpartitur (archive.org, guglielmotellwil00ross_0).
  - Offenbach: Bote & Bock vokalpartitur (archive.org, imslp-aux-enfers-offenbach-jacques).
  - Saint-Saëns: Durand 1922 (archive.org, 31761052133014).
  - Dukas: Durand partitur (Wikimedia Commons) og Dukas' egen versjon for to klaverer (archive.org, imslp-sorcier-dukas-paul).
  - Beethoven: Mutopia og Wikipedia.
  - Chopin: Breitkopf & Härtel og Meynne (archive.org).
  - Elgar: Boosey 1902 (archive.org, RAM10263-2001).
  - Händel: Novello 1902 (archive.org, messiahsacredora00hand_0) og Mutopia.
- **Usikkert i kildene:** andre halvdel av Rossinis tema (takt 9–16) er bare kontrollert for formen. Den er derfor ikke tatt med. «Trolldoms»-figuren i Dukas' takt 2 er ikke lest av sikkert, så Trolldom bruker klarinettmotivet i takt 3–4 i stedet.
- **Forenklet:**
  - Melodien i høyre hånd, enkle akkorder eller bass i venstre.
  - Bindinger over taktstrek finnes ikke i appen. De er erstattet med pauser (Wilhelm Tell takt 8, Beethoven takt 4–5, Elgar takt 7–8 og 15–16).
  - Akvariet har akkorder i stedet for de bølgende løpene.
  - Wilhelm Tell, Trollmannens læregutt, Pomp and Circumstance og Halleluja er kortet ned til en lengde som passer som lyd i et gameshow.
  - Egne slutter: Wilhelm Tell, Trollmannens læregutt og Pomp and Circumstance slutter på grunntonen eller grunnakkorden der temaet ellers går videre.
- **Flyttet toneart:** for at høyre hånd skal ligge fra midtre C og opp, og for færre fortegn.
  - Wilhelm Tell: E-dur → C-dur.
  - Sørgemarsj: b-moll → a-moll. Venstre hånd i originalen går ned til B♭1, som ikke finnes på CT-S400.
  - Pomp and Circumstance: G-dur → C-dur.
  - Trollmannens læregutt og Trolldom: en oktav opp (fagottlyden på keyboardet klinger en oktav ned igjen).
- **Ny i notearket:** punktert åttendedel og fermat. 2/4 og 3/4 bjelkes per slag.

## 2026-11-21 – Import av egne noter

- **Kontekst:** Kasper vil øve på noter han har kjøpt. Repoet og siden er offentlige, så slike noter kan ikke ligge i appen.
- **Beslutning:** import på enheten. Filen leses i nettleseren, og resultatet lagres i `localStorage` (`ovemodus-mine-noter-v1`). Ingenting sendes til noen server.
- **Format:** bare MusicXML i første omgang (`.musicxml`, `.xml`, `.mxl`). MuseScore (gratis) gjør om MIDI og PDF til MusicXML. Å lese MIDI eller PDF direkte i appen ville gitt dårligere noter (kvantisering, gjetting av hender, notegjenkjenning fra bilde).
- **Forenklinger:** bindinger blir pauser (samme valg som i de innebygde låtene). Bare hovedstemmen i hvert notesystem tas med. Pyntenoter hoppes over. Opptakt fylles med pauser.
- **Ikke støttet ennå:** trioler og andre notegrupper, og taktartskifte midt i stykket. Begge gir en feilmelding med taktnummer i stedet for feil noter.
- **Fingersetting:** tas med når filen har den. Ellers vises ingen fingre, og appen fungerer som før uten dem.
- **Skillet mellom hendene:** innebygde låter bruker midtre C som før. Importerte noter kan ha høyre hånd under midtre C. Skillet regnes derfor ut per del (laveste tone i høyre hånd), og når hendene overlapper, ignorerer MIDI ingen toner.
- **Skjermtastaturet:** samme område som før når tonene får plass der, ellers to (opptil tre) oktaver rundt tonene.
- **Avhengighet:** jsdom (bare utvikling) for å teste MusicXML-leseren i Vitest. Nettleseren har sin egen XML-leser, så jsdom følger ikke med i appen.

## 2026-11-21 – Flere varianter av de korte lydene

- **Kontekst:** Kasper vil ha flere alternativer til hver gameshow-lyd, så showet ikke blir ensformig.
- **Beslutning:** variantene er deler (`sections`) i samme låt. Da står hver lydtype én gang i låtvelgeren, og alle variantene bruker samme registrering på keyboardet. Det krever samme toneart og taktart i hver låt.
- **Nye deler:** riktig svar (ta-da, signal, lang), feil svar (womp womp, skurr, nedtur), joker (tryllestav, harpe, hemmelig), dobbel poeng (to ganger, trappetrinn, jackpot), spenning (krypende, trussel, tenketid), tiden er ute (alarm, slutt, fall), intro (kort, marsj), vinner (seiersrunde, kroning). Ny låt: nedtelling (ti sekunder, fem sekunder, tre-to-en, siste sekunder), registrering 5-3.
- **Komponert selv:** alle er nye, korte motiver. De unngår kjente TV-temaer og kjente signaler (for eksempel «Charge!»-signalet og startsignalet i bilspill).
- **Navn på delene:** de eksisterende delene har fått nye titler («Fanfare», «Trist trombone», «Glitter» osv.). Id-ene er uendret, så lagrede rekorder og innstillinger virker som før.
- **Nedtelling:** ved tempo 60 er hvert slag ett sekund. Venstre hånd ligger mellom F2 og F3, så den blir pauker med split på 592 ORCHESTRA SET, som i «Spenning».
- **Test endret:** e2e-testen for låtvelgeren brukte Joker som eksempel på en låt med én del. Den bruker nå Wilhelm Tell.

## 2026-11-21 – Registreringsplass er valgfri

- **Kontekst:** CT-S400 har 32 registreringsplasser (8 banker × 4), og det blir flere lyder enn plasser.
- **Beslutning:** `reg` i `casio` er valgfri. Lyder uten plass vises som «Lyd: …» og med «–» i tabellen, sist og i samme rekkefølge som i låtvelgeren. De viktigste lydene får plass.
- **Ikke gjort:** nye lydnumre er ikke lagt til. Casios brukerveiledning kunne ikke lastes ned i denne økten, og lydene som allerede står i `CT_S400_TONES`, dekker behovet.

## 2026-11-21 – Flere klassiske temaer

- **Utvalg:** bare verk der komponisten døde før 1956. De mest gjenkjennelige temaene først.
- **Metode:** Mutopia lager MIDI fra LilyPond-kilden sin, så MIDI-filen er nøyaktig det samme som noten. Den er lest tone for tone med et lite skript (opptakt, takter, varigheter), og LilyPond-kilden er brukt der noe var uklart. Skannede noter (temabok på Wikimedia Commons, archive.org) er lest av fra bildene.
- **Filer:** de nye temaene ligger i `src/songs/klaver.ts` (klaver og orgel), `marsjer.ts` og `orkester.ts`. De klassiske står alfabetisk i låtvelgeren.
- **Kilder, bolk 1 (alle fra Mutopia):**
  - Beethoven, Für Elise: Breitkopf & Härtel 1888 (fur_Elise_WoO59).
  - Mozart, Rondo alla turca: utgave fra IMSLP (KV331_3_RondoAllaTurca).
  - Mozart, Eine kleine Nachtmusik: Breitkopf & Härtel 1883 (MozartWA-KV525).
  - Joplin, The Entertainer: gjengivelse av originalutgaven fra 1902 (entertainer).
  - Bach, Toccata i d-moll BWV 565: Bach-Gesellschaft 1867 (ToccataFugue).
  - Sousa, The Stars and Stripes Forever: John Church Company 1897 (TheStarsAndStripesForever). Oktavspranget opp til G i takt 60 står slik i kilden.
  - Sousa, The Liberty Bell: John Church Company (TheLibertyBell).
- **Forenklet, bolk 1:**
  - Opptakt står i en egen takt med pauser foran (Für Elise, Rondo alla turca, The Entertainer, Stars and Stripes).
  - Bindinger over taktstrek er pauser (The Entertainer takt 5–6, Stars and Stripes takt 57–58 og 65–66).
  - Rondo alla turca bruker temaet slik det slutter første gang (takt 16–24), fordi det ender på grunntonen. Trillen og tretiandedelene i takt 23 er to fjerdedeler. Venstre hånd i takt 17–21 er en oktav lavere, så den holder seg under midtre C.
  - Eine kleine Nachtmusik: takt 1–4 og G-durakkorden fra takt 5. Strykerne spiller unisont, så venstre hånd spiller melodien tre oktaver lavere.
  - The Entertainer: opptakten og takt 5–8. Melodien ligger i oktaver i originalen, og appen bruker den nederste.
  - Toccata: de tre første taktene og akkordene. Mordentene er skrevet ut, og 32- og 64-delene er sekstendeler.
  - Stars and Stripes: de siste 16 taktene av trioen, flyttet fra A♭-dur til C-dur. Marsjen står i 2/2 som i originalen.
  - The Liberty Bell: første del (16 takter), øverste tone i akkordene. Den slutter på dominanten, som i originalen.
  - Akkordtoner i venstre hånd over midtre C er flyttet en oktav ned eller sløyfet.
- **Kilder, bolk 2:**
  - «Orchesterwerke Romantik Themen» (Wikimedia Commons, skann, offentlig eiendom): Grieg, Morgenstemning (s. 287), Mendelssohn, Bryllupsmarsj (s. 452), Strauss, Also sprach Zarathustra (s. 860), Saint-Saëns, Danse macabre (s. 684). Temaboka viser bare melodien.
  - Mendelssohn, Bryllupsmarsj: bassen er lest av fra klaverutgaven til Carl Wilhelm Kern, Shattinger 1906 (archive.org, b89774188).
  - Strauss, Also sprach Zarathustra: motivet C–G–C er også kontrollert mot notesnutten i Wikipedia-artikkelen.
- **Forenklet, bolk 2:**
  - Morgenstemning: flyttet fra E-dur til C-dur. Da ligger hele melodien under fem fingre (C, D, E, G, A). Forslagsnotene er sløyfet. Venstre hånd holder C og G, som orgelpunktet i originalen.
  - Bryllupsmarsj: temaet uten trompetsignalet foran, fordi signalet er trioler. Trillene er sløyfet. Venstre hånd har bare bassen. Den første akkorden er en dissonans over E i originalen, og her blir den bare E i bassen.
  - Also sprach Zarathustra: C–G–C, C-dur til c-moll, paukene og en egen slutt på C-durakkorden. Den korte E-en (sekstendel) før c-mollakkorden er en kort C-durakkord. Paukene spiller trioler i originalen og åttendedeler her.
  - Danse macabre: valsetemaet, med egen slutt på G. Temaboka viser bare melodien, så venstre hånd er en enkel vals med vanlig harmonisering av den kromatiske linjen (g-moll, F, C/E, c/E♭, g/D, D7, A, D).
- **Kilder, bolk 3:**
  - Charpentier, Te Deum (forspillet): notesnutten i Wikipedia-artikkelen, med både melodi og bass.
  - Beethoven, Ode til gleden: notesnutten i Wikipedia-artikkelen (G-dur), og Mutopia (ode) som kontroll.
  - Haydn, Symfoni nr. 94: notesnutten i Wikipedia-artikkelen.
  - Bizet, Toreador: Carmen-forspillet, Schirmer 1895 (Mutopia, prelude). Refrenget står i forspillet med bass.
  - Strauss d.y., Den blå Donau: førsteutgaven, Spina 1867 (Wikimedia Commons, Donauwalzer Spina 03 og 04), og Mutopia (blue_danube, et arrangement i C-dur) for akkordene.
  - Satie, Gymnopédie nr. 1: Mutopia (gymnopedie_1, Dover) og notesnutten i Wikipedia-artikkelen.
  - Brahms, Wiegenlied: notesnutten i Wikipedia-artikkelen.
- **Forenklet, bolk 3:**
  - Te Deum: trillene er sløyfet. Opptakten står i en egen takt.
  - Ode til gleden: flyttet fra D-dur (originalen) til C-dur, i registeret G4–G5. Bindingen i takt 12–13 er en pause. Venstre hånd er en enkel harmonisering med C og G.
  - Paukeslaget: melodien en oktav opp, så høyre hånd ligger over midtre C. Overraskelsesakkorden er lagt lavere enn i originalen, så den kan tas med én hånd. Venstre hånd er enkle akkorder.
  - Toreador: takt 1–8 av refrenget og en egen slutt på F-durakkorden. Forslagsnotene er sløyfet. Akkordene i venstre hånd er en oktav lavere enn i forspillet.
  - Den blå Donau: de første 16 taktene i D-dur, som originalen. Førsteutgaven har ingen opptakt, så det har ikke appen heller. Den holdte melodinoten under «pom-pom»-akkordene er en halvnote.
  - Gymnopédie: to av de fire innledningstaktene, den første frasen og en egen slutt på F♯. Akkordene står i diskanten i originalen og spilles en oktav lavere av venstre hånd.
  - Brahms' vuggevise: flyttet fra Ess-dur til C-dur. Forslagsnotene er sløyfet. Venstre hånd er enkle akkorder.
- **Kilder, bolk 4:** Liszt, Ungarsk rapsodi nr. 2 (friska): notesnutten i Wikipedia-artikkelen, med begge hender. Flyttet fra F♯-dur til F-dur, og høyre hånd spiller den nederste tonen i oktavene.
- **Registreringsplasser:** alle 32 er nå i bruk. De nye som fikk plass: nedtelling 5-3, Also sprach Zarathustra 5-4, Toccata 6-1, Morgenstemning 6-2, Paukeslaget 6-3, Ungarsk rapsodi 6-4, Te Deum 7-1, Toreador 7-2, Bryllupsmarsj 7-3, Ode til gleden 7-4, The Entertainer 8-1, Für Elise 8-2, The Liberty Bell 8-3, Stars and Stripes 8-4. Valgt etter hva som trolig trengs raskt under showet (intro, drama, overraskelse, fart, vinner). Kasper kan bytte dem i låtfilene.
- **Ikke lagt inn ennå (fant ingen kilde som kunne leses sikkert i denne økten):**
  - Radetzkymarsj: Wikipedia-snutten dekker bare de fire første taktene (i C-dur, originalen er D-dur).
  - Valkyrieritt, Humlens flukt, Sukkerfeens dans, Barcarole, Dronningen av Saba, Brudekor (Wagner): ingen Mutopia-utgave eller notesnutt. Brudekoret finnes som et lite bilde på Commons, for lite til å lese sikkert.
  - Svanesjøen: partituret (Jurgenson, archive.org) er for utydelig i obostemmen.
  - Gladiatorenes inntog: bildet på Commons er for lite.
  - 1812: temaboka har bare åpningen, ikke finalen.
  - Mars (Holst): 5/4 og trioler, som appen ikke støtter.
  - Griegs klaverkonsert: åpningen står i temaboka, men akkordene er for tette til å lese sikkert.
  - Bryllupsdag på Troldhaugen: hovedtemaet har trioler.

## 2026-11-21 – Begge hender med mikrofon (trinn 3)

- **Kontekst:** på iPad finnes ikke Web MIDI, så begge hender samtidig må gå via mikrofonen. Én mikrofon gir ett signal med begge hender i, og YIN finner bare én tone.
- **Beslutning:** appen vet hva som skal spilles, og sjekker det i stedet for å gjette fritt. Venstre hånd sjekkes i bassen (under skillet), høyre hånd med YIN etter at venstre hånds toner er trukket fra med kamfiltre. Én hånd bruker samme kode som før.
- **Forkastet:** YIN på hele signalet eller på lavpassfiltrert signal. Prøvd på kunstige toner: begge feilet for kvinter og akkorder i bassen.
- **Kjent svakhet:** toner i høyre hånd som ligger på en overtone av venstre hånd (A4, E5 og A5 over A2, B4 over E3, og G5 nær 7. deltone av A2) kan ikke høres for seg med én mikrofon. De godtas når venstre hånd er riktig, eller ved et anslag som ikke er i bassen. I del A av Dovregubben gjelder det 14 av 26 toner i høyre hånd. Feil tone i høyre hånd på et slikt steg blir godtatt.
- **Antakelse:** grensene er satt fra kunstige opptak (inharmoniske overtoner, to-trinns utklingning) og ett ekte pianoopptak (FluidSynth) av bare høyre hånd. Høyttalerne på CT-S400 og iPad-mikrofonen gjengir lite under 100 Hz. Grunntonen til A2 (110 Hz) kan derfor bli svak, mens andre deltone (220 Hz) er med i lavpasset. Dette er ikke målt.
- **Forsinkelse:** venstre hånd godtas 117 ms etter anslaget. I «Vent på meg» går markøren videre så mye senere. I «Spill i takt» dømmes tonen etter anslaget.
- **Oppfølging:** test på iPad i notestativet med CT-S400 og del A med begge hender. Lim inn rapporten fra «Mikrofontest» hvis venstre hånd ikke blir hørt. Mulige justeringer er grensen 0,25 for bassandelen og ventetiden på 7 rammer.


## 2026-11-23 – Hele klaverstykker: notemodellen og Für Elise

- **Kontekst:** Kasper vil lære hele «Für Elise» og noen lignende stykker, øve hendene hver for seg og sammen, og høre dem i appen. Modellen manglet 32-deler, trioler og venstre hånd over midtre C.
- **Beslutning, modellen:**
  - Nye varigheter `s32` (0,25) og `s16d` (0,75). Trioler med `T3(...)`: tre toner på plassen til to, varighetene skrives som i noten.
  - Plassene i takten legges på et rutenett av 1/48 åttedel, så tre tredjedeler blir nøyaktig en hel og hendene møtes på samme plass etter en triol.
  - Venstre hånd over midtre C (og høyre under) er lov for stykker i `HANDS_CROSS` i `songs.test.ts`. Der er skillet `null` i deler der hendene overlapper. MIDI og skjermtastaturet skiller da hendene på hva som skal spilles (som for importerte noter). Med «Godta riktig tone i alle oktaver» kan en tone da bli regnet til feil hånd i et steg der begge hender har samme tonenavn. Steget blir likevel riktig ferdig.
  - Mikrofonen med begge hender: når skillet er `null`, lages et skille per steg (`stepSplit`), og bare venstre hånds toner under det trekkes fra med kamfiltre. Ellers ville høye toner i venstre hånd (E5 i overgangen) blitt trukket fra, og høyre hånd under midtre C (A3 i arpeggioen) aldri blitt hørt. Deler med skille, som alle låtene før, oppfører seg som før. Ikke testet med lyd.
- **Beslutning, notearket:**
  - Venstre hånd bytter til diskantnøkkel når en takt i snitt ligger fra E4 og opp, og tilbake under midtre C. Avstanden mellom grensene hindrer at nøkkelen bytter for hver takt. Originalen bytter midt i takten noen steder, appen bare ved taktstrek.
  - Takter med mange korte noter får færre takter per linje (høyst ni toner per takt i snitt), fordi tonenavnene under 32-deler ellers flyter sammen. Eksisterende låter har høyst åtte toner per takt og får samme oppsett som før.
  - Trioler og 32-deler bjelkes per åttendedel, som i originalen.
- **Kilde, Für Elise:** Mutopia `fur_Elise_WoO59` (Breitkopf & Härtel 1888, typesatt av Stelios Samelis, Public Domain). LilyPond-filen er lest med et skript (ikke sjekket inn), og resultatet er sammenlignet tone for tone (tonehøyde, plass og varighet) med det appen bygger for «Hele stykket».
- **Endret fra kilden:**
  - Taktnumrene her følger `ELISE` i `klaver.ts`, der repetisjonene er skrevet ut og opptakten er takt 0.
  - Toner utenfor CT-S400 (C2–C7) er flyttet en oktav inn: E7 og D7 øverst i arpeggioen (takt 101) spilles som E6 og D6. A1 i venstre hånd (takt 99) blir A2. Oktaven A1+A2 (takt 89 og 125) blir bare A2, fordi begge tonene ellers ville vært A2.
  - Forslagsnotene (F–A foran takt 45 og B♭ i takt 48) er sløyfet, fordi de ikke tar tid i takten.
  - Opptakten står i en egen takt med pause foran, og siste takt (to åttendedeler) er fylt ut med en pause.
  - Repetisjonene er skrevet ut i «Hele stykket» (126 takter). Øvedelene har ingen repetisjoner.
- **Fingersetting:** kilden har ingen. Taktene fra gameshow-delen beholder fingrene de hadde. Resten er et eget forslag, laget med en enkel optimering (Parncutt-lignende kostnader for strekk, tommelkryss og svarte tangenter) og deretter rettet for hånd der forslaget var dårlig (for eksempel G3 og B3 med samme finger, tommel på D♯5). Fingrene i arpeggioen tar hensyn til at E6 og D6 er flyttet ned.
- **Deler:** «Tema» er gameshow-delen `elise` (samme id, takter, tempo og registrering 8-2, ny tittel fordi låten nå har flere deler). Nye deler: Mellomspill, F-dur, 32-deler, Orgelpunkt, Orgelpunkt 2, Arpeggio og Hele stykket, på rundt åtte takter hver. Standardtempo 50–60 for øvedelene; originalen har fjerdedel = 72.
- **Kategori:** ny kategori «Klaverstykker (lettest først)» øverst i låtvelgeren. Für Elise er flyttet dit fra gameshow-temaene. Gameshow-delen finnes fortsatt som «Tema».
- **Ikke gjort:** MusicXML-importen avviser fortsatt trioler. Modellen har nå det som trengs for å støtte dem.

## 2026-11-23 – Øve på noen takter: utsnitt, løkke og tempotrapp

- **Kontekst:** Kasper vil lære hele stykker, som Für Elise. Appen kunne starte fra en note i «Vent på meg», men ikke gjenta noen takter eller øke tempoet litt etter litt.
- **Utsnitt:** fra takt til takt innenfor delen, valgt med to nedtrekkslister under «Hva vil du øve på?». Modellen bygges av bare de taktene (`sliceSection` og så `build`), så dømming, tastatur, bokstaver, noteark, mikrofon og avspilling virker som før. Notearket viser bare utsnittet.
  - Forkastet: hele delen i notearket med utsnittet markert. Da måtte all dømming og tidsregning hoppe over steg utenfor utsnittet, og en feil der gir feil dømming.
  - Ikke laget: å velge første og siste note ved å trykke i notearket. Hele takter passer med inntellingen i «Spill i takt». Kan legges til senere.
  - Tastaturet regnes ut fra hele delen, så det ikke hopper når man bytter utsnitt.
- **Taktnummer:** notearket viser taktnummeret først på hver linje (`%%barnumbers 0`), i grått så det ikke forveksles med fingertallene. Bokstavvisningen viser nummeret foran hver takt. Et utsnitt beholder numrene fra delen (`firstBar` og `%%setbarnb`). Numrene teller fra 1 i hver del, fordi delene er satt sammen av grupper (Del A, Del A igjen). Importerte deler på 16 takter får numrene fra stykket.
  - abcjs 6.4.4 krasjer på `%%setbarnb` før første notelinje. En usynlig skillelinje (`%%sep 0 0 0`) foran unngår det.
- **Løkke i «Spill i takt»:** ny inntelling før hver runde, etter 1 s pause der resultatet vises. Forkastet: rett videre uten inntelling. Tempoet kan ha endret seg, og hånden må tilbake til starten av utsnittet.
- **Løkke i «Vent på meg»:** begynner på nytt med en gang, så neste tone teller. Tid og bom står i hintet og i løkkekortet. Siste godkjente tone huskes, så mikrofonen ikke tar utklangen for første tone i neste runde.
- **Tempotrapp:** minst 90 % treff gir 5 BPM opp, under 70 % gir 5 ned, ellers samme tempo. 90 % er samme grense som for rekord. Tempoet går ikke over målet. Står man over målet, holdes tempoet etter gode runder. Målet er delens standardtempo til man velger et annet (per del). Minste tempo er 50.
- **Tempo per utsnitt:** hvert utsnitt husker sitt eget tempo. Et nytt utsnitt starter i tempoet til hele delen, og tempotrappen endrer ikke tempoet til hele delen.
- **Lagring:** samme nøkkel (`dovregubben-ovemodus-v1`), nå versjon 2. Hele delen har samme nøkler som før, så gamle rekorder og tempo gjelder fortsatt. Et utsnitt har `|t5-8` etter del-id-en, tellt fra 1 i delen. Nytt: `settings.ranges`, `settings.loop`, `settings.target` og `progress` (de 12 siste rundene og beste tempo per dag de siste 60 dagene, per del, utsnitt, hånd og modus). `parseStore` sjekker formen på alt, gir standardverdier for det som mangler, og beholder ukjente felter.
  - Kjent risiko: en fane med den gamle versjonen åpen samtidig med den nye. Den gamle lagrer bare `settings` og `rec`, så `progress` kan forsvinne. Sjelden, og bare fremgangen går tapt.
  - Endres takter i en innebygd del senere, kan et lagret utsnitt peke på andre takter. Et utsnitt som ikke lenger passer i delen, slettes.
- **Beste tempo per dag:** fra alle runder i takt med minst 90 %, med eller uten løkke. Liten linjegraf under knappene i oppsettet, bare dager det er øvd, med tabell for skjermlesere. Y-aksen starter ikke på null, fordi forskjellene er på 5 BPM.
- **iPad:** løkkekortet står over notearket. Venstre kolonne bestemmer høyden på scenen, så kortet gjør den ikke høyere: tastaturet slutter på 904 px ved 768×1024 med og uten løkke (testet). Kortet har egen start og stopp, så oppsettet kan være skjult under øving. Resultatet mellom rundene har ingen knapper eller merke, så kortet for neste tone holder samme høyde og tastaturet ikke hopper hver runde.
- **Rettet i forbifarten:** hintet «Denne delen har bare høyre hånd.» ble visket ut med en gang (`resetProgress` kom etter).
- **Funnet:** notearkets maksimale høyde (318 px) virket ikke når arket var høyere enn det, fordi abcjs (`responsive: 'resize'`) setter høyden med `padding-bottom`. Hele stykket i Dovregubben ble rundt 1300 px høyt ved 1366 px bredde. Fantes fra før. Rettet samme dag, se «Notearket følger med».
- **Oppfølging:** test løkken på iPad i notestativet, med mikrofon og CT-S400. Vurder å velge utsnitt ved å trykke i notearket.

## 2026-11-23 – Fire klaverstykker til: Menuett, Kanon, Preludium i C-dur og Preludium i e-moll

- **Metode:** som for Für Elise. LilyPond-filen fra Mutopia er lest med et skript (relativ notasjon, flere stemmer, bindinger), og resultatet er sammenlignet med MIDI-filen fra samme mappe (tonehøyde og plass for hver tone). Appens «Hele stykket» er så sammenlignet tone for tone med det skriptet leste. Skriptene er ikke sjekket inn.
- **Kilder:**
  - Menuett i G-dur, BWV Anh. 114 (Christian Petzold): Mutopia `anna-magdalena-04` (Bach-Gesellschaft, Public Domain).
  - Kanon i D-dur (Pachelbel): eget enkelt arrangement. Grunnbassen og første fiolin i takt 3–12 er tatt fra notesnutten i Wikipedia-artikkelen «Pachelbel's Canon» (avsnittet Analysis). Mutopia-filen `CanonInD` er ikke brukt, fordi den er et arrangement (Jim Paterson, CC BY).
  - Preludium i C-dur, BWV 846 (Bach): Mutopia `wtk1-prelude1` (Public Domain; kilden er oppgitt som ukjent i filen, notene er de vanlige).
  - Preludium i e-moll, op. 28 nr. 4 (Chopin): Mutopia `Chop-28-4` (Peters 1879, Public Domain).
- **Forenklet og endret:**
  - Kanon: høyre hånd spiller første fiolin, venstre hånd grunnbassen. Takt 1–2 er bare bass, som i originalen. Trillen i takt 10 er sløyfet, og sluttakkorden i takt 11 (D-dur) er egen. Arrangementet stopper der, fordi kilden ikke har resten av variasjonene.
  - Preludium i C-dur: venstre hånd har to stemmer (bass og tenor). Her er de én stemme i anslagsrekkefølge: bassen som sekstendel, så tenoren holdt ut halvtakten (dobbeltpunktert fjerdedel, i takt 33–34 trippelpunktert halvnote).
  - Preludium i e-moll: G𝄪5 i takt 16 er skrevet som A5, fordi appen ikke har dobbelte fortegn. H1 i bassen (takt 17 og 24) og E1 (takt 25) er flyttet en oktav opp, og faller bort fordi H2 og E2 allerede står i samme akkord. Forslagsnotene (takt 11 og 19) er sløyfet. Bindingen fra takt 8 til 9 er en pause. Akkordene i takt 24–25 står i bassystemet i originalen, men er en del av høyre hånds stemme og spilles av høyre hånd.
  - Menuett: forslagsnoten i takt 8 er sløyfet. Sluttakkorden i høyre hånd er H3–D4–G4 som i kilden.
- **Hendene krysser midtre C** i alle fire (venstre hånd opp til E4 i Menuetten og A4 i Chopin, høyre hånd ned til H3 i Kanon og D3 i Bach), så de står i `HANDS_CROSS`.
- **Fingersetting:** eget forslag, laget med samme optimering som for Für Elise og rettet for hånd. Menuetten følger vanlig fingersetting (D5 med 5 i takt 1, G4–F♯4 med 2–1). I Chopin har venstre hånds akkorder en fast regel: 5 på bassen, 1 øverst og midtfingeren etter avstanden (4 ved et heltonetrinn eller mindre, 3 opp til en stor ters, ellers 2), så like akkorder får like fingre.
- **Notearket:**
  - abcjs 6.4.4 ignorerer `[K:clef=…]` først på en linje i øverste stemme. Nøkkelen settes derfor på stemmen (`[V:RH clef=…]`) ved linjestart. Høyre hånd bytter til bassnøkkel når takten i snitt ligger under A3 (takt 33 i Bach, som i originalen).
  - Lange akkordnavn står bare når akkorden endrer seg i takten, ellers fløt de sammen under Chopins åtte akkorder per takt. Korte navn som «A+E» i Dovregubben står som før. Timingmerket for en akkord uten navn står under noten.
  - Takter per linje regner med bredden på tonenavnene. Grensen er hevet fra ni til ti toner per takt i snitt.
- **Taktnummer (`firstBar`):** delene har numrene fra stykket, med opptakten som takt 0. For «Hele stykket» med repetisjoner (Menuetten, Für Elise) teller numrene videre gjennom repetisjonene.
- **Tempo:** standardtempo for øving, ikke originaltempoet: Menuett 80, Kanon 60, Preludium i C-dur 50, Preludium i e-moll 50.
- **Casio:** alle bruker 001 STAGE PIANO uten registreringsplass (alle 32 er i bruk). Ikke lagt til cembalo, fordi lydnummeret ikke er kontrollert mot tonelisten.

## 2026-11-23 – Notearket følger med

- **Kontekst:** Kasper spør om arket kan rulle av seg selv. Med hele stykker ble arket mange tusen piksler høyt (Für Elise, hele stykket: 7920 px, siden 9730 px), fordi abcjs styrer høyden på elementet den tegner i. Markøren forsvant under skjermkanten, og man måtte rulle selv.
- **Beslutning:** abcjs tegner i et indre element, så `#sheet` kan begrenses til 318 px og rulle. Når markøren går til en ny linje, rulles den linjen til toppen av arket. Da står neste linje under og kan leses før man kommer dit, som når man blar i noter. Gjelder «Vent på meg», «Spill i takt» og avspillingen. Har man rullet bort selv, rulles det tilbake ved neste tone.
- **Myk rulling**, men med en gang når `prefers-reduced-motion` er på.
- **Forkastet:** å rulle bare når markøren går ut av synsfeltet (slik det var tenkt før). Da ser man ikke neste linje før man er der.
- **Målt:** Für Elise, hele stykket, i takt i 120 BPM: markøren var innenfor arket i alle 249 målinger over 25 s. Siden er 2117 px høy i stedet for 9730.
- **Ikke gjort:** arket bruker fortsatt høyst 318 px, også på store iPader med ledig plass. Bokstavvisningen ruller som før (når en brikke går ut av synsfeltet).

## 2026-11-23 – Sonata facile og Måneskinnssonaten

- **Kilder:**
  - Mozart, pianosonate i C-dur K. 545, 1. sats: Mutopia `K545-1` (Alejandro Sierra, satt fra en utgave på IMSLP, lisens CC BY-SA 3.0).
  - Beethoven, pianosonate nr. 14 op. 27 nr. 2, 1. sats: Mutopia `moonlight` (Berners 1908, redigert av A. Winterberger, satt av Stewart Holmes, lisens CC BY-SA 2.5).
  - **Lisens:** musikken og de trykte forelagene er falt i det fri. Lisensen gjelder Mutopia-filene. Bare tonehøyder og rytmer er brukt, ikke fingersetting, dynamikk eller annet redaksjonelt innhold i filene. Kilden er oppgitt her og i låtfilene. Kasper bør vite om dette valget, siden repoet er offentlig.
- **Metode:** som for de andre stykkene. Parseren måtte i tillegg forstå variabler, `\tag`, transponering, `\afterGrace`, pauser plassert på en tonehøyde (`d\rest`) og bundne akkorder. Begge filer stemmer med MIDI-filene (bortsett fra forslagsnoter).
- **Sonata facile:** «Hele satsen» er uten repetisjonene (73 takter), fordi med dem blir det 146 takter med sekstendeler. Trillene (takt 4, 15, 17, 25, 59, 61 og 70) er hovedtonen, og forslagsnotene er sløyfet. Venstre hånds Alberti-bass har fast fingersetting 5-1-3-1 (5-1-2-1 når midttonen ligger en kvart eller mer over bassen), og skalaene i venstre hånd i takt 50–53 vanlig skalafingersetting.
- **Måneskinnssonaten:**
  - Melodien og triolene i høyre hånd er to stemmer i originalen. Her er de én stemme: der de slår an samtidig, blir de en akkord.
  - Melodiens sekstendel etter en punktert åttendedel (takt 5–6, 10–11, 23–24, 42–43 og 46–47) spilles med tredje triolnote, ikke litt etter. Appen kan ikke vise begge rytmene i samme stemme, og dette er en vanlig måte å øve dem sammen på.
  - Triolnotene som står i bassystemet i originalen (stemmeskifte), spilles av høyre hånd og står i høyre hånds system.
  - Bassoktavene går ned til F♯1 og G♯1. Toner under C2 er flyttet en oktav opp og faller bort når oktaven allerede har tonen (49 steder), så oktaven blir én tone.
  - F𝄪 (takt 27 og 34) er skrevet som G, fordi appen ikke har dobbelte fortegn.
  - Bindinger over taktstreken i bassen (inn i takt 16, 18, 36, 37 og 52) er pauser.
  - Takt 29 begynner med en pause inne i en triol. Modellen tillater nå pauser i trioler (`T3(R(e), …)`).
- **Fingersetting:** eget forslag. Venstre hånds oktaver og akkorder har fast regel (5 nederst, 1 øverst). Fingrene i triolene er fra optimeringen og ikke gjennomgått takt for takt.
- **Tempo:** standardtempo for øving: Sonata facile 60 (hele satsen 80), Måneskinn 50 (hele 55). Originalene er Allegro og Adagio sostenuto.

## 2026-11-23 – Mikrofonen ga ingen lyd på iPaden

- **Kontekst:** Kasper fikk ingen reaksjon når han spilte (Für Elise, hele stykket, begge hender). Mikrofontesten viste nivå −120 dB, og kalibreringen fant verken støy eller toner. Før har iPaden målt −91 dB i stillhet, så −120 dB betyr at nettleseren sendte bare nuller.
- **Undersøkt:** samme del, hånd og innstillinger med falsk mikrofon i Chromium virker (nivå, tonegjenkjenning og dømming, ingen feil i konsollen). Koden bruker ingen JavaScript-funksjoner som Safari 16 mangler. Lyd- og mikrofonkoden var ikke endret, bortsett fra skillet per steg med begge hender (kommer etter nivåmålingen).
- **Antakelse:** iPaden avbrøt lydøkten, trolig da Kasper byttet app (for eksempel for å sende skjermbildet). Safari setter da lydmotoren i tilstanden «interrupted», og den våkner ikke alltid av seg selv. Appen vekket den bare fra «suspended». Ikke bekreftet på iPaden.
- **Beslutning:**
  - Lydmotoren vekkes fra alle tilstander unntatt «closed», ved hvert trykk og hver tast, og når appen blir synlig igjen.
  - Bare nuller i rundt 3 s gir meldingen «Mikrofonen gir ingen lyd …» under mikrofonknappen, og appen prøver å vekke lydmotoren. Meldingen forsvinner når lyden kommer tilbake. En ekte mikrofon gir alltid litt støy, så et stille rom gir ikke meldingen.
  - Stenger nettleseren mikrofonsporet, slås mikrofonen av i appen med en melding om å trykke «Bruk mikrofon» igjen. Settes sporet på pause, sies det også fra.
  - Mikrofontesten og rapporten viser lydmotoren og mikrofonsporet. Kalibreringen gir et eget råd når det bare kommer nuller.
  - En feil i én animasjonsramme stopper ikke lenger alt (mikrofon, takt og tid). Feilmeldingen vises under mikrofonknappen.
- **Oppfølging:** skjer det igjen, åpne «Mikrofontest» og trykk «Kopier rapport». Linjene «Lydmotor» og «Mikrofonspor» viser om det var iPaden som stoppet lyden.

## 2026-11-23 – Konsertversjoner

- **Kontekst:** Kasper skrev (via økten for løkke og tempotrapp): «Det er ikke forenklede versjoner du lærer meg vel? Jeg vil ha "konsertversjonene"».
- **Status:** alle klaverstykkene unntatt Kanon er originalnotene fra utgavene i Mutopia, tone for tone. Kanon er et eget, kort arrangement, slik bestillingen sa.
- **Rettet nå:**
  - Triller og forslagsnoter vises i notearket og spilles i «Hør hvordan det går» (Für Elise, Menuett, Preludium i e-moll, Sonata facile, og trillen i Kanon takt 10). Bare hovedtonen dømmes. Trillen spilles fra tonen over, slik det var vanlig på Mozarts og Beethovens tid.
  - Forslagsnotene og trilletonene (hovedtonen og tonen et halvt eller helt trinn over, rett etter steget med trillen) gir ikke bom i «Vent på meg». I «Spill i takt» teller de som ekstra toner, som ikke trekker ned prosenten.
  - Et fortegn i en forslagsnote gjelder bare forslaget. Hovednoter senere i takten får sitt eget fortegn.
  - «Hele satsen» i Sonata facile har nå repetisjonene, som i noten (146 takter).
  - Teksten under låttittelen sier hvor stykket avviker på grunn av CT-S400 (Für Elise, Preludium i e-moll, Måneskinn).
  - Gjentatte akkordnavn står bare én gang i takten når akkordene er kortere enn en fjerdedel (Alberti- og akkordtakter i Mozart), ellers fløt de sammen.
- **Ikke rettet, krever Kaspers valg:**
  - Kanon: en konsertversjon for klaver finnes ikke (originalen er for tre fioliner og bass). Alternativet er et fullt arrangement av alle variasjonene, eller å bytte ut stykket.
  - Bassoktaver under C2 i Måneskinn og Chopin: med oktav −1 på CT-S400 får hele stykket plass (F♯1–G♯5 og E1–C6), og oktavene kan stå som i originalen. Det krever at Kasper setter oktaven når han spiller dem.
  - Måneskinn: melodiens sekstendel etter tredje triolnote krever to stemmer i høyre hånd, som appen ikke har.
  - En akkord godtas når én av tonene spilles. Det gjelder hele appen og hører til økten for øving og dømming.
