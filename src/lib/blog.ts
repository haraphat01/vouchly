export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; text: string }
  | { type: 'cta'; heading: string; text: string; label: string; href: string }

export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string // ISO date
  updatedAt: string
  readingTime: string
  category: string
  keywords: string[]
  content: ContentBlock[]
}

export const posts: BlogPost[] = [
  // ─── POST 1 ──────────────────────────────────────────────────────────────────
  {
    slug: 'best-testimonial-software-small-business',
    title: 'Best Testimonial Software for Small Businesses in 2025',
    description:
      'Comparing the top testimonial collection tools for small businesses — features, pricing, and which one actually helps you convert visitors into customers.',
    publishedAt: '2025-03-10',
    updatedAt: '2025-04-01',
    readingTime: '9 min read',
    category: 'Buyer Guide',
    keywords: [
      'best testimonial software',
      'testimonial software small business',
      'testimonial collection tool',
      'customer testimonial platform',
      'social proof software',
    ],
    content: [
      {
        type: 'p',
        text: 'If you run a small business, you already know that customer reviews and testimonials are some of the most powerful sales tools you have. Studies consistently show that 92% of consumers read reviews before making a purchase — and that number climbs even higher for service businesses. But knowing testimonials matter and actually having a reliable system to collect, manage, and display them are two different things.',
      },
      {
        type: 'p',
        text: 'In 2025, there are more testimonial software options than ever before — but most are built for enterprise teams with enterprise budgets. This guide cuts through the noise and focuses specifically on tools that work well for small businesses: easy to set up, affordable, and designed to get results fast.',
      },
      {
        type: 'h2',
        text: 'What to Look for in Testimonial Software',
      },
      {
        type: 'p',
        text: "Before we compare tools, here's what matters most when you're a small business owner choosing testimonial software:",
      },
      {
        type: 'ul',
        items: [
          'Simple setup — you should be collecting testimonials within an hour, not a week',
          'Branded collection forms — your customers see your name, not the software company\'s',
          'Multiple formats — text testimonials are standard, but video testimonials convert 2–3× better',
          'Easy embedding — a single script tag or copy-paste widget, no developer required',
          'Pricing that scales — you shouldn\'t need a $300/month enterprise plan to get started',
          'AI assistance — writing clean, specific testimonials from raw customer feedback is hard; AI polish saves time',
        ],
      },
      {
        type: 'h2',
        text: 'The Top Testimonial Software Options in 2025',
      },
      {
        type: 'h3',
        text: '1. Vouchly — Best Overall for Small Businesses',
      },
      {
        type: 'p',
        text: 'Vouchly is purpose-built for small business owners who want a professional testimonial system without the enterprise overhead. You create a branded collection space, share a link with your customers, and collect both text and video testimonials. The AI rewriter turns vague responses like "great service!" into compelling, specific stories that actually convince prospects.',
      },
      {
        type: 'ul',
        items: [
          'Collect text and video testimonials from a single link',
          'AI-powered rewriter turns weak testimonials into high-converting copy',
          'Embeddable testimonial wall with a single script tag',
          'Remove Vouchly branding on paid plans',
          'Free plan available (up to 5 testimonials)',
          'Starter plan at $19/month — affordable for solo operators',
        ],
      },
      {
        type: 'p',
        text: 'Best for: Consultants, coaches, agencies, SaaS founders, and service businesses who want to go from "we have no testimonials" to "our homepage converts" in under a day.',
      },
      {
        type: 'h3',
        text: '2. Testimonial.to — Good for Video-First Teams',
      },
      {
        type: 'p',
        text: 'Testimonial.to pioneered the "share a link, collect a video" format and still does it well. If video is your primary format and you want a polished collection UX, it\'s worth considering. The downside is pricing — even basic features require a paid plan, and there\'s no AI assistance for written testimonials.',
      },
      {
        type: 'ul',
        items: [
          'Strong video testimonial collection UX',
          'Wall of love widget',
          'No free tier with meaningful limits',
          'No AI rewriting or polishing',
          'Starts at $50/month for most features',
        ],
      },
      {
        type: 'h3',
        text: '3. Boast.io — Good for Enterprises, Overkill for Most SMBs',
      },
      {
        type: 'p',
        text: 'Boast.io offers deep customization and integrations that large marketing teams will appreciate. But for a small business owner who just needs testimonials on their homepage, it\'s expensive and complex to configure. Plans start at $50/month and quickly climb with add-ons.',
      },
      {
        type: 'h3',
        text: '4. Senja — Solid Free Tier, Limited Display Options',
      },
      {
        type: 'p',
        text: "Senja has a generous free tier and makes collecting testimonials straightforward. The display widgets are functional but limited — you won't get the clean, customizable wall of love format that higher-converting landing pages rely on. Importing from Google and Trustpilot is a strength.",
      },
      {
        type: 'h2',
        text: 'Comparison Table',
      },
      {
        type: 'ul',
        items: [
          'Vouchly: Free plan + $19/mo — text & video, AI rewriter, embeddable wall, custom branding',
          'Testimonial.to: From $50/mo — strong video UX, wall widget, no AI, no free tier',
          'Boast.io: From $50/mo — enterprise-grade, complex setup, high cost',
          'Senja: Free + paid tiers — easy collection, limited display, no AI',
        ],
      },
      {
        type: 'h2',
        text: 'Our Recommendation',
      },
      {
        type: 'p',
        text: "For the vast majority of small businesses — freelancers, agencies, coaches, SaaS startups — Vouchly is the right starting point. You can collect your first testimonials for free, and the $19/month Starter plan unlocks AI polish and unlimited testimonials before you've spent what you'd pay on a single paid ad.",
      },
      {
        type: 'p',
        text: 'The single biggest mistake small business owners make with testimonials is waiting — waiting for the right tool, the right moment, the right amount of reviews. Start collecting today, and let the system do the work.',
      },
      {
        type: 'cta',
        heading: 'Start collecting testimonials for free',
        text: 'No credit card. Set up your first collection space in under 5 minutes.',
        label: 'Get started free',
        href: '/auth/signup',
      },
    ],
  },

  // ─── POST 2 ──────────────────────────────────────────────────────────────────
  {
    slug: 'how-to-collect-customer-testimonials',
    title: 'How to Collect Customer Testimonials That Actually Convert (Step-by-Step)',
    description:
      'A practical, step-by-step guide to collecting customer testimonials that build trust and drive conversions — including the exact ask timing, questions to use, and how to display them.',
    publishedAt: '2025-03-24',
    updatedAt: '2025-04-05',
    readingTime: '11 min read',
    category: 'How-To Guide',
    keywords: [
      'how to collect customer testimonials',
      'collect testimonials',
      'get customer testimonials',
      'testimonial request email',
      'asking for customer reviews',
    ],
    content: [
      {
        type: 'p',
        text: 'The difference between a business that has a homepage full of powerful testimonials and one with none isn\'t luck — it\'s a system. Most business owners know they should be collecting testimonials but never do it consistently because they don\'t have a repeatable process. This guide changes that.',
      },
      {
        type: 'p',
        text: "We'll walk through exactly when to ask, what to say, what questions produce the best testimonials, and how to display them so they actually move the needle for your business.",
      },
      {
        type: 'h2',
        text: 'Why Most Testimonials Are Useless (and How to Fix It)',
      },
      {
        type: 'p',
        text: '"Great service, highly recommend!" — if your testimonials read like this, they\'re not converting anyone. Generic praise sounds like noise to potential customers. The testimonials that convert are specific, story-driven, and outcome-focused. They describe a before state, an after state, and name the specific thing that made the difference.',
      },
      {
        type: 'callout',
        text: 'Weak: "Loved working with them. Very professional." — Strong: "Before using Vouchly, I had zero social proof on my site. Within two weeks of sharing my collection link, I had 14 genuine testimonials. My conversion rate on the pricing page went from 1.8% to 4.3%."',
      },
      {
        type: 'p',
        text: 'The goal of your testimonial collection system is to make it easy for customers to tell that second kind of story — even if they\'d naturally write the first kind.',
      },
      {
        type: 'h2',
        text: 'Step 1: Identify the Right Moment to Ask',
      },
      {
        type: 'p',
        text: "Timing is the most important variable in testimonial collection. Ask too early and the customer hasn't seen results yet. Ask too late and their enthusiasm has faded. The right moment is immediately after a customer experiences a win.",
      },
      {
        type: 'ul',
        items: [
          'Service businesses: Right after project completion or when you deliver the final result',
          'SaaS products: After a customer hits their first meaningful milestone (first report, first sale, first integration)',
          'E-commerce: 7–14 days after delivery, once they\'ve had time to use the product',
          'Coaches and consultants: At the end of a successful engagement or when a client reports a breakthrough',
        ],
      },
      {
        type: 'p',
        text: 'Set a reminder or automation for each of these moments. The ask should be personal and timely, not a mass email blast.',
      },
      {
        type: 'h2',
        text: 'Step 2: Choose the Right Channel for the Ask',
      },
      {
        type: 'p',
        text: "Email is the most reliable channel for testimonial requests because it gives customers something to reference and respond to on their own time. Direct messages (LinkedIn, Slack, WhatsApp) work especially well for personal client relationships. For SaaS products, an in-app prompt at the right moment can also be highly effective.",
      },
      {
        type: 'h3',
        text: 'The Testimonial Request Email That Actually Gets Replies',
      },
      {
        type: 'p',
        text: 'Keep it short. Personalize the opening. Make the ask clear. Provide a direct link. Here\'s a template that consistently generates strong response rates:',
      },
      {
        type: 'callout',
        text: 'Subject: Quick question (2 minutes)\n\nHi [First Name],\n\nReally glad [specific result you helped them achieve]. It\'s been great working with you.\n\nIf you have 2 minutes, I\'d love a short testimonial I can share on my site. I created a quick form that guides you through a few prompts — takes about 90 seconds:\n\n[YOUR VOUCHLY LINK]\n\nNo pressure at all — only if you\'re happy to!\n\nThanks, [Your Name]',
      },
      {
        type: 'h2',
        text: 'Step 3: Ask the Right Questions',
      },
      {
        type: 'p',
        text: "The questions you ask in your collection form determine the quality of testimonials you get. Open-ended questions like \"What did you think?\" produce vague answers. Specific, structured questions produce specific, usable answers.",
      },
      {
        type: 'ul',
        items: [
          'What was your main challenge or goal before working with us?',
          'What specific result or outcome did you experience?',
          'What surprised you most about [product/service]?',
          'Who would you recommend this to, and why?',
          'What would you say to someone who is on the fence about signing up?',
        ],
      },
      {
        type: 'p',
        text: "You don't need all five questions. Two to three well-chosen questions produce better testimonials than a long survey that customers abandon halfway through.",
      },
      {
        type: 'h2',
        text: 'Step 4: Polish the Response (with AI)',
      },
      {
        type: 'p',
        text: "Even with great questions, some customers will write in fragments, miss context, or bury the best insight at the end. AI rewriting tools can take a raw response and restructure it into a clear, compelling testimonial — without changing the meaning or making it feel fake.",
      },
      {
        type: 'p',
        text: "The key is to use AI as a polish step, not a replacement. You're still using the customer's words and their real experience — you're just making the presentation tighter. Always get the customer's approval before publishing an edited version.",
      },
      {
        type: 'h2',
        text: 'Step 5: Display Testimonials Where They Do the Most Work',
      },
      {
        type: 'p',
        text: 'Collecting testimonials is only half the job. Where you display them matters enormously. The highest-converting placements are:',
      },
      {
        type: 'ul',
        items: [
          'Homepage hero section or directly below it',
          'Pricing page (next to each plan or just above the CTA)',
          'Sales landing pages for specific services or products',
          'Email sequences for leads who haven\'t converted yet',
          'Case study pages for high-consideration purchases',
        ],
      },
      {
        type: 'h2',
        text: 'Step 6: Build Consistency Into Your Process',
      },
      {
        type: 'p',
        text: "The businesses with the best testimonials don't have one great testimonial — they have 20 good ones. Consistency matters. Add a testimonial request to every project completion checklist. Automate the ask at the right moment in your product. Make it a standing weekly task to follow up with recent customers.",
      },
      {
        type: 'p',
        text: 'A system that collects one testimonial per week will give you 52 social proof assets per year. That compounds.',
      },
      {
        type: 'cta',
        heading: 'Ready to build your testimonial system?',
        text: 'Create your first collection space in 5 minutes. Free to start, no credit card required.',
        label: 'Start collecting testimonials',
        href: '/auth/signup',
      },
    ],
  },

  // ─── POST 3 ──────────────────────────────────────────────────────────────────
  {
    slug: 'add-testimonial-wall-to-website',
    title: 'How to Add a Testimonial Wall to Your Website in 5 Minutes (No Code)',
    description:
      'Learn how to embed a beautiful, live testimonial wall on any website — WordPress, Webflow, Squarespace, or custom HTML — using a single script tag. No developer required.',
    publishedAt: '2025-04-01',
    updatedAt: '2025-04-08',
    readingTime: '7 min read',
    category: 'Tutorial',
    keywords: [
      'add testimonial wall to website',
      'embed testimonials website',
      'testimonial wall website',
      'how to display testimonials on website',
      'testimonial widget website',
    ],
    content: [
      {
        type: 'p',
        text: "You've collected great testimonials from your customers. Now you need to actually show them on your website in a way that looks polished and builds trust — not a clunky copy-paste of quotes into a Word doc style layout.",
      },
      {
        type: 'p',
        text: 'A testimonial wall (also called a "wall of love") is a grid or masonry display of multiple testimonials that gives visitors a stream of social proof at a glance. Done right, it\'s one of the highest-converting elements you can add to a homepage or pricing page. This tutorial shows you exactly how to add one — in minutes, without writing code.',
      },
      {
        type: 'h2',
        text: 'What Is a Testimonial Wall?',
      },
      {
        type: 'p',
        text: 'A testimonial wall is a dynamically displayed collection of customer reviews or testimonials, usually in a grid or masonry layout with profile photos, names, roles, and star ratings. Unlike a static quote block, a testimonial wall can show 6, 10, or 20+ testimonials at once and update automatically when you add new ones.',
      },
      {
        type: 'p',
        text: 'The visual density of a wall sends a powerful signal: this business has many happy customers. A single quote on your homepage is a data point; a wall of 15 testimonials is a social movement.',
      },
      {
        type: 'h2',
        text: 'Step 1: Collect Your Testimonials',
      },
      {
        type: 'p',
        text: "Before you can display a testimonial wall, you need testimonials to show. If you're starting from zero:",
      },
      {
        type: 'ol',
        items: [
          'Sign up for Vouchly (free)',
          'Create a collection space with your brand name and logo',
          'Share the collection link with your 5–10 happiest customers via email',
          'Wait 48 hours — most customers respond within a day if you time the ask right',
        ],
      },
      {
        type: 'p',
        text: 'If you already have testimonials from emails, DMs, or Google reviews, you can import those manually or use the import feature.',
      },
      {
        type: 'h2',
        text: 'Step 2: Customize Your Wall',
      },
      {
        type: 'p',
        text: "In your Vouchly dashboard, open your collection space and navigate to the Wall settings. Here you can:",
      },
      {
        type: 'ul',
        items: [
          'Choose which testimonials to feature (or auto-show all approved ones)',
          'Select layout: grid, masonry, or carousel',
          'Set the color scheme to match your brand',
          'Hide or show star ratings, dates, and profile photos',
          'Remove Vouchly branding (Starter plan and above)',
        ],
      },
      {
        type: 'h2',
        text: 'Step 3: Copy the Embed Code',
      },
      {
        type: 'p',
        text: 'Once your wall looks the way you want it, click "Embed" in the dashboard. You\'ll see a snippet like this:',
      },
      {
        type: 'callout',
        text: '<div id="vouchly-wall" data-space-id="your-space-id"></div>\n<script src="https://vouchly.app/embed.js" defer></script>',
      },
      {
        type: 'p',
        text: "That's it. That's the entire embed code. Copy it — you'll paste it wherever you want the wall to appear on your site.",
      },
      {
        type: 'h2',
        text: 'Step 4: Add the Wall to Your Website',
      },
      {
        type: 'h3',
        text: 'WordPress',
      },
      {
        type: 'p',
        text: 'In the WordPress block editor, add a "Custom HTML" block wherever you want the testimonial wall to appear (your homepage, a landing page, or your pricing page). Paste the embed code into the block. Save and publish. Done.',
      },
      {
        type: 'h3',
        text: 'Webflow',
      },
      {
        type: 'p',
        text: 'In the Webflow Designer, drag an "Embed" element onto your page from the Add panel. Double-click it, paste the embed code, and click Save & Close. Publish your site.',
      },
      {
        type: 'h3',
        text: 'Squarespace',
      },
      {
        type: 'p',
        text: 'Add a Code Block to your page, paste the embed code, and save. Note that Squarespace Personal plans may restrict custom code — you\'ll need a Business plan or above.',
      },
      {
        type: 'h3',
        text: 'Custom HTML / Any Other Site',
      },
      {
        type: 'p',
        text: "Paste the embed code directly into your page's HTML at the location where you want the wall to appear. The script loads asynchronously so it won't affect your page load speed.",
      },
      {
        type: 'h2',
        text: 'Step 5: Verify It\'s Live',
      },
      {
        type: 'p',
        text: 'Load your page in an incognito window and confirm the testimonial wall is rendering correctly. Check on mobile too — the wall should be fully responsive. If testimonials aren\'t showing, make sure the space ID in the embed code matches the one in your Vouchly dashboard.',
      },
      {
        type: 'h2',
        text: 'Best Practices for Your Testimonial Wall',
      },
      {
        type: 'ul',
        items: [
          'Place it above the fold on your pricing page — this is where it converts best',
          'Feature 8–16 testimonials for the right density; too few looks sparse, too many becomes overwhelming',
          'Mix text and video testimonials if you have both — video thumbnails draw the eye',
          'Prioritize testimonials that mention specific results, numbers, or outcomes',
          'Update it regularly as you collect new testimonials — a recent date next to a review adds credibility',
        ],
      },
      {
        type: 'h2',
        text: 'How a Testimonial Wall Affects Conversions',
      },
      {
        type: 'p',
        text: "Adding a testimonial wall to a pricing page typically lifts conversion rates by 20–40% when the testimonials are specific and outcome-focused. The effect is strongest for first-time visitors who don't know your brand — they're looking for evidence that other people like them have trusted you and gotten results.",
      },
      {
        type: 'p',
        text: "It's also one of the cheapest conversion improvements you can make. No paid ads. No redesign. Just showing the proof you already have.",
      },
      {
        type: 'cta',
        heading: 'Add a testimonial wall to your site today',
        text: 'Free to start. Set up your first space, collect testimonials, and embed your wall — all in under an hour.',
        label: 'Create your free space',
        href: '/auth/signup',
      },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}
