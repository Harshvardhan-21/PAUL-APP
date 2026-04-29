// All dealer data comes from the backend API via AppDataContext / AuthContext.
// This file is kept for backward compatibility only — do NOT add hardcoded data here.

export const dealerProfile = null; // use AuthContext.user instead
export const associatedElectricians = []; // use AppDataContext.electricians instead
export const TEST_electricianCount = 0;
export const getElectricianCount = () => 0;
