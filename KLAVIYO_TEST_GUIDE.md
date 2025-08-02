# 🧪 Klaviyo Integration Test Guide

## ✅ Status: READY FOR TESTING

Your Klaviyo integration is **LIVE** and ready for testing! Here's how to verify everything works perfectly.

## 🚀 Test Instructions

### Step 1: Start Your Server
```bash
npm run dev
# Or if using production build:
npm run start
```

### Step 2: Make a Test Booking
1. **Go to your booking page**: `http://localhost:5000/booking`
2. **Fill out the form** with YOUR real info:
   - **Name**: Your actual name
   - **Email**: Your actual email (you'll check Klaviyo for this)
   - **Phone**: Your actual phone
   - **Address**: Any valid Atlanta address
   - **Service**: Pick any service (TV Installation, Smart Home, etc.)
   - **Date/Time**: Pick any future date/time

3. **Submit the booking** ✅

### Step 3: Check Klaviyo Dashboard
1. **Login to Klaviyo**: [klaviyo.com](https://klaviyo.com)
2. **Go to**: Audience → Profiles → All Profiles
3. **Look for your email** in the list
4. **Click on your profile** to see all the data

### Step 4: Verify Data Sent
Your profile should show:

#### ✅ **Basic Info**
- First Name
- Last Name  
- Email
- Phone Number
- Full Address

#### ✅ **Booking Properties**
- `service_type`: "TV Installation" (or whatever you picked)
- `preferred_date`: Your booking date
- `appointment_time`: Your booking time
- `booking_id`: Unique booking ID
- `pricing_total`: Booking price
- `lead_source`: "website_booking"
- `customer_type`: "new_booking"
- `has_tv_installation`: true/false
- `has_smart_home`: true/false
- `consent_to_contact`: true

## 🔍 What to Look For

### ✅ **SUCCESS Signs:**
- Profile appears in Klaviyo within 30 seconds
- All booking data is populated correctly
- No errors in your server console logs
- Booking confirmation email still works normally

### ❌ **If Something's Wrong:**
- Check server console for Klaviyo error logs
- Verify API key is correct: `pk_6cc7133ac45bb934eb3ce4bb9972577bab`
- Make sure you have internet connection
- Confirm Klaviyo account has "Profiles:Write" permission

## 📊 Expected Server Logs

**Success Log:**
```
[INFO] Starting Klaviyo profile submission...
[INFO] Klaviyo profile created successfully for your@email.com, Profile ID: 01ABC123
```

**Error Log (if any issues):**
```
[ERROR] Error submitting to Klaviyo: [error details]
```

## 🎉 Once It Works...

You're ready to:
1. **Set up welcome email flows**
2. **Create customer segments**
3. **Launch automated campaigns**
4. **Track customer behavior**

## 🆘 Need Help?

If anything doesn't work:
1. Check the server console logs
2. Verify your API key permissions in Klaviyo
3. Make sure your booking form submitted successfully first
4. Test with a different email address

---

**Integration Status**: ✅ **PRODUCTION READY**  
**API Key**: `pk_6cc7133ac45bb934eb3ce4bb9972577bab`  
**Site ID**: `XHESD3`
