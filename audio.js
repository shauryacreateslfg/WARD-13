const SFX = (() =>{
    let C=null;
    let M=null;
    let droneNodes =[];
    let muted = false;

    function boot() {
        if(C) return;
        C=new (window.AudioContext||window.webkitAudioContext)();
        M=C.createGain();
        M.gain.value=0.55;
        M.connect(C.destination);
    }

    function wake() {C?.state ==='suspended' && C.resume();}

    function noise(secs=2) {
        const b= C.createBuffer(1,C.sampleRate*secs,C.sampleRate);
        const d=b.getChannelData(0);
        for(let i=0; i<d.length;i++) d[i]=Math.random()*2-1;
        return b;
    }

    function distCurve(amt=200) {
        const c=new Float32Array(256);
        for(let i=0;i<256;i++) {
            const x=(i*2)/256-1;
            c[i] =(Math.PI + amt)*x / (Math.PI + amt*Math.abs(x));
        }
        return c;
    }

    function chime(){
        if(!C||muted) return; wake();
        [523.25,392].forEach((f,i)=>{
            const o=C.createOscillator(),g=C.createGain();
            o.type='sine'; o.frequency.value =f;
            const t=C.currentTime +i*0.22;
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.18, t+0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t+1.6);
            o.connect(g); g.connect(M);
            o.start(t); o.stop(t+1.7);
        });
    }

    function heartbeat(count =4,irregular=false) {
        if(!C||muted) return; wake();
        let offset=0;
        for(let i=0; i<count;i++) {
            const gap = irregular
              ?  (Math.random() <0.25 ? 1.4: 0.5+ Math.random()*0.6)
              : 0.75;
            offset +=gap;
            const t =C.currentTime + offset;
            const o =C.createOscillator(),g=C.createGain();
            o.type='sine';o.frequency.value =1200;
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.22, t + 0.015);
            g.gain.exponentialRampToValueAtTime(0.001,t +0.10);
            o.connect(g); g.connect(M);
            o.start(t);o.stop(t+0.12);
        }
    }

    function flatline(duration =3) {
        if(!C || muted) return; wake();
        const t=C.currentTime;
        const o=C.createOscillator(),g=C.createGain();
        o.type='sine';
        o.frequency.setValueAtTime(880,t);
        o.frequency.linearRampToValueAtTime(20, t+duration);
        g.gain.setValueAtTime(0.25,t);
        g.gain.exponentialRampToValueAtTime(0.001, t+duration+0.2);
        o.connect(g); g.connect(M);
        o.start(t); o.stop(t+duration+0.3);
    }

    function startDrone(){
        if(!C||droneNodes.length) return; wake();
        const t=C.currentTime;

        const hissGain=C.createGain(); hissGain.gain.value=0;
        hissGain.gain.linearRampToValueAtTime(0.065, t+6);
        const hissSrc =C.createBufferSource();hissSrc.buffer =noise(4); hissSrc.loop=true;
        const hissBP =C.createBiquadFilter(); hissBP.type='bandpass'; hissBP.frequency.value=1800;hissBP.Q.value=0.4;hissSrc.connect(hissBP); hissBP.connect(hissGain);hissGain.connect(M);hissSrc.start();

        const subGain=C.createGain();subGain.gain.value=0;
        subGain.gain.linearRampToValueAtTime(0.18, t +8);[36,39.5].forEach(f=>{
            const o=C.createOscillator(); o.type='sawtooth';o.frequency.value=f;
            o.connect(subGain); o.start();
            droneNodes.push(o);
        });
        subGain.connect(M);

        const lfo=C.createOscillator(),lfoG=C.createGain();
        lfo.frequency.value=0.09; lfoG.gain.value=0.04;
        lfo.connect(lfoG); lfoG.connect(subGain.gain);
        lfo.start(); droneNodes.push(lfo);

        const midGain =C.createGain(); midGain.gain.value=0;
        midGain.gain.linearRampToValueAtTime(0.07, t+10);
        const mid=C.createOscillator(); mid.type='sine'; mid.frequency.value=146.8;
        const midRev=C.createBiquadFilter(); midRev.type='peaking';midRev.frequency.value=150; midRev.gain.value=8;
        mid.connect(midRev);midRev.connect(midGain);midGain.connect(M);
        mid.start(); droneNodes.push(mid);

        droneNodes.push(hissSrc,subGain,midGain,hissGain);
    }

    function staticBurst(vol= 0.4, dur=0.25) {
        if(!C|| muted) return; wake();
        const src =C.createBufferSource(); src.buffer =noise(dur +0.1);
        const g=C.createGain();
        g.gain.setValueAtTime(vol,C.currentTime);
        g.gain.linearRampToValueAtTime(0,C.currentTime+dur);
        src.connect(g); g.connect(M);
        src.start();src.stop(C.currentTime + dur +0.05);
    }

    function whisper(vol=0.3) {
        if(!C ||muted) return; wake();
        const t=C.currentTime;
        const src=C.createBufferSource(); src.buffer=noise(3);
        const bp=C.createBiquadFilter();bp.type='bandpass'; bp.frequency.value=800;bp.Q.value=14;
        const lfo=C.createOscillator(),lfoG=C.createGain();
        lfo.frequency.value=3.8; lfoG.gain.value=380;
        lfo.connect(lfoG); lfoG.connect(bp.frequency);
        const g =C.createGain();
        g.gain.setValueAtTime(0,t);
        g.gain.linearRampToValueAtTime(vol, t+0.4);
        g.gain.linearRampToValueAtTime(0, t+3);
        lfo.start(t); lfo.stop(t+3);
        src.connect(bp); bp.connect(g); g.connect(M);
        src.start(t); src.stop(t +3.1);
    }

    function scream() {
        if(!C || muted) return; wake();
        staticBurst(1.0,0.8);
        const t=C.currentTime;
        const o=C.createOscillator(); o.type='sawtooth';
        o.frequency.setValueAtTime(2200,t);
        o.frequency.exponentialRampToValueAtTime(80,t +0.7);
        const dist=C.createWaveShaper();dist.curve=distCurve(400);
        const g=C.createGain();
        g.gain.setValueAtTime(0.9,t);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.75);
        o.connect(dist); dist.connect(g); g.connect(M);
        o.start(t); o.stop(t + 0.8);
        subThud(t +0.05);
    }

    function subThud(when=null){
        if(!C || muted) return; wake();
        const t=when??C.currentTime;
        const o=C.createOscillator();o.type='sine';
        o.frequency.setValueAtTime(90,t);
        o.frequency.exponentialRampToValueAtTime(20,t+0.3);
        const g=C.createGain();
        g.gain.setValueAtTime(1.0,t);
        g.gain.exponentialRampToValueAtTime(0.001,t + 0.35);
        o.connect(g); g.connect(M);
        o.start(t); o.stop(t+0.4);
    }

    function creak(){
        if(!C||muted) return; wake();
        const t=C.currentTime;
        const o=C.createOscillator();o.type='sawtooth';
        o.frequency.setValueAtTime(190,t);
        o.frequency.linearRampToValueAtTime(70,t+1.0);
        o.frequency.linearRampToValueAtTime(130,t+1.5);
        const bp=C.createBiquadFilter(); bp.type='peaking';bp.frequency.value=280; bp.gain.value=14;
        const g =C.createGain();
        g.gain.setValueAtTime(0.22,t);
        g.gain.exponentialRampToValueAtTime(0.001, t+1.7);
        o.connect(bp); bp.connect(g); g.connect(M);
        o.start(t); o.stop(t+1.8);
    }

    function phoneRing(rings = 2) {
        if(!C||muted) return;wake();
        for (let i =0;i<rings;i++) {
            const base= C.currentTime + i*1.8;
            [480,620].forEach(f=>{
                const o =C.createOscillator(),g=C.createGain();
                o.type ='square'; o.frequency.value=f;
                g.gain.setValueAtTime(0,base); g.gain.linearRampToValueAtTime(0.14,base + 0.05);
                g.gain.setValueAtTime(0.14,base +0.4);
                g.gain.linearRampToValueAtTime(0,base + 0.45);
                g.gain.setValueAtTime(0.14,base + 0.55);
                g.gain.linearRampToValueAtTime(0,base+1.0);
                o.connect(g); g.connect(M);
                o.start(base); o.stop(base + 1.1);
            });
        }
    }

    function bpCuff(){
        if(!C|| muted) return; wake();
        for(let i=0; i<5;i++){
            const t=C.currentTime+i*0.28;
            const src= C.createBufferSource(); src.buffer=noise(0.12);
            const lp=C.createBiquadFilter(); lp.type='lowpass';lp.frequency.value=600;
            const g=C.createGain();
            g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
            src.connect(lp); lp.connect(g); g.connect(M);
            src.start(t);src.stop(t+0.15);
        }
    }
    return{ boot,chime,heartbeat, flatline, startDrone,
           staticBurst, whisper, scream, subThud, creak,
           phoneRing, bpCuff,
           mute: v => { muted = v; if (M) M.gain.value = v ? 0 : 0.55; } };
})();