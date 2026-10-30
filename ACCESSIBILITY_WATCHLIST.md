# Accessibility Watchlist — for Kimi

Source: Dime's automated audit, 10/30/2026 (axe-core 4.10.3, WCAG 2.1 A + AA, live site).
Scope: ONLY the items that need a human look. Everything else passed clean (zero violations on the homepage, product pages, products list, and the accessibility statement). Nothing below is a confirmed failure — each one is "verify by eye, fix if it misses."

## 1. Text sitting on photo or pseudo-element backgrounds — verify real contrast

The tool could not measure these because the text sits on an image or a ::before/::after background. For each: check the rendered contrast at runtime against 4.5:1 (small text) or 3:1 (large text). If it misses, raise the text color or add a subtle scrim behind the text. The design decisions stay yours.

Homepage:
- `.hero-kicker` — "Car care · Chemical Co · Thirteen Formulas" — 10px, target 4.5:1, hero photo background
- `h1` "Truth, in formulation." and `h1 > em` — 57.6px, target 3:1, hero photo background
- `.sub-desk` — the hero paragraph — 14.4px, target 4.5:1, hero photo background
- `.hero-cta .btn-ghost` ("The House Standard" button) — 10px, target 4.5:1, hero photo background
- `.home-film-content > .kicker` ("The house method") — 10px, target 4.5:1, pseudo-element background
- `#houseMethodTitle` and its `em` — 76px, target 3:1, pseudo-element background
- `.formula-directory-name` (the STRADEN / OMNI / etc. directory rows) — 13px, target 4.5:1, pseudo-element background

product.html?id=wheel:
- `.media-placeholder-copy > span` ("Product image") and `small` ("In preparation") — 9px/8px, target 4.5:1, pseudo-element background. NOTE: this slot rendered as a placeholder at audit time — please confirm the product photo is actually wired on this page.

## 2. aria-prohibited-attr — one element, product page

`<div class="service-ledger" aria-label="Shipping and customer care">` — `aria-label` on a plain `div` is ignored by screen readers (that is the flagged rule). Fix options: add `role="region"` (or `role="group"`) to the div, or drop the aria-label and reference a visible heading via `aria-labelledby`.

## 3. Decorative arrow glyphs not hidden from screen readers — tiny

Add `aria-hidden="true"` to the decorative arrow spans: `.arr` (the ↓ on the product page) and the three `.t-arrow` (→) spans in the related-formula footers. Screen readers otherwise announce them as noise. (`#qMinus` already has its aria-label and the `#ownerReviewOpen` arrow is already hidden — those are fine.)
