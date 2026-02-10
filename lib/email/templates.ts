// ==========================================
// EMAIL TEMPLATES
// ==========================================
// Professional HTML email templates for Align notifications
// Using inline CSS for maximum email client compatibility

const BRAND_COLOR = '#2563eb'; // blue-600
const _BRAND_COLOR_DARK = '#1d4ed8'; // blue-700 - reserved for future use
const GRAY_600 = '#4b5563';
const GRAY_800 = '#1f2937';

// Base email wrapper with responsive styling
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Align</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${BRAND_COLOR};">Align</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${GRAY_600};">Real Estate Matching</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Align. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                <a href="https://app.alignagentsre.com" style="color: ${BRAND_COLOR}; text-decoration: none;">app.alignagentsre.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Button component
function button(text: string, url: string): string {
  return `
    <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; margin-top: 16px;">
      ${text}
    </a>
  `;
}

// Contact info row
function contactRow(label: string, value: string, href?: string): string {
  const valueContent = href 
    ? `<a href="${href}" style="color: ${BRAND_COLOR}; text-decoration: none;">${value}</a>`
    : value;
  return `
    <tr>
      <td style="padding: 8px 0; color: ${GRAY_600}; font-size: 14px; width: 80px; vertical-align: top;">${label}:</td>
      <td style="padding: 8px 0; color: ${GRAY_800}; font-size: 14px; font-weight: 500;">${valueContent}</td>
    </tr>
  `;
}

// ==========================================
// CLIENT MATCH NOTIFICATION
// ==========================================

interface MatchNotificationParams {
  clientName: string;
  realtorName: string;
  realtorEmail: string;
  realtorPhone: string | null;
  dashboardUrl: string;
}

export function getMatchNotificationTemplate(params: MatchNotificationParams): string {
  const { clientName, realtorName, realtorEmail, realtorPhone, dashboardUrl } = params;
  
  const content = `
    <!-- Success Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px;">
        <span style="font-size: 32px;">✓</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${GRAY_800}; text-align: center;">
      You've Been Matched!
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: ${GRAY_600}; text-align: center;">
      Hi ${clientName}, great news! We've found the perfect real estate agent for you.
    </p>
    
    <!-- Realtor Card -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${GRAY_800};">
        Your Matched Agent
      </h3>
      <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: ${BRAND_COLOR};">
        ${realtorName}
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${contactRow('Email', realtorEmail, `mailto:${realtorEmail}`)}
        ${realtorPhone ? contactRow('Phone', realtorPhone, `tel:${realtorPhone.replace(/\D/g, '')}`) : ''}
      </table>
    </div>
    
    <!-- Next Steps -->
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: ${GRAY_800};">
        What's Next?
      </h3>
      <ol style="margin: 0; padding-left: 20px; color: ${GRAY_600}; font-size: 14px;">
        <li style="margin-bottom: 8px;">Your agent will reach out to introduce themselves shortly.</li>
        <li style="margin-bottom: 8px;">Feel free to contact them directly using the information above.</li>
        <li>Discuss your needs and start your real estate journey!</li>
      </ol>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center;">
      ${button('View Your Dashboard', dashboardUrl)}
    </div>
  `;
  
  return emailWrapper(content);
}

// ==========================================
// REALTOR NEW LEAD NOTIFICATION
// ==========================================

interface NewLeadNotificationParams {
  realtorName: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  buyerOrSeller: string | null;
  priceTarget: number | null;
  areaPref: string | null;
  leadsUrl: string;
}

export function getNewLeadNotificationTemplate(params: NewLeadNotificationParams): string {
  const { realtorName, clientName, clientEmail, clientPhone, buyerOrSeller, priceTarget, areaPref, leadsUrl } = params;
  
  const formatPrice = (price: number | null): string => {
    if (!price) return 'Not specified';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };
  
  const formatType = (type: string | null): string => {
    if (!type) return 'Not specified';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const content = `
    <!-- New Lead Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; line-height: 64px;">
        <span style="font-size: 32px;">👤</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${GRAY_800}; text-align: center;">
      New Lead Assigned!
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: ${GRAY_600}; text-align: center;">
      Hi ${realtorName}, you have a new lead waiting for you.
    </p>
    
    <!-- Client Card -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${GRAY_800};">
        Client Information
      </h3>
      <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #16a34a;">
        ${clientName}
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${clientEmail ? contactRow('Email', clientEmail, `mailto:${clientEmail}`) : ''}
        ${clientPhone ? contactRow('Phone', clientPhone, `tel:${clientPhone.replace(/\D/g, '')}`) : ''}
        ${contactRow('Type', formatType(buyerOrSeller))}
        ${contactRow('Budget', formatPrice(priceTarget))}
        ${areaPref ? contactRow('Area', areaPref) : ''}
      </table>
    </div>
    
    <!-- Action Items -->
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: ${GRAY_800};">
        Next Steps
      </h3>
      <ol style="margin: 0; padding-left: 20px; color: ${GRAY_600}; font-size: 14px;">
        <li style="margin-bottom: 8px;">Review the client's profile in your dashboard.</li>
        <li style="margin-bottom: 8px;">Reach out within 24 hours to make a great first impression.</li>
        <li>Log your activities to track your progress.</li>
      </ol>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center;">
      ${button('View Lead Details', leadsUrl)}
    </div>
  `;
  
  return emailWrapper(content);
}

// ==========================================
// CLIENT REASSIGNMENT NOTIFICATION
// ==========================================

interface ReassignmentClientParams {
  clientName: string;
  newRealtorName: string;
  newRealtorEmail: string;
  newRealtorPhone: string | null;
  dashboardUrl: string;
}

export function getReassignmentClientTemplate(params: ReassignmentClientParams): string {
  const { clientName, newRealtorName, newRealtorEmail, newRealtorPhone, dashboardUrl } = params;
  
  const content = `
    <!-- Update Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef3c7; border-radius: 50%; line-height: 64px;">
        <span style="font-size: 32px;">🔄</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${GRAY_800}; text-align: center;">
      Your Agent Has Been Updated
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: ${GRAY_600}; text-align: center;">
      Hi ${clientName}, we've updated your assigned real estate agent to better serve your needs.
    </p>
    
    <!-- New Realtor Card -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${GRAY_800};">
        Your New Agent
      </h3>
      <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: ${BRAND_COLOR};">
        ${newRealtorName}
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${contactRow('Email', newRealtorEmail, `mailto:${newRealtorEmail}`)}
        ${newRealtorPhone ? contactRow('Phone', newRealtorPhone, `tel:${newRealtorPhone.replace(/\D/g, '')}`) : ''}
      </table>
    </div>
    
    <!-- Message -->
    <p style="margin: 0 0 24px; font-size: 14px; color: ${GRAY_600};">
      Your new agent will be reaching out to you shortly. Feel free to contact them directly using the information above.
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center;">
      ${button('View Your Dashboard', dashboardUrl)}
    </div>
  `;
  
  return emailWrapper(content);
}

// ==========================================
// REALTOR REASSIGNMENT NOTIFICATION
// ==========================================

interface ReassignmentRealtorParams {
  realtorName: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  leadsUrl: string;
}

export function getReassignmentRealtorTemplate(params: ReassignmentRealtorParams): string {
  const { realtorName, clientName, clientEmail, clientPhone, leadsUrl } = params;
  
  const content = `
    <!-- Reassignment Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; line-height: 64px;">
        <span style="font-size: 32px;">📋</span>
      </div>
    </div>
    
    <!-- Greeting -->
    <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${GRAY_800}; text-align: center;">
      Client Reassigned to You
    </h2>
    
    <p style="margin: 0 0 24px; font-size: 16px; color: ${GRAY_600}; text-align: center;">
      Hi ${realtorName}, a client has been reassigned to you.
    </p>
    
    <!-- Client Card -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${GRAY_800};">
        Client Information
      </h3>
      <p style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #16a34a;">
        ${clientName}
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${clientEmail ? contactRow('Email', clientEmail, `mailto:${clientEmail}`) : ''}
        ${clientPhone ? contactRow('Phone', clientPhone, `tel:${clientPhone.replace(/\D/g, '')}`) : ''}
      </table>
    </div>
    
    <!-- Note -->
    <p style="margin: 0 0 24px; font-size: 14px; color: ${GRAY_600};">
      This client was previously working with another agent and has been reassigned to you. Please review their profile and reach out to continue the conversation.
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center;">
      ${button('View Your Leads', leadsUrl)}
    </div>
  `;
  
  return emailWrapper(content);
}
