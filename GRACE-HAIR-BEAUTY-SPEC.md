# Grace Hair Beauty — Complete Production Technical Specification

**Version:** 2.0  
**Date:** 2026-05-14  
**Status:** Final — Ready for Codex Implementation  
**Business:** Grace Hair Beauty | 955 Baden Manor Dr, Indianapolis, IN 46217

---

## Contents

1. [Product Strategy](#1-product-strategy)
2. [Information Architecture](#2-information-architecture)
3. [Business Copywriting Direction](#3-business-copywriting-direction)
4. [Visual Design System](#4-visual-design-system)
5. [3D Hero Concept](#5-3d-hero-concept)
6. [AWS Architecture — Terraform](#6-aws-architecture--terraform)
7. [Terraform Design](#7-terraform-design)
8. [Python Lambda Architecture](#8-python-lambda-architecture)
9. [API Design](#9-api-design)
10. [DynamoDB Data Model](#10-dynamodb-data-model)
11. [Security Requirements](#11-security-requirements)
12. [Accessibility and UX Requirements](#12-accessibility-and-ux-requirements)
13. [SEO Requirements](#13-seo-requirements)
14. [Implementation Plan for Codex](#14-implementation-plan-for-codex)

---

---

# 1. Product Strategy

---

## 1.1 Website Purpose

Grace Hair Beauty's website is the primary digital storefront for a Black-owned African braiding and beauty salon in Indianapolis, Indiana. It must convert mobile visitors arriving from Instagram, TikTok, and Google Search into confirmed appointment requests. It must build immediate trust with Black and African-American women, African families, men, and kids who need a skilled, culturally fluent stylist with proven expertise in protective styles, African braids, and natural hair care. The site must function as the business's professional identity online — replacing the current unfinished template site with a premium digital experience that reflects the real quality of the work Grace does.

---

## 1.2 Primary Conversion Goal

**A submitted appointment request** (via the online booking form) or a **direct phone call** click on mobile.

Every page must have a path to one of these two actions.

---

## 1.3 Secondary Conversion Goals

In priority order:

1. Click-to-call on mobile (`tel:+13178503001`)
2. Instagram DM / profile visit
3. Portfolio browsing → booking intent
4. Review submission (builds future social proof)
5. Return-visit rebooking via email confirmation link
6. Google Maps direction request

---

## 1.4 Target Users

| Segment | Ages | Primary Need | Primary Device |
|---|---|---|---|
| Black / African-American women | 18–45 | See styles, trust the quality, book quickly | Mobile |
| African women / diaspora | 25–55 | African braid expertise, real pricing | Mobile + Desktop |
| Mothers booking for kids | 28–45 | Kid-friendly, gentle, clear pricing | Mobile |
| Men | 18–40 | Men's styles, no-fuss booking | Mobile |
| First-time visitors | Any | Portfolio, reviews, trust signals | Mobile |
| Returning clients | Any | Fast rebooking | Mobile |

---

## 1.5 Trust Signals Required

The following must appear above the fold or within the first scroll on the home page:

- **15+ years of experience** — stated clearly in the hero
- **Real portfolio photos** — actual client work, not stock imagery
- **Real client reviews** — never fabricated
- **Licensed professional** badge (if Grace holds a state cosmetology/braiding license)
- **Physical address** — 955 Baden Manor Dr, Indianapolis, IN 46217
- **Phone number** — click-to-call, visible in the header on every page
- **Business hours** — Monday–Sunday, 9:00 AM – 8:00 PM (use this single canonical schedule; the old site had two conflicting schedules — remove both and replace with this one)
- **Social media presence** — Instagram link, visible and active
- **Appointment response commitment** — "We confirm appointments within 24 hours"

---

## 1.6 What Must Be Removed or Rewritten

| Old Content | Problem | Action |
|---|---|---|
| Misspelled business-name variants | Typo in business name | Replace with "Grace Hair Beauty" everywhere |
| Misspelled Services navigation | Typo in navigation | Replace with "Services" |
| Placeholder Latin filler copy | Unprofessional | Remove entirely |
| Off-topic medical consultation wording on appointment page | Wrong industry context | Remove — replace with hair consultation language |
| "Thomas Muller, CEO of SPATHINK" testimonial | Clearly a template placeholder from a business template; SPATHINK is a template company name | Remove entirely |
| "Vivi Marian" testimonial | No verifiable origin; likely template | Remove — only show real, collected reviews |
| "Discover A New Beauty Era" headline | Generic, no brand identity | Replace with brand-specific headline |
| "Discover Our Awesome Services" | Generic, template language | Replace with polished service intro copy |
| "Glow in Beauty", "Look Pretty" | Shallow, generic slogans | Replace with brand-voice copy |
| "Quality Services Showcase" | Template label | Remove |
| Conflicting hours (Mon–Sun vs Sun–Fri) | Confusing for customers | Canonical hours: Mon–Sun, 9:00 AM – 8:00 PM |
| Multiple email addresses (ghbeauty24@gmail.com, contact@gracehairsbeauty.com, ghbeauty@gmail.com) | Inconsistent, untrustworthy | All contact info must come from `BusinessSettings` table. Default to `ghbeauty24@gmail.com` until owner configures otherwise. |
| Copyright "2026" template year | Template artifact | Dynamically set to current year |
| "Designed by Twintusk Marketing" attribution | Should be removed or moved to footer fine print only if contractually required | Confirm with Grace; remove from prominent display |
| Navigation label "Service" | Missing plural | Replace with "Services" |

---

## 1.7 Brand Positioning

Grace Hair Beauty must feel entirely different from ordinary braid salon websites. Most competitor sites are either:
- Generic Wix/Squarespace templates with stock photos and placeholder text
- Visually overwhelming with clashing colors and poor typography
- Built for anyone, not specifically for Black women and African-American communities

Grace Hair Beauty's site must feel like a premium editorial beauty brand — the equivalent of walking into a thoughtfully designed salon where you immediately trust the work before the stylist says a word. The visual language, copy tone, and interaction design should communicate: *this is a professional, this is someone who has mastered their craft, this is where I want my hair done.*

Positioning statement (internal, for design and copy alignment):  
**"Grace Hair Beauty is where African braiding artistry meets premium beauty care — a trusted Indianapolis salon that sees you, knows your hair, and delivers results that last."**

---

---

# 2. Information Architecture

---

## 2.1 Sitemap

```
/                    → Home
/services            → Services
/portfolio           → Portfolio / Gallery
/book                → Book Appointment
/about               → About
/reviews             → Reviews
/contact             → Contact
/admin               → Admin Login (Cognito redirect)
/admin/dashboard     → Admin Dashboard (protected)
/admin/appointments  → Manage Appointments (protected)
/admin/services      → Manage Services (protected)
/admin/portfolio     → Manage Portfolio (protected)
/admin/reviews       → Manage Reviews (protected)
/admin/settings      → Business Settings (protected)
```

---

## 2.2 Page: Home (`/`)

**Purpose:** Convert first-time visitors through trust, beauty, and booking immediacy.

**Main Sections:**
1. Hero — 3D scene (desktop) or static fallback (mobile), headline, subheadline, two CTAs
2. Social proof bar — years of experience, review score, style count
3. Services highlight — 4–6 service cards with thumbnail and starting price
4. Portfolio teaser — 6-photo grid + "View Full Gallery" link
5. About snippet — stylist photo, 2–3 sentences, link to About
6. Reviews carousel — 3–5 real reviews with star ratings
7. Booking CTA section — prominent, with hours and phone
8. Footer — address, phone, hours, social links, nav

**Primary CTA:** "Book Your Appointment" → `/book`  
**Secondary CTA:** "Call Us" → `tel:+13178503001`

**Data from Backend:** `GET /services` (featured), `GET /reviews` (top 3–5), `GET /portfolio` (6 featured), `GET /business-settings`

**SEO Title:** `Grace Hair Beauty | African Braiding & Beauty Salon — Indianapolis, IN`

**SEO Description:** `Expert African braiding, knotless braids, protective styles, natural hair, and sew-in in Indianapolis. 15+ years of experience. Book your appointment online.`

**UX Risks:**
- 3D hero must not block LCP — text and CTAs render before model loads
- Hero CTA must be visible above the fold on all mobile sizes (min 360px wide)
- No auto-playing audio or video

**Mobile-Specific:**
- Sticky bottom bar: "Book Now" button + phone icon — visible on all pages except `/book`
- Social proof bar collapses to 2-per-row on mobile
- Portfolio teaser becomes 2-column on mobile

---

## 2.3 Page: Services (`/services`)

**Purpose:** Communicate expertise, set pricing expectations, and drive to booking.

**Main Sections:**
1. Page header — "Our Services" headline, brief intro copy
2. Category filter tabs — African Braids | Natural | Sew-In | Men | Kids
3. Service cards grid — photo, name, description, starting price, "Book This Service" button
4. Deposit policy notice — "A deposit may be required to hold your appointment"
5. FAQ accordion — 4–6 common service questions
6. Booking CTA banner

**Primary CTA:** "Book This Service" → `/book?service={serviceId}`

**Data from Backend:** `GET /services`

**SEO Title:** `Hair Braiding Services | Grace Hair Beauty — Indianapolis, IN`

**SEO Description:** `African braids, knotless braids, sew-in weaves, silk press, natural styles, men's hairstyles, and kids' braids. Starting at $99.99 in Indianapolis.`

**UX Risks:**
- Long service lists without filtering = decision paralysis; filter tabs are mandatory
- Prices shown as "Starting at" must match what is configured in `BusinessSettings` / services data; no hardcoded pricing
- All service photos must be real work, not stock

**Mobile-Specific:**
- Filter tabs scroll horizontally on mobile — no wrapping
- Service cards are single-column on mobile

---

## 2.4 Page: Portfolio / Gallery (`/portfolio`)

**Purpose:** Provide visual social proof. Convert browsers into bookers.

**Main Sections:**
1. Page header — "Our Work"
2. Style filter tabs — All | Knotless Braids | Box Braids | Senegalese Twists | Sew-In | Natural | Kids | Men
3. Masonry grid gallery — lazy-loaded WebP images, tap to enlarge
4. Lightbox — full photo, style name, "Book This Style" link
5. "Want this look?" sticky CTA on mobile

**Primary CTA:** "Book This Style" → `/book?style={styleId}`

**Data from Backend:** `GET /portfolio` (paginated, filterable)

**SEO Title:** `Hair Gallery | Braids, Natural Styles & More — Grace Hair Beauty Indianapolis`

**SEO Description:** `Browse real client photos: knotless braids, box braids, sew-in, natural hairstyles, and kids' styles by Grace Hair Beauty in Indianapolis.`

**UX Risks:**
- Unoptimized images = broken mobile performance; all images must be WebP, max 800px wide, lazy-loaded
- Empty filter state must show a message, not a blank grid

**Mobile-Specific:**
- 2-column masonry grid on mobile
- Lightbox is full-screen on mobile with swipe-to-dismiss

---

## 2.5 Page: Book Appointment (`/book`)

**Purpose:** Complete the primary conversion: a submitted appointment request.

**Main Sections:**
1. Page header — "Book Your Appointment" + phone number reminder
2. Multi-step booking form (3 steps + confirmation)
   - Step 1: Select service (pre-filled if arriving from service/portfolio page via URL param)
   - Step 2: Personal info — name, phone, email
   - Step 3: Preferred date/time, alternate date, notes
   - Step 4: Confirmation screen — "Your request has been received"
3. Side panel (desktop) — hours, address, phone, "What to expect" note
4. Deposit notice — shown after service selection if applicable

**Primary CTA:** "Confirm Appointment Request"  
**Secondary CTA:** "Prefer to call? (317) 850-3001"

**Data from Backend:** `GET /services`, `POST /appointments`, `GET /business-settings`

**SEO Title:** `Book a Hair Appointment | Grace Hair Beauty — Indianapolis, IN`

**SEO Description:** `Book your braiding or beauty appointment online with Grace Hair Beauty in Indianapolis. African braids, knotless braids, natural styles, and more.`

**UX Risks:**
- Multi-step form must preserve state if user navigates back between steps
- Form must not lose data on validation error
- Confirmation email must send within 60 seconds of submission
- No off-topic medical consultation language anywhere on this page

**Mobile-Specific:**
- Full-screen steps (no side panel on mobile — show it as a collapsed "Location & Hours" accordion)
- Large touch targets for date input (use native date input on mobile)
- Proper autocomplete attributes on all fields
- Phone field: `inputmode="tel"`, `autocomplete="tel"`

---

## 2.6 Page: About (`/about`)

**Purpose:** Build personal connection and trust. Humanize the brand.

**Main Sections:**
1. Stylist photo — professional photo of Grace (real person, not stock)
2. Story section — 3–4 paragraphs: origin, passion, expertise, community commitment
3. 15+ years callout — visual badge/number treatment
4. Values/principles — 3 brand pillars (e.g., Expertise, Authenticity, Care)
5. Salon environment photos — interior shots if available
6. CTA — "Book with Us Today"

**Primary CTA:** "Book Your Appointment" → `/book`

**Data from Backend:** Static initially; can become CMS-managed via admin settings if needed.

**SEO Title:** `About Grace Hair Beauty | 15+ Years of Expert African Braiding in Indianapolis`

**SEO Description:** `Meet Grace — a certified beauty professional with over 15 years in African braiding, protective styles, and natural hair care serving Indianapolis and beyond.`

**UX Risks:**
- Stock photography destroys trust — only real photos of Grace and the salon
- Copy must sound personal and culturally fluent, not corporate

**Mobile-Specific:**
- Photo above text, full-width on mobile
- Values section stacks vertically

---

## 2.7 Page: Reviews (`/reviews`)

**Purpose:** Consolidate social proof. Convert hesitant visitors.

**Main Sections:**
1. Aggregate rating display — star graphic, overall score, total count
2. Review cards grid — first name + last initial, star rating, review text, date
3. "Leave a Review" CTA → Google Maps review URL (from `BusinessSettings`)
4. In-page review submission form (submitted to admin approval queue)

**Primary CTA:** "Leave Us a Google Review"  
**Secondary CTA:** "Share Your Experience Here" (in-page form)

**Data from Backend:** `GET /reviews`

**SEO Title:** `Client Reviews | Grace Hair Beauty — Indianapolis Hair Braiding Salon`

**SEO Description:** `Read real client reviews of Grace Hair Beauty. Real experiences from women, kids, men, and families who trust Grace for African braids and natural styles.`

**UX Risks:**
- Only `approved: true` reviews must be shown publicly — never pending or rejected
- Review submission form needs honeypot + rate limiting

**Mobile-Specific:**
- Cards are single-column on mobile
- Submission form is full-width

---

## 2.8 Page: Contact (`/contact`)

**Purpose:** Provide all contact methods and capture non-booking inquiries.

**Main Sections:**
1. Contact info block — phone (click-to-call), email, address + Google Maps link
2. Hours of operation — canonical: Mon–Sun, 9:00 AM – 8:00 PM
3. Google Maps link (not embed — link loads faster; iframe embed optional with lazy loading)
4. Contact form — name, email, phone (optional), message
5. Social media links

All contact information (phone, email, address, hours) must be fetched from `GET /business-settings`, not hardcoded.

**Primary CTA:** "Call Us Now" → `tel:+13178503001`  
**Secondary CTA:** "Send a Message" → `POST /contact`

**Data from Backend:** `GET /business-settings`, `POST /contact`

**SEO Title:** `Contact Grace Hair Beauty | Hair Salon in Indianapolis, IN`

**SEO Description:** `Contact Grace Hair Beauty at 955 Baden Manor Dr, Indianapolis, IN 46217. Call (317) 850-3001 or send a message. Open 7 days a week, 9am–8pm.`

**UX Risks:**
- Contact form needs honeypot spam protection

**Mobile-Specific:**
- Phone number is a `tel:` link — must be the most prominent element on mobile
- Address links to Google Maps app on mobile

---

## 2.9 Admin Pages (`/admin/*`)

All admin pages are Cognito-protected. Unauthenticated users are redirected to Cognito Hosted UI.

| Route | Purpose |
|---|---|
| `/admin` | Redirects to `/admin/dashboard` if authenticated |
| `/admin/dashboard` | Summary: pending appointments count, unread messages, recent activity |
| `/admin/appointments` | View, filter by status/date, update appointment status |
| `/admin/services` | Create, edit, deactivate services and pricing |
| `/admin/portfolio` | Upload, organize, delete portfolio photos |
| `/admin/reviews` | Approve, reject, or delete submitted reviews |
| `/admin/settings` | Edit `BusinessSettings`: name, phone, email, address, hours, socials, announcements |

**UX Risks:**
- Admin UI must be functional on mobile (Grace may manage the business from her phone)
- Destructive actions (delete) require confirmation dialog
- Image uploads must show progress indicator and handle errors

---

---

# 3. Business Copywriting Direction

All copy below is production-ready website copy. It is warm, professional, premium, and culturally authentic. It does not use placeholder Latin filler, invented testimonials, template slogans, or generic AI filler.

---

## 3.1 Homepage Hero

**Headline:**  
Your Hair, Your Crown.  
*Braided to Perfection.*

**Subheadline:**  
Grace Hair Beauty brings over 15 years of African braiding artistry and natural hair expertise to Indianapolis. From knotless braids to silk press — we take care of your hair like it's our own.

**CTA 1:** Book Your Appointment  
**CTA 2:** View Our Work

---

## 3.2 Social Proof Bar

```
15+          |    ★ 5.0       |     Open
Years of     |    Client      |     Mon – Sun
Experience   |    Reviews     |     9am – 8pm
```

---

## 3.3 Services Section Intro

**Section Label:** What We Offer

**Headline:**  
*Expert Styles,*  
Crafted with Care.

**Body:**  
From classic box braids to intricate knotless styles, from kids' first braids to men's cuts — every service at Grace Hair Beauty is delivered with precision, patience, and pride. We specialize in protective styles that are beautiful, healthy, and built to last.

---

## 3.4 About Section (Short — Homepage Snippet)

**Headline:**  
Meet Grace.

**Body:**  
Grace is a certified beauty professional with over 15 years of experience in African braiding, protective styling, and natural hair care. Born from a deep love of hair and culture, Grace Hair Beauty was built to be a space where every client — woman, man, or child — feels welcomed, seen, and beautifully styled.

Located in Indianapolis, IN, we proudly serve clients from across the city and beyond.

**CTA:** Read Our Story

---

## 3.5 Full About Page Copy

**Headline:**  
More Than a Salon.  
*A Place That Sees You.*

**Section 1: The Beginning**  
Grace Hair Beauty was built on a simple belief: every person deserves to walk out of a salon feeling genuinely beautiful. With over 15 years of hands-on experience in African braiding and natural hair care, Grace has spent her career perfecting styles that honor culture, protect your hair, and turn heads.

**Section 2: The Craft**  
Braiding is not just a service — it is an art form rooted in generations of African tradition. At Grace Hair Beauty, we approach every style with the patience and precision it deserves. Whether you are coming in for your first set of braids or returning for a style you have worn for years, you will leave with work that lasts and hair that thrives underneath.

**Section 3: The Community**  
We proudly serve Black women, African women, men, and children across Indianapolis. Our salon is a welcoming space for every texture, every length, and every style vision. We are here for first-time clients and longtime regulars alike.

**Values:**
- **Expertise** — 15+ years of professional training and real-world experience
- **Authenticity** — African braiding rooted in tradition and cultural pride
- **Care** — We treat your hair like it matters, because it does

---

## 3.6 Booking Section Copy

**Headline:**  
*Ready for Your Appointment?*

**Body:**  
Booking with Grace Hair Beauty is simple. Select your service, share your preferred date, and we will confirm your appointment within 24 hours. Have questions first? Just call us — we are happy to talk through the right style for your hair.

**CTA:** Book Your Appointment  
**Secondary:** (317) 850-3001

**What to Expect Note (shown on /book page):**  
After submitting your request, Grace's team will review your appointment and confirm via email or phone within 24 hours. A deposit may be required to hold certain appointments. We look forward to seeing you.

---

## 3.7 Reviews Section Copy

**Headline:**  
*What Our Clients Say*

**Note on Reviews:**  
All reviews displayed on this site are submitted by real clients. We do not display unverified, purchased, or fabricated reviews. If you have visited Grace Hair Beauty, we would love to hear from you.

**CTA:** Leave Us a Google Review  
**Secondary CTA:** Share Your Experience Here

---

## 3.8 Contact Section Copy

**Headline:**  
*Come Find Us.*

**Body:**  
We are conveniently located in Indianapolis, Indiana, and open seven days a week. Walk-ins are welcome when space allows, but we recommend booking in advance to secure your preferred time.

**Hours display:**  
Monday – Sunday: 9:00 AM – 8:00 PM

**Phone:** (317) 850-3001  
**Address:** 955 Baden Manor Dr, Indianapolis, IN 46217

---

## 3.9 Footer Copy

**Tagline:**  
Grace Hair Beauty — Indianapolis's home for African braiding, protective styles, and natural beauty.

**Legal:**  
© {currentYear} Grace Hair Beauty. All rights reserved.

---

---

# 5. 3D Hero Concept

---

## 5.1 Scene Concept — Abstract 3D Motion

**No human model required. No paid assets. No licensing issues.**

The hero uses abstract 3D motion — floating geometric shapes, glowing orbs, and soft particle drifts — built entirely from code. This is exactly the kind of modern, premium website feel seen on AI-built and design-forward sites today. The motion is smooth, organic, and on-brand: warm gold, cream, and cocoa tones with objects that float, breathe, and respond to the mouse.

**Visual description:**
- 3–5 floating spheres of varying sizes in gold (`#B8860B`) and warm cream (`#FAF6F0`), with a soft emissive glow
- A slow-rotating torus (ring shape) in translucent gold — suggests an abstract crown or halo
- A soft particle field of 80–120 tiny gold dots drifting upward like light dust
- All objects have a gentle idle animation: up-down float on a sin wave, slow Y-axis rotation
- On desktop: subtle mouse parallax — objects shift slightly as the mouse moves (depth illusion)
- Background: transparent canvas — the cream page background shows through
- The entire scene sits in the right 50% of the hero on desktop; on mobile it becomes a subtle full-width animated background strip behind the text

**The effect:** Premium, modern, alive — the same visual language used by luxury beauty brands, AI product sites, and high-end SaaS. Zero cost to implement.

---

## 5.2 Implementation Approach — React Three Fiber Only

Build the production hero directly with React Three Fiber using only primitive Three.js geometry — no external scene service, no imported model, and no paid assets.

```tsx
// src/components/hero/Hero3DScene.tsx

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei'
import { Mesh } from 'three'

// Floating orb — pure mesh, no useFrame needed.
// The <Float> wrapper in SceneObjects handles all floating motion.
// Adding useFrame here would fight with Float's own position.y updates.
function GoldOrb({ position, scale }: {
  position: [number, number, number]
  scale: number
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color="#B8860B"
        emissive="#8B6200"
        emissiveIntensity={0.4}
        distort={0.25}
        speed={1.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  )
}

// Slow-rotating torus — abstract crown/halo element
function GoldRing() {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.08
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <mesh ref={meshRef} position={[0.8, 0.4, -1]} scale={1.2}>
      <torusGeometry args={[1, 0.06, 16, 80]} />
      <meshStandardMaterial
        color="#D4A843"
        emissive="#B8860B"
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

// Main scene — all abstract geometry, no external assets
function SceneObjects() {
  return (
    <>
      {/* Ambient and directional lighting for warm, premium feel */}
      <ambientLight intensity={0.6} color="#FFF8F0" />
      <directionalLight position={[3, 5, 2]} intensity={1.2} color="#FFFAEE" />
      <pointLight position={[-2, 3, 1]} intensity={0.8} color="#C9A84C" />

      {/* Large orb — main focal element */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <GoldOrb position={[0, 0, 0]} scale={1.4} />
      </Float>

      {/* Smaller satellite orbs */}
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.8}>
        <GoldOrb position={[1.8, 0.8, -0.5]} scale={0.55} />
      </Float>
      <Float speed={1.0} rotationIntensity={0.2} floatIntensity={0.4}>
        <GoldOrb position={[-1.4, -0.6, -1]} scale={0.35} />
      </Float>
      <Float speed={2.0} rotationIntensity={0.6} floatIntensity={1.0}>
        <GoldOrb position={[0.6, -1.2, 0.3]} scale={0.22} />
      </Float>

      {/* Abstract crown/halo ring */}
      <GoldRing />

      {/* Particle dust field */}
      <Sparkles
        count={120}
        scale={5}
        size={0.6}
        speed={0.2}
        color="#D4A843"
        opacity={0.7}
      />
    </>
  )
}

export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      frameloop="always"
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <SceneObjects />
    </Canvas>
  )
}

// Dependencies needed:
// npm install @react-three/fiber @react-three/drei three
// @react-three/drei includes: Float, Sparkles, MeshDistortMaterial
// All geometry is built-in Three.js — sphere, torus — no external files
```

---

## 5.3 HeroSection Component

The outer component handles rendering decisions — WebGL check, mobile detection, reduced motion — and keeps the accessible text/CTA column independent of the decorative R3F scene.

```tsx
// src/components/hero/HeroSection.tsx

import { lazy, Suspense, Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeroMotionFallback } from './HeroMotionFallback'

const Hero3DScene = lazy(() => import('./Hero3DScene'))

function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}

// Error boundary: catches R3F errors.
// Falls back to HeroMotionFallback so the hero never shows a broken state.
class HeroErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <HeroMotionFallback /> : this.props.children
  }
}

export function HeroSection() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const reducedMotion = useReducedMotion()
  const webGLOk = canUseWebGL()

  const show3D = isDesktop && webGLOk && !reducedMotion

  // Under reduced motion: skip y translation, keep only opacity fade (short).
  // Under normal motion: full entrance sequence with staggered y + opacity.
  const makeVariants = (yOffset: number, delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : yOffset },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration:  reducedMotion ? 0.15 : 0.5,
      delay:     reducedMotion ? 0    : delay,
    },
  })

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-cream"
      aria-label="Grace Hair Beauty — Indianapolis Hair Salon"
    >
      {/* Text column — always HTML, always accessible */}
      <div className="relative z-10 w-full md:w-1/2 px-6 md:px-16 py-20">
        <motion.p className="hero-eyebrow" {...makeVariants(12, 0)}>
          Indianapolis, Indiana
        </motion.p>
        <motion.h1 className="hero-headline" {...makeVariants(16, 0.1)}>
          Your Hair, Your Crown.<br />
          <em>Braided to Perfection.</em>
        </motion.h1>
        <motion.p className="hero-subheadline" {...makeVariants(12, 0.25)}>
          Over 15 years of African braiding artistry and natural hair expertise.
          Knotless braids, protective styles, silk press, and more.
        </motion.p>
        <motion.div className="hero-cta-group" {...makeVariants(12, 0.4)}>
          <a href="/book" className="btn-primary-gold">Book Your Appointment</a>
          <a href="/portfolio" className="btn-secondary">View Our Work</a>
        </motion.div>
      </div>

      {/* Visual column — decorative, hidden from screen readers */}
      <div
        className="absolute inset-0 md:relative md:w-1/2 md:h-full"
        aria-hidden="true"
        role="presentation"
      >
        {show3D ? (
          <HeroErrorBoundary>
            <Suspense fallback={<HeroMotionFallback />}>
              <Hero3DScene />
            </Suspense>
          </HeroErrorBoundary>
        ) : (
          <HeroMotionFallback />
        )}
      </div>
    </section>
  )
}
```

```tsx
// src/components/hero/HeroMotionFallback.tsx
// Used on: mobile, WebGL unavailable, Suspense loading, reduced-motion, or R3F errors.
// No images. No Three.js. Renders instantly from CSS + Framer Motion.

import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const orbs = [
  { size: 280, top: '10%', left: '55%', delay: 0,   duration: 6 },
  { size: 160, top: '55%', left: '75%', delay: 1.2, duration: 8 },
  { size: 90,  top: '20%', left: '82%', delay: 0.6, duration: 7 },
  { size: 60,  top: '70%', left: '60%', delay: 2.0, duration: 9 },
]

const orbStyle = (orb: typeof orbs[number]) => ({
  width:  orb.size,
  height: orb.size,
  top:    orb.top,
  left:   orb.left,
  background: `radial-gradient(circle at 35% 35%,
    rgba(212,168,67,0.35),
    rgba(184,134,11,0.15) 60%,
    transparent 100%)`,
  filter: 'blur(2px)',
})

export function HeroMotionFallback() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={orbStyle(orb)}
          // Under reduced motion: no y animation, just a static opacity fade-in.
          animate={reducedMotion ? { opacity: 0.4 } : { y: [0, -18, 0] }}
          initial={{ opacity: 0 }}
          transition={reducedMotion
            ? { duration: 0.3 }
            : { duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      ))}
    </div>
  )
}
```

---

## 5.4 Mobile Treatment

On mobile, the hero is full-width text over a subtle animated gradient background. The `HeroMotionFallback` orbs sit absolutely positioned behind the text — they give the page life without competing with the headline.

The layout is handled entirely by the Tailwind classes already in `HeroSection.tsx` — no separate CSS file needed:

```
Visual column:  className="absolute inset-0 md:relative md:w-1/2 md:h-full"
  → mobile: absolute, fills the full section behind the text (z-index 0 via aria-hidden stacking)
  → md+:    relative, occupies right 50% of the row alongside the text column

Text column:    className="relative z-10 w-full md:w-1/2 px-6 md:px-16 py-20"
  → mobile: full width, z-10 keeps it above the absolute orbs
  → md+:    left 50% of the row
```

On mobile with `prefers-reduced-motion: reduce`, `HeroMotionFallback` reads the preference and renders orbs as static soft glows at `opacity: 0.4` — no floating animation runs.

---

## 5.5 Performance Budget

```
No external model files. No CDN dependency for the scene.

Hero render-blocking budget (affects LCP):
  Hero HTML/CSS (text):                 < 20KB gzipped
  Framer Motion (already used site-wide): shared bundle
  HeroMotionFallback (CSS orbs):        < 2KB

Deferred (post-LCP, desktop only, lazy-loaded):
  Three.js (tree-shaken):               < 140KB gzipped
  @react-three/fiber:                   < 180KB gzipped
  @react-three/drei:                    < 60KB gzipped (Sparkles + Float only)

Core Web Vitals targets (mobile, throttled 4G):
  LCP:  < 2.0s   (no external model dependency)
  INP:  < 100ms
  CLS:  < 0.05
  FCP:  < 1.5s
  TTFB: < 800ms

Lighthouse: mobile >= 88, desktop >= 96
```

---

## 5.6 Accessibility Summary

```
- All 3D and motion elements: aria-hidden="true", role="presentation"
- All meaningful content (headline, CTAs, trust copy) is in the HTML DOM
- Screen readers skip the visual column entirely
- Keyboard users cannot tab into the canvas or orbs
- prefers-reduced-motion: reduce
    → HeroMotionFallback renders with no animation prop
    → Orbs display as static soft glows (opacity 0.4)
    → No Framer Motion animate applied
- WebGL unavailable → HeroMotionFallback (CSS orbs) shown
- R3F scene fails to load → Suspense/error boundary catches, HeroMotionFallback shown
- In all fallback paths: text, headline, and CTAs are identical and fully functional
```

---

---

# 6. AWS Architecture — Terraform

---

## 6.1 Architecture Diagram

```
Internet
    |
    v
+--------------------------------------------------------------+
|  Route 53 (gracehairsbeauty.com)                                   |
|  A alias: gracehairsbeauty.com       -> CloudFront (frontend)      |
|  A alias: cdn.gracehairsbeauty.com   -> CloudFront (assets)        |
|  A alias: api.gracehairsbeauty.com   -> CloudFront (API passthru)  |
|  CNAME:   auth.gracehairsbeauty.com  -> Cognito Hosted UI domain   |
|  CNAME:   _dkim.*              -> SES DKIM verification      |
+--------------------------------------------------------------+
    |
    v
+--------------------------------------------------------------+
|  AWS WAF Web ACL (us-east-1 -- required for CloudFront)      |
|  Attached to all CloudFront distributions                    |
|  Rules:                                                      |
|   1. AWSManagedRulesCommonRuleSet                            |
|   2. AWSManagedRulesKnownBadInputsRuleSet                    |
|   3. Rate limit: 1000 req / 5 min per IP (general)           |
|   4. Rate limit: 20 req / 10 min per IP (POST /appointments) |
|   5. Rate limit: 10 req / 10 min per IP (POST /contact)      |
+--------------------------------------------------------------+
    |                          |
    v                          v
+-----------------+   +----------------------------------+
| CloudFront      |   | CloudFront (API passthrough)     |
| (Frontend)      |   | Origin: API Gateway (HTTP API)   |
|                 |   | Cache: DISABLED for /api/*       |
| Origin: S3      |   | Forward: Authorization,          |
| OAC: yes        |   |          Content-Type            |
| HTML: 5 min     |   +----------------------------------+
| CSS/JS: 1 yr    |           |
| Security hdrs   |           v
+-----------------+   +----------------------------------+
    |                 | API Gateway (HTTP API)            |
    v                 | Public routes (no auth):          |
+-----------------+   |   GET  /services                 |
| S3 Frontend     |   |   GET  /portfolio                |
| Private bucket  |   |   GET  /reviews                  |
| Block Public    |   |   GET  /business-settings        |
| Access: ALL ON  |   |   POST /appointments             |
| OAC policy only |   |   POST /contact                  |
| Versioning: ON  |   | Admin routes (Cognito JWT):      |
+-----------------+   |   GET/PATCH/POST/DELETE /admin/* |
                       +----------------------------------+
+-----------------+           |
| CloudFront      |           v
| (Assets CDN)    |   +----------------------------------+
| Origin: S3      |   | Lambda Functions (Python 3.13)   |
| OAC: yes        |   | Architecture: arm64              |
| images: 30 days |   | Powertools: Logger/Tracer/Metrics|
+-----------------+   | X-Ray: Active                    |
    |                 |                                  |
    v                 | fn_get_services                  |
+-----------------+   | fn_get_portfolio                 |
| S3 Assets       |   | fn_get_reviews                   |
| Private bucket  |   | fn_get_business_settings         |
| /portfolio/*    |   | fn_post_appointments             |
| /uploads/*      |   | fn_post_contact                  |
| /uploads/*      |   | fn_admin_* (12 functions)        |
| Presigned URLs  |   | fn_cognito_authorizer            |
| for uploads     |   +----------------------------------+
+-----------------+       |           |           |
                           v           v           v
                    +----------+ +--------+ +----------+
                    | DynamoDB | |  SES   | | Cognito  |
                    | 7 tables | | domain | | UserPool |
                    | On-Demand| | DKIM   | | Admin    |
                    | Encrypt  | | SPF    | | group    |
                    | PITR on  | | DMARC  | | JWT auth |
                    | selected | | Tmpls  | |          |
                    +----------+ +--------+ +----------+
```

---

## 6.2 IAM Least-Privilege per Lambda

```hcl
# Pattern: each function gets its own role with only the permissions it needs.
# No shared roles. No wildcard Actions or Resources in production.

# fn_get_services: read Services table only
# fn_post_appointments: read Services (validate), write Appointments + AuditLog, SES send
# fn_admin_portfolio: read/write/delete Portfolio, write AuditLog, S3 put/delete on /portfolio/*
# fn_cognito_authorizer: CloudWatch logs only — no data access

# Example policy document (Terraform):
data "aws_iam_policy_document" "fn_post_appointments" {
  statement {
    sid    = "DynamoDBRead"
    effect = "Allow"
    actions = ["dynamodb:GetItem"]
    resources = [
      aws_dynamodb_table.services.arn,
    ]
  }
  statement {
    sid    = "DynamoDBWrite"
    effect = "Allow"
    actions = ["dynamodb:PutItem"]
    resources = [
      aws_dynamodb_table.appointments.arn,
      aws_dynamodb_table.audit_log.arn,
    ]
  }
  statement {
    sid     = "SESEmail"
    effect  = "Allow"
    actions = ["ses:SendTemplatedEmail"]
    resources = [
      "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.domain_name}",
    ]
  }
  statement {
    sid    = "Logs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:log-group:/aws/lambda/${local.prefix}-fn-post-appointments:*"]
  }
  statement {
    sid    = "XRay"
    effect = "Allow"
    actions = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
    resources = ["*"]    # X-Ray requires * — documented AWS limitation
  }
}
```

---

## 6.3 CloudFront Security Headers

```hcl
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${local.prefix}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options { override = true }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }

  custom_headers_config {
    items {
      header   = "Permissions-Policy"
      value    = "camera=(), microphone=(), geolocation=(self)"
      override = true
    }
    items {
      header   = "Content-Security-Policy"
      value    = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.gracehairsbeauty.com https://maps.gstatic.com; connect-src 'self' https://api.gracehairsbeauty.com https://cognito-idp.us-east-1.amazonaws.com; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';"
      override = true
    }
  }
}
```

---

---

# 7. Terraform Design

---

## 7.1 Directory Structure

```
infra/
+-- envs/
|   +-- dev/
|   |   +-- main.tf
|   |   +-- variables.tf
|   |   +-- outputs.tf
|   |   +-- locals.tf
|   |   +-- providers.tf
|   |   +-- backend.tf
|   |   +-- terraform.tfvars
|   +-- stage/
|   |   +-- (same structure)
|   +-- prod/
|       +-- (same structure)
+-- modules/
    +-- static_site/       # S3 frontend bucket + OAC policy
    +-- assets_bucket/     # S3 assets bucket + OAC policy
    +-- cloudfront/        # CloudFront distribution + headers policy
    +-- waf/               # WAF Web ACL (us-east-1)
    +-- api_gateway/       # HTTP API + routes + logging
    +-- lambda_python/     # Lambda + role + log group (reusable)
    +-- dynamodb/          # DynamoDB table (reusable)
    +-- cognito/           # User Pool + client + admin group
    +-- ses/               # Domain identity + DKIM + templates
    +-- monitoring/        # CloudWatch alarms + dashboards
    +-- iam/               # Reusable IAM policy document helpers
```

---

## 7.2 Naming Convention

```
Pattern: {project}-{resource}-{env}

gracehairb-frontend-prod           S3 frontend bucket
gracehairb-assets-prod             S3 assets bucket
gracehairb-appointments-prod       DynamoDB table
gracehairb-fn-get-services-prod    Lambda function
gracehairb-api-prod                API Gateway
gracehairb-userpool-prod           Cognito User Pool
gracehairb-waf-prod                WAF Web ACL

Environment values: dev | stage | prod
Project prefix: gracehairb (always this exact string)
```

---

## 7.3 Tagging Strategy

```hcl
# All tags applied via provider default_tags — no per-resource tag blocks needed.
provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "grace-hair-beauty"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "grace-hair-beauty"
      CostCenter  = "salon-website"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"      # Required for WAF + ACM used with CloudFront
  default_tags {
    tags = {
      Project     = "grace-hair-beauty"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

---

## 7.4 Variables and tfvars

```hcl
# infra/envs/prod/variables.tf

variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "Must be dev, stage, or prod."
  }
}
variable "aws_region"              { type = string; default = "us-east-1" }
variable "domain_name"             { type = string }
variable "api_subdomain"           { type = string; default = "api" }
variable "cdn_subdomain"           { type = string; default = "cdn" }
variable "business_email"          { type = string; default = "ghbeauty24@gmail.com" }
variable "alarm_sns_topic_arn"     { type = string; default = "" }
variable "enable_xray"             { type = bool;   default = true }
variable "lambda_memory_mb"        { type = number; default = 256 }
variable "lambda_timeout_public"   { type = number; default = 15 }
variable "lambda_timeout_admin"    { type = number; default = 30 }
```

```hcl
# infra/envs/prod/terraform.tfvars
environment            = "prod"
domain_name            = "gracehairsbeauty.com"
business_email         = "ghbeauty24@gmail.com"
enable_xray            = true
lambda_memory_mb       = 256
lambda_timeout_public  = 15
lambda_timeout_admin   = 30

# infra/envs/dev/terraform.tfvars
environment            = "dev"
domain_name            = "dev.gracehairsbeauty.com"
enable_xray            = false
lambda_memory_mb       = 128
```

---

## 7.5 locals.tf

```hcl
locals {
  project = "gracehairb"
  env     = var.environment
  prefix  = "${local.project}-${local.env}"

  frontend_bucket_name    = "${local.prefix}-frontend"
  assets_bucket_name      = "${local.prefix}-assets"
  api_name                = "${local.prefix}-api"
  cognito_pool_name       = "${local.prefix}-userpool"
  waf_name                = "${local.prefix}-waf"

  table_services          = "${local.prefix}-services"
  table_appointments      = "${local.prefix}-appointments"
  table_portfolio         = "${local.prefix}-portfolio"
  table_reviews           = "${local.prefix}-reviews"
  table_contact_messages  = "${local.prefix}-contact-messages"
  table_business_settings = "${local.prefix}-business-settings"
  table_audit_log         = "${local.prefix}-audit-log"

  site_domain             = var.domain_name
  api_domain              = "${var.api_subdomain}.${var.domain_name}"
  cdn_domain              = "${var.cdn_subdomain}.${var.domain_name}"

  lambda_env_common = {
    ENVIRONMENT              = var.environment
    POWERTOOLS_SERVICE_NAME  = "grace-hair-beauty"
    POWERTOOLS_LOG_LEVEL     = var.environment == "prod" ? "WARNING" : "DEBUG"
    TABLE_SERVICES           = local.table_services
    TABLE_APPOINTMENTS       = local.table_appointments
    TABLE_PORTFOLIO          = local.table_portfolio
    TABLE_REVIEWS            = local.table_reviews
    TABLE_CONTACT_MESSAGES   = local.table_contact_messages
    TABLE_BUSINESS_SETTINGS  = local.table_business_settings
    TABLE_AUDIT_LOG          = local.table_audit_log
    ALLOWED_ORIGIN           = "https://${local.site_domain}"
    ASSETS_BUCKET            = local.assets_bucket_name
    CDN_BASE_URL             = "https://${local.cdn_domain}"
  }
}
```

---

## 7.6 Reusable Module: lambda_python

```hcl
# infra/modules/lambda_python/main.tf

resource "aws_lambda_function" "this" {
  function_name    = var.function_name
  role             = var.role_arn
  runtime          = var.runtime        # default: "python3.13"
  handler          = var.handler        # e.g. "handler.lambda_handler"
  filename         = var.source_zip
  source_code_hash = filebase64sha256(var.source_zip)
  memory_size      = var.memory_size
  timeout          = var.timeout
  architectures    = ["arm64"]          # Graviton2 — 20% cheaper, same or faster

  environment {
    variables = var.environment_vars
  }

  tracing_config {
    mode = var.enable_xray ? "Active" : "PassThrough"
  }

  depends_on = [aws_cloudwatch_log_group.this]
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days  # default: 30
}
```

---

## 7.7 Terraform State Backend

```hcl
# infra/envs/prod/backend.tf
terraform {
  backend "s3" {
    bucket         = "gracehairb-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "gracehairb-terraform-locks"
  }
}
# State bucket and lock table are bootstrapped manually once.
# State bucket: private, versioning ON, SSE-S3, Block Public Access.
# Lock table PK: LockID (String).
```

---

## 7.8 Provider Version Pinning

```hcl
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}
```

---

## 7.9 CI/CD Terraform Workflow

```yaml
# .github/workflows/terraform.yml

on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        env: [dev, stage, prod]
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with: { terraform_version: "1.7.5" }

      - name: Configure AWS (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets[format('TF_ROLE_{0}', upper(matrix.env))] }}
          aws-region: us-east-1

      - run: terraform fmt -check -recursive
        working-directory: infra/

      - run: terraform init
        working-directory: infra/envs/${{ matrix.env }}

      - run: terraform validate
        working-directory: infra/envs/${{ matrix.env }}

      - name: Checkov security scan
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: infra/
          framework: terraform
          soft_fail: false

      - run: terraform plan -var-file=terraform.tfvars -out=tfplan -no-color
        working-directory: infra/envs/${{ matrix.env }}

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: ${{ matrix.env }}   # prod requires manual approval in GitHub
    strategy:
      matrix:
        env: [dev, stage, prod]
      max-parallel: 1                # dev -> stage -> prod sequentially
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with: { terraform_version: "1.7.5" }
      - name: Configure AWS (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets[format('TF_ROLE_{0}', upper(matrix.env))] }}
          aws-region: us-east-1
      - run: terraform init
        working-directory: infra/envs/${{ matrix.env }}
      - run: terraform apply -auto-approve tfplan
        working-directory: infra/envs/${{ matrix.env }}
```

---

# 4. Visual Design System

---

## 4.1 Design Direction

The site uses a **warm editorial luxury** aesthetic — not dark and dramatic, not clinical white. Think a premium beauty magazine with an African-American editorial sensibility: warm cream paper, deep cocoa brown, soft burnished gold. The feeling is: sophisticated, welcoming, culturally rooted, modern without being cold.

Reference aesthetic: Vogue Africa, Naturalle Magazine, Fenty Beauty editorial — warm tones, elegant typography, generous white space.

---

## 4.2 Color Palette

```css
/* Backgrounds */
--cream:          #FAF6F0;   /* Primary background — warm off-white */
--cream-deep:     #F2EAE0;   /* Alternate section background */
--cream-border:   #E4D9CE;   /* Borders on light sections */

/* Brand Browns */
--cocoa:          #2C1810;   /* Primary heading color */
--espresso:       #3D2314;   /* Body text on cream */
--mocha:          #6B4226;   /* Secondary text, labels */
--latte:          #A07850;   /* Tertiary text, metadata */

/* Gold Accents */
--gold:           #B8860B;   /* Primary accent — buttons, highlights */
--gold-light:     #D4A843;   /* Hover states, decorative lines */
--gold-pale:      #F0E0B0;   /* Soft highlight, decorative fills */
--gold-dark:      #8B6200;   /* Pressed states, active borders */

/* Warm Accent */
--terracotta:     #C08060;   /* Secondary accent — tags, decorative */
--blush:          #EDD5C0;   /* Soft fill, card borders, decorative */

/* Neutrals */
--white:          #FFFDF9;   /* Cards, modals */
--ink:            #1A0F09;   /* Near-black for high-contrast text */

/* Feedback */
--success:        #3A6B44;
--error:          #9B2020;
--warning:        #8B5A00;
--info:           #2C5F7A;

/* Usage Rules:
   - --cream is the dominant page background
   - --cocoa is used for all headings
   - --gold is used sparingly: CTAs, decorative lines, active states
   - Never use gold as a large background block
   - Dark sections (hero, footer) use --cocoa as background with --cream text
   - Cards use --white background on --cream page backgrounds
   - No pure #000000 or pure #FFFFFF anywhere
*/
```

---

## 4.3 Typography

```
Display / Hero Headlines
  Font:    Cormorant Garamond
  Weights: 300 (Italic for elegance), 600 (SemiBold)
  Source:  Google Fonts
  Use:     H1 hero, large section headings, pull quotes
  Why:     High-fashion editorial — familiar in luxury beauty brands

Body + UI
  Font:    DM Sans
  Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
  Source:  Google Fonts
  Use:     Navigation, body copy, buttons, form labels, card text, metadata
  Why:     Modern, legible at any size, excellent on mobile

Font loading strategy:
  preconnect: https://fonts.googleapis.com, https://fonts.gstatic.com
  display=swap on both fonts
  Subset: latin (no expanded subsets needed)
```

**Type Scale:**

```css
--text-xs:      0.75rem;    /* 12px — badges, legal */
--text-sm:      0.875rem;   /* 14px — captions, helper text */
--text-base:    1rem;       /* 16px — body copy */
--text-lg:      1.125rem;   /* 18px — emphasized body */
--text-xl:      1.25rem;    /* 20px — card titles */
--text-2xl:     1.5rem;     /* 24px — subheadings */
--text-3xl:     1.875rem;   /* 30px — section headings */
--text-4xl:     2.25rem;    /* 36px — page headings */
--text-5xl:     3rem;       /* 48px — hero sub */
--text-display: clamp(2.5rem, 7vw, 4.5rem); /* Responsive hero headline */

Line heights:
  Display:  1.1
  Headings: 1.2
  Body:     1.7
  UI:       1.0

Letter spacing:
  Display:  -0.02em
  Headings: -0.01em
  Body:     0
  Small caps / labels: 0.08em (uppercase labels only)
```

---

## 4.4 Spacing System

8px base unit. All spacing is a multiple of 4px or 8px.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;

Section vertical padding: 96px desktop / 56px mobile
Container max-width: 1280px
Container horizontal padding: 24px (mobile) / 48px (desktop)
Grid gap: 24px (mobile) / 32px (desktop)
```

---

## 4.5 Button Styles

```css
/* Primary */
background: var(--cocoa);
color: var(--cream);
font: DM Sans 600, 0.9375rem;
padding: 14px 32px;
border-radius: 2px;           /* Nearly square — editorial, not playful */
letter-spacing: 0.04em;
text-transform: uppercase;
transition: background 200ms ease, box-shadow 200ms ease;
hover: background var(--espresso), box-shadow 0 4px 20px rgba(44,24,16,0.25);
active: background var(--ink);

/* Primary Gold Variant (hero CTA only) */
background: var(--gold);
color: var(--ink);
hover: background var(--gold-light);
active: background var(--gold-dark);

/* Secondary (outline) */
background: transparent;
border: 1.5px solid var(--cocoa);
color: var(--cocoa);
hover: background rgba(44,24,16,0.06);

/* Ghost (on dark/cocoa backgrounds) */
background: transparent;
border: 1.5px solid var(--cream);
color: var(--cream);
hover: background rgba(250,246,240,0.1);

/* Danger (admin delete actions) */
background: var(--error);
color: #FFFDF9;
hover: background #7A1818;

/* Disabled (all variants) */
opacity: 0.45;
cursor: not-allowed;
pointer-events: none;

/* Touch target: min 44px height on all buttons */
```

---

## 4.6 Card Styles

```css
/* Service Card */
background: var(--white);
border: 1px solid var(--cream-border);
border-radius: 4px;
overflow: hidden;
box-shadow: 0 2px 8px rgba(44,24,16,0.06);
hover: translateY(-4px), box-shadow 0 8px 32px rgba(44,24,16,0.12);
transition: transform 280ms ease, box-shadow 280ms ease;
image-ratio: 16:9, object-fit: cover;
body-padding: 20px;

/* Portfolio Card */
ratio: 4:5 (portrait);
border-radius: 2px;
overflow: hidden;
hover: overlay rgba(44,24,16,0.4) with "View Style" label in --cream;
transition: overlay opacity 220ms ease;

/* Review Card */
background: var(--white);
border: 1px solid var(--cream-border);
border-top: 3px solid var(--gold);
border-radius: 4px;
padding: 24px;
box-shadow: 0 2px 8px rgba(44,24,16,0.05);

/* No box-shadow on dark (cocoa-background) sections — use border */
```

---

## 4.7 Form Styles

```css
/* Input / Textarea / Select */
background: var(--white);
border: 1px solid var(--cream-border);
border-radius: 2px;
padding: 12px 16px;
font: DM Sans 400, 1rem;
color: var(--espresso);
placeholder: var(--latte);
focus: border-color var(--gold), outline: 2px solid rgba(184,134,11,0.25), outline-offset: 0;
error: border-color var(--error); error message below in var(--error) at text-sm;
disabled: opacity 0.5, background var(--cream-deep);

/* Label */
font: DM Sans 500, 0.875rem;
color: var(--mocha);
text-transform: uppercase;
letter-spacing: 0.06em;
margin-bottom: 6px;

/* Required indicator */
color: var(--gold);
content: " *";

/* Error summary */
role="alert"
aria-live="assertive"
shown at top of form on submit failure
background: rgba(155,32,32,0.08), border-left: 3px solid var(--error), padding: 12px 16px;

/* Multi-step progress */
bar height: 3px;
fill: var(--gold);
track: var(--cream-border);
step circles: --cocoa fill for completed, --gold for current, --cream-border for upcoming;
```

---

## 4.8 Motion Guidelines

```
Philosophy: Motion serves content. Never animate for visual flair alone.
Every animation must reduce cognitive load, signal state change, or guide attention.

Page transitions:
  Fade + slight Y translate: y 16px → 0, opacity 0 → 1, 380ms ease-out

Section reveal (Framer Motion whileInView):
  y: 20px → 0, opacity: 0 → 1
  duration: 500ms
  once: true
  threshold: 0.15
  stagger children: 80ms

Hover:
  Cards: translateY -4px, 240ms ease-out
  Buttons: background color change, 180ms
  Portfolio overlay: opacity 0 → 1, 200ms ease

Loading skeleton:
  Background: linear-gradient(90deg, var(--cream-deep) 25%, var(--cream-border) 50%, var(--cream-deep) 75%)
  background-size: 200%
  animation: shimmer 1.5s infinite

Reduced motion (@prefers-reduced-motion: reduce):
  All translateY animations disabled
  Stagger disabled
  Only opacity transitions remain (max 200ms)
  3D hero replaced with static image
  Skeleton remains (opacity only, no shimmer movement)

Limits:
  No animation duration > 600ms for UI elements
  No looping animations except skeleton shimmer
  No auto-playing carousels
  No parallax scroll effects (causes motion sickness, hurts performance)
```

---

## 4.9 Mobile-First Layout Rules

```
Breakpoints (Tailwind defaults):
  Default (mobile): 0–639px
  sm:  640px
  md:  768px
  lg:  1024px
  xl:  1280px

All CSS is written mobile-first. Desktop styles are additive via media queries.

Navigation:
  Mobile: hamburger → full-screen overlay, cocoa background, cream text
  Desktop: horizontal nav bar on cream background

Sticky bottom bar (mobile, all pages except /book):
  Height: 56px
  Background: var(--cocoa)
  Content: "Book Now" button (gold) + phone icon (cream)
  z-index: 50

Hero layout:
  Mobile: text-only stack (no WebGL), static fallback image below text
  md+: split — text left 50%, 3D scene right 50%

Grid:
  Mobile: 1 column
  sm: 2 columns (cards)
  lg: 3–4 columns (cards)

Images:
  Format: WebP primary, JPEG fallback
  srcSet: 400w, 800w, 1200w
  sizes: "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
  loading="lazy" on all below-fold images
  Aspect-ratio declared in CSS to prevent layout shift

Font minimums:
  Body text: never below 1rem (16px)
  Hero display: clamp(2rem, 8vw, 4.5rem) — always legible

Touch targets:
  All interactive elements: min 44×44px
  No two interactive elements closer than 8px edge-to-edge
```

---

# 8. Python Lambda Architecture

---

## 8.1 Runtime and Tooling

```
Runtime:          python3.13
Architecture:     arm64 (Graviton2 — 20% cost savings, no performance penalty)
Package manager:  pip + requirements.txt per function (or shared layer)
Validation:       pydantic v2
HTTP framework:   None — raw API Gateway proxy event handling
                  (AWS Lambda Powertools event utilities for parsing)
Observability:    AWS Lambda Powertools for Python (Logger, Tracer, Metrics)
Testing:          pytest + pytest-mock + moto (AWS mock)
Linting:          ruff (replaces flake8 + isort + pyupgrade)
Type checking:    mypy (strict mode recommended)
Dependencies:     boto3 (provided by Lambda runtime — do not package)
                  aws-lambda-powertools >= 2.0
                  pydantic >= 2.0
                  ulid-py (for ULID ID generation)
```

---

## 8.2 Python Source Structure

```
lambdas/
+-- src/
|   +-- common/
|   |   +-- __init__.py
|   |   +-- config.py          # Environment variable loading (no defaults for secrets)
|   |   +-- response.py        # Standard API response builders
|   |   +-- errors.py          # Custom exception classes
|   |   +-- validators.py      # Shared Pydantic base models
|   |   +-- dynamo.py          # DynamoDB client wrapper (typed helpers)
|   |   +-- ses_client.py      # SES send helpers
|   |   +-- logger.py          # Powertools Logger with PII redaction
|   |   +-- ids.py             # ULID generation
|   |   +-- honeypot.py        # Honeypot field check
|   |   +-- cors.py            # CORS header builder
|   +-- appointments/
|   |   +-- handler.py         # fn_post_appointments
|   |   +-- models.py          # AppointmentRequest Pydantic model
|   |   +-- service.py         # Business logic (separated from handler)
|   +-- contact/
|   |   +-- handler.py         # fn_post_contact
|   |   +-- models.py
|   +-- services/
|   |   +-- handler.py         # fn_get_services
|   |   +-- models.py
|   +-- portfolio/
|   |   +-- handler.py         # fn_get_portfolio
|   |   +-- models.py
|   +-- reviews/
|   |   +-- handler.py         # fn_get_reviews
|   |   +-- models.py
|   +-- business_settings/
|   |   +-- handler.py         # fn_get_business_settings
|   |   +-- models.py
|   +-- admin/
|       +-- appointments/
|       |   +-- get_handler.py     # fn_admin_get_appointments
|       |   +-- update_handler.py  # fn_admin_update_appointment
|       +-- services/
|       |   +-- handler.py         # fn_admin_services (create/update/delete)
|       +-- portfolio/
|       |   +-- handler.py         # fn_admin_portfolio
|       +-- reviews/
|       |   +-- handler.py         # fn_admin_reviews
|       +-- contact_messages/
|       |   +-- handler.py         # fn_admin_contact_messages
|       +-- business_settings/
|       |   +-- handler.py         # fn_admin_business_settings
|       +-- authorizer/
|           +-- handler.py         # fn_cognito_authorizer (Lambda authorizer)
+-- tests/
|   +-- conftest.py
|   +-- test_appointments.py
|   +-- test_contact.py
|   +-- test_services.py
|   +-- test_portfolio.py
|   +-- test_reviews.py
|   +-- test_admin_appointments.py
|   +-- test_admin_services.py
|   +-- test_admin_reviews.py
|   +-- test_business_settings.py
|   +-- test_authorizer.py
+-- requirements.txt           # Runtime dependencies only (no boto3)
+-- requirements-dev.txt       # pytest, moto, mypy, ruff, etc.
+-- pyproject.toml             # ruff + mypy config
+-- Makefile                   # lint, test, build, deploy shortcuts
```

---

## 8.3 Common Module Patterns

```python
# src/common/config.py
import os

class Config:
    TABLE_SERVICES          = os.environ["TABLE_SERVICES"]
    TABLE_APPOINTMENTS      = os.environ["TABLE_APPOINTMENTS"]
    TABLE_PORTFOLIO         = os.environ["TABLE_PORTFOLIO"]
    TABLE_REVIEWS           = os.environ["TABLE_REVIEWS"]
    TABLE_CONTACT_MESSAGES  = os.environ["TABLE_CONTACT_MESSAGES"]
    TABLE_BUSINESS_SETTINGS = os.environ["TABLE_BUSINESS_SETTINGS"]
    TABLE_AUDIT_LOG         = os.environ["TABLE_AUDIT_LOG"]
    ALLOWED_ORIGIN          = os.environ["ALLOWED_ORIGIN"]
    ASSETS_BUCKET           = os.environ["ASSETS_BUCKET"]
    CDN_BASE_URL            = os.environ["CDN_BASE_URL"]
    ENVIRONMENT             = os.environ.get("ENVIRONMENT", "dev")

    # SES config -- stored in SSM or set at deploy time, not hardcoded
    SES_SENDER_EMAIL        = os.environ["SES_SENDER_EMAIL"]
    ADMIN_ALERT_EMAIL       = os.environ["ADMIN_ALERT_EMAIL"]

config = Config()
```

```python
# src/common/response.py
import json
from typing import Any
from .config import config

def build_response(
    status_code: int,
    body: Any,
    *,
    cache_control: str = "no-store",
) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": config.ALLOWED_ORIGIN,
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "Cache-Control": cache_control,
        },
        "body": json.dumps(body, default=str),
    }

def ok(body: Any, cache_control: str = "no-store") -> dict:
    return build_response(200, body, cache_control=cache_control)

def created(body: Any) -> dict:
    return build_response(201, body)

def bad_request(errors: dict | str) -> dict:
    if isinstance(errors, str):
        return build_response(400, {"error": errors})
    return build_response(400, {"errors": errors})

def not_found(message: str = "Not found") -> dict:
    return build_response(404, {"error": message})

def internal_error() -> dict:
    return build_response(500, {"error": "An unexpected error occurred. Please try again."})
    # Never expose stack traces or internal details to clients
```

```python
# src/common/logger.py
from aws_lambda_powertools import Logger

# Fields that must be scrubbed before any log output
PII_FIELDS = frozenset({
    "clientEmail", "clientPhone", "email", "phone",
    "client_email", "client_phone",
})

class SafeLogger(Logger):
    def _redact(self, record: dict) -> dict:
        return {
            k: "[REDACTED]" if k in PII_FIELDS else v
            for k, v in record.items()
        }

    def info(self, msg, *args, **kwargs):
        if "extra" in kwargs:
            kwargs["extra"] = self._redact(kwargs["extra"])
        super().info(msg, *args, **kwargs)

    def warning(self, msg, *args, **kwargs):
        if "extra" in kwargs:
            kwargs["extra"] = self._redact(kwargs["extra"])
        super().warning(msg, *args, **kwargs)

logger = SafeLogger(service="grace-hair-beauty")
```

```python
# src/common/honeypot.py
def is_bot(body: dict) -> bool:
    """Return True if the honeypot field is populated (bot detected)."""
    return bool(body.get("honeypot", "").strip())

# Usage in handler:
# if is_bot(body):
#     # Silently return 200 -- do not reveal detection to bots
#     return ok({"message": "Your request has been received."})
```

---

## 8.4 Handler Pattern

Every handler follows this exact structure. No deviation.

```python
# src/appointments/handler.py
import json
from aws_lambda_powertools import Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext
from pydantic import ValidationError

from common.config import config
from common.logger import logger
from common.response import ok, created, bad_request, not_found, internal_error
from common.honeypot import is_bot
from .models import AppointmentRequest
from .service import create_appointment

tracer = Tracer(service="grace-hair-beauty")

@logger.inject_lambda_context(log_event=False)   # log_event=False prevents PII in logs
@tracer.capture_lambda_handler
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return bad_request("Request body must be valid JSON.")

    # Honeypot check -- silently accept if bot detected
    if is_bot(body):
        logger.info("Honeypot triggered", extra={"path": event.get("path")})
        return created({"message": "Your appointment request has been received."})

    try:
        request = AppointmentRequest.model_validate(body)
    except ValidationError as exc:
        errors = {err["loc"][-1]: err["msg"] for err in exc.errors()}
        return bad_request(errors)

    try:
        result = create_appointment(request)
        return created(result)
    except ValueError as exc:
        return not_found(str(exc))
    except Exception:
        logger.exception("Unexpected error in post_appointments")
        return internal_error()
```

---

## 8.5 Pydantic Models

```python
# src/appointments/models.py
from datetime import date, time
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class AppointmentRequest(BaseModel):
    serviceId:       str              = Field(min_length=1, max_length=36)
    clientName:      str              = Field(min_length=2, max_length=100)
    clientEmail:     EmailStr
    clientPhone:     str              = Field(min_length=7, max_length=20)
    preferredDate:   date
    preferredTime:   str              = Field(pattern=r"^\d{2}:\d{2}$")
    alternateDate:   date | None      = None
    notes:           str              = Field(default="", max_length=500)
    referralSource:  Literal[
        "instagram", "tiktok", "google",
        "yelp", "friend", "other", ""
    ] = ""
    honeypot:        str              = Field(default="", exclude=True)

    @field_validator("clientName", "notes", mode="before")
    @classmethod
    def strip_html(cls, v: str) -> str:
        """Remove all HTML tags from user-provided strings."""
        return re.sub(r"<[^>]+>", "", v).strip()

    @field_validator("clientPhone", mode="before")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) == 10:
            return f"+1{digits}"
        if len(digits) == 11 and digits[0] == "1":
            return f"+{digits}"
        raise ValueError("Phone must be a valid US phone number.")

    @field_validator("preferredDate", mode="after")
    @classmethod
    def validate_future_date(cls, v: date) -> date:
        from datetime import date as dt, timedelta
        today = dt.today()
        if v <= today:
            raise ValueError("Preferred date must be at least 1 day in the future.")
        if v > today + timedelta(days=90):
            raise ValueError("Preferred date must be within the next 90 days.")
        return v

    @field_validator("preferredTime", mode="after")
    @classmethod
    def validate_business_hours(cls, v: str) -> str:
        hour = int(v.split(":")[0])
        if not (8 <= hour <= 20):
            raise ValueError("Preferred time must be between 8:00 AM and 8:00 PM.")
        return v
```

---

## 8.6 DynamoDB Client Wrapper

```python
# src/common/dynamo.py
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from aws_lambda_powertools import Tracer
from typing import Any

tracer = Tracer(service="grace-hair-beauty")
_resource = boto3.resource("dynamodb")

def get_table(table_name: str):
    return _resource.Table(table_name)

@tracer.capture_method
def put_item(table_name: str, item: dict) -> None:
    table = get_table(table_name)
    table.put_item(Item=item)

@tracer.capture_method
def get_item(table_name: str, key: dict) -> dict | None:
    table = get_table(table_name)
    response = table.get_item(Key=key)
    return response.get("Item")

@tracer.capture_method
def update_item(table_name: str, key: dict, updates: dict) -> dict:
    table = get_table(table_name)
    update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    expr_names  = {f"#{k}": k for k in updates}
    expr_values = {f":{k}": v for k, v in updates.items()}
    response = table.update_item(
        Key=key,
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
        ReturnValues="ALL_NEW",
    )
    return response["Attributes"]

@tracer.capture_method
def query_gsi(
    table_name: str,
    index_name: str,
    pk_name: str,
    pk_value: Any,
    sk_name: str | None = None,
    sk_condition=None,
    limit: int = 50,
    exclusive_start_key: dict | None = None,
    scan_index_forward: bool = True,
) -> tuple[list[dict], dict | None]:
    table = get_table(table_name)
    key_condition = Key(pk_name).eq(pk_value)
    if sk_name and sk_condition:
        key_condition = key_condition & sk_condition

    kwargs: dict = {
        "IndexName": index_name,
        "KeyConditionExpression": key_condition,
        "Limit": min(limit, 100),  # hard cap
        "ScanIndexForward": scan_index_forward,
    }
    if exclusive_start_key:
        kwargs["ExclusiveStartKey"] = exclusive_start_key

    response = table.query(**kwargs)
    return response.get("Items", []), response.get("LastEvaluatedKey")
```

---

## 8.7 Idempotency Strategy

For `POST /appointments` and `POST /contact`, use AWS Lambda Powertools idempotency decorator to prevent duplicate submissions (e.g., user double-taps "Submit"):

```python
# src/appointments/handler.py (idempotency addition)
from aws_lambda_powertools.utilities.idempotency import (
    idempotent_function,
    DynamoDBPersistenceLayer,
)
from aws_lambda_powertools.utilities.idempotency.config import IdempotencyConfig

# Idempotency table (separate DynamoDB table, TTL-enabled, 1-hour expiry)
idempotency_layer = DynamoDBPersistenceLayer(
    table_name=os.environ["TABLE_IDEMPOTENCY"]
)
idempotency_config = IdempotencyConfig(
    event_key_jmespath="body",   # unique key is the full request body
    raise_on_no_idempotency_key=False,
    expires_after_seconds=3600,
)

@idempotent_function(
    data_keyword_argument="request",
    persistence_store=idempotency_layer,
    config=idempotency_config,
)
def create_appointment(request: AppointmentRequest) -> dict:
    # ... business logic
```

---

## 8.8 Cognito JWT Authorizer

```python
# src/admin/authorizer/handler.py
import os
import json
import urllib.request
from functools import lru_cache
import jwt   # PyJWT -- add to requirements.txt

from common.logger import logger

USER_POOL_ID  = os.environ["COGNITO_USER_POOL_ID"]
CLIENT_ID     = os.environ["COGNITO_CLIENT_ID"]
REGION        = os.environ.get("AWS_REGION", "us-east-1")
JWKS_URL      = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json"
ADMIN_GROUP   = "admins"

@lru_cache(maxsize=1)
def get_jwks() -> dict:
    with urllib.request.urlopen(JWKS_URL) as resp:
        return json.loads(resp.read())

def lambda_handler(event: dict, context) -> dict:
    token = event.get("headers", {}).get("authorization", "").removeprefix("Bearer ").strip()
    if not token:
        raise Exception("Unauthorized")

    try:
        jwks_data = get_jwks()
        header = jwt.get_unverified_header(token)
        key = next((k for k in jwks_data["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            raise Exception("Unauthorized")

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
        )

        groups = claims.get("cognito:groups", [])
        if ADMIN_GROUP not in groups:
            raise Exception("Forbidden")

        return generate_policy(claims["sub"], "Allow", event["routeArn"])

    except Exception as exc:
        logger.warning("Auth failure", extra={"reason": str(exc)})
        raise Exception("Unauthorized")

def generate_policy(principal_id: str, effect: str, resource: str) -> dict:
    return {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [{"Action": "execute-api:Invoke", "Effect": effect, "Resource": resource}],
        },
    }
```

---

## 8.9 Testing Strategy

```python
# tests/conftest.py
import pytest
import boto3
from moto import mock_aws

@pytest.fixture(scope="function")
def aws_credentials(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_SECURITY_TOKEN", "testing")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")

@pytest.fixture(scope="function")
def dynamodb_tables(aws_credentials):
    with mock_aws():
        client = boto3.client("dynamodb", region_name="us-east-1")
        client.create_table(
            TableName="gracehairb-dev-services",
            KeySchema=[{"AttributeName": "serviceId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "serviceId", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        # ... create all test tables
        yield

# tests/test_appointments.py
import json
import pytest
from unittest.mock import patch
from appointments.handler import lambda_handler

def make_event(body: dict) -> dict:
    return {"body": json.dumps(body), "headers": {}}

def test_valid_appointment_returns_201(dynamodb_tables):
    event = make_event({
        "serviceId": "test-service-id",
        "clientName": "Keisha Williams",
        "clientEmail": "keisha@example.com",
        "clientPhone": "3175550123",
        "preferredDate": "2026-07-01",
        "preferredTime": "10:00",
        "honeypot": "",
    })
    with patch("appointments.service.verify_service_exists", return_value=True):
        with patch("appointments.service.send_confirmation_emails"):
            response = lambda_handler(event, None)
    assert response["statusCode"] == 201

def test_honeypot_returns_200_silently(dynamodb_tables):
    event = make_event({"honeypot": "I am a bot", "clientName": "Bot"})
    response = lambda_handler(event, None)
    assert response["statusCode"] == 201  # silent accept

def test_invalid_email_returns_400():
    event = make_event({
        "serviceId": "x", "clientName": "Test", "clientEmail": "not-an-email",
        "clientPhone": "3175550123", "preferredDate": "2026-07-01",
        "preferredTime": "10:00",
    })
    response = lambda_handler(event, None)
    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "clientEmail" in body.get("errors", {})
```

---

## 8.10 Python Tooling Config

```toml
# pyproject.toml
[tool.ruff]
target-version = "py313"
line-length = 100
select = ["E", "F", "W", "I", "N", "UP", "S", "B", "A", "C4", "PT"]
ignore = ["S101"]   # allow assert in test files

[tool.ruff.per-file-ignores]
"tests/*" = ["S101", "S106"]

[tool.mypy]
python_version = "3.13"
strict = true
ignore_missing_imports = true
```

```makefile
# Makefile
lint:
	ruff check src/ tests/
	mypy src/

test:
	pytest tests/ -v --cov=src --cov-report=term-missing

build:
	mkdir -p dist/
	pip install -r requirements.txt -t dist/
	cp -r src/* dist/

security-scan:
	pip-audit -r requirements.txt
	bandit -r src/ -ll
```

---

---

# 9. API Design

---

## 9.1 Conventions

```
Base URL (prod):    https://api.gracehairsbeauty.com
Base URL (dev):     https://api.dev.gracehairsbeauty.com
Protocol:           HTTPS only
Content-Type:       application/json (all requests and responses)
Timestamps:         ISO 8601 UTC (2026-05-14T14:30:00Z)
IDs:                ULID (sortable, URL-safe, collision-resistant)
Prices:             Integers in cents (219999 = $219.99)
Pagination:         cursor-based (base64-encoded LastEvaluatedKey)
Auth (admin):       Authorization: Bearer {Cognito JWT}
```

---

## 9.2 GET /services

**Auth:** None  
**Rate limit:** 60 req/min per IP

**Query params:**
```
?category=african-braids|natural|sew-in|men|kids
?featured=true
```

**Response 200:**
```json
{
  "services": [
    {
      "serviceId": "01J...",
      "name": "Knotless Braids",
      "category": "african-braids",
      "description": "Classic knotless braids in any length and color.",
      "startingPrice": 21999,
      "priceUnit": "cents",
      "durationMinutes": 240,
      "imageUrl": "https://cdn.gracehairsbeauty.com/services/knotless-braids.webp",
      "featured": true,
      "active": true
    }
  ]
}
```

**DynamoDB:** GSI `active-featured-index` (PK: active, SK: createdAt). Filter by category client-side if category param provided (cardinality too low to justify additional GSI).

**Validation:** category must be one of allowed enum values → 400 if not.

**Error cases:** 400 invalid category, 500 DynamoDB failure (generic error to client, full error to CloudWatch).

---

## 9.3 GET /portfolio

**Auth:** None  
**Rate limit:** 60 req/min per IP

**Query params:**
```
?category=knotless|box-braids|senegalese|sew-in|natural|kids|men
?limit=20      (max 50)
?cursor={base64}
```

**Response 200:**
```json
{
  "items": [
    {
      "styleId": "01J...",
      "title": "Waist-Length Knotless Braids",
      "category": "knotless",
      "imageUrl": "https://cdn.gracehairsbeauty.com/portfolio/01J....webp",
      "thumbnailUrl": "https://cdn.gracehairsbeauty.com/portfolio/thumbs/01J....webp",
      "featured": false,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "nextCursor": "eyJzdHlsZUlkIjoiMDFKLi4uIn0="
}
```

**DynamoDB:** GSI `active-createdAt-index` (ScanIndexForward: false — newest first). Paginated via ExclusiveStartKey.

**Error cases:** 400 invalid cursor, 400 invalid category, 500.

---

## 9.4 GET /reviews

**Auth:** None  
**Rate limit:** 60 req/min per IP

**Query params:**
```
?limit=10   (max 25)
?cursor={base64}
```

**Response 200:**
```json
{
  "reviews": [
    {
      "reviewId": "01J...",
      "clientName": "Amara T.",
      "rating": 5,
      "body": "Grace did an amazing job on my knotless braids. They lasted 8 weeks!",
      "createdAt": "2026-04-15T00:00:00Z"
    }
  ],
  "nextCursor": null,
  "aggregates": {
    "averageRating": 4.9,
    "totalCount": 47
  }
}
```

**Notes:**
- `clientName` is stored and returned as first name + last initial only. Full name never returned.
- Only `approved: true` reviews returned.
- `aggregates` stored in a dedicated DynamoDB item (`AGGREGATE#RATINGS`) — updated on each review approval. No table scan.

**DynamoDB:** GSI `approved-createdAt-index`.

---

## 9.5 GET /business-settings

**Auth:** None (public — safe fields only)  
**Rate limit:** 60 req/min per IP

**Response 200:**
```json
{
  "businessName": "Grace Hair Beauty",
  "phone": "+13178503001",
  "email": "ghbeauty24@gmail.com",
  "address": {
    "street": "955 Baden Manor Dr",
    "city": "Indianapolis",
    "state": "IN",
    "zip": "46217"
  },
  "hours": {
    "monday": { "open": "09:00", "close": "20:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "20:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "20:00", "closed": false },
    "thursday": { "open": "09:00", "close": "20:00", "closed": false },
    "friday": { "open": "09:00", "close": "20:00", "closed": false },
    "saturday": { "open": "09:00", "close": "20:00", "closed": false },
    "sunday": { "open": "09:00", "close": "20:00", "closed": false }
  },
  "socialLinks": {
    "instagram": "https://instagram.com/gracehairbeauty",
    "facebook": null,
    "tiktok": null
  },
  "googleMapsUrl": "https://maps.google.com/?q=955+Baden+Manor+Dr+Indianapolis+IN+46217",
  "googleReviewUrl": "https://g.page/r/...",
  "announcementBanner": null,
  "bookingNotice": "We confirm all appointments within 24 hours."
}
```

**DynamoDB:** GetItem on BusinessSettings table with PK: `BUSINESS#SETTINGS`, SK: `v1`.

**Cache:** This response can be cached at CloudFront for 5 minutes (short TTL because admin may update it).

---

## 9.6 POST /appointments

**Auth:** None  
**Rate limit:** 20 req/10 min per IP (WAF rule), additionally enforced via Powertools idempotency

**Request body:**
```json
{
  "serviceId":      "01J...",
  "clientName":     "Keisha Williams",
  "clientEmail":    "keisha@example.com",
  "clientPhone":    "3175550123",
  "preferredDate":  "2026-06-10",
  "preferredTime":  "10:00",
  "alternateDate":  "2026-06-11",
  "notes":          "My hair is natural and about shoulder length.",
  "referralSource": "instagram",
  "honeypot":       ""
}
```

**Validation rules (all enforced by Pydantic):**
```
serviceId:       required, non-empty, must resolve to active service in DynamoDB
clientName:      required, 2–100 chars, HTML stripped
clientEmail:     required, valid email format (Pydantic EmailStr)
clientPhone:     required, US phone, normalized to E.164
preferredDate:   required, date >= today+1, date <= today+90
preferredTime:   required, HH:MM, 08:00–20:00
alternateDate:   optional, same rules as preferredDate
notes:           optional, max 500 chars, HTML stripped
referralSource:  optional, one of: instagram|tiktok|google|yelp|friend|other
honeypot:        must be empty; if populated, silently return 201 (do not alert bots)
```

**Response 201:**
```json
{
  "appointmentId": "01J...",
  "status": "pending",
  "message": "Your appointment request has been received. We will confirm within 24 hours."
}
```

**Side effects:**
1. Write Appointment to DynamoDB (status: "pending")
2. Send SES email to client (template: AppointmentConfirmation)
3. Send SES alert to admin (template: AdminNewAppointmentAlert)
4. Write to AdminAuditLog

**Error cases:** 400 validation, 404 serviceId not found, 429 rate limit (WAF), 500.

---

## 9.7 POST /contact

**Auth:** None  
**Rate limit:** 10 req/10 min per IP

**Request body:**
```json
{
  "name":     "Jordan Lee",
  "email":    "jordan@example.com",
  "phone":    "3175550456",
  "message":  "Do you offer treatments for heat-damaged hair?",
  "honeypot": ""
}
```

**Validation:**
```
name:     required, 2–100 chars, HTML stripped
email:    required, valid email
phone:    optional, valid US phone if provided
message:  required, 10–1000 chars, HTML stripped
honeypot: must be empty
```

**Response 201:**
```json
{
  "messageId": "01J...",
  "message": "Thanks for reaching out! We'll respond within 1 business day."
}
```

**Side effects:** Write to ContactMessages, send auto-reply to submitter, forward to admin email.

---

## 9.8 Admin: GET /admin/appointments

**Auth:** Cognito JWT, admins group required  
**Query params:** `?status=pending|confirmed|cancelled|completed`, `?date=2026-06-10`, `?limit=25`, `?cursor={base64}`

**Response 200:**
```json
{
  "appointments": [
    {
      "appointmentId": "01J...",
      "serviceId":     "01J...",
      "serviceName":   "Knotless Braids",
      "clientName":    "Keisha Williams",
      "clientEmail":   "keisha@example.com",
      "clientPhone":   "+13175550123",
      "preferredDate": "2026-06-10",
      "preferredTime": "10:00",
      "alternateDate": "2026-06-11",
      "notes":         "Natural hair, shoulder length",
      "status":        "pending",
      "adminNote":     null,
      "referralSource":"instagram",
      "createdAt":     "2026-05-14T18:00:00Z"
    }
  ],
  "nextCursor": null
}
```

**DynamoDB:** GSI `status-createdAt-index`. Filter by date via FilterExpression if date param provided.

---

## 9.9 Admin: PATCH /admin/appointments/{appointmentId}

**Auth:** Cognito JWT, admins group

**Request body:**
```json
{
  "status":    "confirmed",
  "adminNote": "Confirmed for 10am. Deposit of $50 required."
}
```

**Validation:** status must be one of confirmed|cancelled|completed. adminNote max 500 chars.

**Side effects:**
- status → confirmed: send SES confirmation email to client
- status → cancelled: send SES cancellation email to client
- Write to AdminAuditLog

**Response 200:** Full updated appointment object.

**Error cases:** 404 appointment not found, 400 invalid status.

---

## 9.10 Admin: POST /admin/services

**Auth:** Cognito JWT, admins group

**Request body:**
```json
{
  "name":            "Box Braids",
  "category":        "african-braids",
  "description":     "Classic box braids in any size.",
  "startingPrice":   18000,
  "durationMinutes": 180,
  "imageUrl":        "https://cdn.gracehairsbeauty.com/services/box-braids.webp",
  "featured":        false
}
```

**Validation:**
- All required fields present
- startingPrice > 0 (integer cents)
- category: enum validated
- imageUrl must start with `https://cdn.gracehairsbeauty.com/` — no external URL injection

**Response 201:** Created service with serviceId and active: true.

---

## 9.11 Admin: PATCH /admin/services/{serviceId}

**Request body:** Any subset of service fields. `active: false` deactivates without deleting.

**Response 200:** Updated service object.

---

## 9.12 Admin: DELETE /admin/services/{serviceId}

**Behavior:** Sets `active: false` (soft delete) — preserves referential integrity with existing appointments.

**Response 200:** `{"message": "Service deactivated."}`

---

## 9.13 Admin: POST /admin/portfolio

**Request body:**
```json
{
  "title":        "Boho Knotless Braids",
  "category":     "knotless",
  "imageUrl":     "https://cdn.gracehairsbeauty.com/portfolio/01J....webp",
  "thumbnailUrl": "https://cdn.gracehairsbeauty.com/portfolio/thumbs/01J....webp",
  "featured":     false
}
```

**Note:** Images must already be uploaded to S3 via presigned URL before calling this endpoint. This endpoint records metadata only.

**imageUrl validation:** Must start with `https://cdn.gracehairsbeauty.com/portfolio/`

**Response 201:** Created portfolio item.

---

## 9.14 Admin: PATCH/DELETE /admin/portfolio/{styleId}

**PATCH:** Any subset of portfolio item fields. `active: false` to soft-delete from public gallery.

**DELETE:** Hard delete from DynamoDB. Logs to AdminAuditLog. Does not delete S3 object automatically.

**Response 200:** Updated item or `{"message": "Portfolio item deleted."}`.

---

## 9.15 Admin: POST /admin/reviews

**Request body:**
```json
{
  "clientName": "Amara T.",
  "rating":     5,
  "body":       "Grace did an amazing job on my knotless braids. They lasted 8 weeks!",
  "approved":   false,
  "source":     "submitted"
}
```

**Validation:** rating integer 1–5. body 10–1000 chars. clientName max 50 chars. Only first name + last initial stored.

---

## 9.16 Admin: PATCH /admin/reviews/{reviewId}

**Request body:**
```json
{ "approved": true }
```

**Side effect on approval:** Update `AGGREGATE#RATINGS` item in Reviews table (ADD totalCount 1, ADD sumRatings {rating}, recalculate averageRating).

**Response 200:** Updated review.

---

## 9.17 Admin: DELETE /admin/reviews/{reviewId}

Hard delete. Logs to AdminAuditLog. Updates aggregate stats (subtract from total).

---

## 9.18 Admin: GET /admin/contact-messages

**Query params:** `?read=true|false`, `?limit=25`, `?cursor={base64}`

**Response 200:**
```json
{
  "messages": [
    {
      "messageId": "01J...",
      "name":      "Jordan Lee",
      "email":     "jordan@example.com",
      "phone":     "+13175550456",
      "message":   "Do you offer treatments for heat-damaged hair?",
      "read":      false,
      "createdAt": "2026-05-14T18:00:00Z"
    }
  ],
  "nextCursor": null
}
```

---

## 9.19 Admin: PATCH /admin/business-settings

**Auth:** Cognito JWT, admins group

**Request body:** Any subset of BusinessSettings fields. Partial update supported.

```json
{
  "email":             "contact@gracehairsbeauty.com",
  "announcementBanner":"Closed for July 4th holiday — back July 5th.",
  "bookingNotice":     "We confirm appointments within 24 hours."
}
```

**Validation:**
- email: valid email format
- phone: valid E.164 US phone
- hours: each day object validated (open/close HH:MM format, closed boolean)
- announcementBanner: max 200 chars, HTML stripped
- All URL fields must be https://

**Side effect:** Any CloudFront cache for `/business-settings` should be invalidated after update. Lambda calls CloudFront `create_invalidation` on the path `/business-settings`.

**Response 200:** Full updated BusinessSettings object.

---

---

# 10. DynamoDB Data Model

---

## 10.1 Design Principles

- Separate tables per entity (not single-table design) — access patterns are simple enough and separation improves clarity and independent scaling
- On-Demand billing — traffic is unpredictable for a small business
- Encryption at rest — AWS-owned KMS key on all tables
- Deletion protection — enabled on all tables in prod
- PITR — enabled on Appointments, ContactMessages (sensitive business records)
- No strongly consistent reads unless explicitly required (default eventually consistent)

---

## 10.2 Table: Services

```
Table name:  {prefix}-services
PK:          serviceId (String) — ULID

Attributes:
  serviceId       String   PK — ULID
  name            String   Required
  category        String   Enum: african-braids|natural|sew-in|men|kids
  description     String   Max 500 chars
  startingPrice   Number   Integer cents
  priceUnit       String   Always "cents"
  durationMinutes Number   Optional
  imageUrl        String   CloudFront URL
  featured        Boolean
  active          Boolean  Soft delete flag
  createdAt       String   ISO 8601
  updatedAt       String   ISO 8601

GSI: active-featured-index
  PK: active (String: "true"|"false")
  SK: createdAt
  Purpose: Get all active services, sorted by creation date

Access patterns:
  - Get all active services (homepage, services page)
  - Get service by ID (appointment validation)
  - Get featured active services (homepage highlight)

No TTL.
```

---

## 10.3 Table: Appointments

```
Table name:  {prefix}-appointments
PK:          appointmentId (String) — ULID

Attributes:
  appointmentId   String   PK
  serviceId       String   FK (not enforced)
  serviceName     String   Denormalized for display
  clientName      String   Required
  clientEmail     String   Encrypted at application layer (KMS envelope)
  clientPhone     String   E.164, encrypted at application layer
  preferredDate   String   YYYY-MM-DD
  preferredTime   String   HH:MM
  alternateDate   String   Optional
  notes           String   Max 500 chars
  status          String   Enum: pending|confirmed|cancelled|completed
  adminNote       String   Optional, admin-only
  referralSource  String   Optional enum
  createdAt       String   ISO 8601
  updatedAt       String   ISO 8601

GSI: status-createdAt-index
  PK: status
  SK: createdAt
  Purpose: Admin dashboard — filter by status

GSI: date-status-index
  PK: preferredDate
  SK: status
  Purpose: Admin calendar — appointments for a specific date

PITR: Enabled
No TTL — retain all appointment records.

PII handling:
  clientEmail and clientPhone must be encrypted at the application layer
  before writing to DynamoDB, using AWS KMS GenerateDataKey
  (envelope encryption pattern — data key cached in Lambda memory for reuse).
  This protects PII even if DynamoDB read access is compromised.
```

---

## 10.4 Table: Portfolio

```
Table name:  {prefix}-portfolio
PK:          styleId (String) — ULID

Attributes:
  styleId       String   PK
  title         String   Required
  category      String   Enum: knotless|box-braids|senegalese|sew-in|natural|kids|men
  imageUrl      String   CloudFront URL
  thumbnailUrl  String   CloudFront URL (smaller version)
  featured      Boolean
  active        Boolean  Soft delete
  createdAt     String   ISO 8601
  updatedAt     String   ISO 8601

GSI: active-createdAt-index
  PK: active (String: "true"|"false")
  SK: createdAt
  ScanIndexForward: false (newest first)
  Purpose: Public gallery, paginated

No TTL.
```

---

## 10.5 Table: Reviews

```
Table name:  {prefix}-reviews
PK:          reviewId (String) — ULID or "AGGREGATE#RATINGS" for the stats item

Attributes (review items):
  reviewId      String   PK — ULID
  clientName    String   First name + last initial only (e.g., "Amara T.")
  rating        Number   Integer 1–5
  body          String   10–1000 chars
  approved      Boolean  Must be true for public display
  source        String   "submitted"|"manual"
  createdAt     String   ISO 8601
  updatedAt     String   ISO 8601

Special aggregate item:
  reviewId:       "AGGREGATE#RATINGS"
  totalCount:     Number   (updated via DynamoDB ADD on each approval)
  sumRatings:     Number   (updated via DynamoDB ADD on each approval)
  averageRating:  Number   (recalculated after each update)

GSI: approved-createdAt-index
  PK: approved (String: "true"|"false")
  SK: createdAt
  Purpose: Public review display

No TTL.
```

---

## 10.6 Table: ContactMessages

```
Table name:  {prefix}-contact-messages
PK:          messageId (String) — ULID

Attributes:
  messageId   String   PK
  name        String   Required
  email       String   Encrypted at application layer
  phone       String   Optional, encrypted if provided
  message     String   10–1000 chars
  read        Boolean  Admin has viewed the message
  createdAt   String   ISO 8601

GSI: read-createdAt-index
  PK: read (String: "true"|"false")
  SK: createdAt
  Purpose: Admin inbox — show unread messages first

PITR: Enabled
TTL: Optional — set expiresAt = createdAt + 365 days for automatic cleanup
```

---

## 10.7 Table: BusinessSettings

```
Table name:  {prefix}-business-settings
PK:          settingId (String) — always "BUSINESS#SETTINGS"
SK:          version (String) — always "v1"

This is effectively a single-item table. Simple GetItem to retrieve all settings.

Attributes:
  settingId           String   "BUSINESS#SETTINGS"
  version             String   "v1"
  businessName        String   "Grace Hair Beauty"
  phone               String   E.164 format
  email               String   Business contact email
  address             Map
    street            String
    city              String
    state             String
    zip               String
  hours               Map
    monday–sunday     Map
      open            String   HH:MM
      close           String   HH:MM
      closed          Boolean
  socialLinks         Map
    instagram         String | null
    facebook          String | null
    tiktok            String | null
  googleMapsUrl       String
  googleReviewUrl     String   Used for "Leave a Review" CTA
  announcementBanner  String | null   Max 200 chars
  bookingNotice       String   Max 300 chars
  updatedAt           String   ISO 8601
  updatedBy           String   Cognito sub of last admin to update

Seed data:
  Must be seeded on first deploy with canonical business information.
  Seed script at: lambdas/scripts/seed_business_settings.py

No GSI, no TTL.
```

---

## 10.8 Table: AdminAuditLog

```
Table name:  {prefix}-audit-log
PK:          logId (String) — ULID

Attributes:
  logId          String   PK
  adminUserId    String   Cognito sub
  action         String   e.g., "appointment.confirmed", "service.deleted"
  resourceType   String   "appointment"|"service"|"portfolio"|"review"|"settings"
  resourceId     String   ID of affected resource
  detail         Map      Non-sensitive action details (no PII)
  createdAt      String   ISO 8601
  expiresAt      Number   Unix timestamp — createdAt + 365 days

GSI: adminUserId-createdAt-index
  Purpose: View all actions by a specific admin

TTL: expiresAt (auto-expire after 1 year to control storage cost)
No PITR needed — audit logs are append-only.
```

---


# 11. Security Requirements

---

## 11.1 Infrastructure Security

| Requirement | Implementation |
|---|---|
| No public S3 buckets | Block Public Access enabled on all S3 buckets. No public ACLs. No public bucket policies. Enforced in Terraform with `block_public_acls`, `block_public_policy`, `ignore_public_acls`, `restrict_public_buckets` all set to `true`. |
| CloudFront OAC only | Origin Access Control (not OAI — OAC is the current AWS standard). S3 bucket policy allows GetObject only from the specific CloudFront distribution's OAC. |
| HTTPS only | CloudFront: `viewer_protocol_policy = "redirect-to-https"`. API Gateway: HTTPS endpoint only. No HTTP listeners anywhere. |
| ACM certificate | us-east-1 region (required for CloudFront). Auto-renewal enabled. Managed by Terraform. |
| WAF Web ACL | Attached to all CloudFront distributions. Core rule set + rate rules + bad inputs rule set. Configured in us-east-1 (required for CloudFront WAF). |
| DynamoDB encryption | AWS-owned KMS key (default) on all tables. Upgrade to customer-managed KMS for highest-security environments if needed. |
| S3 versioning | Enabled on frontend bucket and assets bucket. Enables recovery from accidental overwrites. |
| DynamoDB deletion protection | `deletion_protection_enabled = true` on all tables in prod. |
| DynamoDB PITR | Enabled on Appointments and ContactMessages tables. |
| CloudWatch log retention | 30 days for Lambda logs, 90 days for API Gateway access logs. |

---

## 11.2 Application Security

| Requirement | Implementation |
|---|---|
| No secrets in frontend | Frontend environment variables contain only: API base URL, Cognito User Pool ID, Cognito Client ID, CDN base URL. None are secrets — they are public configuration values. No AWS credentials, no API keys. |
| No hardcoded AWS keys | Lambda functions use IAM execution roles. No access keys anywhere. |
| No hardcoded contact info | All business contact information (email, phone, address, hours) comes from `GET /business-settings`. Frontend never hardcodes these values. |
| Input validation | All Lambda handlers validate input with Pydantic before any DynamoDB write or SES call. Invalid input returns 400 with field-level errors. |
| Output encoding | Python json.dumps handles all serialization — no raw string concatenation into JSON responses. |
| XSS prevention | React escapes output by default. No `dangerouslySetInnerHTML` used. All user-provided text is HTML-stripped in Pydantic validators before storage. |
| SQL injection | Not applicable (DynamoDB, no SQL). User input never interpolated into DynamoDB expressions — always uses ExpressionAttributeValues. |
| CORS | API Gateway CORS: explicit allowlist `["https://gracehairsbeauty.com"]` in prod. No wildcard. Configured per-stage in Terraform. |
| CSRF | API is stateless and JWT-based. No session cookies = CSRF is not applicable to this architecture. If cookie-based auth is ever added, add CSRF tokens immediately. |
| Honeypot protection | `POST /appointments` and `POST /contact` include a honeypot field that must be empty. If populated, Lambda silently returns 201 without processing. Do not return 4xx to bots. |
| Admin route protection | All `/admin/*` routes use a Lambda authorizer on API Gateway. The authorizer validates Cognito JWT signature, expiry, audience, and admin group membership. Unauthorized → 401. Non-admin group → 403. |
| Admin group enforcement | Lambda authorizer checks `cognito:groups` claim for the `admins` group. Being authenticated is not sufficient — must be in the admins group. |
| Cognito self-signup disabled | `allow_admin_create_user_only = true` in User Pool. Only Grace (and the deployment admin) can create accounts. |
| Rate limiting | WAF rate rules: 1000 req/5min general, 20/10min for POST /appointments, 10/10min for POST /contact. |
| PII in logs | Logger redacts `clientEmail`, `clientPhone`, `email`, `phone` fields before CloudWatch write. Never log full customer contact info. |
| Application-layer PII encryption | clientEmail and clientPhone in Appointments table, and email/phone in ContactMessages, are encrypted using KMS envelope encryption before storage. |
| Content-Type enforcement | Lambda handlers reject requests with wrong Content-Type on POST/PATCH methods. |
| SES domain verification | DKIM, SPF, and DMARC configured in Route 53. SES sandbox must be exited before go-live (requires AWS production access request). |
| No mixed content | CSP enforces HTTPS-only sources. CloudFront enforces HTTPS. |
| imageUrl validation | Admin endpoints validate that imageUrl/thumbnailUrl begin with `https://cdn.gracehairsbeauty.com/` to prevent external URL injection into the database. |

---

## 11.3 Terraform Security

| Requirement | Implementation |
|---|---|
| No wildcard IAM permissions | Every Lambda IAM policy specifies exact Actions and exact Resource ARNs. No `"Action": "*"` or `"Resource": "*"` except where AWS explicitly requires it (X-Ray: `xray:PutTraceSegments` requires `"Resource": "*"`). |
| Terraform state encryption | State bucket has SSE-S3 encryption. Backend `encrypt = true` in all backend.tf files. |
| State bucket access | State bucket is private. Only the CI/CD OIDC role has access. No developer direct access to prod state. |
| Security scanning | Checkov runs on every Terraform plan in CI. Pipeline fails on any HIGH or CRITICAL finding. |
| OIDC authentication | CI/CD uses GitHub Actions OIDC to assume AWS roles — no long-lived access keys in GitHub Secrets. |
| Provider version pinning | `version = "~> 5.50"` on AWS provider. Prevents unexpected major version changes. |

---

## 11.4 Python Dependency Security

```bash
# Run in CI on every build:
pip-audit -r requirements.txt     # checks for known CVEs in dependencies
bandit -r src/ -ll                 # SAST for common Python security issues

# Block merge on any HIGH severity finding.
# Review and update MEDIUM findings within 2 weeks.
```

---

## 11.5 Environment Separation

```
dev:
  - Separate AWS account or separate resource prefix (gracehairb-dev-)
  - SES: sandbox mode only (send to verified addresses only)
  - DynamoDB: separate tables
  - Cognito: separate User Pool
  - CloudFront: dev subdomain (dev.gracehairsbeauty.com)
  - WAF: rate limits relaxed for testing
  - Deletion protection: OFF (allows destroy during dev)

stage:
  - Separate resource prefix (gracehairb-stage-)
  - SES: may be sandbox or production mode
  - Mirrors prod configuration as closely as possible
  - Used for final QA before every prod deploy
  - Deletion protection: ON

prod:
  - All security controls fully active
  - Deletion protection: ON on all DynamoDB tables
  - PITR: enabled
  - WAF: full rate limits
  - CloudWatch alarms: active
  - SES: production mode (domain verified, out of sandbox)
  - Manual approval required in GitHub Actions environment before apply
```

---

## 11.6 Secure Deployment Pipeline

```
Source:  GitHub (private repository)
CI:      GitHub Actions
Auth:    GitHub OIDC → AWS IAM Role (no static credentials)

Frontend pipeline steps:
  1. npm ci
  2. TypeScript check (tsc --noEmit)
  3. ESLint
  4. Vitest unit tests
  5. npm audit --production (fail on HIGH/CRITICAL)
  6. Vite build (env vars injected from GitHub Secrets — no .env committed)
  7. Lighthouse CI (fail if mobile performance < 80)
  8. aws s3 sync dist/ s3://{bucket} --delete
  9. CloudFront invalidation: /*

Backend (Lambda) pipeline steps:
  1. pip install -r requirements-dev.txt
  2. ruff check src/
  3. mypy src/
  4. pytest tests/ (fail on any test failure)
  5. pip-audit -r requirements.txt
  6. bandit -r src/ -ll
  7. Build zip artifacts per function
  8. Upload to S3 deployment bucket
  9. Terraform plan/apply (via separate terraform workflow)

Terraform pipeline steps:
  1. terraform fmt -check
  2. terraform init
  3. terraform validate
  4. checkov -d infra/ (fail on HIGH/CRITICAL)
  5. terraform plan -out=tfplan
  6. [manual approval for prod]
  7. terraform apply tfplan

Secrets management:
  - GitHub Actions: AWS OIDC role ARNs stored in GitHub Secrets
  - Runtime config: Lambda environment variables injected via Terraform (from locals.tf)
  - No .env files committed. .env.example with placeholder values only.
  - SES_SENDER_EMAIL and ADMIN_ALERT_EMAIL set via Terraform variables, not hardcoded.
```

---

---

# 12. Accessibility and UX Requirements

---

## 12.1 WCAG 2.1 AA Targets

```
All text/background combinations must meet WCAG 2.1 AA contrast ratios:
  Normal text (< 18pt): minimum ratio 4.5:1
  Large text (>= 18pt or bold 14pt): minimum ratio 3:1
  UI components (borders, icons): minimum ratio 3:1

Key pairs (verify with WebAIM Contrast Checker before launch):
  --espresso (#3D2314) on --cream (#FAF6F0):    ratio ~14:1 ✓
  --cocoa (#2C1810) on --cream (#FAF6F0):       ratio ~16:1 ✓
  --cream (#FAF6F0) on --cocoa (#2C1810):       ratio ~16:1 ✓
  --ink (#1A0F09) on --gold (#B8860B):          ratio ~5.1:1 ✓ (AA)
  --mocha (#6B4226) on --cream (#FAF6F0):       ratio ~7.2:1 ✓
  --latte (#A07850) on --cream (#FAF6F0):       ratio ~3.8:1 — use only for large text
  --gold (#B8860B) on --cream (#FAF6F0):        ratio ~3.2:1 — use only for large/decorative text

Never use --latte or --gold as body text color on cream background.
Never use --terracotta (#C08060) as small text on cream.
```

---

## 12.2 Keyboard Navigation

```
- All interactive elements reachable via Tab key in logical DOM order
- Custom focus style:
    outline: 2px solid #B8860B;
    outline-offset: 3px;
    border-radius: 2px;
  Never remove outline without providing a clear alternative focus indicator.
- Skip-to-content link: first focusable element on every page
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50">
      Skip to main content
    </a>
- Lightbox (portfolio): focus traps within lightbox when open; Escape closes; focus returns to trigger
- Mobile menu overlay: focus traps within menu when open; Escape closes
- Multi-step booking form: focus moves to first input of next step on advance; moves to error summary on validation failure
- Admin modals: same focus trap pattern as lightbox
- No keyboard traps that prevent user from escaping
```

---

## 12.3 Screen Reader Labels

```
Images:
  Content images:   descriptive alt text always
    Good: alt="Waist-length knotless braids on a Black woman, styled by Grace Hair Beauty"
    Bad:  alt="braids" or alt="photo"
  Decorative images: alt="" (empty string — not omitted)
  3D canvas:        aria-hidden="true"

Icons and buttons:
  Icon-only buttons: aria-label="Close" — never rely on icon alone
  Star rating:      aria-label="4.9 out of 5 stars, based on 47 reviews"

Form elements:
  Always <label for="..."> — never placeholder-only
  Error messages: aria-describedby linking field to its error message
  Required fields: aria-required="true" + visual indicator

Loading states:
  Skeleton sections: aria-busy="true" on container
  Data-fetch pending: aria-live="polite" region announces when loaded

Booking confirmation:
  aria-live="assertive" on confirmation message

Navigation:
  <nav aria-label="Main navigation">
  <nav aria-label="Footer navigation">

Page structure:
  <header>, <main id="main-content">, <footer>
  <section aria-label="Services"> (for unlabeled sections)
  Heading hierarchy: one <h1> per page, logical h2/h3/h4 nesting
```

---

## 12.4 Reduced Motion

```tsx
// src/hooks/useReducedMotion.ts
import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}

// In Framer Motion components:
// const reducedMotion = useReducedMotion()
// const variants = reducedMotion
//   ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
//   : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }
```

```css
/* CSS fallback */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12.5 Mobile UX Requirements

```html
<!-- Click-to-call — must appear in: header, hero, contact page, footer, sticky bar -->
<a
  href="tel:+13178503001"
  aria-label="Call Grace Hair Beauty at (317) 850-3001"
>
  (317) 850-3001
</a>

<!-- Google Maps link — opens Maps app on mobile -->
<a
  href="https://maps.google.com/?q=955+Baden+Manor+Dr+Indianapolis+IN+46217"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Get directions to Grace Hair Beauty in Google Maps"
>
  Get Directions
</a>
```

```
Booking form mobile requirements:
  inputmode="tel"   on phone field
  inputmode="email" on email field
  autocomplete="name"   on name field
  autocomplete="email"  on email field
  autocomplete="tel"    on phone field
  Native date input on mobile (no custom date picker)
  Full-screen steps (not side-by-side)
  Progress bar always visible at top

Sticky bottom booking bar (mobile, all pages except /book):
  Position: fixed, bottom: 0, left: 0, right: 0
  Height: 56px
  Background: var(--cocoa)
  Content:
    Left: "Book Now" button (gold background, full height)
    Right: phone icon link (cream icon, tap to call)
  z-index: 50
  Padding-bottom: env(safe-area-inset-bottom) — handles iPhone notch

Clear pricing:
  Every service card shows "Starting at $X.XX"
  No service listed without a price
  Prices populated from backend (never hardcoded)
```

---

---

# 13. SEO Requirements

---

## 13.1 Page Metadata Template

```tsx
// src/components/seo/PageMeta.tsx
// Uses react-helmet-async

interface PageMetaProps {
  title: string
  description: string
  canonical: string
  ogImage?: string
  ogType?: string
}

export function PageMeta({
  title,
  description,
  canonical,
  ogImage = "https://cdn.gracehairsbeauty.com/og/home.webp",
  ogType = "website",
}: PageMetaProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="Grace Hair Beauty" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}

// OG image spec: 1200x630px, WebP or JPG, max 1MB
// Must use real salon or portfolio photo — never just text on background
```

---

## 13.2 Local Business Schema

Injected in `<head>` on every page as `<script type="application/ld+json">`. Values populated from `business-settings` API response — not hardcoded.

```json
{
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "name": "Grace Hair Beauty",
  "image": "https://cdn.gracehairsbeauty.com/og/home.webp",
  "url": "https://gracehairsbeauty.com",
  "telephone": "+13178503001",
  "email": "ghbeauty24@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "955 Baden Manor Dr",
    "addressLocality": "Indianapolis",
    "addressRegion": "IN",
    "postalCode": "46217",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "39.6609",
    "longitude": "-86.2094"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "09:00",
      "closes": "20:00"
    }
  ],
  "priceRange": "$$",
  "currenciesAccepted": "USD",
  "description": "Grace Hair Beauty specializes in African braiding, knotless braids, protective styles, natural hairstyles, sew-in weaves, and kids' styles. Serving Indianapolis for over 15 years.",
  "sameAs": [
    "https://www.instagram.com/{handle}"
  ],
  "hasMap": "https://maps.google.com/?q=955+Baden+Manor+Dr+Indianapolis+IN+46217",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "47",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

Note: `aggregateRating` values must come from live `GET /reviews` response (the aggregates field). Do not hardcode.

---

## 13.3 Service Schema

One `Service` schema block per service, injected on the `/services` page:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Hair Braiding",
  "provider": {
    "@type": "HairSalon",
    "name": "Grace Hair Beauty"
  },
  "name": "Knotless Braids",
  "description": "Professional knotless braids in any length.",
  "areaServed": {
    "@type": "City",
    "name": "Indianapolis"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "219.99",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## 13.4 Image Alt Text Guidelines

```
Rules:
1. Describe the style specifically — not just "braids"
   Good: "Waist-length knotless braids with gold cuffs on a Black woman"
   Bad:  "braids" or "hair photo"

2. Include relevant context
   Good: "Box braids on a young girl with colorful beads, styled at Grace Hair Beauty"
   Bad:  "kids hairstyle"

3. Do not keyword-stuff alt text
4. Use alt="" (empty, not omitted) on purely decorative images
5. For service cards: include service name and context
6. For portfolio: include style name, length, and any notable detail

Filename conventions (improves crawlability):
   /portfolio/knotless-braids-waist-length-01.webp     ✓
   /services/knotless-braids-service-card.webp         ✓
   IMG_4523.jpg                                         ✗
   photo1.png                                           ✗
```

---

## 13.5 URL Structure

```
/                     Home (priority: 1.0)
/services             Services (priority: 0.9)
/portfolio            Gallery (priority: 0.8)
/book                 Book (priority: 0.9)
/about                About (priority: 0.7)
/reviews              Reviews (priority: 0.8)
/contact              Contact (priority: 0.8)

robots.txt:
  User-agent: *
  Disallow: /admin
  Allow: /
  Sitemap: https://gracehairsbeauty.com/sitemap.xml

sitemap.xml:
  Include: /, /services, /portfolio, /book, /about, /reviews, /contact
  Exclude: /admin/*
  changefreq: weekly for dynamic pages, monthly for static
  lastmod: build timestamp for static, dynamic for data-driven pages
```

---

## 13.6 Performance Requirements (Core Web Vitals)

```
Target — mobile, throttled 4G, Chrome DevTools:
  LCP:  < 2.5s
  INP:  < 100ms
  CLS:  < 0.05
  FCP:  < 1.8s
  TTFB: < 800ms (CloudFront cached)

Lighthouse CI targets:
  Performance: >= 85 (mobile), >= 95 (desktop)
  Accessibility: >= 95
  Best Practices: >= 95
  SEO: >= 95

Image optimization:
  All images: WebP format
  srcSet: 400w, 800w, 1200w
  sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy" on all below-fold images
  loading="eager" on hero/above-fold images only
  Declare width and height attributes on all images (prevents CLS)

Font loading:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  display=swap on both font families

CloudFront cache headers:
  HTML files:    Cache-Control: public, max-age=300, stale-while-revalidate=60
  CSS/JS/Fonts:  Cache-Control: public, max-age=31536000, immutable  (content-hashed filenames)
  Images:        Cache-Control: public, max-age=2592000              (30 days)
  3D assets:     Not used for the hero; abstract scene geometry is code-generated
  API responses: Cache-Control: no-store (all /api/* routes)
  /business-settings: Cache-Control: public, max-age=300            (5 min — admin may update)
```

---

---

# 14. Implementation Plan for Codex

---

## 14.1 Repository Structure

```
grace-hair-beauty/
+-- .github/
|   +-- workflows/
|   |   +-- ci-frontend.yml
|   |   +-- ci-backend.yml
|   |   +-- terraform.yml
|   |   +-- deploy-frontend.yml
|   |   +-- deploy-backend.yml
+-- frontend/
|   +-- public/
|   |   +-- robots.txt
|   |   +-- sitemap.xml
|   |   +-- images/
|   |   |   +-- hero-fallback.webp
|   |   +-- generated/      (optional local abstract visual assets; no imported 3D models)
|   +-- src/
|   |   +-- assets/fonts/
|   |   +-- components/
|   |   |   +-- layout/
|   |   |   |   +-- Header.tsx
|   |   |   |   +-- Footer.tsx
|   |   |   |   +-- MobileNav.tsx
|   |   |   |   +-- StickyBookingBar.tsx
|   |   |   +-- ui/
|   |   |   |   +-- Button.tsx
|   |   |   |   +-- ServiceCard.tsx
|   |   |   |   +-- PortfolioCard.tsx
|   |   |   |   +-- ReviewCard.tsx
|   |   |   |   +-- StarRating.tsx
|   |   |   |   +-- Skeleton.tsx
|   |   |   |   +-- FilterTabs.tsx
|   |   |   |   +-- Modal.tsx
|   |   |   |   +-- Lightbox.tsx
|   |   |   +-- hero/
|   |   |   |   +-- HeroSection.tsx
|   |   |   |   +-- Hero3DScene.tsx
|   |   |   |   +-- HeroStaticFallback.tsx
|   |   |   |   +-- HeroErrorBoundary.tsx
|   |   |   +-- forms/
|   |   |   |   +-- BookingForm.tsx
|   |   |   |   +-- BookingStep1Service.tsx
|   |   |   |   +-- BookingStep2Contact.tsx
|   |   |   |   +-- BookingStep3DateTime.tsx
|   |   |   |   +-- BookingConfirmation.tsx
|   |   |   |   +-- ContactForm.tsx
|   |   |   |   +-- ReviewSubmitForm.tsx
|   |   |   +-- seo/
|   |   |       +-- PageMeta.tsx
|   |   |       +-- LocalBusinessSchema.tsx
|   |   +-- pages/
|   |   |   +-- Home.tsx
|   |   |   +-- Services.tsx
|   |   |   +-- Portfolio.tsx
|   |   |   +-- Book.tsx
|   |   |   +-- About.tsx
|   |   |   +-- Reviews.tsx
|   |   |   +-- Contact.tsx
|   |   |   +-- admin/
|   |   |       +-- AdminRoot.tsx
|   |   |       +-- AdminDashboard.tsx
|   |   |       +-- AdminAppointments.tsx
|   |   |       +-- AdminServices.tsx
|   |   |       +-- AdminPortfolio.tsx
|   |   |       +-- AdminReviews.tsx
|   |   |       +-- AdminSettings.tsx
|   |   +-- hooks/
|   |   |   +-- useMediaQuery.ts
|   |   |   +-- useReducedMotion.ts
|   |   |   +-- useWebGL.ts
|   |   |   +-- useBusinessSettings.ts
|   |   +-- lib/
|   |   |   +-- api.ts          # Typed fetch wrapper
|   |   |   +-- auth.ts         # Cognito token management
|   |   |   +-- validators.ts   # Client-side zod schemas
|   |   |   +-- format.ts       # Price formatting, date formatting
|   |   +-- types/
|   |   |   +-- index.ts
|   |   +-- App.tsx
|   |   +-- main.tsx
|   +-- index.html
|   +-- vite.config.ts
|   +-- tailwind.config.ts
|   +-- tsconfig.json
|   +-- package.json
+-- lambdas/
|   +-- src/                    (per Section 8.2)
|   +-- tests/
|   +-- requirements.txt
|   +-- requirements-dev.txt
|   +-- pyproject.toml
|   +-- Makefile
|   +-- scripts/
|       +-- seed_business_settings.py
+-- infra/                      (per Section 7.1)
+-- .env.example
+-- .gitignore
+-- README.md
```

---

## 14.2 Frontend Tasks

| # | Task | Priority |
|---|---|---|
| F01 | Project scaffold: `npm create vite@latest` React+TS. Install: tailwindcss, framer-motion, @react-three/fiber, @react-three/drei, three, zod, react-router-dom v6, react-helmet-async, @tanstack/react-query | P0 |
| F02 | Tailwind config: design tokens (colors, fonts, spacing, breakpoints) per Section 4 | P0 |
| F03 | Global layout: Header, Footer, MobileNav, StickyBookingBar | P0 |
| F04 | Routing: all routes, admin route guard (Cognito auth check) | P0 |
| F05 | API client: `src/lib/api.ts` — typed fetch, base URL from env, auth header injection for admin | P0 |
| F06 | `GET /business-settings` hook: `useBusinessSettings` — fetches once on app load, stores in React Query cache; all pages that show phone/address/hours use this hook | P0 |
| F07 | Home page: hero (static first), social proof bar, services highlight, portfolio teaser, about snippet, reviews carousel, booking CTA | P0 |
| F08 | Services page: filter tabs, service cards, FAQ accordion, booking CTA | P0 |
| F09 | Portfolio page: filter tabs, masonry grid, lightbox, pagination | P0 |
| F10 | Book page: multi-step form, step state management, zod validation, service pre-selection from URL param, confirmation screen | P0 |
| F11 | Contact page: contact info (from business-settings), maps link, contact form | P0 |
| F12 | About page: static layout with real copy per Section 3.5 | P1 |
| F13 | Reviews page: aggregate display, review cards, Google review CTA, submission form | P1 |
| F14 | Hero 3D scene: HeroSection, Hero3DScene, HeroMotionFallback, HeroErrorBoundary per Section 5; use code-generated R3F geometry only | P1 |
| F15 | Admin dashboard: Cognito Hosted UI redirect, protected routes, appointment management, service CRUD, portfolio upload, review moderation, settings editor | P1 |
| F16 | SEO: PageMeta on all pages, LocalBusinessSchema, sitemap.xml, robots.txt | P0 |
| F17 | Accessibility: skip link, focus styles, aria-labels, reduced motion, screen reader labels | P0 |
| F18 | Performance: image lazy loading, font preloading, code splitting verification, Lighthouse CI | P1 |
| F19 | Error and loading states: skeleton screens on all API-fetched sections, error states, empty states | P0 |
| F20 | Mobile QA: test on 360px, 390px, 414px, 768px — sticky bar, click-to-call, booking form | P0 |
| F21 | Remove all hardcoded business contact info from components — all must come from `useBusinessSettings` | P0 |

---

## 14.3 Python Lambda Tasks

| # | Task | Priority |
|---|---|---|
| B01 | Python project scaffold: pyproject.toml, requirements.txt, requirements-dev.txt, Makefile | P0 |
| B02 | `src/common/`: config.py, response.py, errors.py, dynamo.py, ses_client.py, logger.py, ids.py, honeypot.py, cors.py | P0 |
| B03 | Pydantic models for all request types | P0 |
| B04 | `fn_get_services`: query active services, category filter | P0 |
| B05 | `fn_get_portfolio`: paginated active portfolio, category filter | P0 |
| B06 | `fn_get_reviews`: approved reviews + aggregates | P0 |
| B07 | `fn_get_business_settings`: GetItem from BusinessSettings table | P0 |
| B08 | `fn_post_appointments`: validate, honeypot, idempotency, DynamoDB write, SES emails, audit log | P0 |
| B09 | `fn_post_contact`: validate, honeypot, DynamoDB write, SES emails | P0 |
| B10 | `fn_cognito_authorizer`: JWT verification, admin group check, policy generation | P0 |
| B11 | `fn_admin_get_appointments`: query by status/date, paginated | P0 |
| B12 | `fn_admin_update_appointment`: status update, SES email on confirm/cancel, audit log | P0 |
| B13 | `fn_admin_services`: create, update, soft-delete; imageUrl domain validation | P0 |
| B14 | `fn_admin_portfolio`: create, update, soft-delete; presigned URL generation for upload | P0 |
| B15 | `fn_admin_reviews`: create, approve (update aggregate), delete (update aggregate) | P0 |
| B16 | `fn_admin_contact_messages`: list with read filter, mark as read | P0 |
| B17 | `fn_admin_business_settings`: partial update, CloudFront invalidation after save | P0 |
| B18 | SES email templates: AppointmentConfirmation, AdminNewAppointmentAlert, ContactAutoReply, AppointmentCancellation | P0 |
| B19 | Seed script: `scripts/seed_business_settings.py` — idempotent seeder with canonical business data | P0 |
| B20 | Unit tests: all handlers, all edge cases, all validation rules (target: 80%+ coverage) | P0 |
| B21 | Integration tests: full appointment flow against DynamoDB Local | P1 |
| B22 | Idempotency table and decorator on post_appointments, post_contact | P1 |
| B23 | KMS envelope encryption for PII fields in Appointments and ContactMessages | P1 |

---

## 14.4 Terraform Tasks

| # | Task | Priority |
|---|---|---|
| T01 | Bootstrap: create Terraform state S3 bucket + DynamoDB lock table (one-time, manual) | P0 |
| T02 | `modules/dynamodb`: reusable table module with PITR flag, TTL, deletion protection | P0 |
| T03 | `modules/lambda_python`: reusable function module per Section 7.6 | P0 |
| T04 | `modules/static_site`: frontend S3 bucket + OAC bucket policy | P0 |
| T05 | `modules/assets_bucket`: assets S3 bucket + OAC + CORS for uploads | P0 |
| T06 | `modules/cloudfront`: distribution for frontend + assets + API passthrough | P0 |
| T07 | `modules/waf`: Web ACL with core rules + rate rules in us-east-1 | P0 |
| T08 | `modules/api_gateway`: HTTP API, all routes, Cognito JWT authorizer route, logging | P0 |
| T09 | `modules/cognito`: User Pool, client, admin group, no self-signup | P0 |
| T10 | `modules/ses`: domain identity, DKIM outputs for Route 53, email templates | P0 |
| T11 | `modules/monitoring`: CloudWatch log groups, alarms (Lambda errors, API 5xx, DynamoDB throttle) | P1 |
| T12 | `modules/iam`: reusable IAM policy document data sources per function type | P0 |
| T13 | `envs/dev/main.tf`: wire all modules for dev environment | P0 |
| T14 | `envs/prod/main.tf`: wire all modules for prod environment | P0 |
| T15 | Route 53 records: A aliases for all CloudFront distributions, SES DKIM CNAMEs | P0 |
| T16 | ACM certificate: us-east-1, DNS validation, SAN for all subdomains | P0 |
| T17 | Deploy IAM OIDC roles for GitHub Actions (one per environment) | P0 |
| T18 | All DynamoDB tables created with correct keys, GSIs, PITR settings | P0 |
| T19 | All Lambda roles: per-function, least-privilege, scoped to specific table ARNs | P0 |
| T20 | Provider version pinning + terraform version constraint in all env blocks | P0 |

---

## 14.5 Testing Tasks

| # | Task |
|---|---|
| TS01 | Unit tests: all Python Lambda handlers, Pydantic validation (all valid/invalid cases), honeypot, pagination |
| TS02 | Unit tests: frontend components (Vitest + React Testing Library) — form steps, validation, error states, loading states |
| TS03 | Integration tests: appointment flow end-to-end (Lambda → DynamoDB Local → SES mock) |
| TS04 | Accessibility audit: axe-core in dev mode (zero violations required). Manual: keyboard-only booking flow. VoiceOver (Safari) on iOS. |
| TS05 | Performance audit: Lighthouse CI on main branch. Fail if mobile performance < 85. |
| TS06 | Cross-browser: Chrome (mobile + desktop), Safari (iOS 16+), Firefox, Samsung Internet |
| TS07 | Dependency security: `npm audit --production` + `pip-audit` run in CI. Fail on HIGH/CRITICAL. |
| TS08 | Admin auth: verify all /admin/* routes return 401 without JWT, 403 with non-admin JWT, 200 with valid admin JWT |
| TS09 | WAF rate limit: verify rate limit fires on burst requests to /appointments and /contact |
| TS10 | Mobile UX: test sticky booking bar, click-to-call, maps link, booking form on real iOS and Android devices |

---

## 14.6 Security Tasks

| # | Task |
|---|---|
| S01 | Confirm all S3 buckets have all four Block Public Access flags set to true in Terraform |
| S02 | Confirm no bucket policy has `"Principal": "*"` |
| S03 | Add honeypot field to BookingForm.tsx and ContactForm.tsx (hidden `<input>`, not aria-hidden — must be hidden via CSS `display:none` or `visibility:hidden`, not aria-hidden, so screen readers do not fill it) |
| S04 | Implement KMS envelope encryption for PII in postAppointments and postContact handlers |
| S05 | Verify SafeLogger redacts PII fields in all log output (unit test this) |
| S06 | Verify Lambda IAM roles are per-function (not shared) in Terraform |
| S07 | Verify CORS in API Gateway is set to `allowOrigins: ["https://gracehairsbeauty.com"]` (prod) |
| S08 | Run Checkov on Terraform: fix all HIGH/CRITICAL findings before first prod deploy |
| S09 | Run `npm audit --production` and `pip-audit`: fix all HIGH/CRITICAL findings |
| S10 | Run `bandit -r src/ -ll` on Lambda code: fix all HIGH findings |
| S11 | Verify SES: DKIM active, SPF record present, DMARC record present, domain out of sandbox |
| S12 | Confirm `.env` files are in `.gitignore`. Confirm no credentials in git history (`git log -p | grep -i key`) |
| S13 | Enable GitHub secret scanning on repository |
| S14 | Verify admin Cognito authorizer checks group membership (not just valid token) |
| S15 | Test imageUrl validation: attempt to inject an external URL via POST /admin/services — verify 400 returned |

---

## 14.7 CI/CD Tasks

| # | Task |
|---|---|
| CI01 | `ci-frontend.yml`: lint (ESLint + tsc), Vitest, npm audit, Lighthouse CI |
| CI02 | `ci-backend.yml`: ruff, mypy, pytest, pip-audit, bandit |
| CI03 | `terraform.yml`: fmt check, init, validate, checkov, plan per environment |
| CI04 | `deploy-frontend.yml`: Vite build (env from GitHub Secrets), S3 sync, CloudFront invalidation |
| CI05 | `deploy-backend.yml`: pip install, build zip artifacts per function, upload to S3, trigger Lambda update |
| CI06 | GitHub Environments: prod environment requires manual approval before apply |
| CI07 | OIDC: all CI workflows authenticate to AWS via OIDC role assumption (no static keys in Secrets) |
| CI08 | Smoke test: after deploy, verify `GET /services` returns 200 and `GET /business-settings` returns 200 |

---

## 14.8 Implementation Phase Order

```
Phase 1 — Infrastructure Foundation (Week 1–2)
  T01 Bootstrap state bucket
  T02–T12 All Terraform modules
  T13 Dev environment wired
  T16 ACM certificate
  T15 Route 53 records
  T17 OIDC roles for CI
  T18 All DynamoDB tables
  T10 SES domain setup + DKIM

Phase 2 — Backend (Week 2–3)
  B01 Python project scaffold
  B02 Common library
  B03 Pydantic models
  B04–B09 All public Lambda functions
  B10 Cognito authorizer
  B18 SES templates
  B19 Business settings seed script
  B20 Unit tests

Phase 3 — Frontend Core Pages (Week 3–4)
  F01 Vite scaffold
  F02 Tailwind tokens
  F03 Layout components
  F04 Routing
  F05 API client
  F06 useBusinessSettings hook
  F07 Home page (static hero first)
  F08 Services page
  F09 Portfolio page
  F10 Book page
  F11 Contact page
  F16 SEO
  F17 Accessibility
  F19 Loading/error states
  F21 Remove hardcoded contact info

Phase 4 — Admin and Remaining Pages (Week 5)
  B11–B17 Admin Lambda functions
  F12 About page
  F13 Reviews page
  F15 Admin dashboard
  T14 Prod environment wired
  T11 CloudWatch monitoring

Phase 5 — Polish and 3D (Week 6)
  F14 3D hero (code-generated R3F geometry only; no external model dependency)
  F18 Performance optimization
  F20 Mobile QA
  TS01–TS10 All tests

Phase 6 — Launch Readiness (Week 7)
  S01–S15 Security checklist
  SES production access request (submit to AWS in Phase 1, usually takes 24–48h)
  CI01–CI08 CI/CD pipelines
  Lighthouse audit — verify all targets met
  Cross-browser testing
  Manual walkthrough of full booking flow with Grace
  DNS cutover from old host to Route 53
```

---

## 14.9 Definition of Done

A task is **Done** when all of the following are true:

**Code quality:**
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] ESLint passes with zero warnings on frontend code
- [ ] ruff check passes on Python code
- [ ] mypy passes on Python code (strict mode)
- [ ] No `print()` statements in Lambda code — use `logger`
- [ ] No `console.log` in frontend production code

**Testing:**
- [ ] Unit tests written and passing for the new feature
- [ ] No existing tests broken by the change

**Security:**
- [ ] No secrets or credentials in code or environment files
- [ ] Input validated before any DynamoDB write (Pydantic on backend, zod on frontend)
- [ ] Admin endpoints return 401 without valid JWT (verified by test)
- [ ] Logger does not output PII fields

**Accessibility:**
- [ ] All images have descriptive alt text (or alt="" if decorative)
- [ ] All interactive elements are keyboard-reachable
- [ ] No axe-core violations in development mode

**Performance:**
- [ ] Lighthouse mobile performance score >= 85 on affected page
- [ ] No new render-blocking resources introduced

**Content:**
- [ ] No placeholder Latin filler text anywhere
- [ ] No fake testimonials anywhere
- [ ] No hardcoded business contact information — all comes from BusinessSettings
- [ ] Business name is "Grace Hair Beauty" everywhere
- [ ] Navigation label is "Services" (not "Service")
- [ ] No off-topic medical consultation language on booking page

**Deployment:**
- [ ] CI pipeline passes on PR
- [ ] Feature verified in dev environment
- [ ] Grace has reviewed and approved the UI on a real mobile device before prod deploy

---

## 14.10 Environment Variables Reference

```bash
# frontend/.env.example (no secrets — all are public config values)
VITE_API_BASE_URL=https://api.gracehairsbeauty.com
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXX
VITE_COGNITO_DOMAIN=auth.gracehairsbeauty.com
VITE_CDN_BASE_URL=https://cdn.gracehairsbeauty.com

# Lambda environment variables (injected by Terraform via locals.lambda_env_common)
ENVIRONMENT=prod
POWERTOOLS_SERVICE_NAME=grace-hair-beauty
POWERTOOLS_LOG_LEVEL=WARNING
TABLE_SERVICES=gracehairb-prod-services
TABLE_APPOINTMENTS=gracehairb-prod-appointments
TABLE_PORTFOLIO=gracehairb-prod-portfolio
TABLE_REVIEWS=gracehairb-prod-reviews
TABLE_CONTACT_MESSAGES=gracehairb-prod-contact-messages
TABLE_BUSINESS_SETTINGS=gracehairb-prod-business-settings
TABLE_AUDIT_LOG=gracehairb-prod-audit-log
ALLOWED_ORIGIN=https://gracehairsbeauty.com
ASSETS_BUCKET=gracehairb-prod-assets
CDN_BASE_URL=https://cdn.gracehairsbeauty.com
SES_SENDER_EMAIL=no-reply@gracehairsbeauty.com
ADMIN_ALERT_EMAIL=ghbeauty24@gmail.com
COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=us-east-1
TABLE_IDEMPOTENCY=gracehairb-prod-idempotency

# No AWS credentials in Lambda environment — Lambda uses its IAM execution role.
# No secrets in code. No .env files committed to git.
```

---

*End of specification. All 14 sections complete.*

*Document: GRACE-HAIR-BEAUTY-SPEC.md — Version 2.0 — 2026-05-14*
