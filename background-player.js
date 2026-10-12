/* LOSI PULSO 3.1 — HTMLMediaElement persistente + controles de bloqueio (Media Session).
   Em PWAs iOS isto é uma melhoria best effort, NAO uma garantia de execucao em segundo plano. */
(()=>{
'use strict';
const audio = document.createElement('audio');
audio.id='lp-background-audio';audio.preload='metadata';audio.setAttribute('playsinline','');
audio.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
document.body.append(audio);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=null,blobUrl=null;
function position(){return Number.isFinite(audio.currentTime)?audio.currentTime:0}
function duration(){return Number.isFinite(audio.duration)?audio.duration:0}
function stamp(seconds){seconds=Math.floor(seconds||0);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
function bar(){let x=document.getElementById('lp-bg-player');if(!x){x=document.createElement('aside');x.id='lp-bg-player';x.setAttribute('aria-label','Player de áudio Losi Pulso');document.body.append(x);}return x;}
function repaint(){const x=bar();if(!active){x.hidden=true;x.innerHTML='';return;}
 x.hidden=false;x.innerHTML=`<div class="lp-bg-disc">♫</div><div class="lp-bg-main"><strong>${esc(active.title)}</strong><small>${esc(active.artist)} · ${esc(active.source)}</small><input aria-label="Posição da música" data-lp-bg="seek" type="range" min="0" max="1000" value="${duration()?Math.floor(position()/duration()*1000):0}" ${!duration()?'disabled':''}></div><button data-lp-bg="toggle" aria-label="${audio.paused?'Reproduzir':'Pausar'}">${audio.paused?'▶':'Ⅱ'}</button><button data-lp-bg="stop" aria-label="Fechar player">×</button>`;
}
function repaintTime(){const x=bar();if(x.hidden)return;const r=x.querySelector('input[data-lp-bg="seek"]');if(!r)return;r.disabled=!duration();if(document.activeElement!==r&&duration())r.value=String(Math.min(1000,Math.floor(position()/duration()*1000)));try{if(navigator.mediaSession?.setPositionState&&duration())navigator.mediaSession.setPositionState({duration:duration(),playbackRate:audio.playbackRate,position:Math.min(duration(),position())});}catch(e){}
}
function session(){if(!('mediaSession' in navigator)||!('MediaMetadata' in window)||!active)return;
 try{navigator.mediaSession.metadata=new MediaMetadata({title:active.title,artist:active.artist,album:'Losi Pulso · '+active.source,artwork:[{src:new URL('icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}]});
 const handlers={play:()=>resume(),pause:()=>pause(),stop:()=>stop(),seekto:d=>{if(Number.isFinite(d.seekTime))audio.currentTime=Math.max(0,Math.min(duration()||Infinity,d.seekTime));},seekbackward:d=>{audio.currentTime=Math.max(0,position()-(d.seekOffset||15));},seekforward:d=>{audio.currentTime=Math.min(duration()||Infinity,position()+(d.seekOffset||15));}};
 Object.entries(handlers).forEach(([k,fn])=>{try{navigator.mediaSession.setActionHandler(k,fn)}catch(e){}});
 }catch(e){console.debug('Media Session indisponível',e);}}
function resume(){if(!active)return;audio.play().catch(()=>{repaint();});}
function pause(){audio.pause();repaint();}
function stop(){audio.pause();audio.removeAttribute('src');audio.load();if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}active=null;
 if('mediaSession' in navigator){try{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}catch(e){}}
 repaint();}
async function play({url=null,blob=null,title='Faixa',artist='DJ',source='MP3'}={}){
 if(!url&&!blob)throw Error('Fonte de áudio ausente');
 stop();if(blob){blobUrl=URL.createObjectURL(blob);url=blobUrl;}
 active={title,artist,source};audio.src=url;audio.load();session();repaint();
 // Interrompe demos e vídeos existentes; não interrompe o próprio <audio>.
 window.dispatchEvent(new Event('losi-video-play'));
 document.querySelectorAll('video').forEach(el=>{try{el.pause()}catch(e){}});
 try{await audio.play();}catch(err){repaint();console.info('Toque no botão ▶ para iniciar o áudio no iPhone:',err.message);}
 repaint();return true;
}
audio.addEventListener('play',()=>{try{if('mediaSession'in navigator)navigator.mediaSession.playbackState='playing'}catch(e){}repaint()});
audio.addEventListener('pause',()=>{try{if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused'}catch(e){}repaint()});
audio.addEventListener('loadedmetadata',()=>{repaint();repaintTime()});
audio.addEventListener('timeupdate',repaintTime);
audio.addEventListener('ended',()=>stop());
audio.addEventListener('error',()=>{if(active){console.warn('Falha ao tocar MP3');repaint();}});
document.addEventListener('click',ev=>{const x=ev.target.closest('[data-lp-bg]');if(!x)return;if(x.dataset.lpBg==='toggle'){audio.paused?resume():pause();}else if(x.dataset.lpBg==='stop')stop();});
document.addEventListener('change',ev=>{if(ev.target.dataset.lpBg==='seek'&&duration())audio.currentTime=duration()*(Number(ev.target.value)/1000);});
window.addEventListener('losi-video-play',ev=>{if(ev.__lpBackgroundAudio)return; /* local players may issue this event */});
window.LosiBackgroundAudio={play,playBlob:(blob,meta={})=>play({...meta,blob}),pause,stop,resume,get active(){return !!active},get element(){return audio}};
repaint();
})();
