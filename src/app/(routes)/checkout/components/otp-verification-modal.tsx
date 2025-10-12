"use client";

import { useState } from "react";

interface OTPVerificationModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onVerify: (otp: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  phoneNumber,
  onVerify,
  onClose,
  loading,
}) => {
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    await onVerify(otp);
    setOtp(""); // Clear OTP after verification attempt
  };

  const handleClose = () => {
    setOtp("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Verify Phone Number
        </h3>
        <p className="text-gray-600 mb-4">
          Enter the OTP sent to {phoneNumber}
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Phone Number"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
