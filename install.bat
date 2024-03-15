@echo off
chcp 65001 > nul

color 0D
title TweetRandomWord v1.1.0 by LukeTheNeko

mode con: cols=75 lines=11

echo.

where node > nul 2>&1
if %errorlevel% equ 0 (
echo           +---------------------------------------------+
echo                     Installing Dependencies...        
echo           +---------------------------------------------+ 
echo.
    
    npm install @napi-rs/canvas --no-fund > nul
    npm install cron --no-fund > nul
    npm install fs --no-fund > nul
    npm install dotenv --no-fund > nul
    npm install express --no-fund > nul
    npm install node-fetch --no-fund > nul
    npm install node-schedule --no-fund > nul
    npm install twitter-api-v2 --no-fund > nul
    
cls
color 0A
mode con: cols=65 lines=5
echo. 
echo           +---------------------------------------------+
echo                      Installation Completed!        
echo           +---------------------------------------------+ 
    
    timeout /t 3 > nul
    
) else (
cls
color 0C
mode con: cols=65 lines=5
echo.
echo  +------------------------------------------------------------+
echo                  Node.js is not installed. 
echo         Please install Node.js to continue.        
echo  +------------------------------------------------------------+
    pause > nul
)