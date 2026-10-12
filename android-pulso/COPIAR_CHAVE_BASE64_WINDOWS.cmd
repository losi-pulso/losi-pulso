@echo off
setlocal
set "PULSO_KEY_FILE=%USERPROFILE%\PULSO_CHAVE_ANDROID_PRIVADA\pulso-release.p12"
if not exist "%PULSO_KEY_FILE%" (
 echo Chave nao encontrada. Rode primeiro GERAR_CHAVE_PERMANENTE_WINDOWS.cmd
 pause
 exit /b 1
)
powershell -NoProfile -Command "$b=[IO.File]::ReadAllBytes($env:PULSO_KEY_FILE);[Convert]::ToBase64String($b) | Set-Clipboard"
if errorlevel 1 (
 echo Falha ao copiar. Verifique se PowerShell esta disponivel.
 pause
 exit /b 1
)
echo Chave codificada copiada para a area de transferencia.
echo No GitHub, cole SOMENTE em Settings ^> Secrets and variables ^> Actions ^> New repository secret
echo Nome: PULSO_ANDROID_KEYSTORE_BASE64
echo Esvazie o clipboard depois de salvar o segredo.
pause
