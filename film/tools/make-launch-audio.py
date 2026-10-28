"""Synthesizes the v2 "Launch" score (120 BPM, 48 s) as stems in public/audio, using FFmpeg's aevalsrc.

Run with: python3 tools/make-launch-audio.py   (needs ffmpeg on PATH; . ~/.local/opt/env.sh)
Bar = 2 s. Progression Dm - Bb - F - C, resolving to D major from 40 s.
"""
import os
import subprocess

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'audio')
D = 48
FINALE = 40

def pick(idx, values):
    """Nested if() selecting values[idx]."""
    e = str(values[-1])
    for i in range(len(values) - 2, -1, -1):
        e = f'if(eq({idx},{i}),{values[i]},{e})'
    return e

CH = 'mod(floor(t/2),4)'
def chord_tone(n):
    loop = [[146.83, 174.61, 220.00], [116.54, 146.83, 174.61], [174.61, 220.00, 261.63], [130.81, 164.81, 196.00]]
    final = [146.83, 185.00, 220.00]
    return f'if(gte(t,{FINALE}),{final[n]},{pick(CH, [c[n] for c in loop])})'

ROOT = f'if(gte(t,{FINALE}),73.42,{pick(CH, [73.42, 58.27, 87.31, 65.41])})'

def render(name, expr, af='anull'):
    graph = f"aevalsrc=exprs='{expr}':s=48000:d={D},{af},aformat=channel_layouts=stereo[a]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-filter_complex', graph, '-map', '[a]', os.path.join(OUT, f'launch-{name}.wav')], check=True)
    print('ok', name)

os.makedirs(OUT, exist_ok=True)

# Kick: four on the floor from the drop (6 s) to the finale (40 s).
kb = 'mod(t,0.5)'
render('kick', f'between(t,6,{FINALE}-0.01)*sin(2*PI*(48+110*exp(-35*{kb}))*{kb})*exp(-7*{kb})*0.95')

# Hats: offbeat noise ticks plus quieter 16ths after the first chorus.
h8 = 'mod(t-0.25,0.5)'
h16 = 'mod(t,0.125)'
render('hats', f'(random(0)*2-1)*(between(t,6,{FINALE})*0.5*exp(-55*{h8})+between(t,14,{FINALE})*0.16*exp(-90*{h16}))',
       'highpass=f=6500')

# Bass: root with sidechain-style pump on every beat.
pump = 'min(1,mod(t,0.5)*5)'
render('bass', f'between(t,6,{D})*({pump}*lt(t,{FINALE})+gte(t,{FINALE})*exp(-0.5*(t-{FINALE})))*(0.6*sin(2*PI*{ROOT}*t)+0.25*sin(4*PI*{ROOT}*t))',
       'lowpass=f=400')

# Arp: 16th-note plucks walking the chord tones an octave up.
step = 'mod(floor(t*8),4)'
tau = 'mod(t,0.125)'
note = f'2*{pick(step, [chord_tone(0), chord_tone(1), chord_tone(2), chord_tone(1)])}'
render('arp', f'between(t,3,{FINALE}+2)*exp(-16*{tau})*(sin(2*PI*{note}*{tau})+0.45*sin(4*PI*{note}*{tau})+0.2*sin(6*PI*{note}*{tau}))*0.35',
       'lowpass=f=5000,aecho=0.7:0.5:375|250:0.35|0.25')

# Pad: sustained chord, slow swell, always on.
pad = '+'.join(f'sin(2*PI*{chord_tone(n)}*t)+0.5*sin(2*PI*{chord_tone(n)}*1.003*t)' for n in range(3))
render('pad', f'({pad})*0.07*(0.8+0.2*sin(2*PI*0.25*t))', 'lowpass=f=1800,aecho=0.8:0.7:200|310:0.3|0.25')

# Risers into the drop (4-6 s) and into the finale (38-40 s).
def riser(a, b):
    u = f'((t-{a})/{b - a})'
    return f'between(t,{a},{b})*{u}*{u}*(0.5*(random(1)*2-1)+0.4*sin(2*PI*(200*(t-{a})+600*(t-{a})*(t-{a}))))'
render('riser', f'({riser(4, 6)}+{riser(38, 40)})*0.6', 'highpass=f=300')
