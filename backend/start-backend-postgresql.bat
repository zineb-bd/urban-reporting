@echo off
echo Demarrage du backend Spring Boot avec PostgreSQL...
echo.
echo ATTENTION: Assurez-vous que PostgreSQL est demarre et que la base de donnees 'cityreport' existe.
echo.
echo Votre version actuelle de Java:
java -version
echo.
echo Tentative de demarrage avec le profil PostgreSQL...
echo.
cd /d %~dp0
mvn clean spring-boot:run -Dspring-boot.run.profiles=postgresql
pause


