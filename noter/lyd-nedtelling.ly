\version "2.24.3"
\include "musikk.ly"
tempoTrack = {
  \tempo 4 = 100 s1*4 \tempo 4 = 106 s1*4 \tempo 4 = 112 s1*4 \tempo 4 = 118 s1*4
  \tempo 4 = 128 s1*4 \tempo 4 = 138 s1*4 \tempo 4 = 148 s1*4 \tempo 4 = 158 s1*4
  \tempo 4 = 172 s1*4 \tempo 4 = 188 s1*4 \tempo 4 = 204 s1*4 \tempo 4 = 220 s1*4
  \tempo 4 = 200 s1
}
runde = { \rhA \rhA \rhB \rhA }
rundeLH = { \lhA \lhA \lhB \lhA }
\score {
  <<
    \new Staff \with { midiInstrument = "acoustic grand" } << \tempoTrack { \global \runde \runde \runde \rhEnd } >>
    \new Staff \with { midiInstrument = "acoustic grand" } { \global \rundeLH \rundeLH \rundeLH \lhEnd }
  >>
  \midi { }
}
