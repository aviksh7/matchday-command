/**
 * Utility functions for Matchday Command operations.
 * (Simulated logic helper functions)
 */

/**
 * Returns a severity color code for styling
 */
export const getSeverityColor = (severity: 'Low' | 'Medium' | 'High'): string => {
  switch (severity) {
    case 'High':
      return '#db4437'; // Red
    case 'Medium':
      return '#f4b400'; // Yellow
    case 'Low':
      return '#0f9d58'; // Green
    default:
      return '#5f6368';
  }
};
