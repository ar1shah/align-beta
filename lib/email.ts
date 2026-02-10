import { Resend } from 'resend';
import {
  getMatchNotificationTemplate,
  getNewLeadNotificationTemplate,
  getReassignmentClientTemplate,
  getReassignmentRealtorTemplate,
} from './email/templates';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = 'Align <noreply@alignagentsre.com>';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.alignagentsre.com';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface MatchNotificationData {
  clientEmail: string;
  clientName: string;
  realtorName: string;
  realtorEmail: string;
  realtorPhone: string | null;
}

export interface NewLeadNotificationData {
  realtorEmail: string;
  realtorName: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  buyerOrSeller: string | null;
  priceTarget: number | null;
  areaPref: string | null;
}

export interface ReassignmentNotificationData {
  email: string;
  name: string;
  newRealtorName: string;
  clientName: string;
  isClient: boolean;
}

// ==========================================
// EMAIL SENDING FUNCTIONS
// ==========================================

/**
 * Send match notification to client when they are assigned to a realtor
 */
export async function sendMatchNotification(data: MatchNotificationData): Promise<{ success: boolean; error?: string }> {
  if (!data.clientEmail) {
    console.warn('sendMatchNotification: No client email provided');
    return { success: false, error: 'No client email provided' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: "You've been matched with your real estate agent!",
      html: getMatchNotificationTemplate({
        clientName: data.clientName || 'there',
        realtorName: data.realtorName || 'Your Agent',
        realtorEmail: data.realtorEmail,
        realtorPhone: data.realtorPhone,
        dashboardUrl: `${DASHBOARD_URL}/dashboard`,
      }),
    });

    if (error) {
      console.error('sendMatchNotification error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Match notification sent to client: ${data.clientEmail}`);
    return { success: true };
  } catch (err) {
    console.error('sendMatchNotification exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send new lead notification to realtor when a client is assigned to them
 */
export async function sendNewLeadNotification(data: NewLeadNotificationData): Promise<{ success: boolean; error?: string }> {
  if (!data.realtorEmail) {
    console.warn('sendNewLeadNotification: No realtor email provided');
    return { success: false, error: 'No realtor email provided' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.realtorEmail,
      subject: `New lead assigned: ${data.clientName || 'New Client'}`,
      html: getNewLeadNotificationTemplate({
        realtorName: data.realtorName || 'there',
        clientName: data.clientName || 'Unknown',
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        buyerOrSeller: data.buyerOrSeller,
        priceTarget: data.priceTarget,
        areaPref: data.areaPref,
        leadsUrl: `${DASHBOARD_URL}/realtor/leads`,
      }),
    });

    if (error) {
      console.error('sendNewLeadNotification error:', error);
      return { success: false, error: error.message };
    }

    console.log(`New lead notification sent to realtor: ${data.realtorEmail}`);
    return { success: true };
  } catch (err) {
    console.error('sendNewLeadNotification exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send reassignment notification to client when they are assigned to a different realtor
 */
export async function sendReassignmentClientNotification(data: {
  clientEmail: string;
  clientName: string;
  newRealtorName: string;
  newRealtorEmail: string;
  newRealtorPhone: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!data.clientEmail) {
    console.warn('sendReassignmentClientNotification: No client email provided');
    return { success: false, error: 'No client email provided' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: 'Your assigned agent has been updated',
      html: getReassignmentClientTemplate({
        clientName: data.clientName || 'there',
        newRealtorName: data.newRealtorName || 'Your New Agent',
        newRealtorEmail: data.newRealtorEmail,
        newRealtorPhone: data.newRealtorPhone,
        dashboardUrl: `${DASHBOARD_URL}/dashboard`,
      }),
    });

    if (error) {
      console.error('sendReassignmentClientNotification error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Reassignment notification sent to client: ${data.clientEmail}`);
    return { success: true };
  } catch (err) {
    console.error('sendReassignmentClientNotification exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send notification to new realtor about a reassigned client
 */
export async function sendReassignmentRealtorNotification(data: {
  realtorEmail: string;
  realtorName: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!data.realtorEmail) {
    console.warn('sendReassignmentRealtorNotification: No realtor email provided');
    return { success: false, error: 'No realtor email provided' };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.realtorEmail,
      subject: `Client reassigned to you: ${data.clientName || 'New Client'}`,
      html: getReassignmentRealtorTemplate({
        realtorName: data.realtorName || 'there',
        clientName: data.clientName || 'Unknown',
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        leadsUrl: `${DASHBOARD_URL}/realtor/leads`,
      }),
    });

    if (error) {
      console.error('sendReassignmentRealtorNotification error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Reassignment notification sent to realtor: ${data.realtorEmail}`);
    return { success: true };
  } catch (err) {
    console.error('sendReassignmentRealtorNotification exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
