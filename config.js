/* Chave publicável do Supabase: pode ficar no navegador. NÃO insira service_role/secret aqui. */
window.LOSI_SUPABASE = Object.freeze({
  url: 'https://tkarjnhdnhirguqbzaxs.supabase.co',
  publishableKey: 'sb_publishable_2idlqWc7Sz0dLI_xwavNRA_C4bOFkIn',
  bucket: 'lp-set-videos',
  mp3Bucket: 'lp-mp3',
  maxUploadMB: 50,
  // MP3 acima de 50 MB: exige Supabase Pro ou integracao com R2.
  // Ajuste o limite global do Storage E o limite do bucket antes de aumentar.
  maxMp3UploadMB: 50,
  maxOfflineMB: 250
});
