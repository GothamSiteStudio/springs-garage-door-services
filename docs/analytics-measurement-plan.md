# Analytics & Measurement Plan
**Springs Garage Door Services**
**Date:** April 18, 2026
**Site:** springsgaragedoorservices.com
**Stack:** Static HTML on GitHub Pages, Matomo (self-hosted), Google Search Console

---

## 1. GA4 Setup Recommendations

### 1.1 Property Configuration

- Create a GA4 property named `Springs Garage Door Services - Production`
- Data stream: Web, URL `https://springsgaragedoorservices.com`
- Time zone: America/Denver (MT)
- Currency: USD
- Enable Enhanced Measurement: page views, scrolls, outbound clicks, site search (off), file downloads

### 1.2 Installation Method

Since the site is static HTML with no tag manager, use the global site tag (gtag.js) placed in the `<head>` of every page, directly after the Matomo snippet. Add to all 8 public HTML files:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Alternative (recommended for future):** Install Google Tag Manager container instead, then manage GA4, conversion tags, and future pixels from GTM without touching HTML again.

### 1.3 Custom Events to Implement

These events map to actual user actions on the site that signal lead intent:

| Event Name | Trigger | Parameters | Implementation |
|------------|---------|------------|----------------|
| `phone_call_click` | Click on any `a[href^="tel:"]` | `link_text`, `page_location` | JS listener on all tel links |
| `email_click` | Click on any `a[href^="mailto:"]` | `link_text`, `page_location` | JS listener on all mailto links |
| `form_submit` | Contact form submitted (`#contactForm` submit success) | `service_type`, `urgency`, `page_location` | Fire after validation passes |
| `form_start` | First interaction with any form field | `page_location` | Fire once per session on first field focus |
| `directions_click` | Click on Google Maps link | `page_location` | JS listener on maps.app.goo.gl links |
| `cta_click` | Click on any `.cta-btn` element | `link_text`, `link_url`, `page_location` | JS listener on .cta-btn class |
| `scroll_depth` | 25%, 50%, 75%, 90% scroll milestones | `percent_scrolled`, `page_location` | Enhanced Measurement covers this |

### 1.4 Implementation Code (add to main.js)

```javascript
/* ----------------------------------------------------------
   GA4 EVENT TRACKING
---------------------------------------------------------- */
function initGA4Events() {
  if (typeof gtag !== 'function') return;

  // Phone call clicks
  qsa('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'phone_call_click', {
        link_text: link.textContent.trim(),
        page_location: window.location.pathname
      });
    });
  });

  // Email clicks
  qsa('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'email_click', {
        link_text: link.textContent.trim(),
        page_location: window.location.pathname
      });
    });
  });

  // Google Maps / directions clicks
  qsa('a[href*="maps.app.goo.gl"], a[href*="google.com/maps"]').forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'directions_click', {
        page_location: window.location.pathname
      });
    });
  });

  // CTA button clicks
  qsa('.cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gtag('event', 'cta_click', {
        link_text: btn.textContent.trim(),
        link_url: btn.getAttribute('href') || '',
        page_location: window.location.pathname
      });
    });
  });

  // Form start (first field interaction)
  const form = qs('#contactForm');
  if (form) {
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (!formStarted) {
        formStarted = true;
        gtag('event', 'form_start', {
          page_location: window.location.pathname
        });
      }
    });
  }

  // Form submit (fire after successful validation)
  // Hook into existing form submit handler
  if (form) {
    form.addEventListener('submit', () => {
      const serviceType = form.querySelector('#serviceType')?.value || '';
      const urgency = form.querySelector('#urgency')?.value || '';
      gtag('event', 'form_submit', {
        service_type: serviceType,
        urgency: urgency,
        page_location: window.location.pathname
      });
    });
  }
}
```

### 1.5 Conversions to Mark in GA4 Admin

Mark these events as conversions in GA4 > Admin > Events:

| Conversion Event | Priority | Why |
|------------------|----------|-----|
| `phone_call_click` | **Primary** | Phone is the #1 lead channel for local service businesses |
| `form_submit` | **Primary** | Direct quote request |
| `email_click` | Secondary | Lower-intent but still a lead signal |
| `directions_click` | Secondary | Indicates local intent / visit planning |

### 1.6 GA4 Audiences to Create

| Audience | Definition | Purpose |
|----------|------------|---------|
| Lead converters | Triggered `phone_call_click` OR `form_submit` | Measure conversion rate by source |
| High-intent visitors | Visited `contact.html` AND scroll > 50% | Remarketing seed (future) |
| Service researchers | Visited `services.html` AND session duration > 60s | Content quality signal |
| Multi-page visitors | Page views per session >= 3 | Engaged traffic quality |

---

## 2. Google Search Console Monitoring Routine

### 2.1 Weekly Checks (Every Monday, 10 min)

| Check | Where in GSC | What to Look For | Action Threshold |
|-------|-------------|-------------------|------------------|
| **Impressions trend** | Performance > Search results > Date range: last 28 days vs previous | Sudden drops = indexing issue; steady climb = SEO working | >20% drop week-over-week |
| **Click trend** | Same view, Clicks tab | Should grow as positions improve | Track absolute number, any clicks from 0 is a win |
| **Average position by query** | Performance > Queries tab, sort by Impressions | Core terms moving from page 2 toward page 1 | Flag queries that drop >5 positions |
| **Top pages by clicks** | Performance > Pages tab | Which pages are earning traffic | If a page has impressions but 0 clicks, title/description needs work |
| **Index coverage** | Pages > Indexing | New errors, excluded pages, canonical issues | Any new "Not indexed" page = investigate same day |
| **www vs non-www** | Pages > Indexing > "Duplicate, Google chose different canonical" | The canonical conflict from the audit must be resolved | Should show 0 duplicates after fix |
| **Core Web Vitals** | Experience > Core Web Vitals | LCP, CLS, INP status (Good / Needs improvement / Poor) | Any "Poor" URL = fix within the week |

### 2.2 Monthly Deep Checks (First Monday of Month, 30 min)

| Check | Action |
|-------|--------|
| **Query discovery** | Export all queries for the month. Identify new queries that appeared with >10 impressions. Add to content strategy if relevant. |
| **Page-level CTR** | For any page with CTR < 2% and >100 impressions, rewrite the meta title and description. |
| **Position movement** | Compare average position for top 20 queries this month vs last month. |
| **Sitemap health** | Pages > Sitemaps. Confirm submitted count matches indexed count. |
| **Mobile usability** | Experience > Mobile Usability. Fix any flagged issues. |
| **Backlink check** | Links > External links. Track new referring domains. |

### 2.3 Immediate Priority (from GSC Audit)

These must be fixed before any measurement plan matters:

1. **Resolve www canonical conflict** - 301 redirect www to non-www (or vice versa) via GitHub Pages CNAME + DNS
2. **Get services.html and contact.html indexed** - Request indexing in GSC URL Inspection tool
3. **Clean up Wix ghost URLs** - Create proper 404 responses or redirects for `/about-us`, `/book-online`, `/s-projects-basic`

---

## 3. KPI Dashboard Design

### 3.1 Core KPI Framework

Organized by business function. Each KPI has a baseline (current state), a 90-day target, and a data source.

#### Lead Generation (Primary)

| KPI | Baseline (Apr 2026) | 90-Day Target | Source | Frequency |
|-----|---------------------|---------------|--------|-----------|
| Phone call clicks / month | Unknown (no tracking) | Establish baseline month 1, then +20% | GA4 `phone_call_click` event | Weekly |
| Form submissions / month | 0 (demo form, not connected) | 5-10 after form goes live | GA4 `form_submit` event | Weekly |
| Total leads / month | Unknown | 15-25 combined (calls + forms + email) | GA4 conversions report | Weekly |
| Lead-to-job conversion rate | Unknown | Establish baseline, then target 40-60% | Manual tracking (CRM or spreadsheet) | Monthly |

#### SEO / Organic Visibility

| KPI | Baseline (Apr 2026) | 90-Day Target | Source | Frequency |
|-----|---------------------|---------------|--------|-----------|
| GSC impressions / month | ~1,935 (10-day window) | 8,000+ (full month, after canonical fix) | GSC Performance | Weekly |
| GSC clicks / month | 2 | 50+ | GSC Performance | Weekly |
| GSC average position (core terms) | 12.2 (page 2) | <8 for top 5 terms | GSC Performance | Weekly |
| Indexed pages | 3 of 7 | 7 of 7 | GSC Pages > Indexing | Weekly |
| Pages with organic clicks | 1 | 4+ | GSC Performance > Pages | Monthly |

#### Website Engagement

| KPI | Baseline (Apr 2026) | 90-Day Target | Source | Frequency |
|-----|---------------------|---------------|--------|-----------|
| Sessions / month | Available in Matomo | +50% from baseline | GA4 + Matomo | Weekly |
| Engagement rate | Unknown | >55% | GA4 | Weekly |
| Avg. engagement time | Unknown | >1:30 | GA4 | Monthly |
| Contact page visit rate | Unknown | >15% of sessions | GA4 > Pages report | Weekly |
| Bounce rate (contact.html) | Unknown | <50% | GA4 | Monthly |

#### Revenue Efficiency (requires manual input or CRM)

| KPI | Baseline | 90-Day Target | Source | Frequency |
|-----|----------|---------------|--------|-----------|
| Cost per lead (CPL) | $0 (organic only) | Track if paid starts | Manual calculation | Monthly |
| Average job value | Ask Eyal | Establish baseline | Manual / invoicing | Monthly |
| Customer acquisition cost (CAC) | Unknown | Calculate after 90 days of data | Total marketing spend / new customers | Monthly |
| Monthly revenue from web leads | Unknown | Track from month 1 | CRM or manual | Monthly |

### 3.2 Dashboard Layout (Google Looker Studio or Spreadsheet)

**Page 1: Executive Summary**
- Total leads this month (calls + forms + emails)
- Lead source breakdown (organic / direct / referral)
- Month-over-month trend line
- Top 3 service types requested

**Page 2: SEO Performance**
- GSC impressions + clicks trend (line chart, last 6 months)
- Top 10 queries table with position, impressions, clicks, CTR
- Index coverage status (indexed vs not)
- Core Web Vitals pass/fail

**Page 3: Website Behavior**
- Sessions by source/medium (bar chart)
- Top pages by sessions and engagement rate
- Contact page funnel: visitors > form starts > form submits
- Device breakdown (mobile vs desktop)

**Page 4: Conversion Tracking**
- Phone click events by page (which page drives the most calls)
- Form submissions by service type
- Conversion rate by landing page
- Time-of-day and day-of-week heatmap for lead events

---

## 4. Call Tracking Recommendation

### 4.1 Why Call Tracking Matters Here

Phone is the primary CTA. The site has `tel:7193089951` links on every page (navbar, hero sections, contact page, footer CTAs). Without call tracking, the highest-value conversion is invisible.

GA4 `phone_call_click` events only tell you someone tapped the link. They do not confirm:
- A call was actually made
- How long the call lasted
- Whether it was a new lead or existing customer
- Which marketing source drove the call

### 4.2 Recommended Solution: CallRail

**Why CallRail:**
- Designed for local service businesses
- Integrates with GA4 (sends call events as conversions)
- Integrates with Google Ads (when/if paid search starts)
- Supports dynamic number insertion (DNI) for source-level tracking
- Call recording for quality review
- Starting at ~$45/month for 5 local numbers + 250 minutes

### 4.3 Implementation Plan

**Phase 1 (immediate):** Single tracking number
- Get one CallRail tracking number for the website
- Replace the hard-coded `7193089951` across all HTML pages with the tracking number
- Keep the original number as the destination (calls forward transparently)
- This alone tells you: total calls from website, call duration, caller location, time of call

**Phase 2 (after organic traffic grows):** Dynamic Number Insertion (DNI)
- Add the CallRail DNI JavaScript snippet to the site
- DNI swaps the displayed phone number based on the visitor's source (organic, direct, referral, paid)
- Now you can attribute calls to specific marketing channels
- Requires enough traffic volume to be meaningful (wait until 200+ sessions/month)

**Phase 3 (if/when Google Ads starts):** Dedicated paid search number
- Separate tracking number for Google Ads campaigns
- Enables accurate ROAS calculation for paid search
- Call extensions in ads use the CallRail number

### 4.4 Alternative (Budget-Conscious)

If CallRail is too expensive at this stage:
- Use Google Business Profile call tracking (free, but limited data)
- Rely on GA4 `phone_call_click` events as a proxy for now
- Ask Eyal to note "How did you find us?" on every call manually
- Revisit CallRail once traffic reaches 500+ sessions/month

---

## 5. Attribution Model for a Local Service Business

### 5.1 Why Attribution is Different for Local Service

The customer journey for garage door services is short and high-intent:

```
Typical path:
Problem occurs (broken spring, stuck door)
  > Google search ("garage door repair colorado springs")
    > Click organic result OR Google Maps listing
      > View website (30-90 seconds)
        > Call immediately OR submit form

Average touchpoints before conversion: 1-2
Average time from first visit to lead: same session (70-80% of cases)
```

This means: **last-click attribution is actually appropriate here.** Unlike e-commerce or SaaS, there is rarely a multi-touch journey. The customer has a problem and needs it solved now.

### 5.2 Recommended Attribution Setup

| Channel | Attribution Logic | Data Source |
|---------|-------------------|-------------|
| **Organic Search** | Last-click. Visitor lands from Google > calls or submits form in same session. | GA4 (source/medium) + GSC (query data) |
| **Google Maps / GBP** | Tracked separately. GBP has its own call/direction/website click metrics. | Google Business Profile Insights |
| **Direct** | Returning visitors or word-of-mouth. High trust signal. | GA4 (direct traffic) |
| **Referral** | Track which directories/sites send traffic. | GA4 (referral report) |
| **Paid Search** | Last-click with CallRail number for phone attribution. | Google Ads + CallRail (future) |

### 5.3 GA4 Attribution Settings

- Go to GA4 > Admin > Attribution Settings
- Set reporting attribution model: **Last click** (cross-channel)
- Lookback window: **7 days** for acquisition, **7 days** for other conversions
  - (Short windows because the decision cycle is same-day for most garage door work)

### 5.4 Offline Attribution (Connecting Calls to Revenue)

This is the hardest part. To close the loop between a website visit and actual revenue:

1. **Simple method (start here):** Eyal tracks every job in a spreadsheet with columns:
   - Date | Customer name | Phone | Service type | How they found us | Quote amount | Job completed (Y/N) | Revenue

2. **Better method (next phase):** Use a simple CRM (Jobber, Housecall Pro, or ServiceTitan - all built for home services) that logs calls, jobs, and revenue. Link it to CallRail for automatic lead source tagging.

3. **Match-back monthly:** Compare CallRail call log (with source data) against completed jobs list. Calculate revenue per channel.

### 5.5 Google Business Profile as a Separate Channel

GBP is a major lead source for local businesses and operates outside the website:
- Track GBP calls, direction requests, and website clicks separately in GBP Insights
- GBP traffic that reaches the website shows as referral from `google.com` with no query data
- Consider GBP its own funnel: Maps search > GBP listing > call/directions/website click

---

## 6. Monthly Reporting Template

### Report Header
```
SPRINGS GARAGE DOOR SERVICES - Monthly Marketing Report
Period: [Month Year]
Prepared: [Date]
```

### Section 1: Executive Summary (1 paragraph)
- Total leads this month (calls + forms + emails)
- Comparison to previous month (% change)
- Biggest win and biggest gap
- One recommended action for next month

### Section 2: Lead Volume

| Metric | This Month | Last Month | Change | Target |
|--------|------------|------------|--------|--------|
| Phone call clicks (GA4) | | | | |
| Form submissions | | | | |
| Email clicks | | | | |
| Total website leads | | | | |
| GBP calls | | | | |
| GBP direction requests | | | | |
| **Total leads (all sources)** | | | | |

### Section 3: SEO & Organic Performance

| Metric | This Month | Last Month | Change |
|--------|------------|------------|--------|
| GSC impressions | | | |
| GSC clicks | | | |
| GSC average CTR | | | |
| GSC average position | | | |
| Indexed pages | | | |
| New queries discovered | | | |

**Top 10 Queries Table:**

| Query | Impressions | Clicks | CTR | Avg Position | Position Change |
|-------|-------------|--------|-----|-------------|----------------|
| | | | | | |

### Section 4: Website Performance

| Metric | This Month | Last Month | Change |
|--------|------------|------------|--------|
| Total sessions | | | |
| Unique users | | | |
| Engagement rate | | | |
| Avg. engagement time | | | |
| Contact page visits | | | |
| Contact page conversion rate | | | |
| Top landing page | | | |
| Mobile vs Desktop split | | | |

### Section 5: Conversion Funnel

```
Sessions ............... [number]
  > Visited contact page ... [number] ([%] of sessions)
    > Started form ......... [number] ([%] of contact visitors)
      > Submitted form ..... [number] ([%] of form starts)
  > Clicked phone ......... [number] ([%] of sessions)
  > Clicked email ......... [number] ([%] of sessions)
```

**Phone clicks by page:**

| Page | Phone Clicks | % of Total |
|------|-------------|------------|
| Homepage | | |
| Contact | | |
| Services | | |
| About | | |
| Service Areas | | |

### Section 6: Channel Attribution

| Channel | Sessions | Leads | Conv. Rate | Revenue (if known) |
|---------|----------|-------|------------|-------------------|
| Organic Search | | | | |
| Direct | | | | |
| Google Business Profile | | | | |
| Referral | | | | |
| Social | | | | |
| Paid (if active) | | | | |

### Section 7: Revenue & Efficiency (when data is available)

| Metric | This Month | Last Month | Change |
|--------|------------|------------|--------|
| Total jobs from web leads | | | |
| Total revenue from web leads | | | |
| Average job value | | | |
| Cost per lead (CPL) | | | |
| Customer acquisition cost (CAC) | | | |
| Marketing spend | | | |
| ROAS | | | |

### Section 8: Action Items for Next Month

| Priority | Action | Owner | Due |
|----------|--------|-------|-----|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Section 9: 90-Day Trend (Charts)

- Line chart: Total leads per month (last 3 months)
- Line chart: GSC impressions + clicks (last 3 months)
- Bar chart: Leads by channel (last 3 months)
- Line chart: Average position for top 5 queries (last 3 months)

---

## Implementation Priority & Timeline

### Week 1 (Immediate)
- [ ] Fix www vs non-www canonical conflict (blocks all measurement accuracy)
- [ ] Request indexing for services.html and contact.html
- [ ] Create GA4 property and install gtag.js on all pages
- [ ] Add phone/email/form/CTA event tracking to main.js
- [ ] Mark `phone_call_click` and `form_submit` as GA4 conversions

### Week 2
- [ ] Connect the contact form to a real endpoint (Formspree, Netlify Forms, or email)
- [ ] Set up GA4 audiences (lead converters, high-intent visitors)
- [ ] Create initial KPI tracking spreadsheet with baselines
- [ ] Configure GA4 attribution settings (last-click, 7-day window)

### Week 3-4
- [ ] Build Looker Studio dashboard (or spreadsheet dashboard) with the layout from section 3.2
- [ ] Evaluate CallRail vs manual tracking based on traffic volume
- [ ] Set up GBP Insights review as part of weekly routine
- [ ] Deliver first monthly report using the template from section 6

### Month 2-3
- [ ] Refine KPI targets based on first month of real data
- [ ] Implement CallRail if traffic justifies it (200+ sessions/month)
- [ ] Begin A/B testing meta titles/descriptions for low-CTR pages in GSC
- [ ] Start offline revenue tracking (spreadsheet or CRM)

---

## Tool Stack Summary

| Tool | Role | Cost | Status |
|------|------|------|--------|
| GA4 | Website analytics, event tracking, conversions | Free | To install |
| Google Search Console | SEO monitoring, indexing, query data | Free | Connected |
| Matomo | Secondary analytics (self-hosted, privacy-first) | Free (self-hosted) | Installed |
| Google Business Profile | Local visibility, calls, directions | Free | Active |
| CallRail | Call tracking, source attribution, recording | ~$45/mo | Recommended (phase 2) |
| Google Looker Studio | Dashboard and reporting | Free | Recommended |
| Spreadsheet (manual) | Revenue tracking, lead-to-job close rate | Free | Start immediately |
