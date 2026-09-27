const ward =(() => {

    const S = {
        name:'',dob:'',reason:'',contact:'',history:'',
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
        { txt: s =>`${S.contact} has already been contacted. They were informed you may not return.`, type:'danger' , delay: 5000},
        { txt: `Hi there. Just a reminder to complete all fields. Have a good night.`, type:'danger' , delay:4000},
        { txt: `please stop trying to close the window. We can see when you try.`, type:'danger' , delay:3500},
        { txt: s=> `${S.name}. Room 13B. Tonight.`, type:'danger' , delay:2500},
    ];
    let titleIdx =0;

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

            document.querySelectorAll('.step-next').forEach(btn => {
                btn.onclick = () => ward.advance(parseInt(btn.dataset.next));
            });
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
        $('end-body').textContent
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

    
})