const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label, value) {
  if (!value) return "";
  return `<tr><th align="left" style="padding:8px 12px;background:#f5f7fa;border:1px solid #e5e9ef;width:190px;">${escapeHtml(label)}</th><td style="padding:8px 12px;border:1px solid #e5e9ef;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
}

function buildEmailHtml(data) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2933;line-height:1.55;">
      <h2 style="color:#08233f;margin:0 0 16px;">New RFQ from Lingfeng Overseas Website</h2>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:760px;">
        ${row("Name", data.name)}
        ${row("Company", data.company)}
        ${row("Email", data.email)}
        ${row("WhatsApp / Phone", data.phone)}
        ${row("Country / Region", data.country)}
        ${row("Product Category", data.category)}
        ${row("Estimated Quantity", data.quantity)}
        ${row("Target Delivery Time", data.delivery)}
        ${row("Customization Requirements", data.customization)}
        ${row("Functional Requirements", data.functionRequirements)}
        ${row("Message", data.message)}
      </table>
      <p style="margin-top:18px;color:#6b7280;font-size:13px;">This message was submitted from the website RFQ form.</p>
    </div>
  `;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  if (!process.env.BREVO_API_KEY) {
    return json(500, { error: "Email service is not configured." });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request body." });
  }

  if (data.website) {
    return json(200, { ok: true });
  }

  if (!data.name || !data.email) {
    return json(400, { error: "Name and email are required." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return json(400, { error: "Please provide a valid email address." });
  }

  const attachment = data.attachment;
  const attachments = [];

  if (attachment?.content && attachment?.name) {
    if ((attachment.size || 0) > MAX_ATTACHMENT_BYTES) {
      return json(400, { error: "Attachment is too large. Please upload a file under 4 MB." });
    }

    attachments.push({
      name: String(attachment.name).slice(0, 120),
      content: attachment.content,
    });
  }

  const toEmail = process.env.RFQ_TO_EMAIL || "sales@lfclothing.com";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "sales@lfclothing.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Lingfeng Apparel Website";

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: toEmail, name: "Lingfeng Sales" }],
    replyTo: {
      email: data.email,
      name: data.name,
    },
    subject: `New RFQ: ${data.category || "Website Inquiry"} - ${data.name}`,
    htmlContent: buildEmailHtml({
      ...data,
      functionRequirements: data.functionRequirements || data.function,
    }),
  };

  if (attachments.length) {
    payload.attachment = attachments;
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo send failed", response.status, errorText);
    return json(502, { error: "Unable to send the RFQ right now. Please email sales@lfclothing.com directly." });
  }

  return json(200, { ok: true });
};
