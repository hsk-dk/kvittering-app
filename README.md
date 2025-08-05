# 📱 Kvittering App

En Progressive Web App (PWA) til nemt at håndtere kvitteringer for foreninger. Tag billeder af kvitteringer, indtast beløb og send direkte til kassereren via email.

## 🚀 Live Demo

Appen er tilgængelig på: **https://hsk-dk.github.io/kvittering-app/**

## ✨ Features

- 📸 **Kamera Integration** - Tag billeder af kvitteringer direkte i appen
- 💰 **Beløb Indtastning** - Nem indtastning af kvitteringsbeløb
- 📧 **Email Integration** - Send kvitteringer direkte til kassereren
- 📱 **PWA** - Installer som app på din telefon
- 🔒 **Offline Support** - Fungerer også uden internetforbindelse
- ⚙️ **Indstillinger** - Tilpas kasserer email og andre præferencer

## 📱 Installation på iPhone/Android

### iPhone (Safari):
1. Åbn appen i Safari: https://hsk-dk.github.io/kvittering-app/
2. Tryk på **Del**-knappen (firkant med pil op)
3. Vælg **"Tilføj til hjemmeskærm"**
4. Giv appen et navn og tryk **"Tilføj"**

### Android (Chrome):
1. Åbn appen i Chrome
2. Tryk på **menu** (tre prikker)
3. Vælg **"Tilføj til hjemmeskærm"**
4. Bekræft installationen

## 🎯 Sådan bruges appen

### 1. Første gang
- Åbn indstillinger (⚙️)
- Indtast kassererens email adresse
- Gem indstillingerne

### 2. Registrer kvittering
- Tryk **"Tag billede"** eller **"Vælg fil"**
- Indtast kvitteringsbeløbet
- Tilføj eventuelt en note
- Tryk **"Send kvittering"**

### 3. Email sendes automatisk
- Appen åbner din standard email app
- Email er forudfyldt med:
  - Kassererens email som modtager
  - Emne: "Kvittering til refusion"
  - Kvitteringsbillede som vedhæftning
  - Beløb og note i email teksten

## 🛠️ Tekniske Detaljer

### Teknologier
- **HTML5** - Struktur og semantik
- **CSS3** - Styling og responsive design
- **Vanilla JavaScript** - Funktionalitet og PWA features
- **Service Worker** - Offline support og caching
- **Web App Manifest** - PWA installation

### Browser Support
- ✅ iOS Safari (13+)
- ✅ Android Chrome (80+)
- ✅ Desktop Chrome/Firefox/Safari
- ✅ PWA installation support

### Fil Struktur
```
kvittering-app/
├── index.html          # Hovedapplikation
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── icon-192.png       # App ikon (192x192)
├── icon-512.png       # App ikon (512x512)
└── README.md          # Denne fil
```

## 🔧 Development

### Kør lokalt
```bash
# Clone repository
git clone https://github.com/hsk-dk/kvittering-app.git
cd kvittering-app

# Start lokal server (vælg en af metoderne)
python -m http.server 8000
# eller
npx serve .
# eller
php -S localhost:8000
```

Åbn derefter http://localhost:8000 i din browser.

### Deployment
Appen er automatisk deployed via GitHub Pages når der pushes til `main` branch.

## 📄 Privacy & Sikkerhed

- **Ingen data opbevares** - Alt behandles lokalt på din enhed
- **Ingen tracking** - Ingen cookies eller analytics
- **Email privacy** - Kun du og kassereren ser kvitteringerne
- **Offline først** - Fungerer uden internetforbindelse

## 🤝 Bidrag

Velkommen til at bidrage til projektet:

1. Fork repositoryet
2. Opret en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dine ændringer (`git commit -m 'Add some AmazingFeature'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åbn en Pull Request

## 📞 Support

Har du problemer eller forslag? Opret et [issue](https://github.com/hsk-dk/kvittering-app/issues) eller kontakt [@hsk-dk](https://github.com/hsk-dk).

## 📝 Licens

Dette projekt er open source og tilgængeligt under [MIT License](LICENSE).

---

**Lavet med ❤️ for foreningsarbejde** 
