# PULSO — Android definitivo com atualização segura

> Esta pasta foi preparada para uso no Windows. É **diferente** do APK de teste: o APK distribuído é assinado sempre pela mesma chave privada que você guarda consigo.

## 1. Criar sua chave privada permanente (apenas uma vez)

No Windows, instale **Java JDK 17+** se ainda não tiver `keytool`. Faça download da pasta `android-pulso` do repositório.

Execute **GERAR_CHAVE_PERMANENTE_WINDOWS.cmd**. Informe uma senha forte quando o terminal pedir. A chave será criada em:

`%USERPROFILE%\PULSO_CHAVE_ANDROID_PRIVADA\pulso-release.p12`

**Faça backup criptografado desse arquivo e da senha.** Sem essa chave, não é possível atualizar uma instalação assinada com ela.

Nunca publique o arquivo `.p12` ou a senha no Netlify, em repositórios Git ou em mensagens.

## 2. Cadastrar os segredos no GitHub

Acesse o repositório GitHub → Settings → Secrets and variables → Actions → New repository secret.

Cadastre dois segredos:

- `PULSO_ANDROID_KEYSTORE_BASE64`: execute **COPIAR_CHAVE_BASE64_WINDOWS.cmd** e cole o conteúdo copiado no campo Value.
- `PULSO_ANDROID_KEYSTORE_PASSWORD`: a mesma senha forte digitada quando você criou a chave.

Se sua chave tiver alias diferente de `pulso`, use uma nova chave com o alias certo *antes* de distribuir qualquer versão; **não troque a chave de versões já distribuídas**.

## 3. Gerar Android release pelo GitHub Actions

Depois de aprovar e incorporar o PR, na aba **Actions** do GitHub, selecione **PULSO Android APK assinado** → **Run workflow**.

O GitHub gerará um artefato chamado **PULSO-Android-ASSINADO**. Ele conterá:
- `PULSO-Android.apk` — APK de distribuição assinado por sua chave, não é o APK de depuração.
- `.well-known/assetlinks.json` — vínculo de segurança entre o APK e o endereço Netlify.
- `LEIA.txt` — instruções rápidas.

Se faltar um segredo, a execução *falhará de propósito* antes de compilar.

## 4. Publicar os arquivos no site

No pacote PULSO SITE_NETLIFY, coloque:
- `SITE_NETLIFY/downloads/PULSO-Android.apk`
- `SITE_NETLIFY/.well-known/assetlinks.json`

Depois envie **a pasta inteira SITE_NETLIFY ao Netlify**. Confira:
- https://sunny-paletas-ca93b2.netlify.app/.well-known/assetlinks.json — deve aparecer JSON.
- https://sunny-paletas-ca93b2.netlify.app/downloads/PULSO-Android.apk — deve baixar o APK assinado.

**Atenção:** nunca misture um APK de teste com o arquivo de distribuição. O domínio e o aplicativo devem permanecer iguais para que a Trusted Web Activity fique sem barra do navegador.

## 5. Instalação e atualizações

O botão no site só mostrará **Baixar APK** quando houver um APK assinado no caminho indicado. Antes disso, ofereça a instalação gratuita do PWA pelo Chrome.

No primeiro lançamento do Android assinado, valide player, login, uploads, áudios em segundo plano e notificações. Alguns recursos dependem de Chrome e podem funcionar de modo diferente do iPhone.

Para atualizar, aumente `versionCode` no arquivo `android-pulso/app/build.gradle`, compile novamente **com a mesma chave** e substitua `downloads/PULSO-Android.apk` no Netlify.

Publicar na **Google Play** é um procedimento distinto e pode ter taxas e requisitos adicionais.

## Segurança

- Guarde o arquivo .p12 fora do repositório.
- Não exponha tokens/chaves do Supabase service role nem do Cloudflare.
- Respeite os direitos autorais dos sets e as regras das plataformas.
- A publicação do APK e da associação de domínio requer o seu consentimento final, pois será acessível ao público.
