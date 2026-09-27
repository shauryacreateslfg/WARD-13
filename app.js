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
})