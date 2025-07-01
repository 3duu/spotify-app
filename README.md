Spotify Clone – Mobile App
A cross-platform mobile app (iOS & Android) built with React Native + TypeScript that mimics core Spotify functionality: music browsing, searching, playback, playlists, albums, podcasts, and more.
The app connects to a Go backend that implements a mock Spotify API, serving real music metadata and streaming MP3s from your local data folder.

Features
🎵 Home, Search, and Library tabs

🔍 Browse playlists, albums, artists, podcasts, and tracks

▶️ Stream and control audio playback (play, pause, skip, seek)

🟢 Floating player bar and full “Now Playing” screen

🎶 Manage playlists (add, remove, create, edit)

📈 Recent plays, recommendations, and “TGIF”/newsletter features

🗂️ All data provided by a Go backend, with local MP3 storage

Requirements
Node.js (18.x or higher)

Yarn or npm

Expo CLI (npm install -g expo-cli)

Go (1.18+)

Git

Quickstart
1. Clone the repository
bash
Copiar
Editar
git clone https://github.com/YOUR_USERNAME/spotify-clone-frontend.git
cd spotify-clone-frontend
2. Install dependencies
bash
Copiar
Editar
yarn        # or: npm install
3. Start the Go backend
You need the backend running locally!
Clone or download the backend repo (or use the /backend folder if included in this repo):

bash
Copiar
Editar
git clone https://github.com/YOUR_USERNAME/spotify-clone-backend.git
cd spotify-clone-backend
go run main.go
By default, the backend runs at http://localhost:8080

It seeds data from data/defaults.json

MP3s and cover images should be in data/media/

If running on a real device, you must change the API base URL in the mobile app to point to your computer’s local network IP, e.g., http://192.168.0.10:8080

4. Configure API base URL
Edit src/services/api.ts and set the API constant to match your backend:

ts
Copiar
Editar
// Example:
export const API = 'http://localhost:8080';
// Or for LAN testing:
export const API = 'http://192.168.0.10:8080';
5. Run the mobile app
To start with Expo Go (best for most dev)
bash
Copiar
Editar
npx expo start
Scan the QR code in Expo Go app (Android/iOS) or

Press a to launch in Android emulator, or i for iOS simulator

To build or run in a pure React Native environment
bash
Copiar
Editar
npx expo run:android
npx expo run:ios
Project Structure
graphql
Copiar
Editar
spotify-clone-frontend/
│
├── src/
│   ├── components/       # UI building blocks (Player, Header, Body, HomeItems, etc)
│   ├── screens/          # Main app screens (HomeScreen, SearchScreen, TrackDetails, etc)
│   ├── services/         # API clients and helpers
│   ├── store/            # Redux/Zustand state management
│   └── assets/           # Images, icons, local mp3 (if needed)
│
├── App.tsx               # App entry point and navigation setup
└── ...
Useful Scripts
yarn start – Run Expo Dev Server

yarn android – Launch Android app

yarn ios – Launch iOS app

yarn lint – Lint code

Backend (Go) – Features & Structure
Built with Go, using the Gin framework and SQLite

Implements mock Spotify API: /tracks/:id, /playlists, /albums, /artists, /search, /newsletters, /users, /me, etc.

Stores music data, playlists, users, and “newsletter” features in SQLite, seeded from data/defaults.json

Serves static files (MP3, covers) via /media

Handles simple OAuth-like authentication, recent plays, recommendations, and more

For details and endpoints, see the backend README or OpenAPI spec.

Troubleshooting
If the app can’t connect to backend, make sure:

Go server is running

The API URL in api.ts matches your machine’s IP and is reachable from device/emulator

To add songs or images, place them in /backend/data/media/

For fresh seed data, delete app.db in the backend folder and restart the server

Contributing
Open issues or PRs if you find bugs or want to suggest features!

All code should be formatted and linted before pushing

License
MIT © YOUR_NAME
