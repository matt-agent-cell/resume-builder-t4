import { Message, ResumeData, VaultItem } from "./types";

export const mockMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hey! I'm your resume builder. I've pulled in your career vault — you've got 8 years of product design experience across 3 companies. What are we building today?",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "2",
    role: "user",
    content:
      "I want to apply for this Senior Product Designer role at Stripe. Can you tailor my resume for it?",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "3",
    role: "assistant",
    content:
      "On it. I've analyzed the Stripe job posting and matched it against your vault. Here's what I'm thinking:\n\n**Strong matches:**\n- Design systems experience at Figma → directly relevant\n- Cross-functional collaboration → they emphasize this heavily\n- Data-informed design → your A/B testing work at Teal\n\n**Gaps to address:**\n- They want payments/fintech experience — I'll reframe your e-commerce work at Shopify to highlight payment flows\n- They mention accessibility — I'll pull in your WCAG compliance work\n\nI've drafted a tailored resume. Take a look at the preview and let me know what you'd like to adjust.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "4",
    role: "user",
    content: "This looks great. Can you make the summary more concise? And swap the bullet about the onboarding redesign with the checkout flow project.",
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: "5",
    role: "assistant",
    content:
      "Done — tightened up the summary to 2 sentences and swapped in the checkout flow project. That bullet now reads:\n\n*\"Led end-to-end redesign of checkout flow serving 2M+ monthly transactions, reducing cart abandonment by 18% through iterative usability testing and data-driven design decisions.\"*\n\nAnything else you'd like to change, or ready to export?",
    timestamp: new Date(Date.now()),
  },
];

export const mockResume: ResumeData = {
  name: "Alex Chen",
  title: "Senior Product Designer",
  email: "alex.chen@email.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  summary:
    "Product designer with 8 years of experience building user-centered digital products at scale. Specialized in design systems, complex workflows, and data-informed iteration.",
  experience: [
    {
      id: "exp1",
      company: "Teal HQ",
      title: "Senior Product Designer",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      bullets: [
        "Led design for AI-powered job search features serving 4M+ users, increasing job match engagement by 32%",
        "Built and maintained component library used across 5 product teams, reducing design-to-dev handoff time by 40%",
        "Designed conversational AI onboarding flow that improved new user activation by 24%",
      ],
    },
    {
      id: "exp2",
      company: "Figma",
      title: "Product Designer",
      location: "San Francisco, CA",
      startDate: "2020",
      endDate: "2023",
      bullets: [
        "Designed core design systems features used by 4M+ designers worldwide",
        "Led end-to-end redesign of checkout flow serving 2M+ monthly transactions, reducing cart abandonment by 18%",
        "Established accessibility standards and WCAG 2.1 AA compliance across the product suite",
      ],
    },
    {
      id: "exp3",
      company: "Shopify",
      title: "Product Designer",
      location: "Toronto, ON",
      startDate: "2017",
      endDate: "2020",
      bullets: [
        "Designed merchant-facing payment and checkout experiences processing $5B+ annually",
        "Led cross-functional team of 8 to ship redesigned storefront editor, adopted by 200K+ merchants",
        "Conducted 50+ user research sessions to inform product strategy for international expansion",
      ],
    },
  ],
  education: [
    {
      id: "edu1",
      school: "Rhode Island School of Design",
      degree: "BFA",
      field: "Graphic Design",
      graduationDate: "2017",
    },
  ],
  skills: [
    "Figma",
    "Design Systems",
    "Prototyping",
    "User Research",
    "Usability Testing",
    "A/B Testing",
    "Accessibility (WCAG)",
    "HTML/CSS",
    "React (basic)",
    "Data Analysis",
  ],
};

export const mockVaultItems: VaultItem[] = [
  {
    id: "v1", type: "experience", label: "Senior Product Designer", detail: "Teal HQ · 2023–Present",
    dateRange: "2023–Present", location: "Remote",
    description: "Leading product design for AI-powered career tools serving 4M+ users.",
    bullets: [
      "Led design for AI-powered job search features, increasing job match engagement by 32%",
      "Built and maintained component library used across 5 product teams, reducing design-to-dev handoff time by 40%",
      "Designed conversational AI onboarding flow that improved new user activation by 24%",
    ],
    tags: ["AI/ML", "Design Systems", "B2C"],
  },
  {
    id: "v2", type: "experience", label: "Product Designer", detail: "Figma · 2020–2023",
    dateRange: "2020–2023", location: "San Francisco, CA",
    description: "Designed core product features for the world's leading collaborative design tool.",
    bullets: [
      "Designed core design systems features used by 4M+ designers worldwide",
      "Led end-to-end redesign of checkout flow serving 2M+ monthly transactions, reducing cart abandonment by 18%",
      "Established accessibility standards and WCAG 2.1 AA compliance across the product suite",
    ],
    tags: ["Design Tools", "Accessibility", "B2B"],
  },
  {
    id: "v3", type: "experience", label: "Product Designer", detail: "Shopify · 2017–2020",
    dateRange: "2017–2020", location: "Toronto, ON",
    description: "Designed merchant-facing commerce experiences for one of the largest e-commerce platforms.",
    bullets: [
      "Designed merchant-facing payment and checkout experiences processing $5B+ annually",
      "Led cross-functional team of 8 to ship redesigned storefront editor, adopted by 200K+ merchants",
      "Conducted 50+ user research sessions to inform product strategy for international expansion",
    ],
    tags: ["E-commerce", "Payments", "International"],
  },
  {
    id: "v4", type: "education", label: "BFA in Graphic Design", detail: "Rhode Island School of Design · 2017",
    dateRange: "2013–2017", location: "Providence, RI",
    description: "Bachelor of Fine Arts with a focus on graphic design, typography, and visual systems.",
    tags: ["Design", "Typography", "Visual Systems"],
  },
  {
    id: "v5", type: "skill", label: "Figma", detail: "Expert · 8 years",
    description: "Advanced prototyping, design systems, component architecture, auto-layout, variables.",
  },
  {
    id: "v6", type: "skill", label: "Design Systems", detail: "Expert · 6 years",
    description: "Built and maintained component libraries at Teal and Figma. Token-based theming, documentation.",
  },
  {
    id: "v7", type: "skill", label: "User Research", detail: "Advanced · 5 years",
    description: "Qualitative interviews, usability testing, surveys, journey mapping, persona development.",
  },
  {
    id: "v8", type: "skill", label: "Prototyping", detail: "Expert · 7 years",
    description: "High-fidelity interactive prototypes in Figma, Framer, and code (React).",
  },
  {
    id: "v9", type: "project", label: "Checkout Flow Redesign", detail: "Figma · Reduced cart abandonment 18%",
    description: "End-to-end redesign of the checkout experience, from cart review to payment confirmation.",
    bullets: [
      "Conducted competitive analysis of 12 checkout flows across SaaS and e-commerce",
      "Ran 8 usability testing sessions to validate design decisions",
      "Reduced cart abandonment by 18% and increased conversion rate by 12%",
    ],
    tags: ["UX Design", "A/B Testing", "Conversion"],
  },
  {
    id: "v10", type: "project", label: "AI Job Search Features", detail: "Teal HQ · 4M+ users",
    description: "Designed the AI-powered job matching and search experience for Teal's main product.",
    bullets: [
      "Created matching algorithm visualization that increased user trust by 28%",
      "Designed conversational search filters reducing time-to-relevant-jobs by 45%",
    ],
    tags: ["AI/ML", "Search", "Product Design"],
  },
  {
    id: "v11", type: "certification", label: "WCAG 2.1 Accessibility", detail: "Completed 2021",
    description: "Comprehensive certification covering WCAG 2.1 AA standards for web accessibility.",
  },
  {
    id: "v12", type: "project", label: "Storefront Editor Redesign", detail: "Shopify · 200K+ merchants",
    description: "Major redesign of Shopify's storefront editor, the primary tool merchants use to customize their online stores.",
    bullets: [
      "Led cross-functional team of 8 through discovery, design, and launch",
      "Adopted by 200K+ merchants within first 6 months",
      "Reduced merchant support tickets for storefront customization by 35%",
    ],
    tags: ["E-commerce", "Editor", "Cross-functional"],
  },
];

export const mockSavedResumes = [
  {
    id: "r1",
    company: "Stripe",
    role: "Senior Product Designer",
    lastEdited: "2 hours ago",
    matchScore: 92,
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "r2",
    company: "Figma",
    role: "Design Lead",
    lastEdited: "3 days ago",
    matchScore: 87,
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "r3",
    company: "Notion",
    role: "Senior Product Designer",
    lastEdited: "1 week ago",
    matchScore: 78,
    color: "bg-stone-100 text-stone-700",
  },
];
