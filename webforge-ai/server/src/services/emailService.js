import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter = null;
function getTransporter() {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function send({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    // Keep local auth flows usable without SMTP. The one-time links are printed
    // only in development; never expose them in production logs.
    if (env.NODE_ENV === 'development') {
      logger.warn('SMTP not configured — local email preview follows', { to, subject });
      console.info(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    } else {
      logger.warn('SMTP not configured — email not sent', { to, subject });
    }
    return { sent: false };
  }
  await t.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  return { sent: true };
}

export async function sendVerificationEmail(user, token) {
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`;
  return send({
    to: user.email,
    subject: 'Verify your WebForge AI account',
    html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  return send({
    to: user.email,
    subject: 'Reset your WebForge AI password',
    html: `<p>Hi ${user.name},</p><p>Click below to reset your password. This link expires shortly.</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
