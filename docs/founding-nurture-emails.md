# Zenda Founding Customer Nurture Sequence

## Overview
5-email sequence triggered after a user signs up on the /founding page. Goal: convert trial users to paid subscribers within the 14-day trial window.

**Timing:** Day 0 (immediate), Day 1, Day 3, Day 7, Day 12

---

## Email 1: Welcome + Quick Win (Day 0 — Immediate)
**Subject:** Welcome to Zenda! Here's how to get your first booking in 5 minutes
**Preview:** Your WhatsApp AI receptionist is ready. Let's set it up.

### Body:
Hi {{first_name}},

Welcome to Zenda — your WhatsApp AI receptionist is ready to start booking appointments for you.

Here's how to get your first automated booking in 5 minutes:

1. **Download the app** — [Mac] / [Windows]
2. **Connect your WhatsApp** — scan the QR code with WhatsApp Business
3. **Add 3 services** — just your top 3 (you can add more later)
4. **Set your hours** — when do you accept appointments?
5. **Test it** — send yourself a message from another phone

That's it. From now on, when anyone messages your business WhatsApp asking for an appointment, Zenda handles it — 24/7.

**Need help?** Reply to this email or message us on WhatsApp.

Talk soon,
The Zenda Team

---

## Email 2: Social Proof + Use Case (Day 1)
**Subject:** How [business type] fills 40% more empty slots with WhatsApp
**Preview:** The average business loses $X/month to no-shows. Here's how to stop that.

### Body:
Hi {{first_name}},

Yesterday you set up Zenda. Today, let's make sure you're using it to its full potential.

**The #1 thing that moves the needle:** Appointment reminders.

When you enable automatic reminders (Settings → Reminders), Zenda sends:
- **24 hours before:** "Hi {{client_name}}, your appointment is tomorrow at {{time}}. Confirm?"
- **2 hours before:** "See you in 2 hours!"

Businesses that enable reminders see a **40% reduction in no-shows**. That's real money back in your pocket.

**Pro tip:** Set up your cancellation policy in Zenda. When someone cancels, Zenda automatically offers the slot to your waitlist. No more empty chairs.

**Quick win:** Enable reminders right now → [Open Zenda]

Best,
The Zenda Team

---

## Email 3: Revenue Calculator (Day 3)
**Subject:** You're leaving $X on the table every month
**Preview:** We did the math. Here's what no-shows cost you.

### Body:
Hi {{first_name}},

Let's talk numbers.

Based on your industry, here's what no-shows are costing you:

| Metric | Value |
|--------|-------|
| Average appointment value | ${{avg_value}} |
| Weekly appointments | {{weekly_appts}} |
| Estimated no-show rate | 20% |
| **Monthly revenue lost** | **${{monthly_lost}}** |
| **Recovered with Zenda** | **${{monthly_recovered}}** |

Zenda costs from $29/month. The ROI speaks for itself.

**3 things to set up this week:**
1. ✅ Enable appointment reminders (if you haven't)
2. 📋 Add your full service menu with prices
3. 🔄 Set up the waitlist for cancellations

Each one takes under 2 minutes.

Need help with any of these? Just reply to this email.

The Zenda Team

---

## Email 4: Advanced Features (Day 7)
**Subject:** 3 features our top users swear by
**Preview:** These settings separate the businesses that thrive from those that just get by.

### Body:
Hi {{first_name}},

You've been using Zenda for a week. Here are 3 features our most successful users rely on:

### 1. Auto-responses for common questions
Set up quick replies for "how much is a [service]?", "what are your hours?", and "where are you located?". Zenda answers instantly — even at midnight.

**Setup:** Settings → Auto-responses → Add

### 2. Recall campaigns
Automatically message clients who haven't booked in 30+ days: "We miss you! Here's a link to book your next appointment."

**Setup:** Campaigns → Recall → Set interval

### 3. Multi-provider scheduling
If you have multiple stylists/therapists/doctors, configure each one with their own schedule. Clients can request a specific provider.

**Setup:** Providers → Add provider → Set hours

---

**Have a question?** Reply to this email — we respond within 2 hours during business hours.

The Zenda Team

---

## Email 5: Trial Ending + Founding Offer (Day 12)
**Subject:** Your trial ends in 2 days — lock in founding pricing
**Preview:** Founding members get 50% off for 3 months. This offer expires soon.

### Body:
Hi {{first_name}},

Your 14-day free trial ends in 2 days. Here's a quick look at what Zenda has done for you:

- **{{messages_handled}}** messages handled automatically
- **{{appointments_booked}}** appointments booked via WhatsApp
- **{{reminders_sent}}** reminders sent
- **{{no_shows_prevented}}** no-shows prevented

### Founding Member Offer (limited time)

As an early adopter, you qualify for founding pricing:

| Plan | Regular Price | **Founding Price** |
|------|--------------|-------------------|
| Solo | $29/mo | **$14.50/mo** |
| Starter | $49/mo | **$24.50/mo** |
| Pro | $89/mo | **$44.50/mo** |

**50% off for 3 months.** After that, you keep the plan at the regular price.

This offer is only available to founding members who subscribe before {{expiry_date}}.

**[Claim founding pricing →]**

If you have any questions or need help, reply to this email. We're here to help.

The Zenda Team

---

## Notes for Implementation
- All emails should be bilingual (ES/EN) based on user's locale at signup
- Revenue calculator values ({{avg_value}}, {{monthly_lost}}) pulled from user's configured services or industry defaults
- Day 5 email stats ({{messages_handled}}, etc.) require tracking — if data isn't available, use industry averages
- Founding coupon code: needs to be created in Stripe (ZEN-86 dependency)
- Unsubscribe link required in all emails
- WhatsApp opt-in confirmation in Email 1 (compliance)
