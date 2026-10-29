"""Synthesizes the 10 s opening's music bed as stems in public/audio, using FFmpeg's aevalsrc.

Run with: python3 tools/make-opening-audio.py   (needs ffmpeg on PATH; . ~/.local/opt/env.sh)
Kept soft so a voiceover sits on top. It is in Bb, the chord the v3/v4 score opens on, so the cut into
the film is seamless; it ends on a riser that lands on v4's first frame.
"""
import os
import subprocess

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'audio')
D = 10
FPS = 30

def render(name, expr, af='anull'):
    graph = f"aevalsrc=exprs='{expr}':s=48000:d={D},{af},aformat=channel_layouts=stereo[a]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-filter_complex', graph, '-map', '[a]', os.path.join(OUT, f'opening-{name}.wav')], check=True)
    print('ok', name)

os.makedirs(OUT, exist_ok=True)

# Pad: Bb add9, slow attack, opens up as the core blooms (6.5 s).
chord = [116.54, 146.83, 174.61, 261.63]
pad = '+'.join(f'sin(2*PI*{f}*t)+0.5*sin(2*PI*{f}*1.004*t)' for f in chord)
render('pad', f'({pad})*0.05*min(1,t/1.5)*(0.7+0.3*min(1,max(0,(t-6.5)/1.5)))', 'lowpass=f=2200,aecho=0.8:0.7:240|360:0.35|0.3')

# Plucks: one note per photo as it lands (frames 6..61), then a rising chime per photo absorbed (frames 105..150).
def pluck(at_frame, hz, amp=0.35, decay=6):
    a = at_frame / FPS
    u = f'(t-{a})'
    return f'gte(t,{a})*{amp}*exp(-{decay}*{u})*(sin(2*PI*{hz}*{u})+0.3*sin(4*PI*{hz}*{u}))'
land = [349.23, 466.16, 523.25, 587.33, 698.46, 932.33]
chime = [587.33, 698.46, 783.99, 932.33, 1046.5, 1174.66]
notes = [pluck(6 + i * 11, hz) for i, hz in enumerate(land)] + [pluck(105 + i * 9, hz, 0.22, 4) for i, hz in enumerate(chime)]
render('plucks', '+'.join(notes), 'aecho=0.7:0.5:300|450:0.35|0.25')

# Bloom + riser: a soft swell when the screen opens, then noise and a pitch sweep into the film.
swell = 'between(t,6.3,8)*sin(PI*(t-6.3)/1.7)*0.25*sin(2*PI*58.27*t)'
u = '((t-7.4)/2.6)'
riser = f'between(t,7.4,10)*{u}*{u}*(0.45*(random(0)*2-1)+0.35*sin(2*PI*(150*(t-7.4)+500*(t-7.4)*(t-7.4))))'
render('rise', f'{swell}+{riser}', 'highpass=f=60')
