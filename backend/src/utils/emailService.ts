import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

export const sendVerificationEmail = async (email: string, otp: number): Promise<boolean> => {
    try {
        const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);" cellspacing="0" cellpadding="0" border="0">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px; text-align: center; background: linear-gradient(135deg, #0066ff 0%, #0044ff 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; font-family: Arial, sans-serif; color: #ffffff; font-size: 24px; font-weight: bold;">Verification Code</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding-bottom: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333;">
                            Here's your verification code:
                          </td>
                        </tr>
                        
                        <!-- OTP Display -->
                        <tr>
                          <td style="padding: 20px 0; text-align: center;">
                            <div style="
                              display: inline-block;
                              padding: 16px 40px;
                              background: #f8f9fa;
                              border-radius: 12px;
                              border: 1px solid #e9ecef;
                            ">
                              <span style="
                                font-family: 'Courier New', monospace;
                                font-size: 32px;
                                font-weight: bold;
                                color: #333333;
                                letter-spacing: 4px;
                              ">${otp}</span>
                            </div>
                          </td>
                        </tr>
                        
                        <!-- Instructions -->
                        <tr>
                          <td style="padding-top: 20px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="text-align: center; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
                                  <p style="margin: 0 0 10px 0;">This code will expire in 5 minutes.</p>
                                  <p style="margin: 0; color: #999999; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #dee2e6; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-family: Arial, sans-serif; font-size: 14px; color: #666666;">
                        © ${new Date().getFullYear()} O'Legendary. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Additional Info -->
                <table role="presentation" style="max-width: 600px; width: 100%; margin: 20px auto 0;" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="text-align: center; font-family: Arial, sans-serif; font-size: 12px; color: #999999;">
                      <p style="margin: 0;">This is an automated message, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            html: emailTemplate,
            text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
