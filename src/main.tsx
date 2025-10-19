// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Context Providers
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PropertiesProvider } from "./context/PropertyContext"; // Note: Changed from PropertiesContext to PropertyContext
import { InquiriesProvider } from "./context/InquiriesContext";
import { TeamMemberProvider } from "./context/TeamMemberContext";
import { ConstructionProjectProvider } from "./context/ConstructionProjectContext";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {/* 
        Provider hierarchy explanation:
        1. BrowserRouter must wrap everything that uses routing
        2. AuthProvider needs to be accessible everywhere
        3. PropertyProvider depends on auth for API calls
        4. InquiriesProvider depends on auth for API calls
        5. App contains all the route definitions
      */}
      <BrowserRouter>
        <AuthProvider>
          <PropertiesProvider>
            <InquiriesProvider>
              <TeamMemberProvider>
                <ConstructionProjectProvider>
                  <App />
                </ConstructionProjectProvider>
              </TeamMemberProvider>
            </InquiriesProvider>
          </PropertiesProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  console.error(
    "Error: Root element with ID 'root' not found in your public/index.html file."
  );
}
