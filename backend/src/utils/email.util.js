const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_NAME = process.env.SENDER_NAME;

/**
 * Generates a setup token for a new tenant owner.
 */
const generateSetupToken = (tenantId, email) => {
    return jwt.sign(
        { tenantId, email, type: 'setup_password' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Sends an email using the Brevo REST API.
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!BREVO_API_KEY) {
            console.warn('⚠️ BREVO_API_KEY is not set. Email will not be sent.');
            return false;
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: SENDER_NAME || 'CU Internship Portal',
                    email: SENDER_EMAIL || 'noreply@comsats.edu.pk'
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return true;
    } catch (error) {
        console.error('❌ EMAIL SENDING FAILED (API):', error);
        return false;
    }
};

/**
 * Generates HTML email template for password reset
 */
const passwordResetTemplate = (userName, resetLink) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - CU Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="background-color: #2563eb; padding: 60px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">CU PORTAL.</h1>
                            <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">Internship Record System</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Password Reset Request</h2>
                            <p style="margin: 0 0 25px 0; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 500;">
                                Hello ${userName}, <br><br>
                                A password reset request was initiated for your CU Internship Portal account. If you did not request this, please ignore this email. Otherwise, use the secure link below to reset your password.
                            </p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);">Reset Password</a>
                            </div>
                            
                            <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
                                This link is valid for 1 hour. <br>
                                If you cannot click the button, copy and paste this URL: <br>
                                <a href="${resetLink}" style="color: #2563eb; font-weight: 700;">${resetLink}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 COMSATS UNIVERSITY // ALL RIGHTS RESERVED</p>
                            <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 10px; font-weight: 600;">Automated System Transmission</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

const staffInvitationTemplate = (role, setupLink) => {
    const roleName = role.replace('_', ' ').toUpperCase();
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Onboarding - CU Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="background-color: #0f172a; padding: 60px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">CU PORTAL.</h1>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">STAFF ONBOARDING PROTOCOL</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Invitation for Access</h2>
                            <p style="margin: 0 0 25px 0; color: #475569; font-size: 16px; line-height: 1.6; font-weight: 500;">
                                You have been invited to join the CU Internship Portal as a <strong>${roleName}</strong>. This access grant allows you to manage specific modules within the ecosystem.
                            </p>
                            
                            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
                                <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px; font-weight: 600;">Click below to initialize your credentials and set your password:</p>
                                <a href="${setupLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);">Initialize Access Hub</a>
                            </div>

                            <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500; font-style: italic;">
                                Note: This invitation link is for faculty/staff use only and will expire in 7 days.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">&copy; 2026 COMSATS UNIVERSITY // ALL RIGHTS RESERVED</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

module.exports = {
    generateSetupToken,
    sendEmail,
    passwordResetTemplate,
    staffInvitationTemplate
};
