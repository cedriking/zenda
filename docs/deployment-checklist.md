# Coolify Environment Variables — Setup Required

## Critical (blocks acquisition tracking)

### Google Analytics
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
- Create property at https://analytics.google.com
- Get Measurement ID (G-XXXXXXX format)
- Set in Coolify: Web app → Environment → Add variable

### Google Ads Conversion Tracking
```
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=xxxxxxxxxx
```
- Create conversion action in Google Ads
- Get the conversion ID (AW-XXXXXXX) and label
- These enable tracking when a user completes signup

### WhatsApp Widget Number
```
NEXT_PUBLIC_WHATSAPP_NUMBER=5215512345678
```
- Business WhatsApp number (country code + number, no spaces or dashes)
- If set, the floating WhatsApp widget links directly to wa.me chat
- If not set, widget links to the demo page

## How to set in Coolify

1. Go to your Coolify dashboard
2. Find the Zenda **web** application
3. Click **Configuration** → **Environment Variables**
4. Add each variable above
5. Click **Save** and **Redeploy**

## Verification

After setting, verify with:
```bash
curl -s https://zenda.bot/es/founding | grep "gtag"
# Should show gtag.js script with the GA measurement ID
```
