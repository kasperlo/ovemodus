# Noter og lyd

- `gameshow-noter.pdf`: side 1 er «I Dovregubbens hall» (forenklet, a-moll) med fingersetting og tonenavn, side 2 er fire gameshow-effekter.
- `lyd/`: Dovregubben i øvetempo, en nedtellingsversjon som blir raskere for hver runde, og lydeffektene.

## Slik lages filene

Krever LilyPond, FluidSynth, ffmpeg og Python med `pretty_midi` (`brew install lilypond fluid-synth ffmpeg`, `pip install pretty_midi`), og lydfonten FluidR3_GM.sf2.

```bash
lilypond noter.ly                                # → noter.pdf
lilypond lyd-ovetempo.ly                         # → lyd-ovetempo.midi (samme for nedtelling og effekter)
python3 scripts/postprocess.py ovetempo lyd-ovetempo.midi ovetempo.mid   # staccato og dynamikk
fluidsynth -ni -F ovetempo.wav FluidR3_GM.sf2 ovetempo.mid
ffmpeg -i ovetempo.wav -af loudnorm=I=-16:TP=-1.5 -qscale:a 2 ovetempo.mp3
```

`musikk.ly` har selve notene. `noter.ly` setter dem på papir, `lyd-*.ly` lager MIDI. Modusene i `postprocess.py` er `ovetempo`, `nedtelling` (crescendo) og `effekter` (pitch bend på trombonen).
