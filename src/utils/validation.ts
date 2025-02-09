/**
 * Validation utilities for secure data handling
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates player name input
 */
export const validatePlayerName = (name: string): ValidationResult => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name must be a non-empty string' };
  }

  // Remove any potentially harmful characters
  const sanitizedName = name.trim().replace(/[<>{}]/g, '');
  
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    return { isValid: false, error: 'Name must be between 2 and 50 characters' };
  }

  return { isValid: true };
};

/**
 * Validates game state structure and data types
 */
export const validateGameState = (state: any): ValidationResult => {
  if (!state || typeof state !== 'object') {
    return { isValid: false, error: 'Invalid game state format' };
  }

  const requiredFields = ['isPlaying', 'winner', 'score'];
  const missingFields = requiredFields.filter(field => !(field in state));

  if (missingFields.length > 0) {
    return { isValid: false, error: `Missing required fields: ${missingFields.join(', ')}` };
  }

  if (typeof state.isPlaying !== 'boolean') {
    return { isValid: false, error: 'isPlaying must be a boolean' };
  }

  if (typeof state.winner !== 'string') {
    return { isValid: false, error: 'winner must be a string' };
  }

  if (typeof state.score !== 'number' || state.score < 0) {
    return { isValid: false, error: 'score must be a non-negative number' };
  }

  return { isValid: true };
};

/**
 * Validates winners list structure and data
 */
export const validateWinnersList = (winners: any[]): ValidationResult => {
  if (!Array.isArray(winners)) {
    return { isValid: false, error: 'Winners must be an array' };
  }

  for (const winner of winners) {
    if (!winner || typeof winner !== 'object') {
      return { isValid: false, error: 'Invalid winner entry format' };
    }

    if (!winner.name || !winner.date) {
      return { isValid: false, error: 'Winner entries must have name and date' };
    }

    if (typeof winner.name !== 'string' || typeof winner.date !== 'string') {
      return { isValid: false, error: 'Invalid winner data types' };
    }

    try {
      new Date(winner.date);
    } catch {
      return { isValid: false, error: 'Invalid date format' };
    }

    const nameValidation = validatePlayerName(winner.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }
  }

  return { isValid: true };
};

/**
 * Validates time-related values
 */
export const validateTimeValue = (time: number): ValidationResult => {
  if (typeof time !== 'number' || isNaN(time)) {
    return { isValid: false, error: 'Time must be a valid number' };
  }

  if (time < 0) {
    return { isValid: false, error: 'Time cannot be negative' };
  }

  const maxAllowedTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (time > maxAllowedTime) {
    return { isValid: false, error: 'Time value exceeds maximum allowed' };
  }

  return { isValid: true };
};

/**
 * Validates card data structure and format
 */
export const validateCardData = (cardData: any): ValidationResult => {
  if (!cardData || typeof cardData !== 'object') {
    return { isValid: false, error: 'Invalid card data format' };
  }

  if (!cardData.cardNumber || typeof cardData.cardNumber !== 'string') {
    return { isValid: false, error: 'Card number must be a string' };
  }

  if (cardData.cardNumber.length !== 14) {
    return { isValid: false, error: 'Card number must be 14 characters long' };
  }

  if (!cardData.timestamp || typeof cardData.timestamp !== 'number') {
    return { isValid: false, error: 'Timestamp must be a number' };
  }

  const now = Date.now();
  if (cardData.timestamp > now || cardData.timestamp < now - (24 * 60 * 60 * 1000)) {
    return { isValid: false, error: 'Invalid timestamp' };
  }

  return { isValid: true };
};

export default {
  validatePlayerName,
  validateGameState,
  validateWinnersList,
  validateTimeValue,
  validateCardData
};
