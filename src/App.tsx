// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Public Pages
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ConstructionPage from "./pages/ConstructionPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Register from "./pages/admin/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminTeamMembers from "./pages/admin/AdminTeamMember";
import AdminConstruction from "./pages/admin/AdminConstruction";
import AdminLayout from "./components/admin/AdminLayout";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Public Routes with Header/Footer */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <Routes>
                <Route index element={<HomePage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="property/:id" element={<PropertyDetailPage />} />
                <Route path="construction" element={<ConstructionPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Routes>
              <Footer />
            </>
          }
        />

        {/* Admin Auth Routes (outside layout) */}
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected Routes (inside layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="teamMembers" element={<AdminTeamMembers />} />
          <Route path="construction" element={<AdminConstruction />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
