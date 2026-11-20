\version "2.24.3"
\include "musikk.ly"
\score { \unfoldRepeats
  <<
    \new Staff = "upper" {
      \time 4/4
      \tempo 4 = 120 \set Staff.midiInstrument = "brass section" \fanfareRH | R1 |
      \tempo 4 = 76 \set Staff.midiInstrument = "trombone" \tromboneRH | R1 |
      \tempo 4 = 100 \set Staff.midiInstrument = "acoustic grand" \glissMidi | R1 |
      \tempo 4 = 80 R1*3 | R1 |
    }
    \new Staff = "lower" {
      \time 4/4
      \set Staff.midiInstrument = "brass section" \fanfareLH | R1 |
      R1*2 | R1 |
      R1 | R1 |
      \set Staff.midiInstrument = "acoustic grand" \tremoloLH | R1 |
    }
  >>
  \midi { }
}
