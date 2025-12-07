
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentProfilePage } from './pages/AgentProfilePage';
import { AdvertisePage } from './pages/AdvertisePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Simple placeholder for pages not fully implemented to ensure router validity
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-32 pb-20 container mx-auto px-4 text-center">
    <h1 className="text-4xl font-bold mb-4 text-brand-dark dark:text-white">{title}</h1>
    <p className="text-gray-500 dark:text-gray-400 mb-8">This page is part of the full specification but currently under development for this demo.</p>
    <div className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700">
      <span className="text-gray-400 font-medium">Content Placeholder</span>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:id" element={<AgentProfilePage />} />
              <Route path="/advertise" element={<AdvertisePage />} />
              <Route path="/about" element={<PlaceholderPage title="About PropertyHub" />} />
              <Route path="/saved" element={<PlaceholderPage title="Saved Properties" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
