# PULSO Android — APK de teste

Este módulo Android é **independente do site GitHub Pages antigo** e abre diretamente:
https://sunny-paletas-ca93b2.netlify.app/

Usa o componente **Trusted Web Activity** do Android Browser Helper. Não armazena músicas nem credenciais no APK: login, mídia e playlists são fornecidos pelo site Netlify/Supabase/Cloudflare R2.

## Como baixar o APK

1. Abra a aba **Actions** do repositório, selecione **PULSO Android APK (teste)**.
2. Clique **Run workflow**, selecione a branch que contém esta implementação e execute.
3. Abra a execução concluída; no rodapé, em **Artifacts**, baixe `PULSO-Android-TESTE`.
4. Extraia o ZIP baixado para encontrar `app-debug.apk` e envie-o ao seu Android para testar.

**Atenção:** este APK é assinado com o certificado temporário de depuração do GitHub. É só para testes, não para loja ou distribuição pública contínua. Cada execução pode gerar certificado diferente e exigir desinstalar a versão de teste anterior. Não confunda o ZIP de Artifacts com o APK.

## Para criar um APK definitivo

Configure uma **keystore própria e persistente**, faça um build Release e publique `/.well-known/assetlinks.json` com a impressão SHA-256 do certificado no **mesmo domínio Netlify**. Até realizar a verificação Digital Asset Links, a Trusted Web Activity pode exibir uma barra do navegador. Evite publicar a keystore ou senhas no GitHub; use os Secrets de Actions.

A funcionalidade de áudio em segundo plano e os uploads precisam ser validados no Android real; a TWA respeita limitações do navegador e de plataformas incorporadas como YouTube.
