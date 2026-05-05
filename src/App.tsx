import { useState } from 'react';
import { Header } from './components/Header';
import { BookingPage } from './pages/BookingPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CURRENT_CUSTOMER } from './mocks/data';
import './App.css';

type View = 'book' | 'appointments';

function App() {
  const [view, setView] = useState<View>('book');

  return (
    <div className="app">
      <Header
        view={view}
        onNavigate={setView}
        customerName={CURRENT_CUSTOMER.name}
      />
      <main className="main">
        {view === 'book' ? (
          <BookingPage onViewAppointments={() => setView('appointments')} />
        ) : (
          <AppointmentsPage onBookNew={() => setView('book')} />
        )}
      </main>
    </div>
  );
}

export default App;
