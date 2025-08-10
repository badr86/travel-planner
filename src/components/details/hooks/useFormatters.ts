import { format } from 'date-fns';

export const useFormatters = () => {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Date not available';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount: number | null | undefined, currency: string = 'USD') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currency} 0`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'Time not available';
    try {
      const date = new Date(`2000-01-01T${time}`);
      return format(date, 'h:mm a');
    } catch (error) {
      return time;
    }
  };

  const formatDuration = (duration: string | null | undefined) => {
    if (!duration) return 'Duration not specified';
    return duration;
  };

  return {
    formatDate,
    formatCurrency,
    formatTime,
    formatDuration,
  };
};
