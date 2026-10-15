import { erstelleLimiter } from './ratenbegrenzung';

// Höchstens 5 Absendungen pro IP-Adresse und Stunde. Die IP wird nur im Arbeitsspeicher
// gehalten, nicht protokolliert, und nach Ablauf des Fensters verworfen.
export const kontaktLimiter = erstelleLimiter(5, 60 * 60 * 1000);
