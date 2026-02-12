# Azure AD – Request for IT Admin

Use the content below (or the short email) when asking your IT admin to complete the app registration.

---

## Redirect URI to register

Azure AD must have this **Reply URL (Redirect URI)** added for the app, **exactly** as written:

```
http://localhost:3000/api/auth/callback/azure-ad
```

- For production, also add: `https://<your-production-domain>/api/auth/callback/azure-ad`

---

## App details (for reference)

| Field | Value |
|--------|--------|
| **Application name** | DigitalT3 Learning Insights Platform |
| **Application (client) ID** | 16e4fa04-a2f8-45dd-9985-e0874fdb5e0a |
| **Directory (tenant) ID** | a1ea755b-f0e4-4e70-9847-30d668730fd3 |
| **Object ID** | ee2d5efc-516d-4ccb-a025-fc619fc78117 |

---

## Short email to send to IT admin

**Subject:** Azure AD app registration – Redirect URI and Client Secret (DigitalT3 Learning Insights Platform)

**Body:**

Hi,

I’m integrating Microsoft sign-in for the **DigitalT3 Learning Insights Platform** using our existing Azure AD app registration and need two things from you:

1. **Redirect URI**  
   Please add this Reply URL (Redirect URI) to the app registration in Azure Portal (App registrations → DigitalT3 Learning Insights Platform → Authentication):

   **`http://localhost:3000/api/auth/callback/azure-ad`**

   (Exact spelling and path are required; otherwise Azure returns AADSTS50011.)

2. **Client secret**  
   Please create a **Client secret** under Certificates & secrets for this app and share the secret value with me securely (e.g. via a secure channel). I will store it only in the application’s environment configuration.

   **App details for reference:**  
   - Application (client) ID: `16e4fa04-a2f8-45dd-9985-e0874fdb5e0a`  
   - Directory (tenant) ID: `a1ea755b-f0e4-4e70-9847-30d668730fd3`

Thank you.

---

## Troubleshooting: "AADSTS50011 – redirect URI does not match"

If you see this error after the admin added localhost, the redirect URI in Azure still does not match what the app sends. Use this checklist.

### 1. Exact URI (copy‑paste)

The app sends this **exact** redirect URI (no changes):

```
http://localhost:3000/api/auth/callback/azure-ad
```

- **No trailing slash** – not `.../azure-ad/`
- **http** for localhost (not https)
- **Port 3000** – if your app runs on another port (e.g. 3001), either add that URI in Azure too and set `NEXTAUTH_URL=http://localhost:3001` in `.env.local`, or run the app on port 3000.

### 2. Where to add it in Azure

- **Azure Portal** → **Microsoft Entra ID** (or Azure Active Directory) → **App registrations** → open the app (Client ID `16e4fa04-a2f8-45dd-9985-e0874fdb5e0a`).
- Go to **Authentication**.
- Under **Platform configurations**, use **Web** (not "Single-page application").
- Under **Redirect URIs**, click **Add URI** and paste exactly: `http://localhost:3000/api/auth/callback/azure-ad`
- Click **Save**.

### 3. After saving

- Wait **3–5 minutes** for Azure to apply the change.
- Try sign-in again; if it still fails, try an incognito/private window or clear the site's cookies for localhost.

### 4. Set NEXTAUTH_URL locally (recommended)

So the app always sends the same redirect URI, set in `version_keerthana/.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
```

(Use the same port you use in the browser. No trailing slash.)
