---
version: alpha
name: Comseven
category: "Thai Brands"
description: "Comseven (comseven.com/th), the corporate site of Com7 Public Company Limited, a Thai IT retailer. White #ffffff and #faf9fa pages, black #000000 type and footer, a fresh green #44c767 View-more button and a #3fb02c share-price panel, Noto Sans Thai at 16px with Sukhumvit Set controls and 2px-radius buttons."
colors:
  canvas: "#ffffff"
  page-largest: "#faf9fa"
  ink: "#000000"
  primary: "#44c767"
  on-primary: "#ffffff"
  brand-green-deep: "#3fb02c"
  overlay: "#00000080"
  hairline: "#b7b7b7"
typography:
  display:
    fontFamily: "\"Noto Sans Thai\""
    fontSize: 20px
    fontWeight: 700
    lineHeight: 28px
    textTransform: uppercase
  body:
    fontFamily: "\"Noto Sans Thai\""
    fontSize: 16px
    fontWeight: 400
    lineHeight: 25.6px
  button:
    fontFamily: "\"Sukhumvit Set\""
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22.4px
  nav:
    fontFamily: "\"Sukhumvit Set\""
    fontSize: 16px
    fontWeight: 400
    lineHeight: 0px
rounded:
  xs: 2px
  sm: 10px
spacing:
  s1: 2px
  s2: 5px
  s3: 7px
  s4: 8px
  s5: 10px
  s6: 14px
  s7: 15px
  s8: 20px
  s9: 21px
  s10: 30px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.xs}"
    padding: 5px 21px
    height: 32px
  nav:
    textColor: "{colors.canvas}"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
  stock-panel:
    backgroundColor: "{colors.brand-green-deep}"
    textColor: "{colors.canvas}"
  business-tile:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.canvas}"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
---

## Overview

This is the corporate site of Com7 Public Company Limited ("บริษัท คอมเซเว่น จำกัด (มหาชน)"), a Thai retailer of IT products. The measured URL redirects to the Thai home page, https://www.comseven.com/th/, titled "Comseven". The page text says the company's main business is retail of IT products such as desktop and portable computers, mobile phones, tablets and lifestyle devices, that it started as an IT retail shop in Pantip Plaza in the year 2539 of the Buddhist calendar, and that the founders incorporated the company on 27 February 2547.

It is an investor-and-corporate site, not a store, and its structure shows that. A dark header carries the white Com7 wordmark with a green "7" and the menu: เกี่ยวกับเรา (About Us), ธุรกิจของเรา (Our Business, with a dropdown), นักลงทุนสัมพันธ์ (Investor Relations), ข่าวสารคอมเซเว่น (News), การพัฒนาอย่างยั่งยืน (Sustainability), ติดต่อเรา (Contact Us) and ร่วมงานกับเรา (Careers), plus a ไทย / English language switch with flag icons. Below it a full-width architectural render of the company's glass-and-timber headquarters under a blue sky carries the English word "WELCOME" and the Thai line "ยินดีต้อนรับสู่…คอมเซเว่น" in white, as part of the banner artwork. A short company-profile block under the heading "ธุรกิจของคอมเซเว่น" (Com7's business) follows, then a three-by-two grid of photographic tiles, a green stock-price panel, a sustainability section, a careers block, an omnichannel shopping block that links to Studio7 and BNN.in.th, and a black footer. The tone is formal Thai corporate copy.

The measured desktop page is 1280px wide and 4130px tall. The extractor hid a popup scrim (`pum-16898`, a Popup Maker overlay) before measuring; it is not documented here.

## Colors

- **Canvas — `#ffffff`** (the body role) and **page-largest — `#faf9fa`**, the largest background area by weight (1060). The page reads as white with a very slightly warm off-white section background.
- **Ink — `#000000`.** All running text and headings on light areas (1321 weighted characters); also the footer fill (area weight 526). White text is the other half of the page (1066 characters): the header, the tile captions, the stock panel and the footer.
- **Primary — `#44c767`.** The fill of the "ดูเพิ่มเติม" (View more) buttons (area weight 15), with white `#ffffff` labels.
- **Brand green deep — `#3fb02c`** (area weight 222): the share-price panel that spans the page, with white text.
- **Overlay — `#00000080`** (50% black, area weight 108): a measured translucent black background area; the photographic tiles in the capture carry a dark gradient under their white captions.
- **Hairline — `#b7b7b7`**, the only measured border color (1 border).

The page is built on a WordPress block theme, whose global styles declare preset colors: `--wp--preset--color--primary: #9DFF20`, `secondary: #274A45`, `tertiary: #F6F6F6`, `contrast: #000000`, `base: #ffffff`, plus the WordPress default set (vivid purple, vivid red, cyan-bluish-gray and so on). The lime `#9DFF20` and the dark green `#274A45` appear in the declared palette but not in any measured role on the home page, so they are noted here and not used as tokens; the measured action green is `#44c767`.

## Typography

Two families are in use. **Noto Sans Thai** is the web font (the loaded-font record lists weights 100, 200, 300, 400, 600 and 700) and carries 2094 of the measured characters; the theme sets it as `--font-base` and `--font-input`. **Sukhumvit Set** is named in the theme's global styles (`h1…h6 { font-family: Sukhumvit Set; font-weight: 400; line-height: 1.4 }`, links, buttons) and was measured on 293 characters, but it is not in the page's loaded-font record, so no web-font file for it was measured. Noto Sans Thai, which the page loads, is the in-system substitute.

Measured roles:

- **Section heading** — Noto Sans Thai 20px / 700, line-height 28px, uppercase transform (the "ธุรกิจของคอมเซเว่น" and "ความยั่งยืน" headings); on mobile it is the same 20px / 700 with 20px of left padding.
- **Body** — Noto Sans Thai 16px / 400, line-height 25.6px, black; on mobile the paragraph measures 14.1589px with line-height 22.6542px.
- **Button** — Sukhumvit Set 14px / 400, line-height 22.4px.
- **Navigation** — Sukhumvit Set 16px / 400 for the link role (its measured line-height is 0px); the header role itself measures Noto Sans Thai 16px / 400 with line-height 25.6px.
- **Tile captions** — English labels (Retail, B2B, Service, Online, Insurance, Distributor) in bold white with a Thai subtitle beneath, as shown in the capture.
- **Size distribution** — by weighted characters: 16px (1147), 14px (568), 12px (305), 18px (238), 24px (53), 30px (51) and 20px (18); the capture shows large numerals in the green panel, and 30px and 24px are the measured larger sizes.

Measured weights are 400 (1986 characters), 700 (223), 200 (127), 300 (41) and 600 (10). The theme also bundles DM Sans, IBM Plex Mono, Inter and Source Serif files, which are not used for measured text on the home page.

## Layout

The layout is a centered 1200px column (measured heading and paragraph blocks are 1200px wide, and the header and footer content width is 1200px and 1265px), with full-bleed imagery. The header is 86px tall on desktop (74px on a 390px viewport). The hero is a full-width image. The business grid is three tiles across and two down, each a photograph with a dark gradient at the bottom, a bold English title and a Thai subtitle at the lower left. The stock panel is a rounded green rectangle across the content width, over a dark city-and-chart banner, with five columns: "SET : COM7", latest price, change, volume and value, plus an update stamp. The sustainability section centers its heading and a two-line paragraph above three image cards, each with a white caption and a green "ดูเพิ่มเติม" button. The footer is 416px tall.

Measured paddings are 10px (22), 8px (12), 20px (11), 60px (7), 30px (6), 50px, 32px, 5px, 21px and 2px. Density is moderate, with a lot of Thai paragraph text set at 16px and generous white space between sections.

## Elevation & Depth

No box-shadow was recorded on any rendered element, and only one border color was measured. Depth comes from photography, the dark gradients on tiles and the strong color block of the green stock panel. The theme's global styles declare shadow presets (for example `6px 6px 0px -3px rgb(255, 255, 255), 6px 6px rgb(0, 0, 0)`), but their use on the home page was not measured.

## Shapes

Shapes are almost square. Buttons use a 2px radius (5 measured occurrences) and the one other measured radius is 10px (1 occurrence). The theme's button rule sets `border-radius: 0` for the WordPress button element, and the measured "ดูเพิ่มเติม" link overrides it with 2px. The photographic tiles are square-cornered rectangles flush against one another; the stock panel has softly rounded corners in the capture.

## Components

- **Primary button (`button-primary`).** "ดูเพิ่มเติม": `#44c767` fill, white label in Sukhumvit Set 14px / 400 with line-height 22.4px, 2px radius, 5px 21px padding, 32px tall and 93px wide.
- **Header (`nav`).** White text on a dark header band; the links underline on hover (measured: text decoration changes from none to underline, color stays white).
- **Language switch.** "ไทย" and "English" with small flag icons, stacked at the right of the header.
- **Business tile (`business-tile`).** Photograph with a dark lower gradient, white bold English title, white Thai subtitle; the measured `#00000080` area is recorded as `overlay`.
- **Stock panel (`stock-panel`).** `#3fb02c` fill, white text, "SET : COM7" in bold, the price and change figures, and an update note ("ราคาอัพเดททุก 15 นาที", prices update every 15 minutes). The numbers are live data and are not part of the design.
- **Sustainability cards.** Three photographs with centered white captions (ความรับผิดชอบต่อสังคม, เพื่อสิ่งแวดล้อม, ธรรมาภิบาล) and a "ดูเพิ่มเติม" button each.
- **Footer.** `#000000` fill, white 16px Sukhumvit Set text and link columns (About Us, Vision and Mission, Message from the Chairman, Executive Structure, Awards, Our Business, News, Investor Relations, Sustainability, Contact Us, Careers), the company's Bangkok address, telephone, registration number, call-center and e-mail lines, and the copyright line "Copyright © 2016-2026 Com7 Public Company Limited."

## Design System Architecture

No public design-system documentation or brand-guideline page is linked from the home page, so no official design system is documented. The site is a custom WordPress theme: assets are served from `/wp-content/themes/comseven/` (bundled fonts under `assets/fonts/`: DM Sans, IBM Plex Mono, Inter, Source Serif) with plugins for multilingual content, Smart Slider 3, a carousel, Contact Form 7 and Popup Maker. The page was read at https://www.comseven.com/th/. The system is the WordPress theme.json global-styles layer: preset custom properties (`--wp--preset--color--*`, `--wp--preset--font-size--*` with fluid `clamp()` values such as `--wp--preset--font-size--small: clamp(0.875rem, 0.875rem + ((1vw - 0.2rem) * 0.227), 1rem)`, `--wp--preset--font-family--*`), a theme-level `--font-base: Noto Sans Thai`, and element rules for headings, links and buttons. Because the editor styles also load WordPress admin variables (`--wpds-*`, `--wp-admin-theme-color`), the extraction's root-variable list includes many non-brand values; they were not used.

## Do's and Don'ts

Do:
- Keep the page white (`#ffffff` or `#faf9fa`) with black text and a black footer.
- Use `#44c767` with a white label for "ดูเพิ่มเติม" buttons, and `#3fb02c` for the investor price panel.
- Set Thai text in Noto Sans Thai at 16px / 25.6px and controls in Sukhumvit Set 14px.
- Darken the lower part of tile photographs and put bold white titles on them.
- Keep corners nearly square (2px).

Don't:
- Don't use the theme's lime `#9DFF20` or the WordPress default palette as brand colors; they are not measured in any role.
- Don't add shadows or borders; none are measured.
- Don't use bold Thai text for body copy: bold (700) is measured only for headings and tile titles.
- Don't copy live stock figures into a design; they come from a data feed.
- Don't document the Popup Maker overlay as UI.

## Responsive Behavior

Measured at 390px wide: the section heading stays 20px / 700 with 20px of left padding in a 375px-wide block; the company paragraph measures 14.1589px / 400 (line-height 22.6542px) with 20px 20px 0 padding in a 246px-tall block; the "ดูเพิ่มเติม" button keeps its 93px by 32px size, 2px radius and `#44c767` fill; the header is 74px tall and its text lists "ไทย" and "English" at 14.3185px. Character-weighted sizes on mobile are 14.1589px, 14px, 18px, 12px, 16px, 24px, 28px and 16.1589px.

Declared in the page's inline CSS: `@media (min-width:782px)` (6 rules), `@media (min-width:600px)`, `@media screen and (max-width: 600px)`, `@media screen and (max-width: 960px)`, `@media screen and (max-width: 1024px)`, and an orientation rule for `(orientation: landscape) and (max-width: 900px)` or `(orientation: portrait) and (max-width: 700px)`. How the menu and the tile grid reflow was not measured. Dark mode was not measured.

## Iteration Guide

1. Set a white page with black text; use `#faf9fa` for alternate section backgrounds.
2. Use Noto Sans Thai: 20px / 700 uppercase headings, 16px / 25.6px body; use Sukhumvit Set 14px for buttons.
3. Build the action button as `#44c767` with a white label, 2px radius, 5px 21px padding.
4. Build the business grid as 3 by 2 photographs with a dark lower gradient and bold white titles.
5. Put one green (`#3fb02c`) investor panel between the grid and the sustainability section.
6. Verify with `node web/scripts/verify-designs.mjs --slug=comseven`.
