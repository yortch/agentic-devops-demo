---
target: frontend/src/pages/HomePage.jsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-06T15-42-41Z
slug: frontend-src-pages-homepage-jsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Loading, error, and recommendation states are visible; no retry or success feedback. |
| 2 | Match System / Real World | 3/4 | Familiar card terms; APR and rewards wording need context. |
| 3 | User Control and Freedom | 3/4 | Navigation is clear; recommender has no reset and Contact Us is inert. |
| 4 | Consistency and Standards | 3/4 | MUI patterns are consistent; placeholder links violate expectations. |
| 5 | Error Prevention | 2/4 | Exact card type matching silently falls back to the first card. |
| 6 | Recognition Rather Than Recall | 3/4 | Key facts are visible; comparison requires leaving the homepage. |
| 7 | Flexibility and Efficiency | 2/4 | Only three featured cards and coarse priorities are available. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean but repetitive over a long scroll. |
| 9 | Error Recovery | 2/4 | Error state offers no retry or fallback. |
| 10 | Help and Documentation | 1/4 | No APR/fee definitions; Contact Us and footer links are non-functional. |
| **Total** |  | **25/40** | **Acceptable (62.5%)** |

#### Design Specificity Verdict

Moderately specific, structurally category-interchangeable. Three Rivers branding is present through Navy/Teal, Pittsburgh, FDIC, QuickBooks, and business-card language. However, the composition remains a conventional fintech template: gradient hero, three cards, three benefits, generic icons, and no distinctive bank story, river motif, product imagery, or proof.

The deterministic detector found zero findings in `frontend/src/pages/HomePage.jsx` (exit code 0, no rules, severities, locations, or false positives). Browser automation was unavailable; HTTP checks confirmed the homepage and `/api/cards` respond successfully. No user-visible overlay is available.

#### Overall Impression

The page is clear, coherent, and approachable, with a useful recommender as its strongest moment. The biggest opportunity is to convert the clean baseline into a more trustworthy, product-specific decision experience.

#### What's Working

- Clear primary heading and comparison CTA.
- Low-friction recommender with three plain-language priorities.
- Consistent MUI component system and Navy/Teal branding.

#### Priority Issues

1. **[P1] Competing hero actions dilute conversion.** “Compare All Cards” and the recommender ask for different next steps. Make “Find my card” primary, demote comparison, and explain recommendation criteria. Suggested command: `/impeccable clarify` or `/impeccable layout`.
2. **[P1] Trust-critical links and Contact Us are non-functional.** Wire Contact Us to `mailto:`/`tel:` or a real route and replace or remove `href="#"` footer links. Suggested command: `/impeccable harden`.
3. **[P1] Recommendation can silently show the wrong card.** Exact `cardType` matching falls back to `cards[0]` while presenting the result as personalized. Use stable category identifiers and explain fallback behavior. Suggested command: `/impeccable harden`.
4. **[P2] Product proof is too thin for a financial decision.** Add decision-relevant facts and a “How to choose” explanation. Suggested command: `/impeccable clarify`.
5. **[P2] The page is visually clean but emotionally generic.** Add an authentic regional/business narrative, imagery, or proof without inventing claims. Suggested command: `/impeccable bolder`.

#### Cognitive Load

Moderate load. The hero presents two primary actions, the page asks users to choose a priority and interpret a recommendation before comparing cards, and APR/rewards/signup details are exposed without progressive disclosure. No single decision point exceeds four visible options.

#### Emotional Journey

The gradient creates energy and legitimacy; the recommender lowers entry anxiety and creates the strongest confidence moment. Dense, repetitive card details create a valley, while placeholder contact and policy links undermine trust at the finish.

#### Persona Red Flags

- **Alex (Power User):** Must navigate to `/cards` to filter and compare; repeated View Details actions create serial browsing.
- **Jordan (First-Timer):** APR, rewards rate, and “See why it fits” lack definitions or visible criteria.
- **Sam (Accessibility/Mobile):** Mobile navigation is not expanded or verified; focus and contrast states are not established by source review.

#### Minor Observations

- Ellipsis is appended even when descriptions are shorter than 150 characters.
- “Rewards: X% back” may be inaccurate for point-based cards.
- “Featured” selection is arbitrary (`cards.slice(0, 3)`).
- The small footer legal text needs adequate contrast and size.

#### Questions to Consider

- What if “Find my card” were the unmistakable primary action and comparison the expert path?
- What evidence would make “No Hidden Fees” believable before a visitor leaves?
- If the bank name and colors were removed, what would prove this belongs to Three Rivers Bank?
- Should “Keep it simple” explain whether that means no annual fee, low APR, or fewer conditions?
