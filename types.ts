
export enum ServiceCategory {
  GENERAL = 'General Dentistry',
  COSMETIC = 'Cosmetic Dentistry',
  ORTHODONTICS = 'Orthodontics',
  EMERGENCY = 'Emergency Care'
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface AppointmentRequest {
  patientType: 'new' | 'returning';
  serviceId: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  insuranceProvider?: string;
}
