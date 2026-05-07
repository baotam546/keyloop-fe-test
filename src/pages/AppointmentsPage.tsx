import { useNavigate } from 'react-router-dom';
import { AppointmentList } from '../components/AppointmentList';
import { Button } from '../components/ui/button';

export function AppointmentsPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your service appointments.</p>
        </div>
        <Button onClick={() => navigate('/')}>+ Book New Service</Button>
      </div>
      <AppointmentList />
    </div>
  );
}
