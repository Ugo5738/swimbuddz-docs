# Supabase Email Templates for SwimBuddz

Copy and paste these templates into your Supabase Dashboard:
**Authentication → Email Templates**

Each template uses the same styling as your existing confirmation email.

---

## 1. Confirm Signup (Already configured)

Your existing template is good. No changes needed.

---

## 2. Reset Password

**Subject:** `Reset Your SwimBuddz Password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0e7490;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 24px 0;
      text-align: left;
      font-size: 14px;
      color: #92400e;
      border-radius: 0 8px 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Reset Your Password</h1>
      <p class="text">
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      <div class="warning">
        This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
      </div>
      <p class="text" style="margin-top: 24px; font-size: 14px;">
        For security, this request was received from a {{ .Data.device }} device.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Guidelines</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link / Passwordless Login

**Subject:** `Your SwimBuddz Login Link`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login Link</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0e7490;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Your Login Link</h1>
      <p class="text">
        Click the button below to securely log in to your SwimBuddz account. No password needed!
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Log In to SwimBuddz</a>
      <p class="text" style="margin-top: 32px; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Guidelines</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Change Email Address (Confirmation for NEW email)

**Subject:** `Confirm Your New Email Address`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your New Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0e7490;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 24px 0;
      text-align: left;
      font-size: 14px;
      color: #92400e;
      border-radius: 0 8px 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Confirm Your New Email</h1>
      <p class="text">
        You requested to change your email address to this one. Click the button below to confirm.
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
      <div class="warning">
        If you didn't request this change, please ignore this email and your account will remain unchanged.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Guidelines</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Reauthentication (Security verification)

**Subject:** `Verify Your Identity - SwimBuddz`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Identity</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0e7490;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .security-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 12px 16px;
      margin: 24px 0;
      text-align: left;
      font-size: 14px;
      color: #166534;
      border-radius: 0 8px 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Verify Your Identity</h1>
      <p class="text">
        For your security, we need to verify your identity before you can make changes to your account.
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Verify Identity</a>
      <div class="security-box">
        <strong>Security Notice:</strong> This verification was requested because you're attempting a sensitive action on your account. This link expires in 10 minutes.
      </div>
      <p class="text" style="margin-top: 24px; font-size: 14px;">
        If you didn't initiate this request, please secure your account immediately by changing your password.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Guidelines</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 6. Invite User

**Subject:** `You're Invited to Join SwimBuddz!`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #0891b2;
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 9999px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #0e7490;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .features {
      text-align: left;
      margin: 24px 0;
      padding: 0 20px;
    }
    .features li {
      margin: 8px 0;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">You're Invited to SwimBuddz!</h1>
      <p class="text">
        You've been invited to join Lagos' premier swimming community. Accept the invitation to get started!
      </p>
      <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
      <ul class="features">
        <li>Join swim sessions at top pools across Lagos</li>
        <li>Connect with fellow swimmers</li>
        <li>Track your swimming progress</li>
        <li>Access exclusive events and programs</li>
      </ul>
      <p class="text" style="margin-top: 24px; font-size: 14px;">
        This invitation link expires in 7 days.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Guidelines</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Notification-Only Templates (No action button needed)

These are informational emails that notify users about completed actions.

---

## 7. Password Changed Notification

**Subject:** `Your SwimBuddz Password Was Changed`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 16px 20px;
      margin: 24px 0;
      text-align: left;
      border-radius: 0 8px 8px 0;
    }
    .success-box .icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .success-box .title {
      font-weight: 600;
      color: #166534;
      margin-bottom: 4px;
    }
    .success-box .desc {
      font-size: 14px;
      color: #166534;
    }
    .warning-text {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #991b1b;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Password Changed Successfully</h1>
      <div class="success-box">
        <div class="icon">&#x2705;</div>
        <div class="title">Your password has been updated</div>
        <div class="desc">This change was made on {{ .SentAt | date "January 2, 2006 at 3:04 PM" }}</div>
      </div>
      <p class="text">
        Your SwimBuddz account password has been successfully changed. You can now use your new password to log in.
      </p>
      <div class="warning-text">
        <strong>Didn't make this change?</strong><br>
        If you didn't change your password, your account may be compromised. Please reset your password immediately and contact our support team.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 8. Email Address Changed Notification

**Subject:** `Your SwimBuddz Email Address Was Changed`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Address Changed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px 20px;
      margin: 24px 0;
      text-align: left;
      border-radius: 0 8px 8px 0;
    }
    .info-box .title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .info-box .detail {
      font-size: 14px;
      color: #1e40af;
      margin: 4px 0;
    }
    .warning-text {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #991b1b;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Email Address Changed</h1>
      <p class="text">
        The email address associated with your SwimBuddz account has been changed.
      </p>
      <div class="info-box">
        <div class="title">Account Update Details</div>
        <div class="detail"><strong>Previous email:</strong> This email address</div>
        <div class="detail"><strong>Changed on:</strong> {{ .SentAt | date "January 2, 2006 at 3:04 PM" }}</div>
      </div>
      <p class="text" style="font-size: 14px;">
        Future account emails will be sent to your new email address. This old email will no longer receive account notifications.
      </p>
      <div class="warning-text">
        <strong>Didn't make this change?</strong><br>
        If you didn't change your email address, your account may be compromised. Please contact our support team immediately.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 9. Phone Number Changed Notification

**Subject:** `Your SwimBuddz Phone Number Was Changed`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phone Number Changed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }
    .text {
      font-size: 16px;
      color: #475569;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .link {
      color: #0891b2;
      text-decoration: none;
    }
    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 16px 20px;
      margin: 24px 0;
      text-align: left;
      border-radius: 0 8px 8px 0;
    }
    .success-box .icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .success-box .title {
      font-weight: 600;
      color: #166534;
      margin-bottom: 4px;
    }
    .success-box .desc {
      font-size: 14px;
      color: #166534;
    }
    .warning-text {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #991b1b;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SwimBuddz</div>
    </div>
    <div class="content">
      <h1 class="h1">Phone Number Updated</h1>
      <div class="success-box">
        <div class="icon">&#x1F4F1;</div>
        <div class="title">Your phone number has been changed</div>
        <div class="desc">This change was made on {{ .SentAt | date "January 2, 2006 at 3:04 PM" }}</div>
      </div>
      <p class="text">
        The phone number associated with your SwimBuddz account has been successfully updated.
      </p>
      <div class="warning-text">
        <strong>Didn't make this change?</strong><br>
        If you didn't update your phone number, your account may be compromised. Please contact our support team immediately.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 SwimBuddz. All rights reserved.</p>
      <p>
        <a href="#" class="link">Privacy Policy</a> •
        <a href="#" class="link">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## How to Apply These Templates

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** in the sidebar
3. Click **Email Templates** under NOTIFICATIONS
4. For each template type:
   - Select the template from the dropdown
   - Update the **Subject** line
   - Paste the HTML into the template editor
   - Click **Save**

## Template Variables Reference

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The action link (confirm, reset, etc.) |
| `{{ .SentAt }}` | Timestamp when email was sent |
| `{{ .Email }}` | User's email address |
| `{{ .Data.xxx }}` | Custom data passed during signup |

---

*Last updated: February 2026*
