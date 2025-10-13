# 🔑 Google Places API - Billing Setup Guide

## ⚠️ Current Issue

```
ERROR: REQUEST_DENIED 
You must enable Billing on the Google Cloud Project
```

## ✅ Solution: Enable Billing

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Enable Billing
1. Go to: https://console.cloud.google.com/billing
2. Click **"Link a billing account"**
3. Click **"CREATE BILLING ACCOUNT"**
4. Fill in your details:
   - Account name
   - Country
   - Payment method (Credit/Debit card)
5. Click **"Submit and enable billing"**

### Step 3: Enable Required APIs
1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable these APIs:
   - ✅ **Places API** (New)
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**

### Step 4: Get Your API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"CREATE CREDENTIALS"** → **"API Key"**
3. Copy your new API key
4. Click "Restrict Key" (recommended):
   - Application restrictions: None (for testing) or HTTP referrers
   - API restrictions: Select "Restrict key"
     - Check: Places API, Geocoding API, Maps JavaScript API

### Step 5: Update Your App
Replace the API key in `components/CustomLocationPicker.tsx`:

```typescript
const GOOGLE_API_KEY = 'YOUR_NEW_API_KEY_HERE';
```

---

## 💰 Pricing (Don't Worry - It's Free!)

### Free Tier (More than enough for testing)
- **$200 free credit per month**
- Places Autocomplete: $2.83 per 1000 requests
- Place Details: $17 per 1000 requests
- **You get ~70,000 autocomplete requests FREE per month!**

### For Your App Usage
- Average user: ~10-20 searches per order
- 100 orders/month = ~2,000 requests
- **Cost: $0** (well within free tier)

### No Surprise Charges
- Set up billing alerts
- Enable budget caps
- Free tier is generous for small apps

---

## 🚀 Alternative: Use Your Own API Key

If you already have a Google Cloud account with billing:

1. Get your API key from: https://console.cloud.google.com/apis/credentials
2. Make sure these APIs are enabled:
   - Places API (New)
   - Geocoding API
3. Update the API key in the code

---

## 🔧 Temporary Fallback (No Billing Needed)

I can add a fallback mode that works without Google Places:
- Uses only GPS location
- Manual address entry
- No autocomplete (but still works!)

Let me know if you want this option!

---

## 📊 Summary

| Option | Pros | Cons |
|--------|------|------|
| Enable Billing | ✅ Full features, ✅ $200 free/month | ⚠️ Requires credit card |
| Your Own Key | ✅ You control it | ⚠️ Need Google account |
| Fallback Mode | ✅ No billing needed | ❌ No autocomplete |

---

## ✅ Recommended Steps

1. **Enable billing** (takes 5 minutes)
2. **Get $200 free credit** per month
3. **Use full Google Places features**
4. **Set billing alerts** for safety

The free tier is very generous - you won't be charged unless you have thousands of users!

---

## 🆘 Need Help?

If you need a fallback solution without billing, let me know and I'll implement:
- GPS location only mode
- Manual address entry
- Saved locations
- No Google API needed

