@echo off
echo ===================================================
echo  Piping Dashboard - Auto deploy to GitHub ^& Vercel
echo ===================================================
echo.

:: Add only code and configuration files, excluding large CSV data
git add index.html vercel.json .gitignore .vercelignore

:: Commit with timestamp
git commit -m "Auto-deploy: Update app features (%date% %time%)"

:: Push to GitHub (this automatically triggers the Vercel build webhook)
echo.
echo Pushing changes to GitHub...
git push origin master

echo.
echo ===================================================
echo  Done! Vercel is now building and deploying.
echo  Website: https://piping-dashboard-tau.vercel.app
echo ===================================================
pause
