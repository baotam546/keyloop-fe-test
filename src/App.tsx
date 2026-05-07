import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { BookingPage } from './pages/BookingPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { TechnicianDashboardPage } from './pages/TechnicianDashboardPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/technician" element={<TechnicianDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
