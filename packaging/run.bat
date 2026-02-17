@echo off
pushd %~dp0
REM If you want to use a specific java path, change 'java' to the full path to your java.exe
java -Djava.library.path="%~dp0natives" -jar "%~dp0app.jar" %*
popd