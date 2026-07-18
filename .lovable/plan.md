# JEEVIX Frontend Redesign Plan

Scope: frontend/UI only. No backend/workflow changes. Existing auth, MCP, mock data, and route structure remain intact.

## 1. Design System Overhaul (`src/styles.css`)
Shift from dark navy to a **light enterprise healthcare palette**:
- Background: off-white `#F7F9FC`; Cards: pure white; Borders: `#E5E9F0`
- Primary: Soft Blue `#1779B4`; Secondary: Light Cyan `#E6F4F9`; Accent: Teal `#1DA8C7`
- Success/Warning/Danger tuned for WCAG AA on white
- Typography scale: display 32/28/22, body 14, small 12, tighter tracking on headings
- Elevation: subtle 1–2 layer shadows (no heavy drop shadows)
- Radius tokens: `--radius-sm 8`, `md 12`, `lg 16`

## 2. Splash Screen (NEW)
- New route `src/routes/index.tsx` becomes splash (2s), then redirects: authenticated → role home, else → `/auth`
- White bg, subtle blue radial glow, centered JEEVIX logo, brand name, tagline "Smart Operations. Better Care.", minimal pulsing dot loader
- Fade-in on mount, fade-out before navigation (framer-like CSS transitions)

## 3. Login Page (`src/routes/auth.tsx`) — Light Redesign
- Convert current dark split-screen to **light theme** split (50/50 desktop, stack on mobile)
- Left: hospital cover image with soft blue tint overlay, hospital logo chip, name, description, welcome message, contact rows; placeholder state when no hospital data
- Right: white card, floating-clear labels, email/password (with reveal), Remember Me, Forgot Password, primary blue Login button, role picker retained for demo
- Support/version footer kept, softer

## 4. Hospital Profile Module (NEW)
- New route `src/routes/_app/module.hospital-profile.tsx` (replaces stub) with form: logo upload, cover upload, name, description, address, city, state, country, phone, email, website, type, beds, departments (chips)
- Persist to `localStorage` key `jeevix.hospital.profile`
- Login page reads this profile; falls back to default demo hospital

## 5. Subscription Module (NEW)
- New route `src/routes/_app/module.subscription.tsx` (replaces stub) with three sections:
  - **Current Plan** summary card
  - **Plans**: Starter / Professional / Enterprise cards with monthly & annual pricing toggle, feature list, "Current" badge, "Upgrade" button
  - **Request Additional Services**: checkbox grid (AI Voice, Custom Dashboard, Mobile App, Website, SMS, WhatsApp, AI Reports, API, Training, Data Migration) + notes textarea + submit (toast confirmation)

## 6. Global Layout Polish
- **Sidebar** (`AppSidebar.tsx`): light surface, refined width, clearer active state (left indicator + bg tint), smoother expand/collapse, better section labels
- **TopBar**: cleaner search, subtle border, refined notification badge
- **Dashboards** (admin/doctor/nurse): tighter card spacing, unified KPI card component, quieter icons, improved typographic hierarchy — no data changes
- **Buttons/Inputs/Tables** (shadcn primitives): refresh via token updates so all pages benefit automatically; ensure focus rings, disabled/loading states, sticky table headers utility class

## 7. Accessibility & Motion
- WCAG AA contrast across the new palette
- Visible focus rings on all interactive elements
- Subtle fade/slide utilities only where meaningful (splash, page mounts, toasts)

## Files Touched (approx.)
- `src/styles.css` (tokens)
- `src/routes/index.tsx` (splash)
- `src/routes/auth.tsx` (light redesign)
- `src/routes/_app/module.$name.tsx` (route to specific modules)
- `src/routes/_app/module.hospital-profile.tsx` (new)
- `src/routes/_app/module.subscription.tsx` (new)
- `src/routes/_app/admin.tsx`, `doctor.tsx`, `nurse.tsx` (spacing/typography polish)
- `src/components/hms/AppSidebar.tsx`, `TopBar.tsx` (polish)
- `src/lib/hospital-profile.ts` (new — localStorage helper)

## Out of Scope
- Backend, auth logic, MCP, mock data content
- New business logic; workflows remain identical

Approve to proceed, or tell me which sections to trim/expand.