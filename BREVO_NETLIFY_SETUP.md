# Brevo + Netlify RFQ Email Setup

## 1. Brevo configuration

1. Log in to Brevo.
2. Open **SMTP & API** and create an API key for Transactional Email.
3. Verify the sender email or sender domain that will be used by the website.
4. Recommended sender:
   - Sender email: `sales@lfclothing.com`
   - Sender name: `Lingfeng Apparel Website`
5. Authenticate the sender domain in Brevo:
   - Add the Brevo verification record.
   - Add the DKIM records Brevo provides.
   - Add or update DMARC for the domain.
6. Check **Security** -> **Authorized IPs**:
   - If IP authorization is enabled, Brevo will reject requests from unrecognized IP addresses even when the API key is valid.
   - For local testing, authorize your current local public IP.
   - For Netlify Functions, IP addresses may change. If Brevo IP authorization blocks unknown IPs, either disable strict IP authorization for this API key or approve the Netlify function IP shown in Brevo's blocked request log after a failed deploy test.

## 2. Netlify environment variables

In Netlify, open the deployed site:

**Site configuration** -> **Environment variables** -> **Add a variable**

Add these variables:

```text
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=sales@lfclothing.com
BREVO_SENDER_NAME=Lingfeng Apparel Website
RFQ_TO_EMAIL=sales@lfclothing.com
```

After saving variables, trigger a new deploy.

## 3. What the form does

- Frontend submits RFQ data to `/.netlify/functions/rfq`.
- Netlify Function calls Brevo's Transactional Email API.
- The email is sent to `RFQ_TO_EMAIL`.
- The buyer's email is set as `replyTo`, so sales can reply directly.
- One attachment is supported, with a 4 MB limit.
- A hidden honeypot field is included to reduce spam.

## 4. Test checklist

1. Deploy the site on Netlify after setting environment variables.
2. Open `/contact.html`.
3. Submit a test RFQ with a real email address.
4. Confirm the message arrives at `sales@lfclothing.com`.
5. Reply to the received email and confirm it replies to the test buyer email.
6. Test a bad URL such as `/missing-page-test` and confirm the custom 404 page appears.
7. If the form fails and Brevo logs an unauthorized IP error, authorize the reported IP or relax IP authorization in Brevo security settings.

## 5. Optional hardening

For production spam protection, add Cloudflare Turnstile or reCAPTCHA validation to the RFQ form and verify the token inside `netlify/functions/rfq.js`.
