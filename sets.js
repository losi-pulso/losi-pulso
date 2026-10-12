/* LOSI PULSO v3 | Cloud DJ video sets, authenticação e moderação via Supabase */
(() => {
'use strict';
const cfg = window.LOSI_SUPABASE || {};
const BUCKET = cfg.bucket || 'lp-set-videos';
const GENRES = ['Techno','House','Progressive','Melodic','Minimal','Afro House','Deep House','Outros'];
const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sb = null, initError = '', initialized = false;
const data = {tab:'discover', user:null, admin:false, gallery:[], mine:[], pending:[], busy:false, message:'', error:false, uploadPct:null, query:'', filter:'Todos', activeVideo:null, refreshed:0};
const root = () => document.querySelector('#view');
function client(){
 if(sb) return sb;
 if(!window.supabase?.createClient) { initError='A biblioteca de conexão não carregou. Verifique sua internet e atualize a página.'; return null; }
 if(!cfg.url || !cfg.publishableKey) { initError='A configuração do Supabase está incompleta.'; return null; }
 sb = window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 sb.auth.onAuthStateChange(() => { if(initialized && !data.busy) setTimeout(()=>load(),0); });
 return sb;
}
function info(s,bad=false){data.message=s;data.error=bad;render();}
function setTab(tab){data.tab=tab;data.message='';render();if(tab==='offline')window.LosiOffline?.refresh();if(tab==='music')window.LosiAudio?.load(data.user,data.admin);}
function status(s){return ({pending:'Aguardando aprovação',approved:'Publicado',rejected:'Recusado'})[s] || s;}
function niceDate(s){try{return new Date(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});}catch{return ''}}
function card(v,scope){const isMine=scope==='mine', isMod=scope==='moderate';
 return `<article class="set-card"><button class="set-visual" type="button" data-set-action="watch" data-id="${e(v.id)}" aria-label="Assistir ${e(v.title)}"><span class="set-art-graphic"><span class="set-turntable"></span><span class="set-art-glow"></span></span><span class="set-play">▶</span><span class="set-overlay-tag">${e(v.genre)}</span></button>
 <div class="set-meta"><span class="set-artist">${e(v.artist)}</span><strong>${e(v.title)}</strong><small>${e(v.description || 'DJ set gravado')}</small><div class="set-bottom"><span>${niceDate(v.created_at)}</span>${isMine||isMod?`<span class="set-pill ${e(v.status)}">${status(v.status)}</span>`:'<span class="set-pill approved">SET LIBERADO</span>'}</div>
 ${v.status==='approved'?`<button class="primary-button set-offline-cta" data-set-action="download-video" data-id="${e(v.id)}">↓ Baixar vídeo offline</button>`:''}
 ${isMine&&v.status==='rejected'&&v.review_note?`<p class="set-review-note">Motivo: ${e(v.review_note)}</p>`:''}
 ${isMine&&v.status!=='approved'?`<button class="set-minor" data-set-action="delete" data-id="${e(v.id)}">Excluir envio</button>`:''}
 ${isMod?`<div class="set-review-controls"><button class="primary-button" data-set-action="approve" data-id="${e(v.id)}">✓ Aprovar</button><button class="secondary-button" data-set-action="reject" data-id="${e(v.id)}">Recusar</button></div>`:''}
 </div></article>`;
}
function authForm(){return `<div class="set-auth"><div class="set-auth-symbol">LØ</div><h3>Seu lugar na cabine.</h3><p>Cadastre-se para enviar sets em vídeo. Os vídeos só aparecem ao público depois da aprovação do administrador.</p>
 <form id="set-auth-form"><label class="set-label">Nome artístico <span>(apenas novo cadastro)</span><input name="name" type="text" placeholder="Seu nome de DJ" maxlength="70" autocomplete="nickname"></label>
 <label class="set-label">E-mail<input name="email" type="email" placeholder="dj@exemplo.com" required autocomplete="email"></label>
 <label class="set-label">Senha<input name="password" type="password" minlength="6" required placeholder="Mínimo de 6 caracteres" autocomplete="current-password"></label>
 <div class="set-auth-buttons"><button type="submit" name="mode" value="login" class="primary-button">Entrar</button><button type="submit" name="mode" value="signup" class="secondary-button">Criar conta</button></div></form></div>`;}
function uploadForm(){return `<div class="set-upload-box"><div class="eyebrow">BACKSTAGE / PUBLICAR</div><h3>Compartilhe sua energia.</h3><p>Envie um DJ set gravado para análise. Apenas vídeos aprovados entram na galeria.</p>
 <form id="set-upload-form">
 <label class="set-label">Nome do set<input type="text" name="title" minlength="3" maxlength="120" required placeholder="Ex.: LØSI — Sunset Sessions #01"></label>
 <label class="set-label">Nome artístico<input type="text" name="artist" minlength="2" maxlength="70" required value="${e(data.user?.user_metadata?.dj_name||'')}" placeholder="Seu nome de DJ"></label>
 <label class="set-label">Gênero musical<select name="genre">${GENRES.map(g=>`<option>${e(g)}</option>`).join('')}</select></label>
 <label class="set-label">Descrição<textarea name="description" maxlength="1000" rows="3" placeholder="Conte sobre a energia do set, tracklist, local da gravação..."></textarea></label>
 <label class="set-label">Vídeo do DJ set <span>MP4, MOV ou WebM</span><input id="set-file" type="file" name="video" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" required></label>
 <p class="set-limit">Limite deste teste: <strong>${cfg.maxUploadMB||50} MB por vídeo</strong>. Para sets longos será necessário ampliar o armazenamento. MP4 H.264/AAC é o formato de reprodução mais compatível.</p>
 <label class="set-consent"><input type="checkbox" name="rights" required> Confirmo que tenho autorização para publicar o vídeo, a imagem das pessoas e o conteúdo musical utilizado.</label>
 <div id="set-progress" aria-live="polite"></div>
 <button class="primary-button set-submit" type="submit" ${data.busy?'disabled':''}>${data.busy?'Enviando vídeo...':'Enviar para aprovação →'}</button>
 </form></div>`;}
function browse(){let videos=data.gallery.filter(v=>(data.filter==='Todos'||v.genre===data.filter) && `${v.artist} ${v.title} ${v.genre}`.toLocaleLowerCase('pt-BR').includes(data.query.toLocaleLowerCase('pt-BR')));
 return `<div class="set-head"><div class="eyebrow">LOSI PULSO / VIDEO SESSIONS</div><h2 class="heading">A cena<br><span class="set-neon">em movimento.</span></h2><p class="subcopy">Sets gravados da comunidade eletrônica. Todos os vídeos passam por curadoria.</p><div class="set-hero-stats"><span>▰ <b>${data.gallery.length}</b> sets publicados</span><span class="set-live-dot">● CURADORIA ATIVA</span></div></div>
 <label class="search-wrap set-search">⌕ <input id="set-search" type="search" value="${e(data.query)}" placeholder="Buscar DJ ou set" aria-label="Buscar DJ sets"></label>
 <div class="set-filters">${['Todos',...GENRES].map(g=>`<button data-set-action="filter" data-genre="${e(g)}" class="chip ${data.filter===g?'active':''}">${e(g)}</button>`).join('')}</div>
 <div class="section-head"><h3 class="section-title">DJ sets em vídeo</h3><span class="section-subtitle">${videos.length} resultado(s)</span></div>
 ${data.busy && !data.refreshed?'<div class="set-empty">Carregando vídeos...</div>':videos.length?`<div class="set-card-grid">${videos.map(v=>card(v,'gallery')).join('')}</div>`:`<div class="set-empty"><span>♫</span><strong>A próxima sessão pode ser a sua.</strong><p>Ainda não há sets aprovados com esses filtros. DJs cadastrados podem enviar seus vídeos para a curadoria.</p><button class="primary-button" data-set-action="tab" data-tab="upload">Enviar meu set</button></div>`}`;
}
function mine(){return `<div class="eyebrow">CONTA DJ / MEUS ENVIOS</div><h2 class="heading">Meu backstage.</h2><p class="subcopy">Acompanhe o status dos vídeos que você enviou.</p>${data.mine.length?`<div class="set-card-grid">${data.mine.map(v=>card(v,'mine')).join('')}</div>`:`<div class="set-empty"><strong>Nenhum set enviado ainda.</strong><p>Seu primeiro vídeo pode estar a um upload de distância.</p><button class="primary-button" data-set-action="tab" data-tab="upload">Enviar meu primeiro set</button></div>`}`}
function moderate(){return `<div class="eyebrow">ÁREA RESTRITA / ADMIN</div><h2 class="heading">Painel de curadoria.</h2><p class="subcopy">Assista antes de aprovar. Apenas os aprovados serão visíveis a todos.</p><div class="set-mod-count"><strong>${data.pending.length}</strong> aguardando análise</div>${data.pending.length?`<div class="set-card-grid">${data.pending.map(v=>card(v,'moderate')).join('')}</div>`:`<div class="set-empty"><strong>Fila zerada.</strong><p>Nenhum envio aguardando revisão.</p></div>`}`}
function view(){const user=data.user;
 return `<section class="sets-page"><div class="set-banner"><span class="set-banner-icon">▰</span><div><strong>LOSI PULSO <em>SETS</em></strong><small>VÍDEOS + MP3 + OFFLINE / V3</small></div><span class="set-banner-indicator">●</span></div>
 <div class="set-tabs"><button class="${data.tab==='discover'?'active':''}" data-set-action="tab" data-tab="discover">Vídeos</button><button class="${data.tab==='music'?'active':''}" data-set-action="tab" data-tab="music">♫ MP3</button><button class="${data.tab==='offline'?'active':''}" data-set-action="tab" data-tab="offline">↓ Offline</button><button class="${data.tab==='upload'?'active':''}" data-set-action="tab" data-tab="upload">+ Enviar vídeo</button>${user?`<button class="${data.tab==='mine'?'active':''}" data-set-action="tab" data-tab="mine">Meus sets</button>`:''}${data.admin?`<button class="${data.tab==='moderate'?'active':''}" data-set-action="tab" data-tab="moderate">Aprovar ${data.pending.length?'('+data.pending.length+')':''}</button>`:''}</div>
 ${data.message?`<div class="set-alert ${data.error?'error':''}" role="status">${e(data.message)}</div>`:''}
 ${initError?`<div class="set-alert error">${e(initError)}</div>`:''}
 ${data.tab==='offline'?(window.LosiOffline?.view()||'Offline indisponível'):data.tab==='music'?(window.LosiAudio?.view()||'MP3 indisponível'):data.tab==='discover'?browse():!user?authForm():data.tab==='upload'?uploadForm():data.tab==='mine'?mine():data.admin?moderate():browse()}
 ${user?`<div class="set-signed-in">Conectado: <b>${e(user.email||'DJ')}</b><button data-set-action="logout">Sair</button></div>`:''}
 <div class="set-footnote">Sem publicação automática • Conteúdo sujeito à análise • Respeite direitos autorais e de imagem.</div></section>`;
}
function render(){if(root() && document.querySelector('.sets-page'))root().innerHTML=view();}
async function load(){if(!navigator.onLine){render();return;}const c=client(); if(!c){render();return;} data.busy=true;render();
 try{
  const {data:auth,error:authError}=await c.auth.getUser(); data.user=authError?null:auth.user;
  data.admin=!!data.user && (await c.rpc('lp_is_admin')).data===true;
  const pub=await c.from('lp_video_sets').select('id,owner_id,artist,title,genre,description,storage_path,status,review_note,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(60);
  if(pub.error)throw pub.error;data.gallery=pub.data||[];
  if(data.user){const own=await c.from('lp_video_sets').select('*').eq('owner_id',data.user.id).order('created_at',{ascending:false}).limit(100);if(own.error)throw own.error;data.mine=own.data||[];}
  else data.mine=[];
  if(data.admin){const pend=await c.from('lp_video_sets').select('*').eq('status','pending').order('created_at',{ascending:true}).limit(100);if(pend.error)throw pend.error;data.pending=pend.data||[];}
  else data.pending=[];
  if(!data.user&&['mine','moderate'].includes(data.tab))data.tab='discover';
  data.refreshed=Date.now();window.LosiAudio?.load(data.user,data.admin);
 }catch(err){data.message='Falha ao buscar vídeos: '+String(err.message||err);data.error=true;}
 finally{data.busy=false;render();}
}
async function authenticate(form,mode){const c=client();if(!c){info(initError,true);return;}const name=form.elements.name.value.trim(),email=form.elements.email.value.trim(),password=form.elements.password.value;
 if(mode==='signup' && name.length<2)return info('Informe um nome artístico com pelo menos 2 caracteres.',true);
 data.busy=true;render(); try{
  const result=mode==='signup'?await c.auth.signUp({email,password,options:{data:{dj_name:name},emailRedirectTo:location.origin+location.pathname}}):await c.auth.signInWithPassword({email,password});
  if(result.error)throw result.error;
  data.message=mode==='signup'&&!result.data.session?'Conta criada. Verifique seu e-mail para ativá-la e depois entre.':'Acesso liberado. Bem-vindo ao Losi Pulso.';data.error=false;
  await load();
 }catch(err){info('Não foi possível entrar/cadastrar: '+String(err.message||err),true)} finally{data.busy=false;render();}
}
let tusLoader=null;
function ensureTus(){if(window.tus?.Upload)return Promise.resolve(window.tus);if(tusLoader)return tusLoader;
 tusLoader=new Promise((res,rej)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tus-js-client@4.1.0/dist/tus.min.js';script.onload=()=>window.tus?.Upload?res(window.tus):rej(new Error('Biblioteca de upload indisponível'));script.onerror=()=>rej(new Error('Sem acesso ao servidor de upload'));document.head.appendChild(script)}).catch(err=>{tusLoader=null;throw err});return tusLoader;}
async function tusUpload(file,path,targetBucket=BUCKET,contentType=null,progressId='set-progress'){const c=client(),tus=await ensureTus(),{data:{session}}=await c.auth.getSession();if(!session)throw Error('Sessão expirada. Entre novamente.');
 const host=new URL(cfg.url).hostname.split('.')[0]; const endpoint=`https://${host}.storage.supabase.co/storage/v1/upload/resumable`;
 return new Promise((res,rej)=>{const task=new tus.Upload(file,{endpoint,retryDelays:[0,3000,5000,10000,20000],headers:{authorization:`Bearer ${session.access_token}`,'x-upsert':'false'},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,metadata:{bucketName:targetBucket,objectName:path,contentType:contentType || file.type || (path.endsWith('.mov')?'video/quicktime':path.endsWith('.webm')?'video/webm':'video/mp4'),cacheControl:'3600'},chunkSize:6*1024*1024,onError:rej,onProgress:(uploaded,total)=>{const node=document.getElementById(progressId);if(node){const pc=Math.round(uploaded/Math.max(total,1)*100);node.innerHTML=`<div class="set-progress-track"><span style="width:${pc}%"></span></div><small>Enviando arquivo: ${pc}%</small>`;}},onSuccess:res});task.findPreviousUploads().then(previous=>{if(previous.length)task.resumeFromPreviousUpload(previous[0]);task.start()}).catch(rej)});
}
async function upload(form){if(data.busy)return;const c=client(),file=form.elements.video.files[0];if(!data.user)return info('Entre na sua conta primeiro.',true);
 if(!file)return info('Escolha um vídeo.',true);const ext=(file.name.split('.').pop()||'').toLowerCase();if(!['mp4','mov','webm'].includes(ext))return info('Use vídeo MP4, MOV ou WebM.',true);
 const limit=(cfg.maxUploadMB||50)*1024*1024;if(file.size>limit)return info(`Arquivo muito grande (${(file.size/1024/1024).toFixed(1)} MB). Limite atual: ${cfg.maxUploadMB||50} MB.`,true);
 if(!form.elements.rights.checked)return info('Confirme os direitos de publicação.',true);
 const id=crypto.randomUUID(),storage_path=`${data.user.id}/${id}.${ext}`;
 const record={id,owner_id:data.user.id,title:form.elements.title.value.trim(),artist:form.elements.artist.value.trim(),genre:form.elements.genre.value,description:form.elements.description.value.trim(),file_ext:ext,storage_path,status:'pending'};
 data.busy=true;data.message='';const btn=form.querySelector('button[type=submit]');if(btn){btn.disabled=true;btn.textContent='Preparando upload...';}
 try{const row=await c.from('lp_video_sets').insert(record).select('id').single();if(row.error)throw row.error;
  await tusUpload(file,storage_path);data.tab='mine';data.message='Vídeo enviado com sucesso! Agora aguarde a aprovação do administrador.';data.error=false;await load();
 }catch(err){data.message='Erro no envio: '+String(err.message||err)+'. Se o set aparecer como pendente sem vídeo, exclua-o e tente novamente.';data.error=true;data.busy=false;render();}
 finally{data.busy=false;render();}
}
async function watch(id){const v=[...data.gallery,...data.mine,...data.pending].find(x=>x.id===id);if(!v)return info('Set indisponível.',true);
 try{const result=await client().storage.from(BUCKET).createSignedUrl(v.storage_path,7200);if(result.error)throw result.error;
  document.querySelector('#lp-video-modal')?.remove();const shell=document.createElement('div');shell.id='lp-video-modal';shell.className='lp-video-modal';shell.innerHTML=`<div class="lp-video-backdrop" data-set-action="close-video"></div><section class="lp-video-sheet" role="dialog" aria-label="Reprodutor de vídeo"><button class="lp-video-close" data-set-action="close-video" aria-label="Fechar vídeo">×</button><div class="lp-video-top"><small>LOSI PULSO VIDEO SESSIONS</small><h3>${e(v.title)}</h3><span>${e(v.artist)} · ${e(v.genre)}</span></div><video src="${e(result.data.signedUrl)}" playsinline controls autoplay preload="metadata" controlslist="nodownload"></video><p>${e(v.description||'DJ set gravado')}</p></section>`;
  document.body.appendChild(shell);document.body.style.overflow='hidden';window.dispatchEvent(new Event('losi-video-play'));shell.querySelector('video')?.play()?.catch(()=>{});
 }catch(err){info('Não foi possível abrir o vídeo. Talvez o upload ainda não tenha terminado: '+String(err.message||err),true);}
}
async function review(id,action){if(!data.admin)return info('Apenas administradores podem moderar.',true);
 const note=action==='rejected'?(prompt('Motivo da recusa (será mostrado ao DJ):')||'').trim().slice(0,500):'';
 if(action==='rejected' && !note)return;
 if(action==='approved'&&!confirm('Aprovar e publicar este DJ set para todos os visitantes?'))return;
 data.busy=true;try{const r=await client().from('lp_video_sets').update({status:action,review_note:note,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','pending').select('id');if(r.error)throw r.error;if(!r.data?.length)throw Error('Envio já analisado ou acesso negado.');data.message=action==='approved'?'Vídeo aprovado e disponível na galeria.':'Vídeo recusado. O DJ verá o motivo.';data.error=false;await load();}
 catch(err){info('Falha ao revisar: '+String(err.message||err),true)}finally{data.busy=false;render();}
}
async function remove(id){const v=data.mine.find(x=>x.id===id);if(!v||v.status==='approved')return info('Este envio não pode ser excluído.',true);
 if(!confirm('Excluir permanentemente este vídeo e seu envio?'))return;
 data.busy=true;
 try{const store=await client().storage.from(BUCKET).remove([v.storage_path]);if(store.error)throw store.error;
  const del=await client().from('lp_video_sets').delete().eq('id',id);if(del.error)throw del.error;
  data.message='Seu envio foi excluído.';data.error=false;await load();
 }catch(err){info('Não foi possível excluir: '+String(err.message||err),true)}finally{data.busy=false;render();}
}
async function logout(){if(!client())return;const r=await client().auth.signOut();if(r.error)return info(r.error.message,true);data.user=null;data.admin=false;data.tab='discover';data.message='Você saiu da conta.';data.error=false;await load();}
// Event delegation confined to own controls; no conflicts with the music player's data-action handlers.
document.addEventListener('click', async ev=>{
 const b=ev.target.closest('[data-set-action]');if(!b)return;
 const a=b.dataset.setAction,id=b.dataset.id;
 if(a==='tab'){setTab(b.dataset.tab);if(!initialized){initialized=true;load();}return;}
 if(a==='filter'){data.filter=b.dataset.genre;render();return;}
 if(a==='watch')return watch(id);
 if(a==='download-video'){const v=data.gallery.find(x=>x.id===id);if(v)window.LosiOffline?.save('video',v,client(),BUCKET);return;}
 if(a==='close-video'){document.querySelector('#lp-video-modal')?.remove();document.body.style.overflow='';return;}
 if(a==='approve')return review(id,'approved');
 if(a==='reject')return review(id,'rejected');
 if(a==='delete')return remove(id);
 if(a==='logout')return logout();
});
document.addEventListener('input',ev=>{if(ev.target.id!=='set-search')return;data.query=ev.target.value;const p=ev.target.selectionStart;render();const q=document.querySelector('#set-search');q?.focus();try{q?.setSelectionRange(p,p)}catch{}});
document.addEventListener('submit',ev=>{if(ev.target.id==='set-auth-form'){ev.preventDefault();const mode=ev.submitter?.value||'login';authenticate(ev.target,mode);}else if(ev.target.id==='set-upload-form'){ev.preventDefault();upload(ev.target);}});
window.LosiSets={view,load,client,uploadToStorage:tusUpload,redraw:render,currentTab:()=>data.tab,openOffline:()=>setTab('offline')};
})();
