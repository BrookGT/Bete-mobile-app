# Bete (mobile)

This repository contains the Bete Expo React Native app. The project was initialized with `create-expo-app`.

Quick start

1. Install dependencies:

```powershell
cd "c:\Users\BirukGT\Desktop\Projects\React-Native Project\bete-mobile-app"
npm install
```

2. Start Expo dev server:

```powershell
npm start
```

3. Open Expo Go on your Android device and scan the QR code shown in the terminal.

What I scaffolded

-   `src/navigation/MainTabNavigator.js` — basic bottom tabs (Home, Chats)
-   `src/screens/*` — placeholder screens for Home and Chat
-   `src/components/*` — small shared components and chat message bubble
-   `src/services/mockChat.js` — in-memory mock chat service to use until backend is available

Next steps

-   Choose an auth provider (Clerk / Supabase / Auth0) so I can scaffold auth flows.
-   Decide on map solution (react-native-maps recommended). If you insist on Leaflet we can embed it in a WebView.
-   Implement a minimal backend to talk to Neon (recommended) or use a hosted backend-as-a-service for auth and realtime chat.
