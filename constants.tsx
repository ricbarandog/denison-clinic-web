
import React from 'react';
import { Service, ServiceCategory } from './types';

export const SERVICES: Service[] = [
  { id: '1', name: 'Routine Check-up', category: ServiceCategory.GENERAL, description: 'Comprehensive exam and professional cleaning.', durationMinutes: 60, price: 1500 },
  { id: '2', name: 'Teeth Whitening', category: ServiceCategory.COSMETIC, description: 'Advanced laser whitening for a brighter smile.', durationMinutes: 90, price: 5000 },
  { id: '3', name: 'Invisalign Consultation', category: ServiceCategory.ORTHODONTICS, description: 'Discrete teeth straightening solutions.', durationMinutes: 45, price: 2000 },
  { id: '4', name: 'Emergency Filling', category: ServiceCategory.EMERGENCY, description: 'Immediate care for tooth pain or damage.', durationMinutes: 60, price: 2500 },
];

export const ICONS = {
  Phone: function PhoneIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    );
  },
  Calendar: function CalendarIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    );
  },
  Check: function CheckIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );
  }
};