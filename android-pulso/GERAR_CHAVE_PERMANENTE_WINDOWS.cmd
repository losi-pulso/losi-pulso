@echo off
chcp 65001 >nul
setlocal
echo =================================================
echo   PULSO - CRIAR CHAVE PERMANENTE DO ANDROID
echo =================================================
where keytool >nul 2>&1
if errorlevel 1 (
 echo ERRO: Java JDK 17 ou superior nao encontrado. Instale um JDK, depois tente novamente.
 pause
 exit /b 1
)
set "PULSO_KEY_DIR=%USERPROFILE%\PULSO_CHAVE_ANDROID_PRIVADA"
set "PULSO_KEY_FILE=%PULSO_KEY_DIR%\pulso-release.p12"
if exist "%PULSO_KEY_FILE%" (
 echo Ja existe uma chave em "%PULSO_KEY_FILE%".
 echo NAO substitua! Uma nova chave impediria atualizacoes em aparelhos com a assinatura antiga.
 pause
 exit /b 1
)
if not exist "%PULSO_KEY_DIR%" mkdir "%PULSO_KEY_DIR%"
echo.
echo Voce criara uma SENHA FORTE. Guarde-a em local seguro.
echo Nao envie a senha nem o arquivo .p12 por mensagem.
echo.
keytool -genkeypair -alias pulso -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12 -keystore "%PULSO_KEY_FILE%" -dname "CN=PULSO by LOSI, OU=Aplicativo, O=PULSO, C=BR"
if errorlevel 1 (
 echo Falhou. Nenhuma chave foi enviada ao GitHub.
 pause
 exit /b 1
)
echo.
echo Chave criada em:
echo "%PULSO_KEY_FILE%"
echo.
echo FACA UM BACKUP SEGURO em um pendrive ou gerenciador confiavel.
echo Nao publique no Netlify ou no repositorio GitHub.
pause
