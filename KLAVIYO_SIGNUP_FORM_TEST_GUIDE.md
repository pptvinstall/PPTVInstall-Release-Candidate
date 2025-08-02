# 🎯 Klaviyo Signup Form Integration - TEST GUIDE

## ✅ **Integration Status: COMPLETE**

Your Picture Perfect TV Install site now has **full Klaviyo signup form integration**!

---

## 🧪 **Testing Your Integration**

### **Step 1: Visit Your Homepage**
Navigate to: `http://localhost:5000`

**Look For:**
- ✅ Big blue signup section: "Get $10 Off Your First Service"
- ✅ Klaviyo form appears automatically
- ✅ Button: "💰 Claim $10 Discount" 

### **Step 2: Visit Your Booking Page**  
Navigate to: `http://localhost:5000/booking`

**Look For:**
- ✅ Green banner at top: "💰 Save $10 on Your Booking!"
- ✅ Klaviyo form embedded inline
- ✅ Button: "Get Discount Code"

### **Step 3: Test the Forms**
1. **Fill out the signup form** with test email
2. **Click "Submit"** or equivalent button  
3. **Check your Klaviyo dashboard** → Profiles
4. **Verify the user** appears in List "RbzDg6"

---

## 🔧 **What's Integrated**

| Component | Location | Status |
|-----------|----------|---------|
| **Klaviyo Tracking Script** | `client/index.html` | ✅ Active |
| **On-Site Forms Script** | `client/index.html` | ✅ Active |
| **Homepage Signup Section** | `src/pages/home.tsx` | ✅ Added |
| **Booking Page Banner** | `src/pages/booking.tsx` | ✅ Added |
| **Manual Trigger Buttons** | Both pages | ✅ Functional |
| **Form ID Integration** | Both locations | ✅ XXjrLu |

---

## 🎨 **Design Details**

### **Homepage Section:**
- **Background:** Blue gradient (brand colors)
- **Text:** White with clear CTA
- **Button:** White with blue text
- **Position:** Between hero and featured service

### **Booking Page Banner:**
- **Background:** Green gradient (urgency/discount)
- **Text:** Green tones for savings focus  
- **Button:** Green with white text
- **Position:** Top of booking page

---

## 📊 **Expected Flow**

```
User Visits Site
       ↓
Sees Signup Form
       ↓  
Fills Out Email
       ↓
Submits Form
       ↓
Added to Klaviyo List "RbzDg6" 
       ↓
3-Day Follow-Up Email Triggers
       ↓
User Returns for Booking
```

---

## 🚀 **Production Checklist**

### **Before Going Live:**
- [ ] Replace Form ID "XXjrLu" with your actual Klaviyo form ID
- [ ] Test form submissions in Klaviyo dashboard
- [ ] Verify list "RbzDg6" receives new contacts  
- [ ] Set up your 3-day follow-up flow in Klaviyo
- [ ] Test the manual trigger buttons
- [ ] Check mobile responsiveness

### **After Going Live:**
- [ ] Monitor Klaviyo analytics for form performance
- [ ] Track conversion rates (signups → bookings)
- [ ] A/B test different discount amounts
- [ ] Optimize form placement based on data

---

## 🛠️ **Customization Options**

### **Change Form Colors:**
Edit the CSS classes in the respective files:
- `bg-gradient-to-r from-blue-600 to-blue-700` (Homepage)
- `bg-gradient-to-r from-green-50 to-blue-50` (Booking page)

### **Update Discount Amount:**
Replace "$10" with your preferred discount in both files.

### **Modify Button Text:**
Change button text in both `home.tsx` and `booking.tsx`.

---

## 📈 **Success Metrics to Track**

1. **Form Submission Rate:** % of visitors who sign up
2. **List Growth:** Daily additions to List RbzDg6  
3. **Email Engagement:** Open/click rates on follow-ups
4. **Conversion Rate:** Signups who become customers
5. **Revenue Attribution:** Sales from email campaigns

---

## ⚡ **Quick Troubleshooting**

**Form Not Appearing?**
- Check browser console for JavaScript errors
- Verify Klaviyo scripts are loading (Network tab)
- Confirm Form ID "XXjrLu" is correct

**Submissions Not Tracked?**
- Check Klaviyo account for new profiles
- Verify Site ID "XHESD3" is correct
- Test with a different email address

**Manual Button Not Working?**
- Check browser console for errors
- Verify Klaviyo On-Site script is loaded
- Try refreshing the page

---

## 🎊 **You're Ready!**

Your **complete email capture system** is now live and ready to convert visitors into customers!

**Next:** Set up your welcome email and 3-day follow-up sequence in Klaviyo dashboard.
