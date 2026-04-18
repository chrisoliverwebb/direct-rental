# Google Sheets Lead Capture

This project can submit the early-access form directly into a Google Sheet using a Google Apps Script "web app" endpoint.

## 1) Create the Sheet

1. Create a new Google Sheet.
2. Add a sheet/tab named `Leads`.
3. Put these headers in row 1:
   - `submittedAt`
   - `email`
   - `name`
   - `properties`
   - `platforms`
   - `pageUrl`
   - `referrer`
   - `userAgent`

## 2) Create the Apps Script Web App

1. In the Google Sheet, go to `Extensions` -> `Apps Script`.
2. Replace the script with the code below.
3. Set a secret token (any random string).

```js
const SHEET_NAME = "Leads";
const SECRET = "CHANGE_ME";
const NOTIFY_EMAIL = "you@yourdomain.com"; // optional: set to "" to disable

function doPost(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const secret = String(params.secret || "");
    if (SECRET && secret !== SECRET) {
      return ContentService.createTextOutput("unauthorized");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Ensure header row exists.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "submittedAt",
        "email",
        "name",
        "properties",
        "platforms",
        "pageUrl",
        "referrer",
        "userAgent",
      ]);
    }

    sheet.appendRow([
      String(params.submittedAt || new Date().toISOString()),
      String(params.email || ""),
      String(params.name || ""),
      String(params.properties || ""),
      String(params.platforms || ""),
      String(params.pageUrl || ""),
      String(params.referrer || ""),
      String(params.userAgent || ""),
    ]);

    if (NOTIFY_EMAIL) {
      const email = String(params.email || "");
      const name = String(params.name || "");
      const properties = String(params.properties || "");
      const platforms = String(params.platforms || "");

      const mail = {
        to: NOTIFY_EMAIL,
        subject: "New Direct Rental lead",
        htmlBody:
          "<p><strong>New early access lead</strong></p>" +
          "<ul>" +
          "<li><strong>Email:</strong> " + escapeHtml(email) + "</li>" +
          "<li><strong>Name:</strong> " + escapeHtml(name) + "</li>" +
          "<li><strong>Properties:</strong> " + escapeHtml(properties) + "</li>" +
          "<li><strong>Platforms:</strong> " + escapeHtml(platforms) + "</li>" +
          "<li><strong>Page:</strong> " + escapeHtml(String(params.pageUrl || "")) + "</li>" +
          "</ul>",
      };

      // Only set reply-to when it exists (passing undefined can throw in Apps Script).
      if (email) {
        mail.replyTo = email;
      }

      MailApp.sendEmail(mail);
    }

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error");
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

## 3) Deploy

1. Click `Deploy` -> `New deployment`.
2. Select type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Deploy and copy the Web App URL.

## 4) Configure Vite Env Vars

Create `.env.local` in the project root:

```bash
VITE_GOOGLE_SHEETS_WEB_APP_URL="PASTE_WEB_APP_URL"
VITE_GOOGLE_SHEETS_SECRET="CHANGE_ME"
```

Restart `npm run dev`.

## Notes

- The frontend submits with `mode: "no-cors"` so the browser won't block the request on CORS.
- This means the frontend can't read the response; it assumes success if the network request completes.
- Use the `SECRET` to prevent random submissions to your script URL.
- Apps Script email sending has daily quotas. For low-volume lead capture this is usually fine.
