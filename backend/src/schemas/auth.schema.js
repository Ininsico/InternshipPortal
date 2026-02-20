const { z } = require('zod');

const SESSIONS = ['FA20', 'SP20', 'FA21', 'SP21', 'FA22', 'SP22', 'FA23', 'SP23', 'FA24', 'SP24'];
const DEGREES = ['BCS', 'BSE', 'BBA', 'BEE', 'BME', 'BAR'];

// ─── Student Login ────────────────────────────────────────────────────────────
const studentLoginSchema = z.object({
    session: z
        .string({ required_error: 'Session is required' })
        .refine((v) => SESSIONS.includes(v), { message: `Session must be one of: ${SESSIONS.join(', ')}` }),

    degree: z
        .string({ required_error: 'Degree is required' })
        .refine((v) => DEGREES.includes(v), { message: `Degree must be one of: ${DEGREES.join(', ')}` }),

    rollId: z
        .string({ required_error: 'Roll serial is required' })
        .min(1, 'Roll serial cannot be empty')
        .max(10, 'Roll serial too long')
        .regex(/^\d+$/, 'Roll serial must be digits only'),

    password: z
        .string({ required_error: 'Password is required' })
        .min(5, 'Password must be at least 5 characters'),
});

// ─── Admin Login ──────────────────────────────────────────────────────────────
const adminLoginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please enter a valid email address')
        .toLowerCase(),

    password: z
        .string({ required_error: 'Password is required' })
        .min(5, 'Password must be at least 5 characters'),
});

module.exports = { studentLoginSchema, adminLoginSchema, SESSIONS, DEGREES };
