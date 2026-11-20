\version "2.24.3"
\include "musikk.ly"
\score {
  <<
    \new Staff \with { midiInstrument = "acoustic grand" } { \global \tempo 4 = 100 \rhA \rhA \rhB \rhA \rhEnd }
    \new Staff \with { midiInstrument = "acoustic grand" } { \global \lhA \lhA \lhB \lhA \lhEnd }
  >>
  \midi { }
}
