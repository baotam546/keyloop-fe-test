import { AppointmentList } from '../components/AppointmentList';

interface Props {
  onBookNew: () => void;
}

export function AppointmentsPage({ onBookNew }: Props) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
          <p>View and manage your service appointments.</p>
        </div>
        <button className="btn btn-primary" onClick={onBookNew}>+ Book New Service</button>
      </div>
      <AppointmentList />
    </div>
  );
}
