import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClock, FaEnvelope, FaPhone, FaTimes, FaUser } from 'react-icons/fa';
import { adminApi } from '../../services/adminApi';
import { CreateReminderData } from '../../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  ticketId?: string;
  onSuccess?: () => void;
}

const ReminderModal = ({
  isOpen,
  onClose,
  customerEmail,
  customerName,
  customerPhone,
  ticketId,
  onSuccess,
}: ReminderModalProps) => {
  // Set default date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Set default time to 9 AM
  const getDefaultTime = () => {
    return '09:00';
  };

  const [reminderDate, setReminderDate] = useState(getTomorrowDate());
  const [reminderTime, setReminderTime] = useState(getDefaultTime());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReminderDate(getTomorrowDate());
      setReminderTime(getDefaultTime());
      setNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reminderDate) {
      setError('Please select a reminder date');
      return;
    }

    // Combine date and time for the reminder_date
    const dateTime = reminderTime
      ? `${reminderDate}T${reminderTime}:00`
      : `${reminderDate}T09:00:00`;

    setIsSubmitting(true);

    try {
      const reminderData: CreateReminderData = {
        ticket_id: ticketId,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        reminder_date: dateTime,
        reminder_time: reminderTime || '09:00',
        notes: notes.trim() || undefined,
      };

      await adminApi.reminders.create(reminderData);
      
      // Reset form
      setReminderDate('');
      setReminderTime('');
      setNotes('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error creating reminder:', err);
      setError(err.message || 'Failed to create reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Schedule Call Reminder</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaUser className="text-indigo-500" />
                <span className="font-medium text-gray-900">
                  {customerName || 'Customer'}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <FaEnvelope className="text-gray-400 text-sm" />
                <span className="text-sm text-gray-600">{customerEmail}</span>
              </div>
              {customerPhone && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">{customerPhone}</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Reminder Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-2 text-indigo-500" />
                    Reminder Date
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    min={getTomorrowDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Reminder Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaClock className="inline mr-2 text-indigo-500" />
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any notes about this reminder..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Schedule Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;

