/* LOSI PULSO v3.1 — downloads privados MP3 e vídeo, armazenados localmente no IndexedDB. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='losi-pulso-offline-v3';
let dbPromise=null, playingUrl=null, busyId=null, progress='', error='';
let items=[];let loaded=false;
const key=(kind,id)=>`${kind}:${id}`;
function db(){
 if(dbPromise)return dbPromise;
 if(!window.indexedDB)return Promise.reject(Error('Armazenamento offline indisponível neste navegador.'));
 dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(KEY,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('media'))req.result.createObjectStore('media',{keyPath:'key'});};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('Falha ao abrir biblioteca offline'));
 }).catch(err=>{dbPromise=null;throw err});return dbPromise;
}
async function tx(mode,fun){const d=await db();return new Promise((resolve,reject)=>{
 const t=d.transaction('media',mode);const r=fun(t.objectStore('media'));let result;
 if(r){r.onsuccess=()=>{result=r.result};r.onerror=()=>reject(r.error);}
 t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);
});}
async function refresh(){try{items=(await tx('readonly',s=>s.getAll())).sort((a,b)=>b.savedAt-a.savedAt);error='';loaded=true;}catch(err){loaded=true;error=err.message||String(err);}rerender();return items;}
const bytes=n=>n>=1024**3?(n/1024**3).toFixed(2)+' GB':n>=1024**2?(n/1024**2).toFixed(1)+' MB':(n/1024).toFixed(0)+' KB';
function view(){
 const total=items.reduce((n,x)=>n+(x.size||0),0);
 return `<div class="offline-page"><div class="eyebrow">LOSI PULSO / OFFLINE</div><h2 class="heading">Seu som.<br><span class="set-neon">Sem internet.</span></h2><p class="subcopy">Vídeos de sets e músicas MP3 baixados neste iPhone. Eles abrem mesmo no modo avião enquanto o iOS conservar o armazenamento.</p>
 <div class="offline-stats"><div><strong>${items.length}</strong><span>arquivos baixados</span></div><div><strong>${bytes(total)}</strong><span>espaço utilizado</span></div></div>
 ${error?`<div class="set-alert error" role="alert">${esc(error)}</div>`:''}
 ${progress?`<div class="set-alert" role="status">${esc(progress)}</div>`:''}
 ${!loaded?'<div class="set-empty">Carregando sua biblioteca offline...</div>':items.length?`<div class="offline-list">${items.map(it=>`<article class="offline-item"><div class="offline-file-icon">${it.kind==='video'?'▣':'♫'}</div><div class="offline-info"><strong>${esc(it.title)}</strong><small>${esc(it.artist)} · ${it.kind==='video'?'VÍDEO':'MP3'} · ${bytes(it.size)}</small></div><div class="offline-actions"><button data-offline-action="play" data-id="${esc(it.key)}" aria-label="Reproduzir ${esc(it.title)}">▶</button><button data-offline-action="delete" data-id="${esc(it.key)}" aria-label="Excluir ${esc(it.title)}">×</button></div></article>`).join('')}</div>`:`<div class="set-empty"><span>↓</span><strong>Nada baixado ainda.</strong><p>Abra as abas <b>Vídeos</b> ou <b>MP3</b> e toque em <b>Baixar offline</b> nos conteúdos aprovados.</p><button class="primary-button" data-set-action="tab" data-tab="discover">Explorar vídeos</button></div>`}
 <div class="offline-warning">⚠️ Downloads offline ficam no armazenamento do navegador/app. O iOS pode apagá-los para liberar espaço ou ao limpar dados do Safari. Não são backups permanentes. Vídeos do YouTube incorporados não são baixados.</div></div>`;
}
function feedback(){
 let el=document.getElementById('lp-download-status');
 if(!el){el=document.createElement('div');el.id='lp-download-status';el.className='lp-download-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el);}
 el.textContent=error||progress||'';el.hidden=!(busyId||error||progress);
 el.classList.toggle('failed',!!error);
}
function rerender(){feedback();const root=document.querySelector('.sets-page');if(root&&window.LosiSets?.currentTab?.()==='offline')window.LosiSets.redraw();}
function has(kind,id){return items.some(it=>it.key===key(kind,id));}
async function save(kind,record,client,bucket){
 const id=key(kind,record.id);if(busyId)return;
 if(has(kind,record.id)){error='Este arquivo já está disponível offline.';rerender();return;}
 if(!navigator.onLine){error='Conecte à internet para baixar este arquivo.';rerender();return;}
 if(!client){error='Conexão com a plataforma indisponível.';rerender();return;}
 busyId=id;error='';progress=`Preparando ${kind==='video'?'vídeo':'MP3'} para download...`;rerender();
 try{
  const link=await client.storage.from(bucket).createSignedUrl(record.storage_path,1800);
  if(link.error)throw link.error;
  const response=await fetch(link.data.signedUrl,{cache:'no-store'});
  if(!response.ok)throw Error(`Falha no download (HTTP ${response.status})`);
  const max=(Number(window.LOSI_SUPABASE?.maxOfflineMB)||50)*1024*1024;const length=Number(response.headers.get('content-length')||0);
  if(length>max)throw Error('Arquivo maior que o limite offline configurado para este aparelho.');
  const chunks=[];let received=0;
  if(response.body?.getReader){const reader=response.body.getReader();try{while(true){const {done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>max){await reader.cancel();throw Error('Arquivo muito grande para esta versão.');}chunks.push(value);progress=`Baixando ${esc(record.title)}: ${length?Math.round(100*received/length)+'%':bytes(received)}`;rerender();}}finally{reader.releaseLock?.();}}
  else {const blob=await response.blob();received=blob.size;if(received>max)throw Error('Arquivo muito grande.');chunks.push(blob);}
  const ext=String(record.storage_path||'').split('.').pop().toLowerCase();
  const mime=kind==='video'?({mp4:'video/mp4',mov:'video/quicktime',webm:'video/webm'}[ext]||'video/mp4'):'audio/mpeg';
  const blob=new Blob(chunks,{type:mime.split(';')[0]});
  if(navigator.storage?.estimate){const est=await navigator.storage.estimate();if(est.quota && est.usage && est.quota-est.usage<blob.size)throw Error('Espaço insuficiente no armazenamento do app.');}
  await tx('readwrite',s=>s.put({key:id,kind,id:record.id,title:record.title,artist:record.artist,genre:record.genre,blob,size:blob.size,savedAt:Date.now()}));
  progress=`✓ ${record.title} foi salvo para ouvir/assistir offline.`;await refresh();
 }catch(err){error='Não foi possível baixar: '+String(err.message||err);}
 finally{busyId=null;rerender();}
}
async function play(id){const it=items.find(x=>x.key===id);if(!it){error='Arquivo offline não encontrado. Atualize a biblioteca.';rerender();return;}
 if(it.kind==='audio'){
  try{await window.LosiBackgroundAudio.playBlob(it.blob,{title:it.title,artist:it.artist,source:'Offline'});}
  catch(err){error='Não foi possível tocar este arquivo: '+String(err.message||err);rerender();}return;
 }
 close();const overlay=document.createElement('div');overlay.id='lp-offline-modal';overlay.className='lp-video-modal';
 playingUrl=URL.createObjectURL(it.blob);
 overlay.innerHTML=`<div class="lp-video-backdrop" data-offline-action="close"></div><section class="lp-video-sheet" role="dialog" aria-label="Reprodução offline"><button class="lp-video-close" data-offline-action="close">×</button><div class="lp-video-top"><small>LOSI PULSO · OFFLINE</small><h3>${esc(it.title)}</h3><span>${esc(it.artist)}</span></div><video controls playsinline preload="metadata" src="${playingUrl}"></video><p>Salvo neste dispositivo · ${bytes(it.size)}</p></section>`;
 document.body.appendChild(overlay);document.body.style.overflow='hidden';window.LosiBackgroundAudio?.pause();window.dispatchEvent(new Event('losi-video-play'));
}

function close(){const el=document.getElementById('lp-offline-modal');if(el){el.querySelector('video,audio')?.pause();el.remove();document.body.style.overflow='';}if(playingUrl){URL.revokeObjectURL(playingUrl);playingUrl=null;}}
async function remove(id){const it=items.find(x=>x.key===id);if(!it||!confirm(`Excluir "${it.title}" dos downloads deste aparelho?`))return;
 try{await tx('readwrite',s=>s.delete(id));await refresh();progress='Arquivo excluído do dispositivo.';}catch(err){error='Erro ao excluir: '+String(err.message||err);}rerender();}
document.addEventListener('click',event=>{const btn=event.target.closest('[data-offline-action]');if(!btn)return;
 const action=btn.dataset.offlineAction,id=btn.dataset.id;
 if(action==='play')play(id);else if(action==='delete')remove(id);else if(action==='close')close();});
window.LosiOffline={view,refresh,save,has,close};
refresh();
})();
