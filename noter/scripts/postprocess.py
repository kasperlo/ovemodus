import sys, math
import pretty_midi as pm

def load(p):
    m = pm.PrettyMIDI(p)
    return m

def staccato(m, frac=0.55, keep_last=True):
    end_all = max(n.end for i in m.instruments for n in i.notes)
    for inst in m.instruments:
        for n in inst.notes:
            if keep_last and abs(n.end - end_all) < 1e-3 or (keep_last and n.end > end_all - 2.5 and n.start >= max(x.start for x in inst.notes) - 1e-3):
                continue
            n.end = n.start + (n.end - n.start) * frac

def velocity_flat(m, rh=82, lh=62):
    # instrument with highest mean pitch = RH
    insts = sorted(m.instruments, key=lambda i: -sum(n.pitch for n in i.notes)/len(i.notes))
    for n in insts[0].notes: n.velocity = rh
    for i in insts[1:]:
        for n in i.notes: n.velocity = lh

def velocity_ramp(m, rh=(52, 118), lh=(40, 100)):
    T = max(n.end for i in m.instruments for n in i.notes)
    insts = sorted(m.instruments, key=lambda i: -sum(n.pitch for n in i.notes)/len(i.notes))
    for k, inst in enumerate(insts):
        lo, hi = rh if k == 0 else lh
        for n in inst.notes:
            n.velocity = int(lo + (hi - lo) * (n.start / T) ** 0.8)

def trombone_bends(m):
    for inst in m.instruments:
        if inst.program != 57:  # GM trombone = program 58 (0-based 57)
            continue
        notes = sorted(inst.notes, key=lambda n: n.start)
        for idx, n in enumerate(notes):
            inst.pitch_bends.append(pm.PitchBend(0, n.start))
            d = n.end - n.start
            last = idx == len(notes) - 1
            steps = 40
            if not last:
                t0 = n.start + d * 0.55
                for s in range(steps + 1):
                    t = t0 + (n.end - t0) * s / steps
                    inst.pitch_bends.append(pm.PitchBend(int(-1400 * (s / steps) ** 1.5), t))
            else:
                n.end = n.start + d * 1.0
                t0 = n.start + 0.35
                for s in range(steps * 3 + 1):
                    t = t0 + (n.end - t0) * s / (steps * 3)
                    frac = s / (steps * 3)
                    vib = 900 * math.sin(2 * math.pi * 5.5 * (t - t0)) * min(1, frac * 3)
                    drop = -5200 * frac ** 2
                    inst.pitch_bends.append(pm.PitchBend(int(max(-8192, min(8191, drop + vib))), t))
        inst.pitch_bends.append(pm.PitchBend(0, notes[-1].end + 0.05))

mode, src, dst = sys.argv[1:4]
m = load(src)
if mode == "ovetempo":
    staccato(m); velocity_flat(m)
elif mode == "nedtelling":
    staccato(m); velocity_ramp(m)
elif mode == "effekter":
    trombone_bends(m)
m.write(dst)
print(mode, "instruments:", [(i.program, len(i.notes)) for i in m.instruments], "dur %.1fs" % m.get_end_time())
