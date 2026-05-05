import { useBookingFlow } from '../hooks/useBookingFlow';
import { Stepper } from '../components/Stepper';
import { DealershipPicker } from '../components/DealershipPicker';
import { VehiclePicker } from '../components/VehiclePicker';
import { ServiceTypePicker } from '../components/ServiceTypePicker';
import { DateTimePicker } from '../components/DateTimePicker';
import { SlotPicker } from '../components/SlotPicker';
import { BookingReview } from '../components/BookingReview';
import { ConfirmationCard } from '../components/ConfirmationCard';
import { enrichAppointment } from '../services/appointments';

interface Props {
  onViewAppointments: () => void;
}

export function BookingPage({ onViewAppointments }: Props) {
  const flow = useBookingFlow();
  const { state } = flow;

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return (
          <DealershipPicker
            loadDealerships={flow.loadDealerships}
            onSelect={flow.selectDealership}
          />
        );
      case 1:
        return (
          <VehiclePicker
            loadVehicles={flow.loadVehicles}
            onSelect={flow.selectVehicle}
            onBack={flow.goBack}
          />
        );
      case 2:
        return (
          <ServiceTypePicker
            loadServiceTypes={flow.loadServiceTypes}
            onSelect={flow.selectServiceType}
            onBack={flow.goBack}
          />
        );
      case 3:
        return (
          <DateTimePicker
            dealership={state.dealership!}
            serviceType={state.serviceType!}
            date={state.date}
            time={state.time}
            loading={state.loading}
            error={state.error}
            onDateChange={flow.setDate}
            onTimeChange={flow.setTime}
            onCheckAvailability={flow.checkAvailability}
            onBack={flow.goBack}
          />
        );
      case 4:
        return (
          <SlotPicker
            slots={state.availableSlots}
            loading={state.loading}
            error={state.error}
            onSelect={flow.selectSlot}
            onBack={flow.goBack}
          />
        );
      case 5:
        return (
          <BookingReview
            dealership={state.dealership!}
            vehicle={state.vehicle!}
            serviceType={state.serviceType!}
            slot={state.selectedSlot!}
            hold={state.hold}
            loading={state.loading}
            error={state.error}
            onConfirm={flow.confirmBooking}
            onBack={flow.goBack}
            onHoldExpired={flow.onHoldExpired}
          />
        );
      case 6: {
        const enriched = enrichAppointment(state.appointment!);
        return (
          <ConfirmationCard
            appointment={state.appointment!}
            dealership={enriched.dealership!}
            vehicle={enriched.vehicle!}
            serviceType={enriched.serviceType!}
            technician={enriched.technician!}
            serviceBay={enriched.serviceBay!}
            onBookAnother={flow.reset}
            onViewAppointments={onViewAppointments}
          />
        );
      }
    }
  };

  return (
    <div className="page-content">
      <Stepper currentStep={state.step} />
      <div className="step-container">
        {renderStep()}
      </div>
    </div>
  );
}
