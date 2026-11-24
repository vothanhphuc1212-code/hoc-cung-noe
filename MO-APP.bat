@echo off
chcp 65001 >nul
title Hoc cung Noe
cd /d "%~dp0"
set PY=
py -3 --version >nul 2>nul && set PY=py -3
if not defined PY python --version >nul 2>nul && set PY=python
if defined PY %PY% -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)" >nul 2>nul || set PY=
if not defined PY (
  echo.
  echo May chua co Python 3.10 tro len.
  echo 1. Mo https://www.python.org/downloads/ va tai ban moi nhat.
  echo 2. Khi cai, NHO tick o "Add Python to PATH".
  echo 3. Cai xong, bam dup lai file MO-APP.bat nay.
  echo.
  pause
  goto :eof
)
%PY% -m pip install --quiet --disable-pip-version-check -r requirements.txt >nul 2>nul
%PY% app\server.py
if errorlevel 1 (
  echo.
  echo App bi loi. Chup man hinh nay, mo muc Issues tren trang GitHub cua goi de nho giup.
  pause
)
