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

