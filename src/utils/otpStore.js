// utils/otpStore.js

const otpStore = new Map();

export const setOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
};

export const getOTP = (email) => {
  const entry = otpStore.get(email);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return null;
  }

  return entry.otp;
};

export const deleteOTP = (email) => {
  otpStore.delete(email);
};
