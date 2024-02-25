Ten projekt został wykonany przez zespół "Algorytmiczni Dijkstrowicze" na [Ogólnopolskie Zawody Techniczne PRIMUS INTER PARES](https://zt.zsl.gda.pl/) organizowane przez Zespół Szkół Łączności
Im. Obrońców Poczty Polskiej w Gdańsku.

---

# [PL] MessageApp - serwer Frontend
To repozytorium funkcjonuje jako zależność dla [repozytorium serwera Backend](https://github.com/NorCz/MessageApp). Zaleca się uruchamianie obu serwerów poprzez jeden [obraz Docker](https://github.com/NorCz/MessageApp/Releases), który zarządza oboma serwerami i ustala właściwe warunki ich pracy w środowisku produkcyjnym.

Mimo że nie jest to zalecane w celach innych niż krótkie sesje debugowania, możliwe jest uruchomienie serwera Frontend niezależnie od serwera Backend, należy jednak pamiętać o utrzymaniu poprawnej konfiguracji środowiska obu serwerów.

> [!WARNING]
> W folderze `src` serwera Frontend należy umieścić **ten sam** plik `.env`, który wykorzystywany jest przez serwer Backend. Wymagane są tutaj pola `server_address` oraz `server_port`.
> Należy upewnić się, aby oba serwery pracowały na **tym samym źródle**. Pozwala to na wykorzystanie w prosty sposób ciasteczek do autentykacji bez dodatkowego zarządzania zapytaniami CORS.

Przed uruchomieniem serwera należy najpierw zainstalować aktualną wersję zależności projektu.
```bash
npm i
```
Serwer można uruchomić następującym skryptem skonfigurowanym dla wsparcia HTTPS w pliku `package.json`:
```bash
npm run start
```
Dodatkowo można zbudować statyczną wersję strony i wystawić ją na dowolnym serwerze z własną konfiguracją (należy jednak pamiętać o zachowaniu zgodnego z serwerem Backend pliku `.env`, oraz utrzymania tego samego źródła obu serwerów) poprzez poniższe polecenie. Gotowa wersja strony zostanie wtedy skompilowana w folderze `build`.
```bash
npm run build
```