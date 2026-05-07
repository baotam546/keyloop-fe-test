import { useNavigate } from 'react-router-dom';
import { AppointmentList } from '../components/AppointmentList';

export function AppointmentsPage() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
          <p>View and manage your service appointments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>+ Book New Service</button>
      </div>
      <AppointmentList />
    </div>
  );
}
