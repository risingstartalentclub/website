export const assets = {
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_I_IH_j952HgPLp9IT6NXIc1mPJfywpnx-lrz5YlbEzXlts1DPrSYsEgx0Cy8F7-X8Ign5tCNd_bQIp_P48DlOclMdXIrpM2xT_lbYJwhdFMubAoqsFXBF9UiXj2BrGtp0jq6tqW3m7eVdBMKnL63GUabTXrhAQEe_YZscFi-qio6Vr6olmXe4edcZ7_Wg9OOxWSLaf_glOCdBplvpTZ1YRpEfrH0dbBbVRX5wDYWW56n6hz1nor_KAYhDAACJ8FROCE",
  profile:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB_kD6hswGeKOrBN-I83hgXmtK0ed7gt7LGv5Wib_dZr4L2UTe7plru3sPkUKQlmLfs6mVxdoAGUt_Btb9-n40t8rbAl0DGwsQtuNHALr7jD9R7d5F9wpuUhkdHjlRk_oDGcRZ0FYxAnRg0OyeSABd-5TcimZHAfM5MbFjnvb62C9e0JPqAwsNYQ3sKyQp5II2wgffhCViogSavlCbfYstYhQ4LIGR155p7IkOuTfsqP28UI9dE86fk0UsolG2vqCaBJxE",
  heroStage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBI3y8VaFxLynnyZzGyeizs4I38-I7RocoLbUg1QKSp05cEXgOpR0gkPBMXAQ4gkzUk-Uf3vIpV2PKlgEwuBg4yigJGUs7C2wgAn_PT_6Rf5sNWi4SiKwsv33Ph36gHNxkUAqO3uMM26PIh0kT-TMhWm3zNcfkENMj8THhtwmXR1uOYk_pkLag6_AQGRijSUuwzdfnSiA2fZIZh2Ut4xMq0e4jHv8urY1uBiI2ZiZsdOVzY7ntHBfYa9g",
  heroThumb:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAiZJ2dCIdaGNEJj5IWQ6gGVTyFRbrDqRyGTMAwsusYD8KBN7e2wUW_oDYZh_AEVz9Vw91vwVUBOOGzVWAYY9ZIDAbhAU8GuHsGAg6tNVjTOzOQLlKm_joe9eZSAUfRNS5JHNZxyrwNkZUewLEpXV2VeTYDM412-OwK_5bXc6bYJJUdoCJxj77X8qyy4vQ4l6s_4CgyVgrCnn3NgBEYD0ZI-TETHjF99zpnjm4hTF8T56q2b-9CX8DVbg",
} as const;

export type AgeGroup = "all" | "baby" | "kids" | "teens";

export type Contest = {
  slug: string;
  title: string;
  ageGroup: Exclude<AgeGroup, "all">;
  categoryLabel: string;
  ageBadge: string;
  endsLabel: string;
  endsUrgent: boolean;
  description: string;
  reward: string;
  rewardIcon: string;
  fee: string;
  deadline: string;
  image: string;
  imageAlt: string;
};

export const ageFilters: { id: AgeGroup; label: string }[] = [
  { id: "all", label: "All Contests" },
  { id: "baby", label: "Baby & Toddler (1–3)" },
  { id: "kids", label: "Kids & Juniors (4–12)" },
  { id: "teens", label: "Teens & Youth (13–20)" },
];

export const contests: Contest[] = [
  {
    slug: "baby-toddler-festive-look",
    title: "Baby & Toddler Festive Look",
    ageGroup: "baby",
    categoryLabel: "Baby & Toddler (Ages 1-3)",
    ageBadge: "Ages 1–3 Years",
    endsLabel: "Ends in 6 Days (Oct 28)",
    endsUrgent: true,
    description:
      "Showcase your little star's cutest festive avatar, regional ethnic attire, and adorable cheerful charm.",
    reward: "₹25,000 + Golden Star Trophy",
    rewardIcon: "emoji_events",
    fee: "Free Entry",
    deadline: "Oct 28, 2025",
    image: "/contests/baby-festive.jpg",
    imageAlt: "Baby & Toddler Festive Look winner",
  },
  {
    slug: "diwali-cultural-showcase-2026",
    title: "Diwali & Cultural Showcase 2026",
    ageGroup: "kids",
    categoryLabel: "Kids & Juniors (Ages 4-12)",
    ageBadge: "Ages 4–12 Years",
    endsLabel: "Ends in 12 Days (Nov 4)",
    endsUrgent: false,
    description:
      "Celebrate cultural heritage, festive tradition, creative dance, or music. Open to passionate budding artists.",
    reward: "₹35,000 + Certificate & Medal",
    rewardIcon: "military_tech",
    fee: "Free Entry",
    deadline: "Nov 4, 2025",
    image: "/contests/diwali.jpg",
    imageAlt: "Diwali & Cultural Showcase 2026",
  },
];

export type Winner = {
  name: string;
  quote: string;
  contest: string;
  badge: string;
  badgeIcon: string;
  badgeGold: boolean;
  title: string;
  image: string;
  imageAlt: string;
};

export const winners: Winner[] = [
  {
    name: "Aarav Sharma (Age 2)",
    quote: "Beaming with natural charm and adorable festive style in the Toddler Category.",
    contest: "Toddler Festive Star Season 1",
    badge: "1st Place Winner",
    badgeIcon: "star",
    badgeGold: true,
    title: "Toddler Champion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlCNa5JT3msD4gtL3otlAPJKmzMzg7kAyP2SHxqKeUl3C8sWTooW4LyjLv0bC9KF-jG7AXSEG_hAGFNIo3OdYpqy-Ue_JB9CbNPJ4DKJ_PcstkZuyhga2wPna9LCtjYmZM0E6jSjbKmL37OCZMoMMbonF83r8BFaXnbMpNDJ6ByBnatEJbkOOHYQ8t1vwwzn7Sd6HiVHLd0mtKkUDkpAiujZpRsQuuJjZMgCpaycOvCB1R9ZQWk6hyTw",
    imageAlt: "Portrait of Aarav Sharma (Age 2)",
  },
  {
    name: "Ananya Patel (Age 12)",
    quote:
      "Recognized for graceful rhythm, dedication, and vibrant stage presence in the Junior Showcase.",
    contest: "Classical Dance Junior Champion",
    badge: "Junior Star Award",
    badgeIcon: "military_tech",
    badgeGold: false,
    title: "Junior Champion",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsr14CrhiLSB3GkBhmn_im0QmOggMHrEW8p_iblvoUgzPA9oRgfwa7u0YTCRFgArQnmnyDslYtxEvSb9Q-LVr8UzB723T7wVOqrBvL5FXoxUrOVRGdrpB9MzkzilY6OjlLSa9ILwdR9JKcVW-bztlNk5EjvXER_El0BuIt52bZllR2GiDCStrNADwc9YphYIJQC0vcLHNmFDpZ4tf0p7wxrbMlAoCleHWneSk_Nsixly4xvHCkLUwi5A",
    imageAlt: "Portrait of Ananya Patel (Age 12)",
  },
  {
    name: "Rohan Deshmukh (Age 18)",
    quote: "Awarded for inspiring visual storytelling capturing youth culture and community spirit.",
    contest: "Youth Creative Photography Award",
    badge: "Youth Choice Award",
    badgeIcon: "favorite",
    badgeGold: true,
    title: "Youth Excellence",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAna6PGz_W5YunZDWFNfHSGtrsTGUpPUSZSTphEqMA28shU0fyp7XDxU9WMoz76X_RA9xGlr9KTtliUT01v1I0PtBSYS9HDi7E0NAV2pjxmLVjmoneUbACPYZi08sy1a5rVf_FlOT590nuj22j8Ut88MmA05AmO7YITisLSvWy-ZGdbORB4Y7R1qimnlA0ZFbjhi9Oo7Zs5Wy7B6NNh79i24S-2fAkmr9SMuZrykK01kC_UZyuARe_XaA",
    imageAlt: "Portrait of Rohan Deshmukh (Age 18)",
  },
];

export const clubRegistration = {
  slug: "club-registration",
  title: "New Participant Registration",
  categoryLabel: "Youth Category (Ages 1-20)",
  reward: "Official Star Entry Badge",
  fee: "Free to Join",
  deadline: "Ongoing",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#competitions", label: "Competitions" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#winners", label: "Winners" },
  { href: "/#why-us", label: "Why Us" },
  { href: "/#contact", label: "Contact" },
] as const;
