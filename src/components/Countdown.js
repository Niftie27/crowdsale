import { useEffect, useState } from 'react';

const Countdown = ({ durationInMinutes = 30 }) => {
  // ✅ State to track remaining time in seconds
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const now = Date.now(); // ✅ Current timestamp
    let endTime = localStorage.getItem('countdownEndTime');

    if (!endTime || now > parseInt(endTime)) {
      // ✅ If no end time stored or it's expired, set a new one
      endTime = now + durationInMinutes * 60 * 1000; // ✅ durationInMinutes to ms
      localStorage.setItem('countdownEndTime', endTime); // ✅ Persist end time
    }

    const updateCountdown = () => {
      // ✅ Calculate remaining seconds from stored endTime
      const remaining = Math.max(0, Math.floor((parseInt(endTime) - Date.now()) / 1000));
      setTimeLeft(remaining); // ✅ Update state
    };

    updateCountdown(); // ✅ Initial call to set state right away

    const timer = setInterval(updateCountdown, 1000); // ✅ Update every 1s

    return () => clearInterval(timer); // ✅ Cleanup on component unmount
  }, [durationInMinutes]); // ✅ Re-run if duration changes

  // ✅ Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="text-center my-3">
      <h3>⏳ Public sale starts in {formatTime(timeLeft)}</h3> {/* ✅ Display formatted countdown */}
    </div>
  );
};

export default Countdown;
