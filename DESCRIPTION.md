# Appointment Scheduling System

A professional appointment booking and management system for automotive service appointments. The app provides a seamless experience for clients to book appointments and technicians to view and manage their schedules.

## Features

### Client Booking Flow
- **Step 1: Location Selection** - Browse and search dealerships by name, address, or distance
- **Step 2: Service Selection** - Choose vehicle details and select from available services (Oil Change, Tire Rotation, Brake Inspection, etc.)
- **Step 3: Time Slot Selection** - Pick available date and time from multiple options
- **Step 4: Confirmation** - Enter contact information and review complete appointment details
- **Success Page** - Confirmation screen with appointment details and next steps

### Technician Dashboard
- **Today's Appointments** - View appointments scheduled for today with quick status overview
- **Upcoming Appointments** - Browse future appointments organized by date
- **Completed Appointments** - Review past completed services
- **Appointment Details** - Click any appointment to view complete customer and service information
- **Status Management** - Update appointment status (pending, confirmed, completed, cancelled)
- **Search & Filter** - Find appointments by customer name, vehicle, or service type

## Project Structure

```
app/
├── page.tsx                          # Home page with role selection
├── layout.tsx                        # Root layout with theme provider
├── globals.css                       # Global styles and design tokens
├── client/
│   └── booking/
│       ├── page.tsx                  # Booking flow container (4-step process)
│       └── success/
│           └── page.tsx              # Booking confirmation page
└── technician/
    └── schedule/
        └── page.tsx                  # Technician dashboard

components/
├── booking/
│   ├── step-indicator.tsx            # Visual progress indicator
│   ├── dealership-search.tsx          # Location search component
│   ├── vehicle-and-service-selector.tsx  # Service selection tabs
│   ├── time-slot-selector.tsx         # Calendar and time picker
│   └── appointment-summary.tsx        # Review and contact form
└── technician/
    ├── appointment-card.tsx           # Reusable appointment card
    └── appointment-detail.tsx         # Modal with full appointment details
```

## Design System

### Color Scheme
- **Primary**: Purple (`oklch(0.5 0.22 262.7)`) - Main actions and highlights
- **Secondary**: Orange/Brown (`oklch(0.4 0.15 35)`) - Alternative actions
- **Background**: Off-white (`oklch(0.98 0 0)`) - Main surface
- **Neutral Grays**: Various shades for text and borders
- **Status Colors**: 
  - Yellow for pending appointments
  - Blue for confirmed appointments
  - Green for completed appointments
  - Red for cancelled appointments

### Typography
- **Font Family**: Inter (default system font)
- **Headings**: 2xl-4xl with bold weight
- **Body**: 14px with 1.5 line height

## Key Components

### StepIndicator
Displays progress through the 4-step booking process with numbered circles and connecting lines.

### DealershipSearch
Shows a list of dealerships with:
- Name, address, phone number
- Operating hours
- Distance from user
- Search/filter functionality

### VehicleAndServiceSelector
Tabbed interface for selecting vehicle and service type with:
- Service duration and pricing
- Visual selection indicators
- Form validation

### TimeSlotSelector
Calendar-based time picker with:
- Available dates as clickable cards
- Time slots with availability status
- Selected slot summary

### AppointmentSummary
Multi-field form capturing:
- Customer name, email, phone
- Optional notes
- Full appointment details review

### AppointmentCard
Compact appointment display showing:
- Customer name and phone
- Service type and vehicle
- Time and location
- Status badge

### AppointmentDetail
Modal dialog with:
- Full appointment information
- Customer and service details
- Status update controls

## Mock Data

The application uses mock data for demonstration:

**Dealerships**: 3 sample locations with details
**Available Time Slots**: Multiple dates and times with availability status
**Appointments**: 7 sample appointments across different dates and statuses

## Navigation Flow

### For Clients
1. Home page → "Book an Appointment"
2. Select dealership
3. Choose vehicle and service
4. Pick date and time
5. Enter contact info and confirm
6. View success confirmation

### For Technicians
1. Home page → "View Schedule"
2. Browse today's appointments or upcoming dates
3. Use search to find specific appointments
4. Click appointment card to view details
5. Update status as needed

## Features Implemented

✅ Responsive mobile-first design
✅ Step-by-step booking wizard
✅ Real-time search and filtering
✅ Tab-based service selection
✅ Calendar time slot picker
✅ Appointment status management
✅ Modal detail view for appointments
✅ Success confirmation with appointment summary
✅ Professional color scheme with accessible contrast
✅ Accessibility features (semantic HTML, ARIA labels)
✅ Smooth transitions and hover states
✅ Session storage for appointment data

## Customization

### To modify services
Edit the `SERVICE_TYPES` array in `components/booking/vehicle-and-service-selector.tsx`

### To change dealerships
Edit the `MOCK_DEALERSHIPS` array in `components/booking/dealership-search.tsx`

### To add more time slots
Modify the `MOCK_AVAILABLE_SLOTS` array in `components/booking/time-slot-selector.tsx`

### To adjust color scheme
Update the design tokens in `app/globals.css` (the oklch color values in :root and .dark sections)

## Backend Integration (Future)

The current implementation uses mock data. To connect to a real backend:

1. Replace mock data with API calls in each component
2. Update the booking flow to save to a database
3. Implement technician authentication
4. Add real-time appointment updates
5. Integrate with email/SMS notifications

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- SSR for faster initial load
- Client-side filtering for instant search
- Optimized image loading
- Minimal JavaScript bundle
- CSS-in-JS with Tailwind for efficient styling

## Accessibility

- Semantic HTML structure
- Color contrast ratio compliance
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators for keyboard users
- Form labels properly associated with inputs
