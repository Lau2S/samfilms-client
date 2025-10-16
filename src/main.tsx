 import React from "react";
 import ReactDOM from "react-dom/client";
 import RoutesSamFilms from "./routes/RoutesSamFilms.tsx";  
 import './index.scss';

 ReactDOM.createRoot(document.getElementById("root")!).render(
   <React.StrictMode>
     <RoutesSamFilms />
   </React.StrictMode>
 );

console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🌐 API URL:', import.meta.env.VITE_API_URL);