"""Synthesizes the v3 "Genesis" score (120 BPM, 48 s) as stems in public/audio, using FFmpeg's aevalsrc.

Run with: python3 tools/make-genesis-audio.py   (needs ffmpeg on PATH; . ~/.local/opt/env.sh)
Bar = 2 s. Progression Bb - F - C - Dm (darker, wider than v2), D major lift in the finale.
Sections: 0-6 build, 6 drop (sub drop), 22-34 warp reel (double-time hats), 40 implosion, 44 final hit.
"""
import os
import subprocess

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'audio')
D = 48
DROP = 6
FINALE = 40

def pick(idx, values):
    e = str(values[-1])
    for i in range(len(values) - 2, -1, -1):
        e = f'if(eq({idx},{i}),{values[i]},{e})'
    return e

CH = 'mod(floor(t/2),4)'
LOOP = [[116.54, 146.83, 174.61], [174.61, 220.00, 261.63], [130.81, 164.81, 196.00], [146.83, 174.61, 220.00]]
FINAL = [146.83, 185.00, 220.00]
ROOTS = [58.27, 43.65, 65.41, 73.42]

def tone(n):
    return f'if(gte(t,{FINALE}),{FINAL[n]},{pick(CH, [c[n] for c in LOOP])})'

ROOT = f'if(gte(t,{FINALE}),73.42,{pick(CH, ROOTS)})'
# Deterministic hash of the current 16th step, in [0,1).
H16 = '(sin(floor(t*8)*12.9898)*43758.5453-floor(sin(floor(t*8)*12.9898)*43758.5453))'

def render(name, expr, af='anull'):
    graph = f"aevalsrc=exprs='{expr}':s=48000:d={D},{af},aformat=channel_layouts=stereo[a]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-filter_complex', graph, '-map', '[a]', os.path.join(OUT, f'genesis-{name}.wav')], check=True)
    print('ok', name)

os.makedirs(OUT, exist_ok=True)

# Kick with a long sub tail, plus a pitch-dive sub drop on the drop and the finale.
kb = 'mod(t,0.5)'
kick = f'between(t,{DROP},{FINALE}-0.01)*sin(2*PI*(45+130*exp(-40*{kb}))*{kb})*exp(-6*{kb})'
def subdrop(a):
    u = f'(t-{a})'
    return f'between(t,{a},{a}+2.5)*sin(2*PI*(30*{u}+40*(1-exp(-1.5*{u}))/1.5))*exp(-1.1*{u})'
render('kick', f'({kick}+{subdrop(DROP)}+{subdrop(FINALE + 4)})*0.95')

# Hats: offbeats, 16ths from bar 7, 32nd rolls during the warp reel.
h8 = 'mod(t-0.25,0.5)'
h16 = 'mod(t,0.125)'
h32 = 'mod(t,0.0625)'
render('hats',
       f'(random(0)*2-1)*(between(t,{DROP},{FINALE})*0.5*exp(-60*{h8})+between(t,14,{FINALE})*0.15*exp(-100*{h16})+between(t,22,34)*0.12*exp(-140*{h32}))',
       'highpass=f=7000')

# Reese bass: detuned harmonic stacks, pumped on the beat.
pump = 'min(1,mod(t,0.5)*4)'
reese = '+'.join(f'{1 / n:.3f}*(sin(2*PI*{n}*{ROOT}*t)+sin(2*PI*{n}*{ROOT}*1.012*t))' for n in range(1, 6))
render('bass', f'between(t,{DROP},{D})*({pump}*lt(t,{FINALE})+gte(t,{FINALE}+4)*exp(-0.4*(t-{FINALE}-4)))*({reese})*0.22',
       'lowpass=f=700')

# Arp: 16th plucks; octave jumps on every 4th step.
step = 'mod(floor(t*8),8)'
tau = 'mod(t,0.125)'
note = pick(step, [f'2*{tone(0)}', f'2*{tone(1)}', f'2*{tone(2)}', f'4*{tone(0)}', f'2*{tone(2)}', f'2*{tone(1)}', f'4*{tone(1)}', f'2*{tone(2)}'])
render('arp', f'between(t,2,{FINALE})*exp(-18*{tau})*(sin(2*PI*{note}*{tau})+0.5*sin(4*PI*{note}*{tau})+0.25*sin(6*PI*{note}*{tau}))*0.3',
       'lowpass=f=6000,aecho=0.7:0.5:375|250:0.35|0.25')

# Data blips: sparse, pitched from the hash, like telemetry.
blip_note = f'(880+880*floor({H16}*4)/2)'
render('blips', f'between(t,1,{FINALE}+6)*gt({H16},0.62)*exp(-45*{tau})*sin(2*PI*{blip_note}*{tau})*0.22',
       'aecho=0.6:0.4:250:0.3')

# Pad: wide chord with slow swell; brighter in the finale.
pad = '+'.join(f'sin(2*PI*{tone(n)}*t)+0.6*sin(2*PI*{tone(n)}*1.004*t)+0.3*sin(4*PI*{tone(n)}*t)' for n in range(3))
render('pad', f'({pad})*0.06*(0.75+0.25*sin(2*PI*0.25*t))', 'lowpass=f=2400,aecho=0.8:0.7:220|330:0.35|0.3')

# FX: risers into 6 s and 40 s, glitch stutters on the chapter cuts, an implosion suck at 42-44 s.
def riser(a, b):
    u = f'((t-{a})/{b - a})'
    return f'between(t,{a},{b})*{u}*{u}*(0.5*(random(1)*2-1)+0.4*sin(2*PI*(180*(t-{a})+700*(t-{a})*(t-{a}))))'
def stutter(a):
    return f'between(t,{a}-0.25,{a})*gt(mod(t*32,1),0.5)*(random(2)*2-1)*0.5'
suck = f'between(t,{FINALE}+2.5,{FINALE}+4)*pow((t-{FINALE}-2.5)/1.5,3)*(random(3)*2-1)*0.7'
fx = '+'.join([riser(3, DROP), riser(37, FINALE)] + [stutter(a) for a in (10, 16, 22, 34)] + [suck])
render('fx', f'({fx})*0.6', 'highpass=f=250')
