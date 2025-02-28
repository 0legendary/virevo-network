import redisClient from "../../config/redisClient";

const OTP_EXPIRY = 300; // 5 minutes (300 seconds)

/**
 * Stores OTP in Redis with a TTL of 5 minutes.
 * @param email - User's email as the key
 * @param otp - Generated OTP
 */
export const storeOTP = async (email: string, otp: string): Promise<void> => {
  try {
    await redisClient.set(email, otp, { EX: OTP_EXPIRY });
  } catch {
    return;
  }
};

/**
 * Verifies the OTP entered by the user.
 * If correct, it deletes the OTP to prevent reuse.
 * @param email - User's email
 * @param enteredOtp - OTP entered by the user
 * @returns `true` if OTP is valid, `false` otherwise
 */
export const verifyOTP = async (email: string, enteredOtp: string): Promise<boolean> => {
  try {
    const storedOtp = await redisClient.get(email);

    if (!storedOtp) return false;

    if (storedOtp === enteredOtp) {
      await redisClient.del(email);
      return true;
    }
  } catch {
    return false
  }
  return false;
};
