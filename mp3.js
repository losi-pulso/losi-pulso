/* LOSI PULSO v3.1 — catálogo de MP3, envio de DJs e aprovação. */
(()=>{
'use strict';
const TABLE='lp_mp3_tracks',BUCKET='lp-mp3';
const GENRES=['Techno','House','Progressive','Melodic','Minimal','Afro House','Deep House','Outros'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data={gallery:[],mine:[],pending:[],user:null,admin:false,section:'catalog',busy:false,message:'',error:false,loaded:false};
const client=()=>window.LosiSets?.client?.();
function notice(text,isError=false){data.message=text;data.error=isError;redraw();}
function redraw(){if(window.LosiSets?.currentTab?.()==='music')window.LosiSets.redraw();}
const status=s=>({pending:'Aguardando aprovação',approved:'Publicado',rejected:'Recusado'})[s]||s;
function card(track,mode){const mine=mode==='mine',mod=mode==='mod';return `<article class="mp3-card"><div class="mp3-art">♫</div><div class="mp3-details"><span class="set-artist">${esc(track.artist)}</span><strong>${esc(track.title)}</strong><small>${esc(track.genre)} ${mine||mod?'· '+status(track.status):'· MP3 aprovado'}</small>${track.description?`<p>${esc(track.description)}</p>`:''}
 <div class="mp3-buttons"><button class="secondary-button" data-mp3-action="listen" data-id="${esc(track.id)}">▶ Ouvir</button>
 ${track.status==='approved'?`<button class="primary-button" data-mp3-action="download" data-id="${esc(track.id)}">↓ Baixar offline</button>`:''}
 ${mine&&track.status!=='approved'?`<button class="set-minor" data-mp3-action="delete" data-id="${esc(track.id)}">Excluir envio</button>`:''}</div>
 ${mine&&track.status==='rejected'&&track.review_note?`<p class="set-review-note">Motivo da recusa: ${esc(track.review_note)}</p>`:''}
 ${mod?`<div class="set-review-controls"><button class="primary-button" data-mp3-action="approve" data-id="${esc(track.id)}">Aprovar</button><button class="secondary-button" data-mp3-action="reject" data-id="${esc(track.id)}">Recusar</button></div>`:''}
 </div></article>`;}
function maxMp3MB(){return Number(window.LOSI_SUPABASE?.maxMp3UploadMB)||50;}
function uploadForm(){return `<div class="set-upload-box mp3-upload"><div class="eyebrow">PUBLICAR / MÚSICA</div><h3>Envie seu MP3.</h3><p>Compartilhe uma faixa autorizada com a comunidade. A publicação depende de aprovação.</p>
 <form id="mp3-upload-form"><label class="set-label">Título da música<input name="title" minlength="3" maxlength="120" required placeholder="Ex.: Midnight Orbit"></label>
 <label class="set-label">Nome artístico<input name="artist" minlength="2" maxlength="70" required value="${esc(data.user?.user_metadata?.dj_name||'')}" placeholder="Nome do DJ"></label>
 <label class="set-label">Estilo musical<select name="genre">${GENRES.map(g=>`<option>${g}</option>`).join('')}</select></label>
 <label class="set-label">Descrição<input name="description" maxlength="500" placeholder="Sobre o lançamento (opcional)"></label>
 <label class="set-label">Arquivo MP3<input name="audio" type="file" accept=".mp3,audio/mpeg,audio/mp3" required></label>
 <p class="set-limit">Limite atual: <strong>${maxMp3MB()} MB por MP3</strong>. Envio em partes com retomada quando a conexão cair. Sets acima de 50 MB exigem um plano de armazenamento maior ou uma integração R2. É necessário ter autorização para publicar.</p>
 <label class="set-consent"><input type="checkbox" name="rights" required> Tenho autorização para publicar e disponibilizar esta música para reprodução e download offline.</label>
 <div id="mp3-progress" aria-live="polite"></div><button class="primary-button" type="submit" ${data.busy?'disabled':''}>${data.busy?'Enviando...':'Enviar MP3 para aprovação →'}</button></form></div>`;}
function view(){return `<div class="mp3-page"><div class="eyebrow">LOSI PULSO / MP3</div><h2 class="heading">Música para<br><span class="set-neon">sentir em qualquer lugar.</span></h2><p class="subcopy">Faixas aprovadas para ouvir online ou guardar no aparelho. A seleção offline funciona sem internet.</p>
 <div class="mp3-subnav"><button class="${data.section==='catalog'?'active':''}" data-mp3-action="section" data-section="catalog">Ouvir MP3</button><button class="${data.section==='upload'?'active':''}" data-mp3-action="section" data-section="upload">+ Publicar</button>${data.user?`<button class="${data.section==='mine'?'active':''}" data-mp3-action="section" data-section="mine">Meus MP3</button>`:''}${data.admin?`<button class="${data.section==='mod'?'active':''}" data-mp3-action="section" data-section="mod">Aprovar ${data.pending.length?'('+data.pending.length+')':''}</button>`:''}</div>
 ${data.message?`<div class="set-alert ${data.error?'error':''}" role="status">${esc(data.message)}</div>`:''}
 ${data.section==='catalog'?(data.gallery.length?`<div class="mp3-list">${data.gallery.map(v=>card(v,'catalog')).join('')}</div>`:`<div class="set-empty"><span>♫</span><strong>${data.loaded?'O primeiro lançamento está chegando.':'Buscando músicas...'}</strong><p>As músicas enviadas por DJs aparecem aqui depois da aprovação.</p></div>`):
 data.section==='upload'?(!data.user?`<div class="set-empty"><strong>Entre na sua conta de DJ para enviar MP3.</strong><p>Use a aba + Enviar para se cadastrar ou entrar com seu e-mail.</p><button class="primary-button" data-set-action="tab" data-tab="upload">Entrar ou criar conta</button></div>`:uploadForm()):
 data.section==='mine'?(data.mine.length?`<div class="mp3-list">${data.mine.map(v=>card(v,'mine')).join('')}</div>`:'<div class="set-empty">Nenhum MP3 enviado ainda.</div>'):
 data.admin?(data.pending.length?`<div class="mp3-list">${data.pending.map(v=>card(v,'mod')).join('')}</div>`:'<div class="set-empty">Nenhum MP3 aguardando aprovação.</div>'):'<div class="set-empty">Área restrita.</div>'}
 </div>`;}
async function load(user,admin){data.user=user||null;data.admin=!!admin;
 if(!navigator.onLine){data.loaded=true;redraw();return;}
 const c=client();if(!c)return;
 try{const pub=await c.from(TABLE).select('*').eq('status','approved').order('created_at',{ascending:false}).limit(80);if(pub.error)throw pub.error;data.gallery=pub.data||[];
  if(user){const own=await c.from(TABLE).select('*').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(80);if(own.error)throw own.error;data.mine=own.data||[];}else data.mine=[];
  if(admin){const pend=await c.from(TABLE).select('*').eq('status','pending').order('created_at',{ascending:true}).limit(80);if(pend.error)throw pend.error;data.pending=pend.data||[];}else data.pending=[];
  if(!user&&['mine','mod'].includes(data.section))data.section='catalog';data.loaded=true;
 }catch(err){data.message='Não foi possível carregar os MP3: '+String(err.message||err);data.error=true;data.loaded=true;}redraw();}
function get(id){return [...data.gallery,...data.mine,...data.pending].find(x=>x.id===id);}
async function signed(t){const c=client();if(!c)throw Error('Conecte à internet para reproduzir este MP3.');const l=await c.storage.from(BUCKET).createSignedUrl(t.storage_path,21600);if(l.error)throw l.error;return l.data.signedUrl;}
async function listen(id){const t=get(id);if(!t)return notice('MP3 indisponível.',true);
 try{const url=await signed(t);await window.LosiBackgroundAudio.play({url,title:t.title,artist:t.artist,source:'MP3 · '+t.genre});
 }catch(err){notice('Erro ao abrir MP3: '+String(err.message||err),true);}}

function close(){const el=document.getElementById('lp-mp3-modal');el?.querySelector('audio')?.pause();el?.remove();document.body.style.overflow='';}
async function upload(form){if(data.busy||!data.user)return;const file=form.elements.audio.files[0];if(!file)return notice('Selecione um arquivo MP3.',true);
 if(!/\.mp3$/i.test(file.name))return notice('Apenas arquivos .mp3 são aceitos para publicação.',true);
 if(file.size>maxMp3MB()*1024*1024||!file.size)return notice(`O MP3 deve ter entre 1 byte e ${maxMp3MB()} MB. Para enviar sets maiores, é necessário ampliar o armazenamento.`,true);
 if(!form.elements.rights.checked)return notice('É necessário confirmar autorização para publicação e download.',true);
 const id=crypto.randomUUID(),path=`${data.user.id}/${id}.mp3`;
 const record={id,owner_id:data.user.id,artist:form.elements.artist.value.trim(),title:form.elements.title.value.trim(),genre:form.elements.genre.value,description:form.elements.description.value.trim(),storage_path:path,status:'pending'};
 data.busy=true;data.message='';form.querySelector('button[type=submit]').disabled=true;
 try{const ins=await client().from(TABLE).insert(record).select('id').single();if(ins.error)throw ins.error;
  await window.LosiSets.uploadToStorage(file,path,BUCKET,'audio/mpeg','mp3-progress');data.section='mine';data.message='MP3 enviado! Aguarde a aprovação para entrar no catálogo e habilitar downloads.';data.error=false;await load(data.user,data.admin);
 }catch(err){data.message='Falha no envio: '+String(err.message||err)+'. Caso apareça como pendente sem áudio, exclua e envie novamente.';data.error=true;}
 finally{data.busy=false;redraw();}}
async function review(id,status){if(!data.admin)return notice('Somente administradores podem aprovar.',true);
 const reason=status==='rejected'?(prompt('Motivo da recusa:')||'').trim().slice(0,500):'';
 if(status==='rejected'&&!reason)return;if(status==='approved'&&!confirm('Aprovar esta música para reprodução e download offline?'))return;
 const res=await client().from(TABLE).update({status,review_note:reason,reviewed_at:new Date().toISOString()}).eq('id',id).eq('status','pending').select('id');
 if(res.error)return notice(res.error.message,true);if(!res.data?.length)return notice('Faixa já analisada ou sem permissão.',true);
 data.message='MP3 '+(status==='approved'?'aprovado':'recusado')+'.';data.error=false;await load(data.user,data.admin);}
async function remove(id){const t=data.mine.find(x=>x.id===id);if(!t||t.status==='approved'||!confirm(`Excluir seu MP3 "${t.title}"?`))return;
 const storage=await client().storage.from(BUCKET).remove([t.storage_path]);if(storage.error)return notice(storage.error.message,true);
 const res=await client().from(TABLE).delete().eq('id',id);if(res.error)return notice(res.error.message,true);
 data.message='Envio excluído.';data.error=false;await load(data.user,data.admin);}
async function download(id){const t=get(id);if(!t||t.status!=='approved')return notice('Somente faixas aprovadas podem ser baixadas.',true);
 await window.LosiOffline.save('audio',t,client(),BUCKET);}
document.addEventListener('click',event=>{const b=event.target.closest('[data-mp3-action]');if(!b)return;
 const a=b.dataset.mp3Action,id=b.dataset.id;
 if(a==='section'){data.section=b.dataset.section;redraw();}else if(a==='listen')listen(id);else if(a==='download')download(id);
 else if(a==='close')close();else if(a==='approve')review(id,'approved');else if(a==='reject')review(id,'rejected');else if(a==='delete')remove(id);
});
document.addEventListener('submit',e=>{if(e.target.id==='mp3-upload-form'){e.preventDefault();upload(e.target);}});
window.LosiAudio={view,load,redraw};
})();
