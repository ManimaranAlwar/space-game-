class AstraEngine {
    constructor() {
        this.score = 0; this.oxygen = 100; this.fuel = 100;
        this.currentIdx = 0; this.questions = [];
        this.astro = document.getElementById('astronaut');
        this.planetPool = ['jupeter.png', 'mars.png', 'sarten.png', 'urenis.png',"ploto.png","suturn.png","earth.png"];
        this.createStars();
        
        // Manual Hint Button
        document.getElementById('hint-btn').onclick = () => this.triggerHint();
    }

    createStars() {
        const container = document.getElementById('starfield');
        for(let i=0; i<100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3;
            star.style.width = size + 'px'; star.style.height = size + 'px';
            star.style.left = Math.random() * 100 + '%'; star.style.top = Math.random() * 100 + '%';
            container.appendChild(star);
        }
    }

    async init() {
        const res = await fetch('/api/questions');
        this.questions = await res.json();
        // Spawn big home planet
        this.spawnPlanet("START", "earth.png", 50, 5, 180, true);
        this.startLoop();
        this.loadMission();
    }

    startLoop() {
        setInterval(() => {
            if (this.currentIdx < this.questions.length) {
                this.oxygen -= 0.3;
                document.getElementById('oxy-bar').style.width = this.oxygen + '%';
                if(this.oxygen <= 0) this.endGame("OXYGEN DEPLETED");
            }
        }, 1000);
    }

    triggerHint() {
        const q = this.questions[this.currentIdx];
        const ship = document.getElementById('hint-ship');
        if(!q) return;
        document.getElementById('hint-bubble').innerText = q.hint;
        ship.classList.add('active');
        setTimeout(() => ship.classList.remove('active'), 4000);
    }

    loadMission() {
        const q = this.questions[this.currentIdx];
        if(!q) return this.endGame("GALAXY SAVED!");
        document.getElementById('question-text').innerText = q.q;

        // Positioned low to avoid terminal (15% drop applied)
        const pos = [{ l: 20, b: 35 }, { l: 50, b: 50 }, { l: 80, b: 35 }];

        q.options.forEach((opt, i) => {
            const img = this.planetPool[Math.floor(Math.random()*4)];
            const p = this.spawnPlanet(opt, img, pos[i].l, pos[i].b, 150);
            p.onclick = () => this.jump(p, i === q.correct);
        });
    }

    jump(target, isCorrect) {
        if(!isCorrect) {
            target.classList.add('planet-fall');
            setTimeout(() => this.endGame("CRITICAL NAVIGATION ERROR"), 1000);
            return;
        }

        // Activate Fire
        this.astro.classList.add('flying');
        this.fuel -= 10;
        this.score += 100;
        document.getElementById('score-val').innerText = this.score;
        document.getElementById('fuel-bar').style.width = this.fuel + '%';
        
        this.syncAstro(target);

        setTimeout(() => {
            // Deactivate Fire
            this.astro.classList.remove('flying');
            document.querySelectorAll('.planet').forEach(p => { if(p !== target) p.remove(); });
            
            target.style.left = "50%"; target.style.bottom = "5%";
            target.style.width = "180px"; target.style.height = "180px";
            
            setTimeout(() => {
                this.syncAstro(target);
                this.currentIdx++; 
                this.loadMission();
            }, 800);
        }, 600);
    }

    syncAstro(p) {
        const r = p.getBoundingClientRect();
        this.astro.style.left = `${r.left + r.width/2 - 32}px`;
        this.astro.style.top = `${r.top + r.height/2 - 40}px`;
    }

    spawnPlanet(txt, img, l, b, size, isOrigin=false) {
        const p = document.createElement('div');
        p.className = 'planet';
        p.innerHTML = `<span>${txt}</span>`;
        p.style.left = l+'%'; p.style.bottom = b+'%';
        p.style.width = size+'px'; p.style.height = size+'px';
        p.style.backgroundImage = `url('/static/images/${img}')`;
        document.body.appendChild(p);
        if(isOrigin) setTimeout(() => this.syncAstro(p), 100);
        return p;
    }

    async endGame(msg) {
        document.getElementById('end-screen').style.display = 'flex';
        document.getElementById('status').innerText = msg;
        document.getElementById('final-score').innerText = this.score;
        
        await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({score: this.score})
        });
    }
}
window.onload = () => new AstraEngine().init();