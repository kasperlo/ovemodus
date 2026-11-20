\version "2.24.3"
\include "musikk.ly"

#(set-global-staff-size 22)

% Tonenavn under notene: store bokstaver med ♯/♭
#(define (letter-name pitch context)
   (let* ((names #("C" "D" "E" "F" "G" "A" "B"))
          (n (vector-ref names (ly:pitch-notename pitch)))
          (alt (ly:pitch-alteration pitch)))
     (cond
      ((= alt 1/2)
       (make-concat-markup
        (list n (make-fontsize-markup -3 (make-raise-markup 0.9 (make-sharp-markup))))))
      ((= alt -1/2)
       (make-concat-markup
        (list n (make-fontsize-markup -3 (make-raise-markup 0.4 (make-flat-markup))))))
      (else n))))

namesWith = \with {
  noteNameFunction = #letter-name
  \override NoteName.font-family = #'sans
  \override NoteName.font-series = #'bold
  \override NoteName.font-size = #-2.5
  \override NoteName.color = #(rgb-color 0.30 0.30 0.30)
  \override VerticalAxisGroup.nonstaff-relatedstaff-spacing.padding = #0.6
}

\paper {
  top-margin = 12\mm
  bottom-margin = 12\mm
  left-margin = 15\mm
  right-margin = 15\mm
  indent = 0
  tagline = ##f
  print-page-number = ##f
  ragged-last-bottom = ##t
  markup-system-spacing = #'((basic-distance . 10) (padding . 3))
  score-markup-spacing = #'((basic-distance . 10) (padding . 3))
  markup-markup-spacing = #'((basic-distance . 1) (padding . 1.2))
  system-system-spacing = #'((basic-distance . 16) (minimum-distance . 12) (padding . 3))
  score-system-spacing = #'((basic-distance . 14) (padding . 4))
}

\layout {
  \context {
    \PianoStaff
    \accepts "NoteNames"
  }
  \context {
    \Score
    \override Fingering.color = #(rgb-color 0.10 0.35 0.75)
    \override SectionLabel.font-size = #1
  }
}

\header {
  title = "I Dovregubbens hall"
  subtitle = "fra «Peer Gynt» – forenklet keyboardversjon i a-moll"
  composer = "Edvard Grieg"
  tagline = ##f
}

\markup \column {
  \vspace #0.5
  \wordwrap {
    \bold "Som nedtelling:"
    Spill del A to ganger, så del B, så del A igjen. Start rolig, og ta hele
    runden fra start litt raskere og sterkere hver gang. Når tiden er ute:
    slå sluttakkorden.
  }
  \vspace #0.4
  \wordwrap {
    \bold "Lesehjelp:"
    Korte, hakkete toner (staccato).
    \with-color #(rgb-color 0.10 0.35 0.75) "Blå tall"
    = fingersetting (1 = tommel, 5 = lillefinger). Bokstavene under notene er
    tonenavn (B heter H på norsk). Venstre hånd tar de samme to tonene på hvert
    slag – enda enklere: bare den nederste.
  }
}

\score {
  \new PianoStaff <<
    \new Staff = "rh" {
      \global
      \tempo "Rolig marsj" 4 = 100
      \sectionLabel "Del A (2 ganger)"
      \repeat volta 2 { \rhAf }
      \break
      \sectionLabel "Del B"
      \rhBf
      \break
      \sectionLabel "Del A igjen"
      \rhA
      \textEndMark \markup \italic \small "fra start, raskere!"
      \section
      \sectionLabel "Når tiden er ute:"
      \rhEnd
      \bar "|."
    }
    \new NoteNames \with \namesWith {
      \repeat volta 2 { \rhA } \rhB \rhA s1
    }
    \new Staff = "lh" {
      \global \clef bass
      \repeat volta 2 { \lhA } \lhB \lhA \lhEnd
    }
  >>
  \layout { }
}

\markup \column {
  \vspace #1.5
  \bold \fontsize #1 "Lydvalg på keyboardet"
  \vspace #0.3
  \line { \bold "Dovregubben:" piano, fagott (bassoon) eller pizzicato-strykere }
  \line { \bold "Riktig svar:" trompet / brass }
  \line { \bold "Feil svar:" trombone – med pitch bend på siste tone }
  \line { \bold "Spenning:" piano, strykere eller pauke (timpani) }
}

\pageBreak

\markup \fill-line { \fontsize #5 \bold "Lydeffekter til gameshowet" }
\markup \fill-line { \italic "Korte stikk mellom spørsmålene – lær disse først, de gir mest stemning per øvetime" }

\score {
  \header { piece = \markup \bold \fontsize #1.5 "1. Riktig svar! – fanfare" }
  \new PianoStaff <<
    \new Staff { \time 4/4 \tempo 4 = 120 \fanfareRH \bar "|." }
    \new NoteNames \with \namesWith { \fanfareRH }
    \new Staff { \clef bass \fanfareLH }
  >>
  \layout { ragged-right = ##t }
}
\markup \column { \wordwrap { Raskt opp C–E–G–C, så et kraftig C-dur-slag. Gjerne med trompet- eller brass-lyd. } \vspace #0.6 }

\score {
  \header { piece = \markup \bold \fontsize #1.5 "2. Feil svar – «sad trombone»" }
  <<
    \new Staff { \time 4/4 \tempo 4 = 76 \tromboneRH \bar "|." }
    \new NoteNames \with \namesWith { \tromboneRH }
  >>
  \layout { ragged-right = ##t }
}
\markup \column { \wordwrap { Tre «wah» nedover i halvtoner, og la den siste henge. Bruk trombone-lyd og dra pitch bend-hjulet ned på siste tone. } \vspace #0.6 }

\score {
  \header { piece = \markup \bold \fontsize #1.5 "3. Daily Double! – glissando" }
  <<
    \new Staff { \time 4/4 \glissRH \bar "|." }
    \new NoteNames \with \namesWith { \glissRH }
  >>
  \layout { ragged-right = ##t }
}
\markup \column { \wordwrap { Dra neglen (baksiden av fingrene) over de hvite tangentene fra lav C til høy C, så fort du klarer. } \vspace #0.6 }

\score {
  \header { piece = \markup \bold \fontsize #1.5 "4. Spenning før svaret avsløres – tremolo" }
  <<
    \new Staff { \time 4/4 \clef bass \tempo 4 = 80
      \tremoloLH \bar "|." }
    \new NoteNames \with \namesWith { \tremoloNames }
  >>
  \layout { ragged-right = ##t }
}
\markup \wordwrap { Veksle lynraskt mellom lav C og C♯ (to fingre), start svakt og bygg opp. Hold det gående til svaret avsløres, avslutt med et slag – og gå rett over i 1 eller 2. }
