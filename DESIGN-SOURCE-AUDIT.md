# Design Source Audit — `soft-ui-dashboard-react-1.0.0.zip`

> Mandatory pre-build inspection for **Website 25 — DataPulse Analytics Platform**
> (100 Website Challenge — first analytics dashboard build).
> Every item below was read directly out of the uploaded archive before a single
> line of new code was written.

---

## 0. Archive identity

| Field | Value |
|---|---|
| Archive | `soft-ui-dashboard-react-1.0.0.zip` (5,621,660 bytes) |
| Root folder | `soft-ui-dashboard-react-1.0.0/` |
| Product | **Soft UI Dashboard React** by Creative Tim |
| `package.json` version | `4.0.1` (source headers inconsistently say `v3.1.0` / `v4.0.1`) |
| Distributed by | ThemeWagon (`homepage: themewagon.github.io/soft-ui-dashboard-react`) |
| Licence | `SEE LICENSE IN <https://www.creative-tim.com/license>` |
| Total files | **259** |
| Build system | **Create React App** (`react-scripts` 5.0.1) — *not* Next.js |
| Language | **JavaScript (JSX)** — no TypeScript, no `.ts`/`.tsx` anywhere |
| Router | `react-router-dom` 6.11.1 (client-side SPA) |

### Root-level files

```
.env                  GENERATE_SOURCEMAP=false      (only env content in archive)
.eslintrc.json
.gitignore
.npmrc
.prettierrc.json      printWidth 100, trailingComma es5, tabWidth 2, semi true,
                      singleQuote false, endOfLine auto
CHANGELOG.md
ISSUE_TEMPLATE.md
LICENSE.md
README.md
jsconfig.json         baseUrl "src", paths {"*": ["src/*"]}  → absolute imports
package.json
public/
src/
```

---

## 1. Folder & file inventory

### 1.1 `public/` (5 files)

| File | Notes |
|---|---|
| `index.html` | CRA shell, see §5 for font/link tags |
| `manifest.json` | `short_name: "Soft UI Dashboard"`, `theme_color: #17c1e8`, `background_color: #ffffff`, icon `favicon.png` 64/32/24/16 |
| `favicon.png` | |
| `apple-icon.png` | referenced at `sizes="76x76"` |
| `robots.txt` | `User-agent: *` / `Disallow:` (allow-all) |

### 1.2 `src/` top level

```
src/App.js          root component, theme + RTL cache + route mapping
src/index.js        ReactDOM root, BrowserRouter, SoftUIControllerProvider
src/routes.js       route registry (drives the Sidenav automatically)
src/assets/         images + theme
src/components/     9 "Soft*" design-system primitives
src/context/        global UI state (React Context + useReducer)
src/examples/       composed building blocks (navbars, cards, charts, tables…)
src/layouts/        7 page layouts
```

### 1.3 Naming conventions observed

- **Folder per component**, always with an `index.js` barrel entry.
- Styled-engine wrappers are siblings named `<Component>Root.js`
  (`SoftBoxRoot.js`, `SoftButtonRoot.js`, `SidenavRoot.js`, `SoftInputRoot.js`…).
- Design-system primitives are prefixed **`Soft`** (`SoftBox`, `SoftTypography`…).
- Chart folders nest a `configs/index.js` holding the Chart.js options object.
- Page data is colocated in a `data/` subfolder exporting plain JS objects
  (`layouts/dashboard/data/gradientLineChartData.js`).
- Sidenav-specific CSS-in-JS lives in `examples/Sidenav/styles/*.js` and is
  exported as a **function `(theme, ownerState) => ({…})`**.
- Every file opens with the same 14-line Creative Tim banner comment.
- PascalCase for components/folders, camelCase for functions/data files.

---

## 2. Page routes and their layouts

Routes come from `src/routes.js`; `App.js` maps `route` → `component`.
There is **no server routing, no file-system routing, no API layer**.

| # | `key` | `route` | Layout folder | Sidenav icon | `type` |
|---|---|---|---|---|---|
| 1 | `dashboard` | `/dashboard` | `layouts/dashboard` | `<Shop size="12px"/>` | collapse |
| 2 | `tables` | `/tables` | `layouts/tables` | `<Office size="12px"/>` | collapse |
| 3 | `billing` | `/billing` | `layouts/billing` | `<CreditCard size="12px"/>` | collapse |
| 4 | `virtual-reality` | `/virtual-reality` | `layouts/virtual-reality` | `<Cube size="12px"/>` | collapse |
| 5 | `rtl` | `/rtl` | `layouts/rtl` | `<Settings size="12px"/>` | collapse |
| — | `account-pages` | — | — | — | **title** ("Account Pages") |
| 6 | `profile` | `/profile` | `layouts/profile` | `<CustomerSupport size="12px"/>` | collapse |
| 7 | `sign-in` | `/authentication/sign-in` | `layouts/authentication/sign-in` | `<Document size="12px"/>` | collapse |
| 8 | `sign-up` | `/authentication/sign-up` | `layouts/authentication/sign-up` | `<SpaceShip size="12px"/>` | collapse |

Route-object schema documented in the file header:
`type` (`collapse` \| `title` \| `divider`), `name`, `key`, `icon`, `collapse`
(nested array), `route`, `href`, `title`, `component`, `noCollapse`.

**Layout containers**
- `examples/LayoutContainers/DashboardLayout` — sets `layout: "dashboard"`,
  offsets content for the 250px sidenav.
- `examples/LayoutContainers/PageLayout` — sets `layout: "page"`, no sidenav
  (used by authentication pages).
- `layouts/authentication/components/` → `BasicLayout`, `CoverLayout`,
  `IllustrationLayout`, plus `Footer`, `Separator`, `Socials`.

**Unmatched routes:** `App.js` ends with `<Route path="*" element={<Navigate to="/dashboard" />} />`
— a redirect, **not** a 404 page.

---

## 3. Components, props and state

### 3.1 Design-system primitives (`src/components/`)

All are MUI `styled()` wrappers that receive an `ownerState` object.

| Component | Props (defaults in **bold**) |
|---|---|
| **SoftBox** | `variant` **contained**\|gradient · `bgColor` **transparent** · `color` **dark** · `opacity` **1** · `borderRadius` **none** · `shadow` **none** |
| **SoftTypography** | `color` **dark** (inherit/primary/secondary/info/success/warning/error/light/dark/text/white) · `fontWeight` **false**\|light\|regular\|medium\|bold · `textTransform` **none**\|capitalize\|uppercase\|lowercase · `verticalAlign` **unset**+8 · `textGradient` **false** · `opacity` **1** · `children` required |
| **SoftButton** | `size` **medium**\|small\|large · `variant` **contained**\|text\|outlined\|gradient · `color` **white**+8 · `circular` **false** · `iconOnly` **false** · `children` required |
| **SoftInput** | `size` **medium**\|small\|large · `icon` **{component:false, direction:"none"}** (direction none\|left\|right) · `error` **false** · `success` **false** · `disabled` **false** |
| **SoftAlert** | `color` **info**+7 · `dismissible` **false** · `children` required |
| **SoftBadge** | `color` **info**+7 · `variant` **gradient**\|contained · `size` **sm**\|xs\|md\|lg · `circular` **false** · `indicator` **false** · `border` **false** · `container` **false** · `children` **false** |
| **SoftAvatar** | `bgColor` **transparent**+8 · `size` **md** (xs\|sm\|md\|lg\|xl\|xxl) · `shadow` **none** (xs…xxl\|inset) |
| **SoftProgress** | `variant` **contained**\|gradient · `color` **info**+7 · `value` **0** · `label` **false** |
| **SoftPagination** | `item` **false** · `variant` **gradient**\|contained · `color` **info**+8 (incl. white) · `size` **medium** · `active` **false** · `children` required |

`SoftAlert` additionally ships `SoftAlertCloseIcon.js`.
`SoftInput` ships four roots: `SoftInputRoot`, `SoftInputWithIconRoot`,
`SoftInputIconBoxRoot`, `SoftInputIconRoot`.

**SoftBox resolution logic** (`SoftBoxRoot.js`) — reproduced in the new build:
- valid gradients: `primary secondary info success warning error dark light`
- valid colors: `transparent white black primary secondary info success warning error light dark text grey-100…grey-900`
- valid radii: `xs sm md lg xl xxl section`
- valid shadows: `xs sm md lg xl xxl inset`

### 3.2 Composed blocks (`src/examples/`)

- **Breadcrumbs**
- **Cards** — `BlogCards/DefaultBlogCard`, `BlogCards/TransparentBlogCard`,
  `CounterCards/OutlinedCounterCard`, `InfoCards/DefaultInfoCard`,
  `InfoCards/ProfileInfoCard`, `MasterCard`, `PlaceholderCard`,
  `PricingCards/DefaultPricingCard`, `ProjectCards/DefaultProjectCard`,
  `StatisticsCards/MiniStatisticsCard`
- **Charts** (10 families, see §9)
- **Configurator** — right-hand settings drawer
- **Footer** — props `company {href,name}` (default Creative Tim), `links[]`
  (Creative Tim / About Us / Blog / License)
- **Icons** — 9 hand-rolled SVG components: `Basket, CreditCard, Cube,
  CustomerSupport, Document, Office, Settings, Shop, SpaceShip`
- **Items/NotificationItem**
- **LayoutContainers** — `DashboardLayout`, `PageLayout`
- **Lists/ProfilesList**
- **Navbars** — `DashboardNavbar` (+ `styles/`), `DefaultNavbar`
  (+ `DefaultNavbarLink`, `DefaultNavbarMobile`)
- **Sidenav** — `index.js`, `SidenavRoot.js`, `SidenavCollapse`, `SidenavCard`,
  `styles/sidenav.js`, `styles/sidenavCollapse.js`
- **Tables/Table** — props `columns[]`, `rows[]`
- **Timeline** — `TimelineItem`, `TimelineList`, `context/`

**`MiniStatisticsCard` props** (the model for the new KPI cards):
`bgColor` **white**, `title {fontWeight:"medium", text:""}`, `count` (required),
`percentage {color:"success", text:""}`, `icon {color, component}` (required),
`direction` **right**\|left.

**`Sidenav` props**: `color`, `brand`, `brandName`, `routes`, `...rest`.
**`DefaultNavbar` props**: `transparent` **false**, `light` **false**, `action`.

### 3.3 State management

**No Redux, no Zustand, no MobX, no React Query, no Jotai.**
State is **React Context + `useReducer`** only — `src/context/index.js`.

```js
const initialState = {
  miniSidenav: false,
  transparentSidenav: true,
  sidenavColor: "info",
  transparentNavbar: true,
  fixedNavbar: true,
  openConfigurator: false,
  direction: "ltr",
  layout: "dashboard",
};
```

Reducer action types: `MINI_SIDENAV`, `TRANSPARENT_SIDENAV`, `SIDENAV_COLOR`,
`TRANSPARENT_NAVBAR`, `FIXED_NAVBAR`, `OPEN_CONFIGURATOR`, `DIRECTION`, `LAYOUT`.
Exported setters: `setMiniSidenav`, `setTransparentSidenav`, `setSidenavColor`,
`setTransparentNavbar`, `setFixedNavbar`, `setOpenConfigurator`, `setDirection`,
`setLayout`. Hook: `useSoftUIController()` (throws outside provider).
Secondary context: `examples/Timeline/context` (dark-mode flag for timelines).

Component-local state seen in `App.js`: `onMouseEnter`, `rtlCache`.
`Sidenav` has a `resize` listener that sets `miniSidenav` when
`window.innerWidth < 1200`.

---

## 4. CSS variables and design tokens

The theme is **MUI `createTheme` in JS — there are zero CSS custom properties
and zero CSS/SCSS files in the archive.** All tokens below were lifted from
`src/assets/theme/base/*` and are re-expressed as CSS variables in the new build.

### 4.1 `colors.js`

```
background.default  #f8f9fa
text.main/focus     #67748e
transparent.main    transparent
white.main/focus    #ffffff
black.light         #141414   black.main/focus  #000000
primary.main        #cb0c9f   primary.focus     #ad0a87
secondary.main      #8392ab   secondary.focus   #96a2b8
info.main           #17c1e8   info.focus        #3acaeb
success.main        #82d616   success.focus     #95dc39
warning.main        #fbcf33   warning.focus     #fcd652
error.main          #ea0606   error.focus       #c70505
light.main/focus    #e9ecef
dark.main/focus     #344767
```

**Grey scale**
`100 #f8f9fa · 200 #e9ecef · 300 #dee2e6 · 400 #ced4da · 500 #adb5bd ·
600 #6c757d · 700 #495057 · 800 #343a40 · 900 #212529`

**Gradients** (`main` → `state`)
```
primary   #7928ca → #ff0080
secondary #627594 → #a8b8d8
info      #2152ff → #21d4fd
success   #17ad37 → #98ec2d
warning   #f53939 → #fbcf33
error     #ea0606 → #ff667c
light     #ced4da → #ebeff4
dark      #141727 → #3a416f
```

**alertColors** (main / state / border), **badgeColors** (background / text),
**socialMediaColors** (12 networks), plus:
```
inputColors.borderColor.main  #d2d6da    .focus #35d1f5
inputColors.boxShadow         #81e3f9
inputColors.error             #fd5c70    .success #66d432
sliderColors.thumb.borderColor #d9d9d9
circleSliderColors.background  #d3d3d3
tabs.indicator.boxShadow       #ddd
```

### 4.2 `borders.js`

`borderColor = grey[300] (#dee2e6)`
`borderWidth: 0, 1px, 2px, 3px, 4px, 5px` (emitted via `pxToRem`)
`borderRadius: xs 2px · sm 4px · md 8px · lg 12px · xl 16px · xxl 24px · section 160px`

### 4.3 `boxShadows.js` — built by `boxShadow([x,y],[blur,spread],color,opacity,inset)`

```
xs     0 2px 9px -5px   rgba(0,0,0,.15)
sm     0 5px 10px 0     rgba(0,0,0,.12)
md     0 4px 6px -1px   rgba(20,20,20,.12), 0 2px 4px -1px rgba(20,20,20,.07)
lg     0 8px 26px -4px  rgba(20,20,20,.15), 0 8px 9px -5px rgba(20,20,20,.06)
xl     0 23px 45px -11px rgba(20,20,20,.25)
xxl    0 20px 27px 0    rgba(0,0,0,.05)      ← the canonical card shadow
inset  inset 0 1px 2px 0 rgba(0,0,0,.075)
navbarBoxShadow  inset 0 0 1px 1px rgba(255,255,255,.9), 0 20px 27px 0 rgba(0,0,0,.05)
buttonBoxShadow.main  0 4px 7px -1px rgba(0,0,0,.11), 0 2px 4px -1px rgba(0,0,0,.07)
buttonBoxShadow.stateOf 0 3px 5px -1px rgba(0,0,0,.09), 0 2px 5px -1px rgba(0,0,0,.07)
inputBoxShadow.focus  0 0 0 2px rgba(129,227,249,1)
```

### 4.4 `breakpoints.js`

`xs 0 · sm 576 · md 768 · lg 992 · xl 1200 · xxl 1400`
(Bootstrap-style, **not** MUI defaults. Sidenav mini-mode flips at `xl` = 1200.)

### 4.5 `globals.js`

```
html { scroll-behavior: smooth }
*, *::before, *::after { margin:0; padding:0 }
a, a:link, a:visited { text-decoration: none !important }
.link { color: #344767 !important; transition: color 150ms ease-in !important }
.link:hover/:focus { color: #17c1e8 !important }
```

### 4.6 Theme helper functions (`assets/theme/functions/`)

| Function | Behaviour |
|---|---|
| `pxToRem(n, base = 16)` | `` `${n/base}rem` `` |
| `linearGradient(color, state, angle = 310)` | `linear-gradient(310deg, c, s)` |
| `boxShadow(offset[], radius[], color, opacity, inset = "")` | composes rem shadow |
| `rgba(color, opacity)` | uses `hexToRgb` |
| `hexToRgb(color)` | `chroma(color).rgb().join(", ")` (chroma-js 2.4.2) |
| `gradientChartLine(chart, color, opacity = 0.2)` | canvas `createLinearGradient(0,230,0,50)`, stops at `1 → rgba(color,.2)`, `0.2 → rgba(72,72,176,0)`, `0 → rgba(203,12,159,0)` |

### 4.7 Component theme overrides (`assets/theme/components/`)

`button/{root,contained,outlined,text,buttonText}`, `card/{index,cardContent,cardMedia}`,
`dialog/*`, `form/{autocomplete,checkbox,container,input,inputBase,inputLabel,inputOutlined,radio,select,switchButton,textField,formControlLabel}`,
`list/*`, `menu/*`, `stepper/*`, `table/*`, `tabs/*`, plus
`appBar, avatar, breadcrumbs, divider, icon, iconButton, linearProgress, link, popover, sidenav, slider, svgIcon, tooltip, typography`.

Key extracted values:
- **Card root** — `background #fff`, `border 0 solid rgba(0,0,0,.125)`,
  `border-radius 16px (xl)`, `box-shadow: xxl`, `display:flex; flex-direction:column; word-wrap:break-word`.
- **Button root** — `font-size: size.xs (12px)`, `border-radius: md (8px)`,
  `padding: 12px 24px`, icon `font-size 15px`.
- **Button sizes** — small `min-height 32px / padding 8px 32px / font 12px`;
  medium `min-height 40px / padding 12px 24px`; large `min-height 47px /
  padding 14px 64px / font 14px`.
- **InputBase** — `padding 8px 12px`, `font-size 14px !important`,
  `border-radius md (8px)`, `transition: box-shadow 150ms ease, border-color 150ms ease, padding 150ms ease`.
- **Sidenav** — fixed width **250px**; mini width **96px**; closed transform
  `translateX(-320px)`; transitions use MUI `sharp` easing with
  `shorter`/`enteringScreen` durations.

---

## 5. Fonts — files, weights, import method

- **No font files are bundled.** Zero `.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`
  in the archive.
- Import method: **Google Fonts `<link rel="stylesheet">` in `public/index.html`**

```html
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
```

- **Family:** `"Roboto", "Helvetica", "Arial", sans-serif`
- **Weights loaded:** 300 (light), 400 (regular), 500 (medium), 700 (bold)
- Token map: `fontWeightLight 300 · fontWeightRegular 400 · fontWeightMedium 500 · fontWeightBold 700`

**Type scale** (`pxToRem` values; px shown)

| Token | Size | Line-height | Weight | Colour |
|---|---|---|---|---|
| `h1` | 48 | 1.25 | 500 | `#344767` |
| `h2` | 36 | 1.30 | 500 | `#344767` |
| `h3` | 30 | 1.375 | 500 | `#344767` |
| `h4` | 24 | 1.375 | 500 | `#344767` |
| `h5` | 20 | 1.375 | 500 | `#344767` |
| `h6` | 16 | 1.625 | 500 | `#344767` |
| `subtitle1` | 20 | 1.625 | 400 | — |
| `subtitle2` | 16 | 1.600 | 500 | — |
| `body1` | 20 | 1.625 | 400 | — |
| `body2` | 16 | 1.600 | 400 | — |
| `button` | 14 | 1.5 | 700 | `text-transform: uppercase` |
| `caption` | 12 | 1.25 | 400 | — |
| `d1…d6` | 80 / 72 / 64 / 56 / 48 / 40 | 1.2 | 300 | `#344767` |

`size` scale: `xxs 10.4 · xs 12 · sm 14 · md 16 · lg 18 · xl 20`
`lineHeight` scale: `sm 1.25 · md 1.5 · lg 2`

> ⚠️ Brief floor (body ≥ 15px, metadata ≥ 11px, nav 13px, buttons 12px) is
> **stricter than the source** in places — `caption` 12px and `size.xxs` 10.4px
> fall below the 11px metadata floor. Resolution recorded in §15.

---

## 6. Icon libraries

| Library | Version | Usage |
|---|---|---|
| `@mui/icons-material` | 5.11.16 | imported ad-hoc in layouts |
| **Material Icons webfont** | Google Fonts link | `<Icon>settings</Icon>` ligature API — the dominant pattern |
| Custom SVG set | — | 9 components in `src/examples/Icons/` (`Shop`, `Office`, `CreditCard`, `Cube`, `Settings`, `CustomerSupport`, `Document`, `SpaceShip`, `Basket`), all accept a `size` prop, default `"16px"` |

```html
<link href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp" rel="stylesheet" />
```

**No Lucide, no Feather, no Heroicons, no FontAwesome in the source.**
The brief mandates Lucide for the new build → documented deviation in §15.

---

## 7. Loading screen

**ABSENT.** Exhaustive grep for `loading|spinner|preloader|skeleton` across
`src/` returns exactly one unrelated hit
(`assets/theme/components/form/autocomplete.js` — MUI's `.MuiAutocomplete-loading`
style override). There is no splash component, no progress indicator, no
route-transition loader, no `React.Suspense` fallback.

→ **Fallback spec from the brief applies** (see §15 build plan).

## 8. Cookie consent banner

**ABSENT.** Grep for `cookie` across `src/` returns **zero** hits. No banner, no
modal, no preference toggles, no `localStorage` key, no cookie policy route.

→ **Fallback spec from the brief applies**, Kenya DPA 2019 compliant.

## 9. CAPTCHA

**ABSENT.** Grep for `captcha|recaptcha|hcaptcha|turnstile` across the whole
archive returns **zero** hits. The sign-in / sign-up forms are pure presentation
with no submit handler and no validation.

→ Google reCAPTCHA v3 to be added fresh, server-verified.

## 10. Privacy policy / Terms / 404 / 500

| Page | Status in zip |
|---|---|
| Privacy policy | **ABSENT** — the only `privacy`/`terms` hit is the sign-up checkbox label *"I agree the Terms and Conditions"* in `layouts/authentication/sign-up/index.js`, linking nowhere |
| Terms & conditions | **ABSENT** |
| Cookie policy | **ABSENT** |
| 404 page | **ABSENT** — `App.js` uses `<Navigate to="/dashboard" />` for `path="*"`. (`package.json` `predeploy` copies `index.html` → `404.html` purely for GitHub Pages SPA rewriting.) |
| 500 page | **ABSENT** — no error boundary anywhere |

→ All four to be authored fresh against the Soft UI visual language.

## 11. API routes

**NONE.** The archive is a pure client-side SPA. There is no `api/`, `server/`,
`pages/api`, no `fetch(` to a backend, no axios, no mock-service worker.
All data is hard-coded in `layouts/**/data/*.js`.

## 12. Environment variables

Only one, in `.env`:

```
GENERATE_SOURCEMAP=false
```

Grep for `process.env` across `src/` → **zero** references.
No `.env.example`, no `.env.local`, no secrets of any kind.

## 13. Charting libraries

| Package | Version |
|---|---|
| `chart.js` | **3.9.1** |
| `react-chartjs-2` | **3.0.5** |
| `chroma-js` | 2.4.2 (colour maths for gradients) |
| `react-countup` | 6.4.2 (number count-up animations) |
| `react-flatpickr` | 3.10.13 (date pickers) |

**No Recharts, no D3, no ApexCharts, no Nivo, no Victory in the source.**
The brief mandates Recharts → documented deviation in §15.

**Chart families present** (each with its own `configs/index.js`):
`BarCharts/{HorizontalBarChart, ReportsBarChart, VerticalBarChart}`,
`BubbleChart`, `DoughnutCharts/DefaultDoughnutChart`,
`LineCharts/{DefaultLineChart, GradientLineChart}`, `MixedChart`, `PieChart`,
`PolarChart`, `RadarChart`.

**Canonical chart options** (from `GradientLineChart/configs/index.js`) —
reproduced verbatim in the Recharts build:
```
responsive: true, maintainAspectRatio: false
legend: hidden
interaction: { intersect: false, mode: "index" }
y-axis: grid shown, drawBorder false, drawTicks false, borderDash [5,5]
        ticks color #b2b9bf, font-size 11, padding 10, lineHeight 2
x-axis: grid hidden entirely
        ticks color #b2b9bf, font-size 11, padding 20, lineHeight 2
```
Axis tick colour **`#b2b9bf`** and tick size **11px** are the key visual fingerprints.

## 14. Other libraries

`@mui/material` 5.13.0 · `@mui/styled-engine` 5.12.3 · `@emotion/{react,styled,cache}` 11.11.0
· `stylis` 4.2.0 + `stylis-plugin-rtl` 2.1.1 (RTL support, `direction` state)
· `prop-types` 15.8.1 · `uuid` 9.0.0 · `web-vitals` 3.3.1
· Testing: `@testing-library/{jest-dom,react,user-event}`
· `leaflet@1.7.1` CSS linked in `index.html` (map styling; no JS counterpart shipped)
· Dev: eslint 8.40 + prettier 2.8.8 + `eslint-config-prettier`, `eslint-plugin-{import,react,react-hooks,prettier}`, `gh-pages`

## 15. Images in the archive

`assets/images/` — `bruce-mars.jpg`, `home-decor-1/2/3.jpg`, `ivana-square.jpg`,
`ivana-squares.jpg`, `ivancik.jpg`, `kal-visuals-square.jpg`, `logo-ct.png`,
`marie.jpg`, `team-1…5.jpg`, `vr-bg.jpg`
`curved-images/` — `curved-6.jpg`, `curved0.jpg`, `curved1.jpg`, `curved14.jpg`, `white-curved.jpeg`
`illustrations/` — `rocket-white.png`
`logos/` — `mastercard.png`, `visa.png`
`shapes/` — `waves-white.svg`
`small-logos/` — `icon-sun-cloud.png`, `logo-{apple,atlassian,facebook,google,invision,jira,slack,spotify,webdev,xd}.svg`

All are Creative Tim stock, **none are East African** → replaced with
Pexels/Unsplash imagery per the brief, credited in `image-credits.md`.

---

## 16. Summary & reproduction plan

### What the zip gives us (reproduced faithfully)

✅ The **complete Soft UI token system** — every colour, gradient, grey, shadow,
radius, breakpoint and type-scale value above is ported 1:1 into
`src/styles/tokens.css` as CSS custom properties, keeping the exact hex codes
and the `pxToRem(n) = n/16rem` convention.
✅ The **`Soft*` primitive API** — `SoftBox`, `SoftTypography`, `SoftButton`,
`SoftBadge`, `SoftAlert`, `SoftInput`, `SoftProgress`, `SoftAvatar` rebuilt as
typed React components with the **same prop names, same unions, same defaults**.
✅ The **card look** — `#fff`, `border-radius 16px`, `box-shadow xxl
(0 20px 27px 0 rgba(0,0,0,.05))`.
✅ The **gradient language** — `linear-gradient(310deg, main, state)`.
✅ The **250px / 96px sidenav** with the 1200px (`xl`) mini-mode flip,
transparent-sidenav default, `info` accent.
✅ The **chart grammar** — hidden legend, index-mode tooltips, dashed `[5,5]`
y-grid, no x-grid, `#b2b9bf` 11px ticks.
✅ The **Context + useReducer** state model, extended with the new
`miniSidenav / sidenavColor / fixedNavbar / direction / layout` keys.
✅ **Roboto 300/400/500/700** via `next/font/google` (upgraded from a blocking
`<link>` to self-hosted-at-build for performance; same family, same weights).
✅ Folder-per-component + `index` barrel + colocated `data/` conventions.
✅ Prettier config (printWidth 100, 2-space, semi, double quotes) carried over.

### What the zip does NOT contain (built fresh to the brief)

| Missing | Source of truth |
|---|---|
| Loading screen | brief fallback — wordmark fade-in, rotating ring, counting data columns, < 2s |
| Cookie consent banner | brief fallback — 4 toggles, localStorage, `/legal/cookie-policy`, Kenya DPA 2019 |
| reCAPTCHA v3 | fresh — server-verified, v2 fallback under score 0.5 |
| Privacy policy / Terms / Cookie policy | fresh — in Soft UI page layout |
| 404 / 500 | fresh — branded Soft UI |
| Any API route | fresh — 16 Next.js route handlers |
| Env vars | fresh — `.env.example` with 30+ names |
| Auth / roles | fresh — NextAuth, Owner/Manager/Analyst/Viewer |
| MDX blog | fresh |
| 3D globe | fresh — three.js |

### Documented, brief-mandated deviations from the zip

| Zip | New build | Why |
|---|---|---|
| CRA + react-router SPA | **Next.js 14 App Router + TypeScript** | brief: Vercel deployment, SSR, API routes |
| JavaScript + PropTypes | **TypeScript** | brief |
| Chart.js 3.9.1 / react-chartjs-2 | **Recharts** | brief: "Recharts: all dashboard charts" |
| Material Icons webfont + 9 custom SVGs | **Lucide only** | brief: "Lucide only" |
| MUI + Emotion styled-engine | **CSS Modules + CSS custom properties** | removes a 300 kB runtime from a dashboard that must SSR fast; **all visual tokens preserved exactly** |
| `<link>` Google Fonts | **`next/font/google`** | same family/weights, no render-blocking request |
| Creative Tim stock photos | **Pexels/Unsplash East African imagery** | brief |
| `caption` 12px / `size.xxs` 10.4px | **metadata floor raised to 11px**, nav 13px, buttons 12px, body 15px | brief accessibility floors override the source where the source is smaller |
| `primary #cb0c9f` (magenta) used sparingly | kept in the token set; **`info #17c1e8` + `dark #344767` lead** the DataPulse palette | matches the source's own dashboard default (`sidenavColor: "info"`, `theme-color: #17c1e8`) |
| body/metadata text greys `#67748e`, `#adb5bd`, `#6c757d` | **darkened** to `#3d4a5f`, `#737d8c`, `#545d6a` | the source values measured 1.9–4.9:1 as text on white; readability feedback overrode the 1:1 port |
| 3D globe (three.js) | **removed** | dropped from the marketing skin during the design pass; the dashboard is the product |

> Everything else — every hex, every shadow, every radius, every type step — is
> the zip's, unchanged.
