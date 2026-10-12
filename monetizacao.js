(function(){
  "use strict";
  var cfg = window.PULSO_MONETIZACAO || {};
  function byId(id){return document.getElementById(id);}
  function str(x){return typeof x === "string" ? x.trim() : "";}
  function validEmail(x){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);}
  function safeUrl(x){
    try { var u = new URL(x); return u.protocol === "https:" ? u.href : ""; }
    catch(e){ return ""; }
  }
  var pix = str(cfg.pixKey);
  if(pix && byId("pix-ready")){
    byId("pix-ready").hidden = false;
    byId("pix-unavailable").hidden = true;
    byId("pix-value").textContent = pix;
    byId("copy-pix").addEventListener("click", async function(){
      var msg = byId("copy-result");
      try {
        if(!navigator.clipboard || !navigator.clipboard.writeText) throw Error("indisponível");
        await navigator.clipboard.writeText(pix);
        msg.textContent = "Chave copiada. Faça a transferência no seu banco, após conferir os dados do beneficiário.";
      } catch(e) {
        msg.textContent = "Copie a chave acima manualmente. Confira o beneficiário antes do pagamento.";
      }
    });
  }
  var email = str(cfg.contatoEmail);
  var contactOkay = validEmail(email);
  var sponsor = safeUrl(str(cfg.parceiroUrl));
  var partnerLink = byId("partner-link");
  if(partnerLink && (sponsor || contactOkay)){
    partnerLink.href = sponsor || ("mailto:" + email + "?subject=" + encodeURIComponent("Parceria comercial - PULSO RADIO"));
    partnerLink.hidden = false;
    byId("partner-unavailable").hidden = true;
    if(!sponsor){partnerLink.removeAttribute("target");partnerLink.removeAttribute("rel");}
  }
  var rightsLink = byId("rights-contact");
  if(rightsLink && contactOkay){
    rightsLink.href = "mailto:" + email + "?subject=" + encodeURIComponent("Notificação de direitos autorais - PULSO RADIO");
    rightsLink.hidden = false;
    byId("rights-unavailable").hidden = true;
  }
}());
