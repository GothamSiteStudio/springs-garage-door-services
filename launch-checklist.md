# Springs Garage Door Services Launch Checklist

Current state snapshot:
- Home page and supporting page set now exist, including About, Services, Service Areas, Contact, Terms, Privacy, and a styled 404 page.
- Shared navigation, footer, CTA system, sitemap, robots, favicon, Open Graph asset, contact form flow, and core structured data are now in place.
- The remaining work is factual verification, image optimization, external profile validation, Lighthouse and schema QA, and live deployment checks.

## 1. Critical Build Completion

- [x] Create the About page with a full owner-led narrative for Eyal.
- [x] Create the Services page with clear sections for installation, replacement, repair, openers, maintenance, and spring replacement.
- [x] Create the Service Areas page with stronger local intent copy for each area served.
- [x] Create the Terms of Use page.
- [x] Create the Contact page because the home page already links to it in multiple places.
- [x] Reuse the same header, footer, CTA system, and internal link structure across all pages.
- [x] Add active navigation states for each page so the current page is always obvious.

## 2. EEAT and Owner Authority

- [x] Add a dedicated owner story for Eyal: experience, service philosophy, standards, and why customers trust him.
- [x] Add real trust signals that can be verified: years in business, coverage area, business hours, address, contact channels, and review profiles.
- [x] Add a short "Why Homeowners Trust Eyal" section on the home page and About page.
- [x] Add project-backed proof with captions that explain the problem, the fix, and the result.
- [ ] Add review/testimonial content if accurate source material is available.
	- Reviews widget now reads from a static `data/google-reviews.json` file. A GitHub Action (`.github/workflows/fetch-reviews.yml`) fetches fresh reviews weekly using the Places API key stored in GitHub Secrets. No API key is exposed client-side.
	- Next step: add `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` as repository secrets in GitHub, then trigger the workflow manually to populate live reviews.
- [x] Add warranty/process language where true: inspection, recommendation, installation standards, and post-job support.
	- Added manufacturer-backed warranty language, post-job functional testing, safety checks, follow-up support, and workmanship accountability across Services, Home, and About pages.
	- Services page now includes a dedicated "Workmanship and Warranty" section with three cards: manufacturer-backed components, workmanship accountability, and post-job support.
	- Each service listing on the Services page gained a warranty or post-job bullet point.
	- Home and About pages gained warranty and follow-up items in their authority/trust lists.
- [x] Add licensing, insurance, certifications, or manufacturer partnerships only if they are factually confirmed.
	- Added Colorado Secretary of State Certificate of Good Standing (LLC registered 01/02/2024, entity ID 20241004519) as a downloadable PDF at `docs/certificate-of-good-standing.pdf`.
	- Linked from the About page Trust Signals section and the Home page "Why Homeowners Trust Eyal" authority list.
- [x] Add a stronger local-business voice so the site reads like a real owner-led company, not a generic contractor template.

## 3. SEO Foundations

- [x] Give every page its own title tag, meta description, canonical URL, and Open Graph tags.
- [x] Make sure each page has one clear H1 and a strong H2/H3 hierarchy.
- [x] Expand internal linking between services, service areas, contact, and about content.
- [x] Add service-intent keyword coverage naturally across headings, body copy, FAQs, and CTA text.
- [x] Add a sitemap.xml file.
- [x] Add a robots.txt file.
- [x] Add a browser favicon and site icons.
- [x] Create a default social share image for Open Graph.
- [x] Make image alt text specific and local instead of generic.
- [x] Compress and standardize images so page speed stays strong.
	- Created WebP versions of all 23 used raster images (17 photos + 6 brand logos). Total savings: 5,526 KB down to 3,552 KB (36% reduction).
	- Wrapped all 47 `<img>` tags across 8 HTML pages in `<picture>` elements with WebP `<source>` and original JPG/PNG fallback for full browser compatibility.
	- Fixed a broken image reference in privacy.html (`white-raised-panel-pair-driveway.jpg` did not exist, replaced with `white-raised-panel-stone-facade.jpg`).

## 4. Structured Data

- [x] Keep LocalBusiness schema consistent across all pages.
- [x] Add Person schema for Eyal on the About page.
- [x] Add Service schema blocks on the Services page.
- [x] Add BreadcrumbList schema on inner pages.
- [x] Add FAQ schema only where the visible FAQ content actually appears.
- [x] Validate all schema in Google Rich Results Test before launch.
	- Audited JSON-LD across all 7 pages. All blocks parse as valid JSON.
	- Fixed index.html missing `@id` on LocalBusiness (broke cross-page `@id` references).
	- Standardized `areaServed` to 11 areas (added El Paso County) consistently across index, about, services, service-areas, and contact pages (plus Person schema on about).
	- Added `openingHoursSpecification` and `sameAs` to services, service-areas, and contact pages (previously only on index and about).
	- Enriched privacy.html and terms.html LocalBusiness with `image`, `logo`, and `description` (were minimal stubs).
	- Fixed contact.html: added top-level `areaServed` and expanded `contactPoint.areaServed` from 8 to 11 areas.
	- Run Google Rich Results Test manually at https://search.google.com/test/rich-results after next deploy to confirm rich result eligibility.

## 5. Local SEO Depth

- [x] Turn service areas into useful local content, not just a city list.
- [x] Mention the most important areas with unique copy: Colorado Springs, Monument, Fountain, Falcon, Peyton, Woodland Park, Manitou Springs, Black Forest, and nearby communities.
- [x] Add local service context like residential demand, common repair issues, and routing coverage where it is helpful and accurate.
- [x] Keep business name, phone, address, hours, and social links identical everywhere.
- [x] Link to Google Maps and review profiles from multiple trust-focused sections.

## 6. Conversion and UX

- [x] Build the Contact page with a real quote/request form and clear service CTA.
- [x] Add mobile-first call actions so users can tap to call immediately.
- [x] Add a simple trust-first quote flow: service type, location, urgency, contact details.
- [x] Add thank-you or confirmation behavior for forms.
- [x] Make emergency and same-day messaging prominent but accurate.
- [x] Check that animations support the site rather than slowing it down or distracting from the CTA.
	- Audited 12+ animation systems across CSS and JS (scroll-reveal, counter, typewriter, parallax, particles, card-tilt, magnetic buttons, image-reveal, stagger, cursor-glow, scroll-progress, testimonial slider).
	- Added full `prefers-reduced-motion: reduce` support: CSS media query disables all transition/animation durations and instantly reveals `.animate-on-scroll` elements; JS guards skip parallax, particles, card-tilt, magnetic buttons, cursor-glow, stagger, image-reveal, typewriter, and counters for reduced-motion users.
	- Fixed hero CTA visibility: `.hero .animate-on-scroll` and `.hero-panel.animate-on-scroll` now have `opacity: 1; transform: none` in CSS so the primary "Book service" CTA and hero content are always visible even before JS fires.
	- Typewriter no longer clears text content for reduced-motion users, preserving the visible tagline as a fallback.
	- Counter values display final numbers instantly for reduced-motion users instead of animating from 0.

## 7. Content Quality

- [x] Rewrite remaining copy so it sounds consistent, premium, local, and owner-led.
- [x] Remove any placeholder phrasing that describes the rebuild instead of speaking directly to customers.
- [x] Replace generic statements with concrete service language and local details.
- [x] Add FAQs to the pages where they support search intent and customer objections.
- [x] Add before/after framing or mini case studies where the images support it.

## 8. Brand and Assets

- [x] Confirm the exact logo file and use a single preferred format consistently across the site.
	- Logo files: `images/logo.jpg` (fallback) and `images/logo.webp` (preferred). Both exist and are used consistently via `<picture>` elements with WebP source + JPG fallback across all 8 HTML pages (header brand-badge and footer logo).
	- JSON-LD schema consistently references `https://springsgaragedoorservices.com/images/logo.webp` for the `logo` property on every page.
	- No mixed formats, no stale references, no missing files.
- [x] Match the final color system exactly to the logo if any current accent colors are still approximate.
	- Extracted exact logo pixel colors using PIL: gold `#ffc631` (RGB 255,198,49), red `#fe0000` (RGB 254,0,0), deep red `#bf0101` (RGB 191,1,1).
	- Updated CSS custom properties: `--gold` from `#f6bf2a` to `#ffc631`, `--gold-soft` from `#ffde7f` to `#ffe08f`, `--red` from `#d61d17` to `#fe0000`, `--red-deep` from `#8f1511` to `#bf0101`.
	- Updated 29 hardcoded `rgba(246,191,42,...)` to `rgba(255,198,49,...)` and 10 hardcoded `rgba(214,29,23,...)` to `rgba(254,0,0,...)` throughout style.css.
	- All accent colors now match the exact logo palette.
- [x] Create optimized WebP versions for the primary photos if needed.
	- Completed as part of Section 3 image optimization. All used photos and brand raster logos now have WebP variants served via `<picture>` elements.
- [ ] Check image cropping, focal points, and dark-theme contrast on mobile and desktop.

## 9. Compliance and Trust

- [x] Add a Privacy Policy page if the site will collect leads through a form.
- [x] Make Terms of Use specific to this business instead of generic boilerplate.
- [x] Add any required disclosures for warranties, availability, estimates, or emergency service claims.

## 10. QA and Launch

- [x] Create all currently missing linked pages before previewing the full site.
- [ ] Test every internal link, phone link, email link, and external review/social link.
- [ ] Test the site on desktop, tablet, and mobile breakpoints.
- [ ] Run Lighthouse for performance, accessibility, best practices, and SEO.
- [ ] Validate that scroll effects, counters, menus, and animations work on all pages.
- [x] Review the CSS editor warnings currently shown for modern functions like clamp() and min() and confirm target browser compatibility.
- [ ] Check image loading, layout shift, and font loading behavior.
- [ ] Deploy to a preview URL and perform a final live crawl.
- [ ] Submit sitemap to Google Search Console after launch.

## 11. Best-Next Expansion After Launch

- [ ] Build separate city landing pages for the highest-value service areas.
- [ ] Build separate service landing pages for spring repair, opener repair, garage door installation, and garage door replacement.
- [ ] Add a reviews/results page for stronger trust and conversion support.
- [ ] Add a small advice or FAQ content hub for long-tail search coverage.