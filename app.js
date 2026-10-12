/* LOSI PULSO 1.0 — local-first iPhone web app. All content marked 'demo' is generated on-device. */
(() => {
'use strict';
const DEMOS = [
  {id:'d1',title:'Last Light',artist:'LOSI PULSO Sessions',genre:'Progressive',bpm:124,art:'prism',root:36,pattern:0,sequence:[0,3,0,7,5,3,0,10],motif:[0,3,7,10,7,5,3,12],progression:[0,5,3,7],desc:'Progressive hipnótico'},
  {id:'d2',title:'Concrete Pulse',artist:'LOSI PULSO Sessions',genre:'Techno',bpm:138,art:'grid',root:38,pattern:4,sequence:[0,0,3,0,0,5,3,0],motif:[0,12,0,7,5,0,3,0],bassWave:'sawtooth',bassCut:280,desc:'Warehouse energy'},
  {id:'d3',title:'Jungle Frequencies',artist:'LOSI PULSO Sessions',genre:'Melodic',bpm:126,art:'vortex',root:41,pattern:2,sequence:[0,7,3,5,0,10,7,5],motif:[0,3,7,12,10,7,5,3],desc:'Noites ao ar livre'},
  {id:'d4',title:'Afterhours Drift',artist:'LOSI PULSO Sessions',genre:'Deep House',bpm:120,art:'aura',root:33,pattern:3,sequence:[0,5,7,3,0,5,3,10],motif:[7,3,5,0,10,7,3,5],bassWave:'triangle',desc:'Amanhecer em câmera lenta'},
  {id:'d5',title:'Warehouse 04',artist:'LOSI PULSO Sessions',genre:'Techno',bpm:145,art:'blocks',root:34,pattern:4,sequence:[0,0,0,3,0,5,0,3],motif:[0,0,3,0,7,0,5,3],bassCut:220,desc:'Pico de energia'},
  {id:'d6',title:'Under the Canopy',artist:'LOSI PULSO Sessions',genre:'Progressive',bpm:125,art:'forest',root:37,pattern:1,sequence:[0,5,3,7,0,10,5,7],motif:[0,7,5,3,12,10,7,5],desc:'Groove que envolve'},
  {id:'d7',title:'Moonline',artist:'LOSI PULSO Sessions',genre:'Melodic',bpm:123,art:'nebula',root:40,pattern:2,sequence:[0,3,7,5,3,10,7,0],motif:[12,10,7,3,5,7,0,3],desc:'Atmosfera noturna'},
  {id:'d8',title:'Neon Boulevard',artist:'LOSI PULSO Sessions',genre:'House',bpm:128,art:'neon',root:39,pattern:1,sequence:[0,0,7,3,5,3,10,7],motif:[0,3,7,10,3,5,7,12],desc:'Club groove'}
];
const $ = (sel) => document.querySelector(sel);
const escape = (s) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS_KEY='losi-pulso-settings-v1';
let persisted={};try{persisted=JSON.parse(localStorage.getItem(LS_KEY))||{}}catch(e){}
const state={page:'home',genre:'Todos',search:'',fav:new Set(persisted.fav||[]),playlists:Array.isArray(persisted.playlists)?persisted.playlists:[],posts:Array.isArray(persisted.posts)?persisted.posts:[],uploads:[],current:null,playing:false,playerOpen:false,sheet:null,sheetTrack:null,playlistOpen:null,playlistQueue:null,shuffle:false,repeat:false,position:0,queue:[],loadingAudio:false};
const synth=new PulsoSynth();
let audio=null,audioURL=null,toastTimer=null,dbPromise=null;
const icons={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  library:'<rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  play:'<path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>',
  pause:'<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  chevron:'<path d="m15 18-6-6 6-6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  next:'<path d="m5 4 12 8-12 8V4zm14 0v16"/>',
  prev:'<path d="m19 4-12 8 12 8V4zM5 4v16"/>',
  shuffle:'<path d="M4 7h3c5 0 5 10 10 10h3m-3-3 3 3-3 3M4 17h3c2 0 3-2 4-4m3-5c1-1 2-1 3-1h3m-3-3 3 3-3 3"/>',
  repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  more:'<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="M5 5 19 19M19 5 5 19"/>',
  headphones:'<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 14h4v7H5a2 2 0 0 1-2-2v-5zm18 0h-4v7h2a2 2 0 0 0 2-2v-5z"/>',
  trash:'<path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-9v.5"/>',
  spark:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
  video:'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3z"/>',
  radio:'<circle cx="12" cy="12" r="2"/><path d="M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14M8 8a6 6 0 0 0 0 8m8-8a6 6 0 0 1 0 8"/>'
};
const ico=(name,size=20)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||''}</svg>`;
const allTracks=()=>[...DEMOS,...state.uploads];
const getTrack=id=>allTracks().find(t=>t.id===id);
const isFile=t=>t&&t.kind==='file';
const dur=t=>isFile(t)?(t.duration||0):synth.duration(t);
const fmtTime=seconds=>{if(!Number.isFinite(seconds))return '0:00';seconds=Math.floor(Math.max(0,seconds));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`};
const save=()=>{try{localStorage.setItem(LS_KEY,JSON.stringify({fav:[...state.fav],playlists:state.playlists,posts:state.posts}))}catch(e){showToast('Não foi possível salvar preferências')}};
const cover=(t,cls='',play=false)=>`<span class="cover ${escape(t.art||'upload')} ${cls}" aria-hidden="true"><span class="cover-art"></span><span class="art-caption">${isFile(t)?'SEU ÁUDIO':'LOSI PULSO / DEMO'}</span>${play?`<span class="cover-play">${ico('play',16)}</span>`:''}</span>`;
const badgeText=t=>isFile(t)?'ARQUIVO LOCAL':`${t.bpm} BPM · DEMO`;
const item=(t)=>`<div class="track-row ${state.current===t.id&&state.playing?'playing':''}">
 <button class="bare-track" data-action="play-track" data-id="${escape(t.id)}" aria-label="Reproduzir ${escape(t.title)}" style="padding:0;border:0;background:transparent">${cover(t,'',true)}</button>
 <div class="track-info"><button data-action="play-track" data-id="${escape(t.id)}" class="bare-track" style="padding:0;border:0;background:none;color:inherit;text-align:left;display:block;width:100%"><span class="track-name">${escape(t.title)}</span><span class="track-meta">${escape(t.artist)} · ${escape(t.genre)}</span></button><span class="track-tag">${badgeText(t)}</span></div>
 <button class="icon-button ${state.fav.has(t.id)?'active':''}" data-action="favorite" data-id="${escape(t.id)}" aria-label="${state.fav.has(t.id)?'Remover dos favoritos':'Adicionar aos favoritos'}">${ico('heart',19)}</button>
 <button class="icon-button" data-action="add-to-playlist" data-id="${escape(t.id)}" aria-label="Adicionar à playlist">${ico('more',20)}</button>
</div>`;
const feature=t=>`<button class="feature-track" data-action="play-track" data-id="${escape(t.id)}" aria-label="Ouvir ${escape(t.title)}">${cover(t,'',true)}<span class="track-name">${escape(t.title)}</span><span class="track-meta">${escape(t.genre)} · ${t.bpm} BPM</span></button>`;
const genreChips=(active,action)=>['Todos','Progressive','Techno','Melodic','Deep House','House'].map(g=>`<button class="chip ${active===g?'active':''}" data-action="${action}" data-genre="${escape(g)}">${escape(g)}</button>`).join('');
function postCard(p){return `<div class="post-card"><div class="post-icon">${ico('radio',24)}</div><div class="post-info"><strong>${escape(p.title)}</strong><span>${escape(p.artist)} · ${escape(p.platform)}</span><button class="text-button" data-action="open-post" data-id="${escape(p.id)}">Abrir set ${ico('arrow',13)}</button></div><button class="icon-button" data-action="delete-post" data-id="${escape(p.id)}" aria-label="Excluir link">${ico('close',16)}</button></div>`}
function wallSection(){return `<div class="section-head"><h3 class="section-title">Mural de sets</h3><button class="text-button" data-action="add-post">${ico('plus',14)} Novo link</button></div><p class="section-subtitle" style="line-height:1.6;margin:-4px 0 12px">Salve seus links de sets do SoundCloud, Spotify ou YouTube. Por enquanto, o mural é privado neste aparelho.</p>${state.posts.length?state.posts.slice(0,6).map(postCard).join(''):`<div class="post-empty">${ico('headphones',23)}<strong>Seu mural começa aqui.</strong><span>Adicione um link de DJ set para acessar quando quiser.</span><button class="secondary-button" data-action="add-post">${ico('plus',14)} Adicionar meu primeiro set</button></div>`}`}
function viewHome(){
 const recs=DEMOS.filter(t=>state.genre==='Todos'||t.genre===state.genre);
 return `<div class="eyebrow">DOMINE A FREQUÊNCIA</div><h2 class="heading">Boa noite,<br>o som te espera.</h2><p class="subcopy">Seu espaço para explorar a cultura eletrônica.</p>
 <section class="hero"><div class="hero-content"><span class="hero-kicker"><i class="live-dot"></i> LOSI PULSO SESSIONS</span><h1>FEEL<br>THE <em>BEAT.</em></h1><p>Do warm-up ao último drop. Sua jornada começa aqui.</p><button class="primary-button" data-action="play-track" data-id="d1">${ico('play',16)} Ouvir sessão</button></div><div class="hero-visual" aria-hidden="true"><span class="hero-ring"></span><span class="hero-ring"></span><span class="hero-ring"></span><span class="hero-ring"></span></div></section>
 <div class="section-head"><h3 class="section-title">Explore o som</h3></div><div class="genre-row">${genreChips(state.genre,'set-genre')}</div>
 <div class="section-head"><h3 class="section-title">Em destaque</h3><button class="text-button" data-action="go-explore">Ver tudo ${ico('arrow',12)}</button></div>
 <div class="horizontal-tracks">${recs.map(feature).join('')||'<p class="empty">Nenhuma demo neste estilo.</p>'}</div>
 <button class="mix-card" data-action="play-track" data-id="d6" style="text-align:left;width:100%;color:white"><div><span class="eyebrow">O CLIMA DA NOITE</span><div class="mix-title">Warung mood</div><div class="mix-copy">Progressive · groove · atmosfera</div></div><span class="circle-arrow">${ico('arrow',18)}</span></button>
 <div class="section-head"><h3 class="section-title">Na rotação</h3><span class="section-subtitle">Loops originais de demonstração</span></div>${DEMOS.slice(0,4).map(item).join('')}
 ${wallSection()}
 <section class="note-box" style="margin-top:24px;border:1px solid #34513a;padding:18px;border-radius:16px"><strong style="color:var(--green)">APOIE O PULSO ♡</strong><p style="font-size:12px;line-height:1.6;color:#b8c7ba">Ajude a manter o projeto e descubra oportunidades de parceria. O app continua gratuito.</p><a href="monetizacao.html" class="primary-button" style="text-decoration:none">Apoie / parcerias →</a></section>
 <p class="helper" style="margin-top:20px">As faixas demo são loops sintetizados em tempo real. Importe suas músicas na Biblioteca para ouvir arquivos completos.</p>`;
}
function matchesGenre(t){return state.genre==='Todos'||t.genre===state.genre}
function matchesSearch(t){const q=state.search.toLocaleLowerCase('pt-BR').trim();return !q||`${t.title} ${t.artist} ${t.genre}`.toLocaleLowerCase('pt-BR').includes(q)}
function viewExplore(){
 const tracks=allTracks().filter(t=>matchesGenre(t)&&matchesSearch(t));
 return `<div class="eyebrow">EXPLORE / DESCUBRA</div><h2 class="heading">Encontre<br>seu próximo som.</h2><p class="subcopy">Techno, house e progressive em um só lugar.</p>
 <label class="search-wrap">${ico('search',19)}<input id="search-input" type="search" value="${escape(state.search)}" placeholder="Busque por faixa, artista, gênero..." autocomplete="off" aria-label="Buscar músicas"></label>
 <div class="filters">${genreChips(state.genre,'set-genre')}</div><div class="section-head" style="margin:10px 0 6px"><h3 class="section-title">Todas as faixas</h3><span class="section-subtitle">${tracks.length} resultado(s)</span></div>
 ${tracks.length?tracks.map(item).join(''):`<div class="empty">${ico('search',30)}<p>Nada por aqui. Tente outro termo ou gênero.</p></div>`}${wallSection()}`;
}
function playlistCard(p){const songs=p.ids.filter(id=>getTrack(id));return `<button class="playlist-card" data-action="open-playlist" data-id="${escape(p.id)}"><span class="playlist-symbol">${ico('music',21)}</span><strong>${escape(p.name)}</strong><small>${songs.length} faixas</small></button>`}
function viewLibrary(){
 if(state.playlistOpen){const p=state.playlists.find(p=>p.id===state.playlistOpen);if(!p){state.playlistOpen=null;return viewLibrary()}const tracks=p.ids.map(getTrack).filter(Boolean);return `<button class="text-button" data-action="close-playlist">${ico('chevron',16)} Biblioteca</button><div class="eyebrow">SUA PLAYLIST</div><h2 class="heading">${escape(p.name)}</h2><p class="subcopy">${tracks.length} faixa(s) · salvas neste aparelho</p><div style="display:flex;gap:10px;margin-bottom:20px"><button class="primary-button" data-action="play-playlist" data-id="${escape(p.id)}" ${!tracks.length?'disabled':''}>${ico('play',16)} Reproduzir</button><button class="secondary-button" data-action="delete-playlist" data-id="${escape(p.id)}">${ico('trash',16)} Excluir</button></div>${tracks.length?tracks.map(t=>`${item(t)}<button class="text-button" style="font-size:10px;padding:0 0 12px" data-action="remove-from-playlist" data-id="${escape(t.id)}" data-playlist="${escape(p.id)}">Remover desta playlist</button>`).join(''):'<div class="empty">Sua playlist ainda não tem músicas. Adicione faixas pelo botão de opções.</div>'}`}
 const liked=allTracks().filter(t=>state.fav.has(t.id));
 return `<div class="eyebrow">SEU UNIVERSO SONORO</div><h2 class="heading">Minha biblioteca.</h2><p class="subcopy">Seu som, do seu jeito, salvo neste dispositivo.</p>
 <div class="stats-strip"><div class="stat-card"><strong class="stat-number">${state.fav.size}</strong><span class="stat-label">Favoritos</span></div><div class="stat-card"><strong class="stat-number">${state.playlists.length}</strong><span class="stat-label">Playlists</span></div><div class="stat-card"><strong class="stat-number">${state.uploads.length}</strong><span class="stat-label">Meus áudios</span></div></div>
 <button class="offline-library-shortcut" data-action="go-offline"><span>↓</span><div><strong>Downloads offline</strong><small>Vídeos e MP3 salvos neste aparelho</small></div><b>ABRIR →</b></button>
 <div class="section-head"><h3 class="section-title">Suas playlists</h3><button class="text-button" data-action="create-playlist">${ico('plus',14)} Criar</button></div><div class="playlist-grid"><button class="playlist-card create" data-action="create-playlist"><span class="playlist-symbol">${ico('plus',20)}</span><strong>Nova playlist</strong><small>Organize sua vibe</small></button>${state.playlists.map(playlistCard).join('')}</div>
 <div class="section-head"><h3 class="section-title">Seus arquivos</h3><button class="text-button" data-action="upload">Adicionar ${ico('plus',14)}</button></div><div class="upload-zone"><span class="upload-icon">${ico('upload',21)}</span><div><strong>Importe suas músicas</strong><p>MP3, WAV, M4A e outros áudios aceitos pelo iPhone.</p></div><button class="icon-button" data-action="upload" aria-label="Importar arquivos">${ico('plus',21)}</button></div>
 <input id="audio-upload" type="file" accept="audio/*,.mp3,.m4a,.wav,.aac,.flac" multiple hidden>
 ${state.uploads.length?state.uploads.map(t=>`${item(t)}<button data-action="delete-upload" data-id="${escape(t.id)}" class="text-button" style="padding:3px 0 12px;font-size:10px">Excluir arquivo deste app</button>`).join(''):'<p class="helper" style="margin:12px 2px">Seus áudios ficam apenas no armazenamento deste aparelho, sem envio a servidores.</p>'}
 <div class="section-head"><h3 class="section-title">Favoritos</h3><span class="section-subtitle">${liked.length} faixas</span></div>${liked.length?liked.map(item).join(''):`<div class="empty"><span class="empty-icon">${ico('heart',23)}</span>Curta uma faixa para encontrá-la aqui.</div>`}`;
}
function viewProfile(){return `<div class="eyebrow">BACKSTAGE / PERFIL</div><h2 class="heading">Seu espaço.</h2><p class="subcopy">Para quem vive pela música.</p>
 <div class="profile-head"><span class="profile-avatar">L</span><div><strong>LØSI</strong><small>Explorador da cena eletrônica<br>LOSI PULSO · versão demo</small></div></div>
 <div class="section-head"><h3 class="section-title">O aplicativo</h3></div>
 <div class="menu-row">${ico('radio',20)}<div>Player de música eletrônica</div><span>Funcionando</span></div>
 <div class="menu-row">${ico('library',20)}<div>Playlists e favoritos</div><span>Neste iPhone</span></div>
 <div class="menu-row">${ico('upload',20)}<div>Importar arquivos de áudio</div><span>Local</span></div>
 <div class="menu-row">${ico('video',20)}<div>Sets em vídeo e músicas MP3</div><span>Versão 3.1</span></div>
 <div class="menu-row">${ico('headphones',20)}<div>Mural pessoal de links</div><span>${state.posts.length} salvo(s)</span></div>
 <div class="note-box"><strong style="color:var(--green)">LOSI PULSO / VERSÃO 3.1</strong><br>Na aba Sets, DJs podem enviar vídeos e MP3 para aprovação. Baixe conteúdos aprovados na área Offline para usar sem internet. A biblioteca musical e as playlists permanecem salvas neste aparelho.</div>  <a class="primary-button" href="monetizacao.html" style="text-decoration:none;margin-top:20px">♡ Apoie o PULSO / Parcerias</a>
  <button class="secondary-button" style="margin-top:12px" data-action="about-install">${ico('info',15)} Como instalar no iPhone</button>`}
const nav=[['home','Início','home'],['explore','Explorar','search'],['sets','Sets','video'],['library','Biblioteca','library'],['profile','Perfil','user']];
function renderNav(){$('#bottom-nav').innerHTML=nav.map(([page,label,icon])=>`<button class="nav-item ${state.page===page?'active':''}" data-action="nav" data-page="${page}" ${state.page===page?'aria-current="page"':''}>${ico(icon)}<span>${label}</span></button>`).join('')}
function renderMain(){const prev=$('#view');prev.innerHTML=state.page==='home'?viewHome():state.page==='explore'?viewExplore():state.page==='library'?viewLibrary():state.page==='sets'?(window.LosiSets?.view()||'<p>Carregando sets...</p>'):viewProfile();renderNav()}
function renderMini(){const t=getTrack(state.current);$('#mini-player').innerHTML=!t?'':`<div class="mini-player"><div class="mini-content"><button data-action="open-player" style="border:0;padding:0;background:transparent">${cover(t)}</button><button data-action="open-player" class="mini-info" style="background:none;border:0;color:inherit;text-align:left"><strong>${escape(t.title)}</strong><small>${escape(t.artist)}</small></button><button class="mini-play" data-action="toggle-play" aria-label="${state.playing?'Pausar':'Reproduzir'}">${ico(state.playing?'pause':'play',23)}</button><button class="mini-play" data-action="next" aria-label="Próxima faixa">${ico('next',19)}</button></div><div class="mini-progress"><span class="js-progress-fill"></span></div></div>`;syncProgress()}
function renderPlayer(){const t=getTrack(state.current);if(!t||!state.playerOpen)return '';return `<div class="player-overlay"><div class="player-panel"><div class="player-top"><button data-action="close-player" aria-label="Minimizar player">${ico('down',26)}</button><strong>LOSI PULSO / NOW PLAYING</strong><button data-action="add-to-playlist" data-id="${escape(t.id)}" aria-label="Adicionar à playlist">${ico('more',24)}</button></div>
 ${cover(t,`player-cover ${state.playing?'animated':''}`)}
 <div class="player-song"><div style="min-width:0"><strong>${escape(t.title)}</strong><small>${escape(t.artist)} · ${escape(t.genre)} ${isFile(t)?'':'· '+t.bpm+' BPM'}</small></div><button class="icon-button ${state.fav.has(t.id)?'active':''}" data-action="favorite" data-id="${escape(t.id)}" aria-label="Favoritar">${ico('heart',25)}</button></div>
 <div><input class="seek js-progress" type="range" min="0" max="1000" value="0" aria-label="Posição da faixa"><div class="time-row"><span class="js-current-time">0:00</span><span class="js-duration">${fmtTime(dur(t))}</span></div></div>
 <div class="controls"><button class="control-icon ${state.shuffle?'on':''}" data-action="shuffle" aria-label="Alternar aleatório">${ico('shuffle',20)}</button><button class="control-icon" data-action="prev" aria-label="Anterior">${ico('prev',26)}</button><button class="big-play" data-action="toggle-play" aria-label="${state.playing?'Pausar':'Reproduzir'}">${ico(state.playing?'pause':'play',30)}</button><button class="control-icon" data-action="next" aria-label="Próxima">${ico('next',26)}</button><button class="control-icon ${state.repeat?'on':''}" data-action="repeat" aria-label="Repetir música">${ico('repeat',19)}</button></div>
 <div class="player-bottom"><span style="display:flex;gap:9px;align-items:center"><span class="wave-mini ${state.playing?'':'paused'}"><i></i><i></i><i></i><i></i><i></i></span> ${isFile(t)?'SEU ARQUIVO':'DEMO SINTETIZADA'}</span><strong>FEEL THE BEAT.</strong></div>
 </div></div>`}
function renderSheet(){if(!state.sheet)return '';const t=getTrack(state.sheetTrack);let content='';
 if(state.sheet==='create-playlist')content=`<h3>Criar playlist</h3><p>Dê um nome à sua nova sessão.</p><form id="new-playlist-form"><input type="text" id="playlist-name" maxlength="55" placeholder="Ex.: Progressive ao pôr do sol" required autocomplete="off"><button class="primary-button" type="submit">${ico('plus',16)} Criar playlist</button></form>`;
 if(state.sheet==='add-to-playlist')content=`<h3>Adicionar à playlist</h3><p>${t?escape(t.title):'Faixa'} · escolha onde guardar.</p>${state.playlists.map(p=>`<button class="sheet-row" data-action="add-existing-playlist" data-id="${escape(p.id)}">${ico('music',19)} ${escape(p.name)} <small>${p.ids.length} faixas</small></button>`).join('')}<button class="sheet-row" data-action="create-playlist">${ico('plus',19)} Criar nova playlist</button>`;
 if(state.sheet==='add-post')content=`<h3>Salvar um DJ set</h3><p>Guarde um link para ouvir depois. Ele será exibido só neste aparelho, sem publicação pública.</p><form id="new-post-form"><label class="sheet-label">Nome do set</label><input type="text" name="title" maxlength="75" placeholder="Ex.: Progressive Session 01" required><label class="sheet-label">DJ / artista</label><input type="text" name="artist" maxlength="75" placeholder="Nome do DJ" required><label class="sheet-label">Link SoundCloud, Spotify ou YouTube</label><input type="url" name="url" placeholder="https://soundcloud.com/..." required><button class="primary-button" type="submit">${ico('plus',16)} Salvar no meu mural</button></form>`;
 if(state.sheet==='install')content=`<h3>LOSI PULSO no seu iPhone</h3><p>1. Publique a pasta deste app em uma hospedagem HTTPS.<br>2. Abra o endereço pelo <strong>Safari</strong> no iPhone.<br>3. Toque em <strong>Compartilhar</strong> e depois <strong>Adicionar à Tela de Início</strong>.<br>4. Abra o ícone LOSI PULSO como um aplicativo.</p><p>O endereço deve estar publicado online: abrir um HTML diretamente pelos Arquivos não habilita a instalação PWA.</p>`;
 if(state.sheet==='delete-upload')content=`<h3>Excluir áudio?</h3><p>${t?escape(t.title):'Este arquivo'} será removido do armazenamento deste aplicativo no aparelho.</p><button class="primary-button" style="background:#e9ac96" data-action="confirm-delete-upload" data-id="${escape(state.sheetTrack)}">Excluir áudio</button>`;
 return `<div class="sheet-backdrop" data-action="dismiss-sheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="Ações"><div class="sheet-handle"></div>${content}<div class="sheet-footer"><button class="secondary-button" data-action="dismiss-sheet">Fechar</button></div></div></div>`;
}
function renderOverlays(){$('#overlays').innerHTML=renderPlayer()+renderSheet();syncProgress()}
function render(){renderMain();renderMini();renderOverlays();const avatar=$('.avatar');if(avatar)avatar.textContent='L'}
function showToast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}
function navigate(page){state.page=page;state.sheet=null;state.playlistOpen=null;state.genre='Todos';state.search='';render();if(page==='sets')window.LosiSets?.load();window.scrollTo(0,0)}
function stopAudio(){synth.stop();if(audio){audio.onloadedmetadata=null;audio.ontimeupdate=null;audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();audio=null;}if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null}}
function setupPersonalMediaSession(t){
 if(!('mediaSession' in navigator)||!('MediaMetadata' in window))return;
 try{
  navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist,album:'Losi Pulso · Minha biblioteca',artwork:[{src:new URL('icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}]});
  const actions={play:()=>{if(!state.playing)togglePlay()},pause:()=>{if(state.playing)togglePlay()},previoustrack:()=>nextTrack(true),nexttrack:()=>nextTrack(),seekto:d=>{if(Number.isFinite(d.seekTime))seek(d.seekTime)},seekbackward:d=>seek(Math.max(0,currentPosition()-(d.seekOffset||15))),seekforward:d=>seek(currentPosition()+(d.seekOffset||15))};
  Object.entries(actions).forEach(([action,handler])=>{try{navigator.mediaSession.setActionHandler(action,handler)}catch(e){}});
 }catch(e){console.debug('Controles da tela bloqueada indisponíveis',e)}
}
function playTrack(id,queue=null){
 const t=getTrack(id);if(!t)return showToast('Esta faixa não está disponível');
 try{
  window.LosiBackgroundAudio?.stop();stopAudio();state.current=id;state.position=0;state.playing=true;state.queue=queue||allTracks().map(t=>t.id);
  if(isFile(t)){
   audioURL=URL.createObjectURL(t.blob);audio=new Audio(audioURL);audio.preload='metadata';setupPersonalMediaSession(t);
   audio.onloadedmetadata=()=>{t.duration=Number.isFinite(audio.duration)?audio.duration:0;syncProgress()};
   audio.ontimeupdate=()=>syncProgress();
   audio.onended=()=>state.repeat?playTrack(t.id,state.queue):nextTrack();
   audio.onerror=()=>{state.playing=false;renderMini();renderOverlays();showToast('Este formato não pôde ser reproduzido no iPhone')};
   const p=audio.play();if(p&&p.catch)p.catch(()=>{state.playing=false;renderMini();renderOverlays();showToast('Toque em reproduzir para iniciar o áudio')});
  }else{synth.start(t,0)}
  renderMain();renderMini();renderOverlays();
 }catch(err){state.playing=false;renderMini();renderOverlays();showToast(err.message||'Não foi possível reproduzir')}
}
function togglePlay(){const t=getTrack(state.current);if(!t)return playTrack('d1');if(state.playing){state.position=currentPosition();state.playing=false;if(isFile(t))audio?.pause();else synth.stop()}else{state.playing=true;if(isFile(t)){window.LosiBackgroundAudio?.stop();const p=audio?.play();if(p&&p.catch)p.catch(()=>{state.playing=false;showToast('Toque novamente para reproduzir')})}else{try{synth.start(t,state.position)}catch(e){state.playing=false;showToast('Áudio indisponível')}}}renderMini();renderOverlays()}
function currentPosition(){const t=getTrack(state.current);return !t?0:isFile(t)?(audio?.currentTime||state.position):state.playing?synth.getPosition():state.position}
function syncProgress(){const t=getTrack(state.current);if(!t)return;const duration=dur(t),position=currentPosition(),pct=duration?Math.min(100,(position/duration)*100):0;document.querySelectorAll('.js-progress-fill').forEach(el=>el.style.width=pct+'%');document.querySelectorAll('.js-progress').forEach(el=>{if(document.activeElement!==el)el.value=String(Math.floor(pct*10))});document.querySelectorAll('.js-current-time').forEach(el=>el.textContent=fmtTime(position));document.querySelectorAll('.js-duration').forEach(el=>el.textContent=fmtTime(duration))}
function nextTrack(back=false){const tracks=state.queue.filter(id=>!!getTrack(id));if(!tracks.length)return;const i=tracks.indexOf(state.current);const pos=state.shuffle?Math.floor(Math.random()*tracks.length):(i+(back?-1:1)+tracks.length)%tracks.length;playTrack(tracks[pos],tracks)}
function favorite(id){if(state.fav.has(id))state.fav.delete(id);else state.fav.add(id);save();render();showToast(state.fav.has(id)?'Adicionado aos favoritos':'Removido dos favoritos')}
function openSheet(type,trackId=null){state.sheet=type;state.sheetTrack=trackId;renderOverlays();if(type==='create-playlist')setTimeout(()=>$('#playlist-name')?.focus(),70)}
function db(){if(!('indexedDB'in window))return Promise.reject(new Error('Armazenamento de arquivos indisponível'));if(dbPromise)return dbPromise;dbPromise=new Promise((res,rej)=>{const req=indexedDB.open('losi-pulso-music-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('tracks',{keyPath:'id'});req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});return dbPromise}
async function dbRequest(mode,fn){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('tracks',mode),store=tx.objectStore('tracks');let req,result;try{req=fn(store)}catch(e){reject(e);return}req.onsuccess=()=>{result=req.result};tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||new Error('Transação cancelada'));tx.onerror=()=>reject(tx.error||new Error('Falha no armazenamento'))})}
async function loadUploads(){try{const entries=await dbRequest('readonly',store=>store.getAll());state.uploads=entries.filter(e=>e.blob instanceof Blob).map(e=>({...e,art:'upload',kind:'file'}));render()}catch(e){console.warn('Biblioteca IndexedDB',e)}}
async function importFiles(files){if(!files?.length)return;let count=0;for(const file of files){if(!(file.type.startsWith('audio/')||/\.(mp3|m4a|wav|aac|flac|ogg)$/i.test(file.name))){showToast('Selecione arquivos de áudio');continue}if(file.size>250*1024*1024){showToast('Arquivo muito grande: máximo 250 MB');continue}const record={id:'f'+Date.now()+'-'+Math.random().toString(36).slice(2,8),title:file.name.replace(/\.[^.]+$/,'').trim().slice(0,100)||'Áudio sem nome',artist:'Minha biblioteca',genre:'Meu áudio',kind:'file',art:'upload',blob:file,addedAt:Date.now(),duration:0};try{await dbRequest('readwrite',store=>store.put(record));state.uploads.unshift(record);count++}catch(e){showToast('Não há espaço ou permissão para guardar este arquivo')}}render();if(count)showToast(`${count} áudio(s) adicionados ao seu iPhone`)}
async function deleteAudio(id){if(state.current===id){stopAudio();state.current=null;state.playing=false}try{await dbRequest('readwrite',store=>store.delete(id));state.uploads=state.uploads.filter(t=>t.id!==id);state.fav.delete(id);state.playlists.forEach(p=>p.ids=p.ids.filter(v=>v!==id));save();state.sheet=null;render();showToast('Áudio excluído do aplicativo')}catch(e){showToast('Não foi possível excluir este áudio')}}
function createPost(form){
 const title=form.elements.title.value.trim(),artist=form.elements.artist.value.trim();
 let url;try{url=new URL(form.elements.url.value.trim())}catch(e){return showToast('Insira um link válido')}
 if(url.protocol!=='https:')return showToast('Use um link seguro (https)');
 const host=url.hostname.toLowerCase().replace(/^www\./,'');
 const sites={'soundcloud.com':'SoundCloud','on.soundcloud.com':'SoundCloud','open.spotify.com':'Spotify','spotify.link':'Spotify','youtube.com':'YouTube','m.youtube.com':'YouTube','music.youtube.com':'YouTube','youtu.be':'YouTube'};
 if(!sites[host])return showToast('Use links SoundCloud, Spotify ou YouTube');
 state.posts.unshift({id:'s'+Date.now(),title:title.slice(0,75),artist:artist.slice(0,75),url:url.href,platform:sites[host]});
 state.posts=state.posts.slice(0,50);save();state.sheet=null;render();showToast('Set salvo no seu mural');
}
function createPlaylist(name){const p={id:'p'+Date.now()+'-'+Math.random().toString(36).slice(2,5),name:name.trim().slice(0,55),ids:[]};if(!p.name)return;state.playlists.unshift(p);if(state.sheetTrack&&getTrack(state.sheetTrack))p.ids.push(state.sheetTrack);state.sheet=null;save();render();showToast('Playlist criada')}
function addExistingPlaylist(id){const p=state.playlists.find(p=>p.id===id);if(!p||!state.sheetTrack)return;if(p.ids.includes(state.sheetTrack))showToast('Esta música já está na playlist');else{p.ids.push(state.sheetTrack);save();showToast('Adicionada à playlist')}state.sheet=null;render()}
function handleAction(button){const action=button.dataset.action,id=button.dataset.id;
 switch(action){
 case 'go-home':case 'go-explore':case 'go-profile':navigate({'go-home':'home','go-explore':'explore','go-profile':'profile'}[action]);break;
 case 'nav':navigate(button.dataset.page);break;
 case 'set-genre':state.genre=button.dataset.genre;renderMain();break;
 case 'play-track':playTrack(id);break;
 case 'toggle-play':togglePlay();break;
 case 'next':nextTrack();break;
 case 'prev':if(currentPosition()>3){seek(0)}else nextTrack(true);break;
 case 'shuffle':state.shuffle=!state.shuffle;renderOverlays();break;
 case 'repeat':state.repeat=!state.repeat;renderOverlays();break;
 case 'favorite':favorite(id);break;
 case 'open-player':state.playerOpen=true;renderOverlays();break;
 case 'close-player':state.playerOpen=false;renderOverlays();break;
 case 'add-to-playlist':openSheet('add-to-playlist',id);break;
 case 'create-playlist':openSheet('create-playlist',state.sheetTrack);break;
 case 'add-existing-playlist':addExistingPlaylist(id);break;
 case 'dismiss-sheet':state.sheet=null;renderOverlays();break;
 case 'upload':$('#audio-upload')?.click();break;
 case 'go-offline':navigate('sets');window.LosiSets?.openOffline();break;
 case 'open-playlist':state.playlistOpen=id;renderMain();window.scrollTo(0,0);break;
 case 'close-playlist':state.playlistOpen=null;renderMain();break;
 case 'play-playlist':{const p=state.playlists.find(p=>p.id===id);if(p&&p.ids.length)playTrack(p.ids[0],p.ids.filter(id=>!!getTrack(id)));break}
 case 'delete-playlist':{const p=state.playlists.find(p=>p.id===id);if(!p)return;if(confirm(`Excluir a playlist "${p.name}"?`)){state.playlists=state.playlists.filter(p=>p.id!==id);state.playlistOpen=null;save();render();showToast('Playlist excluída')}break}
 case 'remove-from-playlist':{const p=state.playlists.find(p=>p.id===button.dataset.playlist);if(p){p.ids=p.ids.filter(v=>v!==id);save();renderMain();showToast('Faixa removida')}break}
 case 'delete-upload':openSheet('delete-upload',id);break;
 case 'confirm-delete-upload':deleteAudio(id);break;
 case 'about-install':openSheet('install');break;
 case 'add-post':openSheet('add-post');break;
 case 'open-post':{const post=state.posts.find(p=>p.id===id);if(post)window.open(post.url,'_blank','noopener,noreferrer');break}
 case 'delete-post':state.posts=state.posts.filter(p=>p.id!==id);save();render();showToast('Link removido');break;
 }
}
function seek(position){const t=getTrack(state.current);if(!t)return;const d=dur(t),newPos=Math.min(Math.max(position,0),Math.max(d-.01,0));state.position=newPos;if(isFile(t)){if(audio&&Number.isFinite(audio.duration))audio.currentTime=newPos}else if(state.playing)synth.seek(newPos);syncProgress()}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(!btn)return;if(btn.dataset.action==='dismiss-sheet'&&e.target.closest('.sheet')&&e.target!==btn)return;handleAction(btn)});
document.addEventListener('input',e=>{
 if(e.target.id==='search-input'){state.search=e.target.value;const idx=e.target.selectionStart;renderMain();const el=$('#search-input');if(el){el.focus();try{el.setSelectionRange(idx,idx)}catch(e){}}}
 if(e.target.matches('.js-progress')){const t=getTrack(state.current);if(t)seek(dur(t)*(Number(e.target.value)/1000))}
});
document.addEventListener('submit',e=>{if(e.target.id==='new-playlist-form'){e.preventDefault();createPlaylist($('#playlist-name')?.value||'')}if(e.target.id==='new-post-form'){e.preventDefault();createPost(e.target)}});
document.addEventListener('change',e=>{if(e.target.id==='audio-upload'){importFiles([...e.target.files]);e.target.value=''}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.sheet){state.sheet=null;renderOverlays()}else if(state.playerOpen){state.playerOpen=false;renderOverlays()}}});
window.addEventListener('losi-video-play',()=>{if(state.playing)togglePlay()});
setInterval(()=>{if(state.playing)syncProgress()},250);
render();loadUploads();
if('serviceWorker'in navigator && /^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
