/* PULSO LAB — original, procedural demonstration audio. No third-party samples. */
class PulsoSynth {
  constructor() {
    this.ctx = null;
    this.output = null;
    this.interval = null;
    this.track = null;
    this.startPosition = 0;
    this.startContextTime = 0;
    this.tickIndex = 0;
    this.nextStepTime = 0;
    this.noise = null;
  }
  ensureContext() {
    if (!this.ctx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('Este navegador não oferece áudio Web Audio.');
      this.ctx = new Context();
      this.noise = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate), this.ctx.sampleRate);
      let samples = this.noise.getChannelData(0);
      for(let i=0;i<samples.length;i++) samples[i]=(Math.random()*2-1);
    }
    this.ctx.resume();
  }
  duration(track) { return 16 * 4 * 60 / track.bpm; }
  getPosition() {
    if (!this.track || !this.ctx) return 0;
    const total=this.duration(this.track);
    return ((this.startPosition + Math.max(0,this.ctx.currentTime-this.startContextTime)) % total + total) % total;
  }
  start(track, position=0) {
    this.stop();
    this.ensureContext();
    this.track = track;
    const c=this.ctx;
    const now=c.currentTime;
    const compressor=c.createDynamicsCompressor();
    compressor.threshold.value=-18;compressor.knee.value=14;compressor.ratio.value=3.5;
    compressor.attack.value=.007;compressor.release.value=.18;
    this.output=c.createGain();this.output.gain.setValueAtTime(.68,now);
    this.output.connect(compressor);compressor.connect(c.destination);
    this.delay=c.createDelay(1);this.delay.delayTime.value=60/track.bpm*0.75;
    this.feedback=c.createGain();this.feedback.gain.value=.23;
    this.echoMix=c.createGain();this.echoMix.gain.value=.19;
    this.delay.connect(this.feedback);this.feedback.connect(this.delay);
    this.delay.connect(this.echoMix);this.echoMix.connect(this.output);
    const stepSeconds=60/track.bpm/4;
    this.startPosition=Math.max(0,position)%this.duration(track);
    this.startContextTime=now+.055;
    this.tickIndex=Math.floor(this.startPosition/stepSeconds);
    this.nextStepTime=now+.055;
    this.scheduler();
    this.interval=setInterval(()=>this.scheduler(),25);
  }
  stop() {
    if(this.interval){clearInterval(this.interval);this.interval=null;}
    if(this.output && this.ctx){
      const out=this.output;
      const time=this.ctx.currentTime;
      out.gain.cancelScheduledValues(time);
      out.gain.setTargetAtTime(0.0001,time,.025);
      setTimeout(()=>{try{out.disconnect()}catch(e){}},400);
    }
    this.track=null;
  }
  seek(position) { if(this.track){ const t=this.track;this.start(t,position); } }
  scheduler() {
    if(!this.track) return;
    const stepSeconds=60/this.track.bpm/4;
    while(this.nextStepTime < this.ctx.currentTime+.13) {
      this.scheduleStep(this.tickIndex,this.nextStepTime);
      this.tickIndex=(this.tickIndex+1)%256;
      this.nextStepTime+=stepSeconds;
    }
  }
  midi(n){return 440*Math.pow(2,(n-69)/12)}
  envelope(time,attack,decay,level) {
    const g=this.ctx.createGain();
    g.gain.setValueAtTime(.0001,time);
    g.gain.exponentialRampToValueAtTime(Math.max(.001,level),time+attack);
    g.gain.exponentialRampToValueAtTime(.0001,time+attack+decay);
    g.connect(this.output);return g;
  }
  kick(t,soft=false) {
    const c=this.ctx,o=c.createOscillator(),g=this.envelope(t,.004,.35,soft?.32:.75);
    o.type='sine';o.frequency.setValueAtTime(165,t);o.frequency.exponentialRampToValueAtTime(46,t+.16);o.frequency.exponentialRampToValueAtTime(39,t+.32);
    o.connect(g);o.start(t);o.stop(t+.42);
  }
  noiseHit(t,type='hat',gain=.13) {
    const c=this.ctx,src=c.createBufferSource();src.buffer=this.noise;
    const filter=c.createBiquadFilter();filter.type=type==='clap'?'bandpass':'highpass';filter.frequency.value=type==='clap'?1650:6700;
    const g=this.envelope(t,.002,type==='clap'?.13:.055,gain);
    src.connect(filter);filter.connect(g);src.start(t);src.stop(t+.22);
  }
  bass(t,note,track) {
    const c=this.ctx,o=c.createOscillator(),filter=c.createBiquadFilter();
    o.type=track.bassWave||'sawtooth';o.frequency.value=this.midi(note);
    filter.type='lowpass';filter.frequency.setValueAtTime(track.bassCut||410,t);filter.frequency.exponentialRampToValueAtTime(105,t+.24);filter.Q.value=2.7;
    const g=this.envelope(t,.009,.26,track.bassLevel||.105);
    o.connect(filter);filter.connect(g);o.start(t);o.stop(t+.29);
  }
  pluck(t,note,track,level=.062) {
    const c=this.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
    o.type=track.leadWave||'triangle';o.frequency.value=this.midi(note);
    f.type='lowpass';f.frequency.setValueAtTime(2400,t);f.frequency.exponentialRampToValueAtTime(420,t+.38);f.Q.value=1;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(level,t+.016);g.gain.exponentialRampToValueAtTime(.0001,t+.44);
    o.connect(f);f.connect(g);g.connect(this.output);g.connect(this.delay);
    o.start(t);o.stop(t+.47);
  }
  pad(t,notes,track) {
    const c=this.ctx,dur=60/track.bpm*3.75;
    notes.forEach((note,i)=>{
      const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
      o.type='sine';o.frequency.value=this.midi(note);o.detune.value=i===1?4:i===2?-5:0;
      f.type='lowpass';f.frequency.value=700;
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.018,t+.4);g.gain.setValueAtTime(.018,t+dur-.5);g.gain.linearRampToValueAtTime(.0001,t+dur);
      o.connect(f);f.connect(g);g.connect(this.output);o.start(t);o.stop(t+dur+.05);
    });
  }
  scheduleStep(tick,t) {
    const track=this.track;
    const step=tick%16,bar=Math.floor(tick/16),pattern=track.pattern||0;
    const kickPattern=(pattern===4 && bar%4===3) ? [0,8,12]:[0,4,8,12];
    if(kickPattern.includes(step))this.kick(t);
    if([4,12].includes(step)&&pattern!==3)this.noiseHit(t,'clap',pattern===4?.09:.12);
    if(step%4===2)this.noiseHit(t,'hat',pattern===4?.07:.095);
    if(pattern>=1 && step%4===0 && (bar+step)%3!==0)this.noiseHit(t,'hat',.022);
    if(pattern===4&&step%2===1)this.noiseHit(t,'hat',.05);
    if(pattern===3&&step===12)this.noiseHit(t,'clap',.08);
    if([0,3,6,8,11,14].includes(step) && (step!==14||bar%2===0)){
      const seq=track.sequence||[0,0,3,0,5,3,0,7];
      const offset=seq[(bar*2+Math.floor(step/3))%seq.length];
      this.bass(t,track.root-12+offset,track);
    }
    if(step===0 && bar%2===0){
      const progression=track.progression||[0,5,3,7];
      const root=track.root+12+progression[(bar/2)%progression.length];
      this.pad(t,[root,root+3,root+7],track);
    }
    const melodicSteps=pattern===4?[3,11]:pattern===3?[6,14]:[2,7,10,15];
    if(melodicSteps.includes(step) && (bar%4!==3||step===10)){
      const motif=track.motif||[0,3,7,10,12,7,3,5];
      const index=(bar*2+Math.floor(step/3))%motif.length;
      this.pluck(t,track.root+24+motif[index],track,pattern===4?.027:.047);
    }
  }
}
window.PulsoSynth=PulsoSynth;
