\version "2.24.3"
\language "english"   % cs = C#, ds = D#, fs = F#, gs = G#, bf = Bb

global = { \key a \minor \time 4/4 }

% ---------------- I Dovregubbens hall (forenklet, a-moll) ----------------
% Høyre hånd, del A (med fingersetting første gang)
rhAf = \fixed c' {
  a8^1 b^2 c'^3 d'^4 e'^5 c'^3 e'4^5 |
  ds'8^4 b^2 ds'4^4 d'8^4 bf^2 d'4^4 |
  a8^1 b^2 c'^3 d'^1 e'^2 c'^1 e'^2 a'^5 |
  g'8^4 e'^2 c'^1 e'^2 g'2^4 |
}
rhA = \fixed c' {
  a8 b c' d' e' c' e'4 |
  ds'8 b ds'4 d'8 bf d'4 |
  a8 b c' d' e' c' e' a' |
  g'8 e' c' e' g'2 |
}
% Høyre hånd, del B
rhBf = \fixed c' {
  e'8^1 fs'^2 gs'^3 a'^4 b'^5 gs'^3 b'4^5 |
  c''8^5 gs'^2 c''4^5 b'8^4 gs'^2 b'4^4 |
  e'8^1 fs' gs' a' b' gs' b'4 |
  c''8^5 gs' c''4 b'2 |
}
rhB = \fixed c' {
  e'8 fs' gs' a' b' gs' b'4 |
  c''8 gs' c''4 b'8 gs' b'4 |
  e'8 fs' gs' a' b' gs' b'4 |
  c''8 gs' c''4 b'2 |
}
rhEnd = \fixed c' { <a c' e' a'>4-> r4 r2 }

% Venstre hånd: samme kvint på hvert slag
lhA = \fixed c { <a, e>4 q q q | q q q q | q q q q | q q q q | }
lhB = \fixed c { <e, b,>4 q q q | q q q q | q q q q | q q q q | }
lhEnd = \fixed c { <a,, a,>4-> r4 r2 }

% ---------------- Lydeffekter ----------------
fanfareRH = { c'16 e' g' c'' <c' e' g' c''>2.\fermata }
fanfareLH = { r4 <c, c>2.\fermata }

tromboneRH = { r4 g'4 fs' f' | e'1\bendAfter #-4 \fermata }

glissRH = { c'2\glissando c'''4-> r4 }
% For lydfilen: glissandoen skrevet ut som raske hvite tangenter
glissMidi = { \tuplet 14/8 { c'32 d' e' f' g' a' b' c'' d'' e'' f'' g'' a'' b'' } c'''4-> r2 }

tremoloLH = { \repeat tremolo 16 { c,32\pp\< cs, } | \repeat tremolo 16 { c,32 cs, } | c,4\ff-> r4 r2 }
tremoloNames = { c,2 cs, | c, cs, | c,4 r4 r2 }
