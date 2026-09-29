const ward =(() => {

    const S = {
        name:'',dob:'',reason:'',contact:'',relation:'',history:'',
        step:0,
        scaresLeft:3,
        ambientRunning: false,
        titleInterval: null,
        figureVisible: false,
        lastInteraction: Date.now(),
    };

    const $ = id => document.getElementById(id);
    const body = document.body;

    const FACES = [
        {
            art: `
    ▄████████████████████▄
    █▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀█
    █░░░░░░░░░░░░░░░░░░░░█
    █░░▄██████████████▄░░█
    █░░██▀░░░░░░░░░▀██░░█
    █░░█░░▄▄░░░░▄▄░░█░░░█
    █░░█░░▀█░░░░█▀░░█░░░█
    █░░██▄░▀████▀░▄██░░░█
    █░░░▀████████████▀░░░█
    █░░░░░░░░░░░░░░░░░░░░█
    ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀` ,
            text:`room 13b has your chart`
        },
        {
            art: `
    ████████████████████████
    ██░░░░░░░░░░░░░░░░░░░██
    ██░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░██
    ██░░█░░░░░░░░░░░░█░░░██
    ██░░█░▄▀▄░░░░▄▀▄░█░░░██
    ██░░█░░░░░░░░░░░░█░░░██
    ██░░█░░░░▄▄▄░░░░░█░░░██
    ██░░█░░▄█████▄░░░█░░░██
    ██░░▀▀▀▀▀▀▀▀▀▀▀▀▀▀░░██
    ██░░░░░░░░░░░░░░░░░░░██
    ████████████████████████`,
            text:`you checked yourself in`
        },
        {
            art: `
    ░░░░░▄████████▄░░░░░░
    ░░░▄██▀░░░░░░░▀██▄░░░
    ░░██░░░░▄▄░░▄▄░░░██░░
    ░██░░░░░██░░██░░░░██░
    ░██░░░░░░░░░░░░░░░██░
    ░██░░▄▄░░░░░░░▄▄░░██░
    ░░██░▀▀█████████▀░██░░
    ░░░███░░░░░░░░░███░░░
    ░░░░░▀▀████████▀▀░░░░`, 
            text:`you've been here before`
        },
        {
            art: `
    ██╗    ██╗ █████╗ ██████╗ ██████╗
    ██║    ██║██╔══██╗██╔══██╗██╔══██╗
    ██║ █╗ ██║███████║██████╔╝██║  ██║
    ██║███╗██║██╔══██║██╔══██╗██║  ██║
    ╚███╔███╔╝██║  ██║██║  ██║██████╔╝
     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
              ██╗██████╗
              ██║╚════██╗
              ██║ █████╔╝
              ██║ ╚═══██╗
              ██║██████╔╝
              ╚═╝╚═════╝`,
            text: ` DO NOT LEAVE`
        },
    ];


    const NURSE = [
        { txt: `Thank you for beginning the form. A coordinator is reviewing you intake.`, type:'normal', delay:3000},
        { txt: `we noticed the name field was completed quickly. Please ensure it is accurate.`,type:'normal' , delay:5000},
        { txt: `your file has been flagged for overnight observation. Please remain in the building.`, type:'warning', delay:5000},
        { txt: `we located an existing record under your date of birth.Admission logged:[DATE].`,type:'warning',delay:6000 },
        { txt: s =>`${s.contact} has already been contacted. They were informed you may not return.`, type:'danger' , delay: 5000},
        { txt: `Hi there. Just a reminder to complete all fields. Have a good night.`, type:'danger' , delay:4000},
        { txt: `please stop trying to close the window. We can see when you try.`, type:'danger' , delay:3500},
        { txt: s=> `${s.name}. Room 13B. Tonight.`, type:'danger' , delay:2500},
    ];
    let titleIdx =0;
    let nurseIdx = 0;
    let nurseTimer = null;
 
    const TITLES = [
        `St. Maren's Hospital — Patient Intake`,
        `St. Maren's Hospital — Patient Intake`,
        `St. Maren's Hospital — Patient Intake`,
        `you left a tab open`,
        `St. Maren's Hospital — Patient Intake`,
        `she can see this tab`,
        `St. Maren's Hospital — Patient Intake`,
        `WARD 13 — DO NOT CLOSE`,
        `St. Maren's Hospital — Patient Intake`,
    ];

    function begin() {
        SFX.boot(); SFX.chime();
        flicker(() => {
            $('pg-landing').classList.add('hidden');
            $('pg-form').classList.remove('hidden');
            SFX.startDrone();
            SFX.heartbeat(3, false);
            showStep(0);
            setProgress(5,'normal');
            startAmbientEvents();
            scheduleRandomPhotoScares();

        });
    }

    function showStep(n) {
        document.querySelectorAll('.ward-step').forEach(s => s.classList.add('hidden'));
        $(`s${n}`)?.classList.remove('hidden');
        S.step = n;
        const inp =$(`s${n}`)?.querySelector('input,textarea');
        if (inp) setTimeout(() => inp.focus(), 120);
    }

    function advance(next) {
        const validators ={
            0:() => {S.name=$('f-name')?.value.trim(); return!!S.name;},
            1:() =>{S.dob=$('f-dob')?.value.trim(); return!!S.dob;},
            2:() =>{S.reason =$('f-reason')?.value.trim(); return!!S.reason;},
            3:() =>{S.contact=$('f-contact')?.value.trim(); 
                S.relation=$('f-relation')?.value.trim();
                return!!(S.contact && S.relation);
            },
            4: () => {S.history= document.querySelector('input[name="hist"]:checked')?.value || ''; return!!S.history; },
            5: () => true,
         };

         if (!(validators[S.step]?.())) {
            shakeStep();
            SFX.staticBurst(0.2,0.1);
            return;
         }

         const hooks = {
            1: step1Horror,
            2: step2Horror,
            3: step3Horror,
            4: step4Horror,
            5: () => {step5Horror(); return; },
            6: () => {finalSequence(); return; },
         };

         const fn = hooks[next];
         if (fn) {
            fn();
         } else {
            showStep(next);
         }
    }
    
    function step1Horror(){
        setProgress(18, 'normal');
        SFX.chime();
        showStep(1);
        setTimeout(() => {
            const hint =$('dob-hint');
            if (hint) typeCorruptThenFix(hint,`we already have your date of birth on file, ${S.name}.`);
        },2200);
    }

    function step2Horror() {
        setProgress(36, 'normal');
        showStep(2);
        setTimeout(() =>{
            const f = $('f-dob');
            if (!f) return;
            SFX.staticBurst(0.12,0.08);
            const orig = f.value;
            f.classList.add('input-writhe');
            f.value = corruptStr(orig);
            setTimeout(() => {
                f.value = orig;
                f.classList.remove('input-writhe');
            },2000);
        },1000);
    }

    function step3Horror() {
        setProgress(52,'normal');
        SFX.bpCuff();
        showStep(3);
        setTimeout(() =>{
            const hint=$('contact-hint');
            if (hint) typeCorruptThenFix(hint,`They will be told you can't come home.`);
        },3000);
        setTimeout(startNurseFeed,2500);
    }

    function step4Horror() {
        setProgress(68, 'warning');
        showStep(4);
        SFX.heartbeat(2, true);
        setTimeout(() => {
            SFX.phoneRing(2);
            setTimeout(() =>{
                appendNurse(`someone just called the ward desk asking for you.They wouldn't leave their name.`,'danger');
                SFX.whisper();
            },3800);   
        },2000);

        setTimeout(() =>{
            const unsure=$('opt-unsure');
            if(unsure) {
                const lbl =unsure.querySelector('input + *') || unsure;
                setTimeout(() => typeCorruptThenFix(lbl.lastChild || lbl, `I think i have been here before`),3000);
            }
        }, 1500);
    }

    function step5Horror() {
        setProgress(82,'danger');
        showStep(5);
        body.classList.add('dim-pulse');
        $('ov-vignette').className = 'fixed inset-0 z-[901] pointer-events-none vignette-danger transition-all duration-1000';
       
        setTimeout(() => {
            const lbl =$('s5-label');
            if (lbl) typeCorruptThenFix(lbl,`Confirm you're ${S.name}`);
            
        }, 600);

        setTimeout(() =>{
            const f=$('f-confirm');
            if (!f) return;
            f.value = ''; f.placeholder= '';
            SFX.staticBurst(0.18,0.15);
            typeIntoField(f, corruptStr(S.name), () => {
                f.classList.add('input-writhe');
                setTimeout(() => {
                    SFX.staticBurst(0.1,0.08);
                    f.value =S.name;
                    f.classList.remove('input-writhe');
                    setTimeout(() =>showStaffNote(
                        `Patient: ${S.name} · DOB: ${S.dob}\n` +
                        `Prior admission record found. Date of prior admission: the night of ${S.dob}.\n` +
                        `Status on discharge: [REDACTED]\n` +
                        `Ward 13 assigned. Contact ${S.contact} (${S.relation}) — notification DECLINED.\n` +
            
                        `Note from duty nurse: "Do not let this one leave."`

                    ),1200);
                },1800);
            });
        },2000);
    }

    function showStaffNote(text) {
        const box =$('staff-note'), el= $('staff-note-text');
        if (!box || !el) return;
        box.classList.remove('hidden') ;
        el.textContent = '';
        SFX.creak();
        typeText(el, text,22,() => {
            body.classList.add('tinge-red');
            scheduleJumpscare(3500);
        });
    }

    function  finalSequence() {
        setProgress(100, 'danger');
        showStep(6);
        SFX.flatline(3);
        stopNurseFeed();

        const feed=$('nurse-feed');
        if (feed) feed.classList.add('hidden');

        const container =$('final-lines');
        if (!container) return;
        
        const lines =[
            { t: 0,txt:`Form ST-13B — processing complete.` },
            { t: 1800,txt: `Patient: ${S.name}` },
            { t: 3200,txt: `DOB: ${S.dob}` },
            { t: 4400,txt: `Reason for visit: ${S.reason}` },
            { t: 5800,txt: `` },
            { t: 6200,txt: `Ward 13 has been expecting you, ${S.name}.`,red: true },
            { t: 7800,txt: `` },
            { t: 8200,txt: `${S.contact} was informed.`, red: true },
            { t: 9400,txt: `They did not respond.`, red: true },
            { t: 11000,txt: `` },
            { t: 11400,txt: `This is your admission.`,red: true },
            { t: 13000,txt: `It is not your first.`, red: true },
            { t: 14800,txt: `` },
            { t: 15200,txt: `Do not try to leave.`,bold: true, red: true },

        ];

        lines.forEach(({t,txt,red,bold}) =>{
            setTimeout(() => {
                if (!txt) { container.appendChild(document.createElement('br')); return;}
                const p= document.createElement('p');
                if (red) p.style.color ='#8b0000';
                if(bold) p.style.fontWeight='bold';
                container.appendChild(p);
                typeText(p, txt, 30);
                if(red) SFX.staticBurst(0.08,0.06);
            },t);
        });

        startTitleCycle();
        setTimeout(() => body.classList.add('tinge-dark'), 8000);

        setTimeout(()=> {
            flicker(() =>{
                showJumpscare(FACES[FACES.length - 1], () => {
                    $('pg-form').classList.add('hidden');
                    $('pg-end').classList.remove('hidden');
                    $('ov-vignette').className='fixed inset-0 z-[901] pointer-events-none vignette-black transition-all duration-1000';
                    loadEndScreen();
                },2000);
            });
        },18000);
    }
    
    function loadEndScreen() {
        $('end-head').textContent='Admission Complete';
        $('end-body').textContent=
          `your records have been transferred to the permanent ward. ` + 
          `St. Maren's thanks you for your cooperation. `+
          `Pleasee do not attempt to contact your next of kin.`;

        const rec=$('end-record');
        [
            ['Name', S.name],
            ['Date of birth',S.dob],
            ['Reason for Visit', S.reason || 'Unknown'],
            ['Next of Kin',`${S.contact} (${S.relation})`],
            ['Prior Visits',S.history === 'yes' ? 'yes , records retrieved' : S.history === 'no' ? 'First visit logged' : 'Records found regardless'],
            ['Ward Assigned','13-B (Permanent)'],
            ['Discharge Date','N/A'],
            ['Status', '◼ DECEASED — Processing'],
        ].forEach(([k,v]) => {
            const row = document.createElement('div');
            row.className='flex gap-3 border-b border-[#1a1a1a] pb-1.5';
            row.innerHTML= `<span style="color:#444;width:130px;flex-shrink:0;font-size:11px">${k}</span><span style="color:#666;font-size:11px">${v}</span>`;
            rec.appendChild(row);        
        });

        SFX.subThud();
        setTimeout(()=> SFX.whisper(0.2),2000);
    }

    function startNurseFeed(){
        const feed= $('nurse-feed');
        if (!feed ||nurseTimer !== null) return;
        feed.classList.remove('hidden');
        queueNextNurse();
    }

    function stopNurseFeed(){
        clearTimeout(nurseTimer);
        nurseTimer= null;
    }
    
    function queueNextNurse(){
        if(nurseIdx >= NURSE.length) return;
        const msg=NURSE[nurseIdx++];
        nurseTimer=setTimeout(() => {
            const txt =typeof msg.txt =='function'? msg.txt(S) : msg.txt;
            appendNurse(txt.replace('[DATE]',S.dob || 'unknown'),msg.type);
            SFX.whisper(0.15);
            queueNextNurse();
        }, msg.delay);
    }

    function appendNurse(text,type='normal'){
        const msgs =$('nurse-msgs');
        if (!msgs) return ;
        const colours ={
            normal: 'border-[#aaa89a] text-[#555]',
            warning: 'border-[#9a8000] text-[#665500]',
            danger:  'border-[#8b0000] text-[#8b0000]',
        };
        const div=document.createElement('div');
        div.className= `nurse-msg border-l-2 pl-3 py-1 ${colours[type] || colours.normal}`;
        div.innerHTML = `<span style="font-size:10px;color:#bbb;display:block;margin-bottom:2px">Ward Staff — ${new Date().toLocaleTimeString()}</span>`;

        const span= document.createElement('span');
        span.style.fontSize='13px';
        span.style.lineHeight='1.6';
        div.appendChild(span);
        msgs.appendChild(div);
        msgs.scrollTop =msgs.scrollHeight;
        typeText(span,text,20);
    }

    function startAmbientEvents() {
        if(S.ambientRunning)  return;
        S.ambientRunning=true;

        setInterval(() =>{
            const idle =(Date.now() -S.lastInteraction) > 9000;
            if (idle && S.step >= 2 && !S.figureVisible) showShadowFigure();
            if (!idle && S.figureVisible) hideShadowFigure();
        },1500);

        setInterval(() =>{
            if(S.step<1) return;
            const r = Math.random();
            if(r<0.3) SFX.heartbeat(1,Math.random() <0.4);
            else if (r<0.5) SFX.staticBurst(0.06,0.08);
            else if(r<0.6)SFX.whisper(0.08);
        },12000 + Math.random()*8000);

        setInterval(()=>{
            if(S.step<2) return;
            sweepGlitchBar();
        },18000 + Math.random()*12000);

        setInterval(() =>{
            if (S.step <3) return;
            const options =[
                `${S.name ||'you'} - are you still there?`,
                `don't look behind you`,
                `St. Maren's Hospital - Patient Intake`,
                `She's in the roomwith you`,
                `St. Maren's Hospital - Patient Intake`,
            ];
            document.title=options[Math.floor(Math.random()*options.length)];
            setTimeout(() => document.title =`St. Maren's Hospital - Patient Intake`,2500);
        },25000+ Math.random()*15000);
    }

    function scheduleJumpscare(delay){
        if (S.scaresLeft <= 0) return;
        S.scaresLeft--;
        setTimeout(() => {
            if (S.step>=6) return;
            flicker(()=>{
                const face = FACES[Math.floor(Math.random()*(FACES.length-1))];
                showJumpscare(face, () => SFX.creak(), 900+Math.random()*400);
            });  
        }, delay);
    }

    function showJumpscare(face,onEnd,duration = 1000) {
        const layer=$('js-layer'),art=$('js-art'), txt=$('js-text');
        art.textContent=face.art;
        txt.textContent=face.text;
        layer.classList.remove('hidden');
        SFX.scream();
        flashWhite(80);
        setTimeout(() => {
            layer.classList.add('hidden');
            art.textContent='';
            txt.textContent='';
            if(onEnd) onEnd(); 
        },duration);
    }

    function showShadowFigure(){
        if(S.figureVisible) return;
        S.figureVisible=true;
        const fig=$('shadow');

        fig.style.transition = ' opacity 0.8s ease, right 1.4s ease-in';
        fig.style.right='-140px';
        fig.style.opacity='0';
        requestAnimationFrame(() =>{
            requestAnimationFrame(()=>{
                fig.style.opacity='0.12';
                fig.style.right='-20px';
            });
        });
        SFX.whisper(0.08);
    }

    function hideShadowFigure() {
        S.figureVisible=false;
        const fig =$('shadow');
        fig.style.opacity='0';
        fig.style.right ='-120px';
    }

    function startTitleCycle() {
        clearInterval(S.titleInterval);
        S.titleInterval= setInterval(() => {
            document.title = TITLES[titleIdx++ % TITLES.length];
        }, 2800);
    }

    function flicker(cb){
        body.classList.add('flicker');
        SFX.staticBurst(0.35,0.4);
        setTimeout(() => { 
            body.classList.remove('flicker'); cb?.();
        },520);
    }

    function flashWhite(ms=60) {
        const ov=$('ov-white');
        ov.style.opacity='1';
        setTimeout(()=> ov.style.opacity='0',ms);
    }

    function sweepGlitchBar(){
        const bar=$('glitch-bar');
        bar.style.top='-4px';
        bar.style.opacity= '0.7';
        bar.classList.add('bar-sweep');
        setTimeout(() => {
            bar.classList.remove('bar-sweep');
            bar.style.opacity='0'; 
        },750);
    }

    function setProgress(pct,tier='normal'){
        const pbar=$('pbar');
        pbar.style.width =pct + '%';
        if (tier === 'warning') pbar.style.background='#8b6a00';
        else if (tier === 'danger') pbar.style.background='#8b0000';

    }

    function shakeStep(){
        const s= document.querySelector('.ward-step:not(.hidden)');
        s?.classList.add('shake');
        setTimeout(() => s?.classList.remove('shake'),600);
    }

    function typeText(el,text,speed=30,onDone) {
        let i = 0; el.textContent='';
        const timer = setInterval(()=>{
            el.textContent+= text[i++];
            if (i>= text.length) {clearInterval(timer); onDone?.();}
        },speed);
    }

    function typeIntoField(el,text,onDone){
        let i= 0;
        const timer=setInterval(()=>{
            el.value += text[i++];
            if (i>= text.length) {clearInterval(timer); onDone?.();}
        },65);
    }

    function typeCorruptThenFix(el,finalText){
        SFX.staticBurst(0.1,0.07);
        el.textContent=corruptStr(finalText);
        el.classList.add('txt-glitch');
        setTimeout(() => {
            el.textContent= finalText;
            el.classList.remove('txt-glitch');
        }, 350);
    }

    function corruptStr(str){
        const g= '█▓▒░╬╪╩╦╠║╔╗╚╝▄▀■□▪▫†‡§¶';
        return str.split('').map(c =>
            Math.random() <0.45 ? g[Math.floor(Math.random()*g.length)] : c
        ).join('');
        
    }

    function poke() {S.lastInteraction= Date.now(); }

    const PHOTO_FACE = `data:image/jpeg;base64,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`;

    function showPhotoScare(duration) {
        if (S.step >= 6) return;
        const layer = $('js-layer'), art = $('js-art'), txt = $('js-text');

        art.textContent = '';
        art.style.cssText = '';
        const img = document.createElement('img');
        img.src = PHOTO_FACE;
        img.style.cssText = 'width:100vw;height:100vh;object-fit:cover;position:fixed;inset:0;opacity:0.92;mix-blend-mode:luminosity;filter:contrast(1.3) brightness(0.85) saturate(0.4);';
        art.appendChild(img);

        const phrases = [
        `SHE KNOWS YOUR NAME`,
        `YOU CANNOT LEAVE`,
        `SHE IS BEHIND YOU`,
        `WARD 13 IS PERMANENT`,
        ``,
        ];
        txt.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        txt.style.cssText = 'font-family:"Special Elite",cursive;font-size:clamp(1.2rem,3vw,2rem);color:#ff1a1a;text-shadow:0 0 20px #8b0000,0 0 40px #8b0000;bottom:80px;left:0;right:0;text-align:center;position:absolute;letter-spacing:0.2em;';

        layer.classList.remove('hidden');
        SFX.scream();
        flashWhite(120);
        body.style.transition = 'background 0.05s';
        body.style.background = '#1a0000';

        const shake = $('pg-form') || $('pg-landing');
        if (shake) { shake.classList.add('shake'); setTimeout(() => shake.classList.remove('shake'), 600); }

        setTimeout(() => {
            layer.classList.add('hidden');
            art.innerHTML = '';
            img.remove();
            txt.textContent = '';
            txt.style.cssText = '';
            body.style.background = '';
        }, duration);
    }

    function scheduleRandomPhotoScares() {
        let fired = 0;
        const max = 5 + Math.floor(Math.random() * 2);

        function scheduleNext(minDelay, maxDelay) {
            if (fired >= max) return;
            const delay = minDelay + Math.random() * (maxDelay - minDelay);
            setTimeout(() => {
                if (S.step < 1 || S.step >= 6) { scheduleNext(12000, 30000); return; }
                fired++;
                flicker(() => showPhotoScare(900 + Math.random() * 600));
                scheduleNext(8000, 35000);
            }, delay);
        }

        scheduleNext(12000, 40000); 
    }
    return{begin,advance,poke};
    
})();

document.addEventListener('DOMContentLoaded', ()=> {
    const intakeNum=`13-${Math.floor(Math.random()*9000 + 1000)}`;
    const $= id => document.getElementById(id);

    $('intake-num').textContent=`Intake #${intakeNum}`;
    $('form-intake-num').textContent=`Intake #${intakeNum}`;
    $('form-date').textContent=new Date().toLocaleDateString('en-GB',{
        day:'2-digit', month:'long',year:'numeric'
    });

    const tick =() =>{
        const t = new Date().toLocaleTimeString('en-GB', {hour12: false});
        const c1=$('clock'),c2=$('clock2');
        if(c1) c1.textContent=t;
        if(c2) c2.textContent=t;
    };
    tick();
    setInterval(tick,1000);

    document.querySelectorAll('.step-next').forEach(btn =>{
        btn.addEventListener('click', ()=> ward.advance(parseInt(btn.dataset.next)));
    });

    document.addEventListener('keydown', e=>{
        if(e.key ==='Enter') {
            document.querySelector('.ward-step:not(.hidden) .step-next')?.click();
        }
        ward.poke();
    });
    document.addEventListener('mousemove', ()=> ward.poke());
    document.addEventListener('click', ()=> ward.poke());

    document.addEventListener('visibilitychange', ()=> {
        if(!document.hidden) {
            const name= $('f-name')?.value?.trim();
            if (name) {
                document.title=`${name} - please come back`;
                setTimeout(() => document.title=`St. Maren's Hospital - Patient Intake`, 3000);
            }
        }
    });
});