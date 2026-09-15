@echo off
rem Double-click to build the presentation and open it in your default browser.
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run present
