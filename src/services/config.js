 import Constants from 'expo-constants';

 // Automatically derive API URL in development from Expo host IP
 // and use a fixed URL in production.

 function getDevApiUrl() {
   const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.23:19000"
   if (!hostUri) {
     // Fallback when hostUri is not available (e.g. running in a different context)
     return 'http://localhost:5000';
   }

   const host = hostUri.split(':')[0];
   return `http://${host}:5000`;
 }

 const DEV_API_URL = getDevApiUrl();

 // Deployed backend URL on Render for preview/production builds
 const PROD_API_URL = 'https://bete-mobile-app-backend.onrender.com';

 export const API_URL =
   process.env.NODE_ENV === 'development' ? DEV_API_URL : PROD_API_URL;
