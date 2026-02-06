'use client';

import { useState, useEffect, useRef } from 'react';

export default function PaymentTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPaymentMade, setIsPaymentMade] = useState<boolean>(false);
  const [isOrderCanceled, setIsOrderCanceled] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SET_TIME = 100000; // 100 วินาที (ms)

  // ฟังก์ชันเดียวจบ: set ค่าเริ่ม + start interval
  const startCountdown = (initialTime: number) => {
    // set ค่าเริ่ม
    setTimeLeft(initialTime);

    // กัน interval ซ้อน
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setIsOrderCanceled(true);
          localStorage.removeItem('startTime');
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  // โหลดค่าจาก localStorage ตอน mount
  useEffect(() => {
    const startTime = localStorage.getItem('startTime');

    if (startTime) {
      const timePassed = Date.now() - Number(startTime);
      const timeRemaining = SET_TIME - timePassed;

      if (timeRemaining > 0) {
        startCountdown(timeRemaining); // ส่งค่าเดียวพอ
      } else {
        setIsOrderCanceled(true);
        setTimeLeft(0);
      }
    }

    // cleanup ตอน unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartTimer = () => {
    if (localStorage.getItem('startTime')) return;

    const startTime = Date.now();
    localStorage.setItem('startTime', startTime.toString());

    setIsOrderCanceled(false);
    setIsPaymentMade(false);
    startCountdown(SET_TIME); // ไม่ต้อง setTimeLeft ซ้ำ
  };

  const handlePayment = () => {
    setIsPaymentMade(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    localStorage.removeItem('startTime');
  };

  const handleClearStartTime = () => {
    localStorage.removeItem('startTime');
    setTimeLeft(0);
    setIsOrderCanceled(false);
    setIsPaymentMade(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isPaymentMade ? (
        <h1>OK</h1>
      ) : !isOrderCanceled ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg"
              onClick={handleStartTimer}
            >
              Start Order
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg"
              onClick={handlePayment}
            >
              Make Payment
            </button>
          </div>

          <p className="text-lg">
            Time left: {Math.floor(timeLeft / 1000)} seconds
          </p>
        </div>
      ) : (
        <p className="text-red-500 font-bold">Your order has been canceled.</p>
      )}

      <button
        className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg"
        onClick={handleClearStartTime}
      >
        Clear Start Time
      </button>
    </div>
  );
}
