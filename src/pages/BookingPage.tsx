import { useNavigate } from 'react-router-dom';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { Stepper } from '../components/Stepper';
import { CustomerInfoForm } from '../components/CustomerInfoForm';
import { DealershipPicker } from '../components/DealershipPicker';
import { VehiclePicker } from '../components/VehiclePicker';
import { ServiceTypePicker } from '../components/ServiceTypePicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { BookingReview } from '../components/BookingReview';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { enrichAppointment } from '../services/appointments';

export function BookingPage() {
  const navigate = useNavigate();
  const flow = useBookingFlow();
  const { state } = flow;

  const renderStep = () => {
    switch (state.step) {
      case 0: return <CustomerInfoForm onSubmit={flow.submitCustomerInfo} />;
      case 1: return <DealershipPicker loadDealerships={flow.loadDealerships} onSelect={flow.selectDealership} onBack={flow.goBack} />;
      case 2: return <VehiclePicker    loadVehicles={flow.loadVehicles}       onSelect={flow.selectVehicle}    onBack={flow.goBack} />;
      case 3: return <ServiceTypePicker loadServiceTypes={flow.loadServiceTypes} onSelect={flow.selectServiceType} onBack={flow.goBack} />;
      case 4: return (
        <DateTimePicker
          dealership={state.dealership!} serviceType={state.serviceType!}
          date={state.date} time={state.time} slotAvailability={state.slotAvailability}
          loading={state.loading} error={state.error}
          onDateChange={flow.setDate} onTimeSelect={flow.selectTime} onBack={flow.goBack}
        />
      );
      case 5: return (
        <BookingReview
          customerInfo={state.customerInfo!} dealership={state.dealership!}
          vehicle={state.vehicle!} serviceType={state.serviceType!}
          slot={state.selectedSlot!} hold={state.hold}
          loading={state.loading} error={state.error}
          onConfirm={flow.confirmBooking} onBack={flow.goBack} onHoldExpired={flow.onHoldExpired}
        />
      );
      case 6: {
        const enriched = enrichAppointment(state.appointment!);
        return (
          <ConfirmationCard
            customerInfo={state.customerInfo!} appointment={state.appointment!}
            dealership={enriched.dealership!} vehicle={state.vehicle!}
            serviceType={enriched.serviceType!} technician={enriched.technician!}
            serviceBay={enriched.serviceBay!}
            onBookAnother={flow.reset} onViewAppointments={() => navigate('/appointments')}
          />
        );
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Stepper currentStep={state.step} />
      <div>{renderStep()}</div>
    </div>
  );
}
