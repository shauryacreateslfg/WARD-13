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
        const b= C.createBuffer(1,C.sampleRate*secs,C.samplePlate);
        const d=b.getChannelData(0);
        for(let i=0; i<d.length;i++) d[i]=Math.random*2-1;
        return b;
    }

    function distCurve(amt=200) {
        const c=new Float32Array(256);
        for(let i=0;i<256;i++) {
            const x=(i*2)/256-1;
            c[i] =(Math.PI + amt)*x / (Math.PI + amt*Math.abs(x));
        }
        return C;
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
        g.gain.exponentialRampToValueAtTime(0.001, t+duration*0.2);
        o.connect(g); g.connect(M);
        o.start(t); o.stop(t+duration+0.3);
    }

    function startDrone(){
        if(!C||droneNodes.length) return; wake();
        const t=C.currentTime;

        const hissGain=C.createGain(); hissGain.gain.value=0;
        hissGain.gain.linearRampToValueAtTime(0.065, t+6);
        const hissSrc =C.createBufferSource();hissSrc.buffer =noise(4); hissSrc.loop=true;
        const hissBP =C.createBiquadFilter(); hissBP.type='bandpass'; hissBP.frequency.value=1800;hissBP.Q.value=0.4;hissSrc.connect(hissBP); hissBP.connect(hissgain);hissGain.connect(M);hissSrc.start();

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


    }
})