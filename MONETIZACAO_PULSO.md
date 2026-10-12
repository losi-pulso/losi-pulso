# PULSO RADIO — Monetização legal: primeira etapa

Esta proposta adiciona duas páginas sem integrar gateway de pagamento, sem cobrar pelo áudio e sem publicar anúncios automaticamente.

## Ativação em poucos minutos

1. Edite monetizacao-config.js: coloque uma chave Pix aleatória do seu banco no campo pixKey (evite CPF, telefone e dados pessoais no código público). Escolha um email de contato e configure contatoEmail.
2. Opcionalmente, defina parceiroUrl com HTTPS se tiver um formulário de contato comercial. Sem ele, o botão usa email.
3. Publique os arquivos monetizacao.html, monetizacao.js, monetizacao.css, monetizacao-config.js e direitos.html junto ao site. Faça o mesmo com a alteração de app.js (adiciona o acesso na home e no Perfil) e a atualização de sw.js.
4. Antes de liberar downloads, anúncios ou sets comerciais, revise licenças e autorizações das músicas, gravações e imagens exibidas.
5. Confirme recebimentos no banco. Não existe confirmação automática de Pix e não há consulta a transações.

## Limites de licenciamento e plataforma

- O ECAD orienta que serviços de execução pública musical na internet demandam licença inclusive quando não há receita. Isso NÃO significa que a licença de execução pública dispense permissões sobre fonogramas, vídeos e outras utilizações. Consulte https://www4.ecad.org.br/servicos-digitais-informacoes-gerais/
- O envio com checkbox e aprovação do administrador não provam titularidade nem substituem licenças. Até a verificação, não monetize nem disponibilize publicamente DJ sets de repertório de terceiros como se estivessem liberados.
- O AdSense e outras redes exigem conteúdo e anúncios conforme as políticas, incluindo conteúdos enviados por usuários. Não inclua scripts de anúncios sem aprovação e política de privacidade específica. https://support.google.com/adsense/answer/1355699?hl=pt-BR
- O GitHub Pages NÃO permite hospedagem de sites cuja finalidade principal seja operar negócios ou efetuar transações comerciais. Se o PULSO ganhar caráter comercial predominante, utilize hospedagem com termos compatíveis (p.ex., avalie a hospedagem atual no Netlify). https://docs.github.com/pt/pages/getting-started-with-github-pages/github-pages-limits
- Linkar para conteúdo oficial de outra plataforma não lhe dá direito de copiar, extrair áudio ou burlar o player. Respeite as regras da plataforma de origem.

## Tempo e receita

- Código estático não necessita processamento pago por visitante. Custos de armazenamento, tráfego, domínio ou exigências legais podem surgir; o limite gratuito não é garantia de gratuidade permanente.
- Apoios Pix são voluntários; não há receita assegurada.
- Parcerias exigem conversas e negociação humanas. Não configure publicação automática de publicidade contratada sem revisão.
- Vídeos e MP3 enviados por usuários continuam exigindo moderação e acompanhamento de denúncias.

## Compatibilidade

Esta branch foi criada sobre o repositório losi-pulso/losi-pulso, que continha a versão 3.1 no GitHub. Uma versão posterior eventualmente hospedada no Netlify é outro deploy: integrar os arquivos na versão ativa antes de publicar, sem substituir a versão nova por estes arquivos antigos.
