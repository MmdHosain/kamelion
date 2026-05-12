import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AppointmentModal = ({ open, onClose }) => {
  const { requireAuth, user } = useAuth();
  
  const [activeDay, setActiveDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.getDate(),
        month: date.toLocaleDateString('fa-IR', { month: 'short' }),
        dayName: date.toLocaleDateString('fa-IR', { weekday: 'short' }),
        fullDate: date,
      });
    }
    return days;
  };

  const days = getNext14Days();

  const mockSlots = {
    0: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    1: ['09:00', '10:30', '11:30', '14:00', '16:00'],
    2: ['10:00', '11:00', '14:00', '15:00', '16:00'],
    3: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    4: ['09:30', '10:30', '11:30', '14:30', '15:30'],
    5: ['10:00', '11:00', '14:00', '15:00'],
    6: ['09:00', '10:00', '11:00'],
  };

  const handleDayChange = (index) => {
    setActiveDay(index);
    setSelectedTime(null);
  };

  // Handle appointment booking with auth check
  const handleBookAppointment = () => {
    if (!selectedTime) return;

    // Check authentication and trigger auth modal if needed
    requireAuth(() => {
      // This callback executes after successful authentication
      bookAppointment();
    });
  };

  // Actual booking logic (executes after auth)
  const bookAppointment = () => {
    const appointmentData = {
      date: days[activeDay].fullDate,
      time: selectedTime,
      userId: user?.id,
      userName: user?.name,
    };

    console.log('Booking appointment:', appointmentData);
    
    // TODO: Replace with actual API call
    // import { createReservation } from '../../api/reservationService';
    // await createReservation(appointmentData);
    
    // Show success message
    alert(`نوبت شما برای ${days[activeDay].dayName} ${days[activeDay].date} ${days[activeDay].month} ساعت ${selectedTime} ثبت شد`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">انتخاب زمان نوبت</h2>

        {/* User info display (if authenticated) */}
        {user && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              نوبت برای: <span className="font-bold">{user.name}</span>
            </p>
          </div>
        )}

        {/* Day Picker */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">انتخاب روز</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDayChange(index)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-lg border-2 transition ${
                  activeDay === index
                    ? 'border-[#2F5D50] bg-[#2F5D50]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xs text-gray-500">{day.dayName}</span>
                <span className="text-lg font-bold text-gray-800">{day.date}</span>
                <span className="text-xs text-gray-500">{day.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">انتخاب ساعت</h3>
          <div className="grid grid-cols-4 gap-3">
            {(mockSlots[activeDay % 7] || []).map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-lg border-2 transition ${
                  selectedTime === time
                    ? 'border-[#2F5D50] bg-[#2F5D50] text-white'
                    : 'border-gray-200 hover:border-[#2F5D50] text-gray-700'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBookAppointment}
          disabled={!selectedTime}
          className={`mt-6 w-full py-3 rounded-xl text-white font-medium transition ${
            selectedTime
              ? 'bg-[#2F5D50] hover:bg-[#264a3f]'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          ثبت نوبت
        </button>
      </div>
    </div>
  );
};

export default AppointmentModal;
