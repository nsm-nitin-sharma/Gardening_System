@echo off
setlocal
set MAVEN_VERSION=3.9.6
set DIRNAME=%~dp0
set MAVEN_HOME=%DIRNAME%\.mvn\apache-maven-%MAVEN_VERSION%

if exist "%MAVEN_HOME%\bin\mvn.cmd" goto run

echo Downloading Apache Maven %MAVEN_VERSION%...
if not exist "%DIRNAME%\.mvn" mkdir "%DIRNAME%\.mvn"
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host 'Downloading Maven...'; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip', '%DIRNAME%\.mvn\maven.zip'); Write-Host 'Extracting Maven...'; Expand-Archive -Path '%DIRNAME%\.mvn\maven.zip' -DestinationPath '%DIRNAME%\.mvn\' -Force; Remove-Item '%DIRNAME%\.mvn\maven.zip'"

:run
"%MAVEN_HOME%\bin\mvn.cmd" %*
