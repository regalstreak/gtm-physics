# GTM Physics

**An interactive diagnostic for finding a product's natural go-to-market motion.**

[Try it live](https://www.gtmphysics.com) · [Explore the product profiles](https://www.gtmphysics.com/products/clari)

GTM Physics maps a product across twelve commercial forces, then suggests the GTM mix that best fits its shape. It is built for founders, operators, and teams who want a sharper starting point for deciding how to take a product to market.

![GTM Physics](https://www.gtmphysics.com/favicon.svg)

## What it does

- Walks through a fast, twelve-question product diagnostic
- Scores product-led, sales-led, hybrid, channel-led, content-led, and community-led motions
- Recommends a primary motion, supporting motions, and practical first moves
- Produces a compact, shareable results URL
- Lets users save the result as an image
- Compares a result with product profiles for [Clari](https://www.gtmphysics.com/products/clari), [Fathom](https://www.gtmphysics.com/products/fathom), [Notion](https://www.gtmphysics.com/products/notion), and [Clay](https://www.gtmphysics.com/products/clay)
- Provides dedicated, linkable GTM Physics pages for each reference product

## The twelve forces

| Force | What it captures |
| --- | --- |
| Solution complexity | Setup, evaluation, and implementation effort |
| Atomizability | Whether an individual can start or the organization must coordinate |
| User technical skill | A user's ability to evaluate and implement independently |
| Internal user power | A user's ability to champion or buy |
| Transaction size / LTV | Revenue potential and payback horizon |
| Category maturity | Whether the category and its budget are established |
| Urgency / pain | How mission-critical the problem is |
| Frequency of use | How often the product appears in the workflow |
| Budget ownership | How centralized the buying decision is |
| Intrinsic virality | Whether use naturally creates product exposure |
| Integration gravity | How much external setup is required before value arrives |
| Governance sensitivity | The level of security, IT, legal, and procurement involvement |

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

### Available commands

```bash
npm run dev      # Start the local development server
npm run lint     # Check the codebase with Oxlint
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Sharing

Finished diagnostics are encoded into a short `?r=` URL. Opening one of these links reconstructs the same responses and results, so it is safe to share a completed profile without a backend or account.

## Product pages

Each reference profile has a direct route:

- [`/products/clari`](https://www.gtmphysics.com/products/clari)
- [`/products/fathom`](https://www.gtmphysics.com/products/fathom)
- [`/products/notion`](https://www.gtmphysics.com/products/notion)
- [`/products/clay`](https://www.gtmphysics.com/products/clay)

## Stack

- React
- Vite
- Lucide icons
- html2canvas for result images
- Vercel for deployment

## Attribution

This project is based on [Pete Kazanjy's GTM Physics framework](https://x.com/kazanjy).

Made with ❤️ by [Neil Agarwal](https://x.com/regalstreak).

## Contributing

Ideas, corrections, and improvements are welcome. Open an issue or submit a pull request.
