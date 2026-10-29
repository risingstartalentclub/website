export const legalLinks = [
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/rules", label: "Competition Rules" },
  { href: "/refund", label: "Refund & Cancellation Policy" },
] as const;

export const clubContact = {
  name: "Rising Star Talent Club",
  email: "support@risingstartalentclub.com",
  website: "https://www.risingstartalentclub.com/",
};

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  closing?: string;
};

export const termsDocument: LegalDocument = {
  eyebrow: "Legal & Compliance",
  title: "Terms and Conditions",
  intro:
    "These terms apply when you use the Rising Star Talent Club website or take part in a competition. A parent or legal guardian should read them before registering a child.",
  sections: [
    {
      title: "Acceptance of Terms",
      paragraphs: [
        "By accessing our website or participating in our competitions, you agree to these Terms and Conditions. Parents or legal guardians are responsible for reviewing these terms before registering a child.",
      ],
    },
    {
      title: "Eligibility and Registration",
      paragraphs: [
        "Eligibility, age limits, registration dates, and participation requirements will be specified for each competition.",
        "A parent or legal guardian must register or represent a child and provide consent wherever required by law.",
        "Participants must provide accurate information and submit entries within the announced deadline.",
        "Registration does not guarantee selection as a winner.",
      ],
    },
    {
      title: "Competition Rules",
      paragraphs: [
        "Participants must follow the rules and submission guidelines published for each competition. Entries must be original or submitted with the necessary permissions and must not infringe another person's rights.",
        "Content that is abusive, misleading, unlawful, inappropriate for children, or unrelated to the competition may be disqualified.",
        "Rising Star Talent Club may reject entries that do not meet the published eligibility or competition requirements.",
      ],
    },
    {
      title: "Judging and Results",
      paragraphs: [
        "Entries will be evaluated according to the criteria announced for the relevant competition. The judging process and selection criteria may vary by activity.",
        "Results announced by Rising Star Talent Club will be considered final, subject to correction of genuine errors or applicable legal requirements.",
      ],
    },
    {
      title: "Prizes and Certificates",
      paragraphs: [
        "Prizes, gifts, and certificates will be provided according to the details announced for each competition. Only participants identified as eligible winners or recipients will qualify for the stated rewards.",
        "Prizes are subject to availability and any specific conditions announced before or during the competition. Any material change to a promised reward will be communicated appropriately.",
      ],
    },
    {
      title: "Photos, Videos, and Content",
      paragraphs: [
        "Parents or legal guardians are responsible for ensuring they have the necessary rights and permissions to submit a child's photograph, video, artwork, or other content.",
        "Content may be used to administer and evaluate the competition. Separate, appropriate parental or guardian permission will be obtained for promotional publication of a child's image, video, or identifying information wherever required by law.",
        "Submitting an entry does not automatically grant unlimited permission to use it for unrelated promotional purposes.",
      ],
    },
    {
      title: "Fair Participation and Disqualification",
      paragraphs: [
        "Participants must not submit false information, plagiarised work, manipulated entries that violate competition rules, or content that infringes another person's rights.",
        "Attempts to manipulate results, misuse the website, or interfere with the competition may result in disqualification.",
      ],
    },
    {
      title: "Website Use and Availability",
      paragraphs: [
        "We aim to keep our website accessible and accurate, but we cannot guarantee uninterrupted access or that the website will always be free from technical errors.",
        "We may update, maintain, or modify the website and its features when necessary.",
      ],
    },
    {
      title: "Privacy",
      paragraphs: [
        "Personal information is handled in accordance with our [Privacy Policy](/privacy). Parents and guardians should review that policy to understand how registration details, children's information, and submitted content are collected and used.",
      ],
    },
    {
      title: "Changes or Cancellation",
      paragraphs: [
        "Rising Star Talent Club may modify, postpone, or cancel a competition when reasonably necessary, including due to technical issues, insufficient participation, unforeseen circumstances, or other legitimate reasons.",
        "Where appropriate, important changes will be communicated through our website or official communication channels.",
      ],
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "To the extent permitted by applicable law, Rising Star Talent Club is not responsible for issues caused by third-party platforms, internet or device failures, or circumstances beyond our reasonable control.",
        "Nothing in these Terms excludes any liability or consumer right that cannot legally be excluded.",
      ],
    },
    {
      title: "Changes to These Terms",
      paragraphs: [
        "We may update these Terms and Conditions when our services, competition rules, or legal requirements change. The latest version will be published on this page.",
      ],
    },
    {
      title: "Governing Law",
      paragraphs: [
        "These Terms and Conditions are governed by the laws of India, subject to applicable legal rights and requirements.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "For questions about competitions, registration, or these Terms and Conditions, please contact Rising Star Talent Club at support@risingstartalentclub.com or visit https://www.risingstartalentclub.com/.",
      ],
    },
  ],
  closing:
    "We want every child to have a positive opportunity to showcase their talent in a fair, respectful, and supportive environment.",
};

export const privacyDocument: LegalDocument = {
  eyebrow: "Legal & Compliance",
  title: "Privacy Policy",
  intro:
    "This policy explains how Rising Star Talent Club handles personal information when a parent or guardian uses the website or registers a child for a competition.",
  sections: [
    {
      title: "Who this policy is for",
      paragraphs: [
        "Parents or legal guardians are responsible for reviewing this policy before registering a child. A parent or guardian manages participation for anyone under 18.",
      ],
    },
    {
      title: "Information we collect",
      paragraphs: [
        "We store the parent or guardian name, mobile number, and email used to create an account.",
        "For a child, we store the name, age, whether they are a boy or a girl, and the Instagram profile link given with an entry, together with the contest details submitted for that competition.",
        "Contact messages store the name, email, and message you send.",
      ],
    },
    {
      title: "How we use information",
      paragraphs: [
        "We use this information to run contests, send submission guidelines, manage the parent account, and reply to support requests.",
        "We do not sell personal information.",
      ],
    },
    {
      title: "Who can see an entry",
      paragraphs: [
        "Entries are visible to the signed-in member who submitted them. They are not published as a public directory.",
        "Winner profiles shown on the site are the featured honors already presented by the club.",
      ],
    },
    {
      title: "Photos, videos, and content",
      paragraphs: [
        "Parents or legal guardians are responsible for ensuring they have the necessary rights and permissions to submit a child's photograph, video, artwork, or other content.",
        "Content may be used to administer and evaluate the competition. Separate, appropriate parental or guardian permission will be obtained for promotional publication of a child's image, video, or identifying information wherever required by law.",
        "Submitting an entry does not automatically grant unlimited permission to use it for unrelated promotional purposes.",
      ],
    },
    {
      title: "Correction and deletion",
      paragraphs: [
        "Parents or guardians can ask us to correct or delete a child's account and entries by emailing support@risingstartalentclub.com or through the [contact form](/contact).",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "For questions about this Privacy Policy, contact Rising Star Talent Club at support@risingstartalentclub.com or visit https://www.risingstartalentclub.com/.",
      ],
    },
  ],
};

export const rulesDocument: LegalDocument = {
  eyebrow: "Fair Play Guidelines",
  title: "Competition Rules",
  intro:
    "These rules apply to all competitions organised by Rising Star Talent Club. By submitting an entry, parents or legal guardians agree to ensure that the participant follows these rules.",
  sections: [
    {
      title: "Genuine and Original Entries",
      paragraphs: [
        "All submissions must be genuine, original, and created by the participant, except where a competition specifically permits assistance.",
        "Fake entries, impersonation, copied work, misleading information, or manipulated submissions intended to gain an unfair advantage are not allowed.",
        "Participants must not submit another person's work as their own.",
      ],
    },
    {
      title: "AI-Generated Content",
      paragraphs: [
        "Fully AI-generated photos, videos, artwork, voices, or other submissions are not accepted as genuine participant-created entries unless the specific competition expressly allows AI-generated content.",
        "Entries created or substantially altered using AI to misrepresent a child's actual talent, performance, appearance, or original work may be disqualified.",
        "Normal editing, trimming, captions, lighting adjustments, and other permitted enhancements are acceptable unless the competition rules state otherwise.",
        "Rising Star Talent Club may request reasonable clarification or supporting information when the authenticity of an entry is in doubt.",
      ],
    },
    {
      title: "Respect for Religion and Culture",
      paragraphs: [
        "Content that deliberately insults, mocks, or promotes hatred against any religion, religious belief, deity, place of worship, or cultural community is not allowed.",
        "Entries must not encourage religious hatred, discrimination, or hostility.",
        "Participants are expected to treat all religions, cultures, and communities with respect.",
      ],
    },
    {
      title: "Appropriate and Respectful Content",
      paragraphs: [
        "Vulgar, abusive, sexually explicit, hateful, threatening, or otherwise inappropriate content is prohibited.",
        "Bullying, harassment, personal attacks, and discriminatory remarks about any individual or community are not allowed.",
        "Content must be suitable for a children's talent platform and its audience.",
      ],
    },
    {
      title: "Comments and Public Interaction",
      paragraphs: [
        "Offensive, abusive, hateful, threatening, or inappropriate comments on competition posts are prohibited.",
        "Participants, parents, and supporters must not harass others, post personal attacks, spread false accusations, or deliberately disrupt the competition.",
        "Spam, fake engagement, misleading claims, and attempts to manipulate voting or results are not allowed where relevant to the competition.",
        "Violations may result in comment removal, warnings, disqualification, or restriction from future competitions, depending on the seriousness of the conduct.",
      ],
    },
    {
      title: "Copyright and Permissions",
      paragraphs: [
        "Participants must have the necessary rights or permissions to submit photographs, videos, music, artwork, and other material.",
        "Content copied from another creator or used without required permission may be rejected.",
        "Participants must not share another person's private information, image, or video without appropriate permission.",
      ],
    },
    {
      title: "Accurate Information and Eligibility",
      paragraphs: [
        "Registration details must be accurate and complete.",
        "Participants must meet the age limits and other eligibility conditions announced for the specific competition.",
        "False age details, duplicate or fraudulent registrations, impersonation, or deliberate misrepresentation may lead to disqualification.",
      ],
    },
    {
      title: "Fair Participation",
      paragraphs: [
        "Cheating, falsifying evidence, manipulating votes, using fake accounts, or interfering with another participant's entry is prohibited.",
        "Participants must follow the submission format, deadlines, and any additional rules published for each competition.",
        "Only entries that meet the applicable requirements will be considered.",
      ],
    },
    {
      title: "Review and Disqualification",
      paragraphs: [
        "Rising Star Talent Club may review entries, request clarification, remove inappropriate content, or disqualify submissions that violate these rules.",
        "Serious or repeated violations may result in removal from the current competition or restriction from future competitions. Decisions will be based on the available information, the published rules, and the circumstances of the case.",
      ],
    },
    {
      title: "Competition-Specific Rules",
      paragraphs: [
        "Some competitions may have additional requirements relating to age, duration, format, themes, judging, voting, or submission deadlines. Those requirements must be followed alongside these universal rules.",
      ],
    },
    {
      title: "Child Safety",
      paragraphs: [
        "Parents or legal guardians are responsible for overseeing their child's participation. Entries must not expose children to unsafe activities, inappropriate situations, or unnecessary disclosure of private information.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "If you have questions about these rules or wish to report a suspected violation, contact Rising Star Talent Club at support@risingstartalentclub.com or visit https://www.risingstartalentclub.com/.",
      ],
    },
  ],
  closing:
    "Our goal is to maintain a fair, respectful, safe, and enjoyable environment where every child has the opportunity to showcase their talent.",
};

export const refundDocument: LegalDocument = {
  eyebrow: "Legal & Compliance",
  title: "Refund & Cancellation Policy",
  intro:
    "This policy explains registration fees, gifts, cancellations, and what to do if someone asks you to pay outside the official Rising Star Talent Club channels.",
  sections: [
    {
      title: "Free Competitions",
      paragraphs: [
        "Competitions advertised as free are completely free to enter. No registration fee is charged for these competitions. Participants will not be asked to pay any additional amount to participate in a free competition.",
      ],
    },
    {
      title: "Paid Competitions",
      paragraphs: [
        "Some competitions may require a registration fee. The applicable fee will be clearly mentioned before registration.",
        "Registration fees are non-refundable once registration is completed, except where a refund is required by applicable law or where Rising Star Talent Club decides otherwise.",
      ],
    },
    {
      title: "Gifts and Delivery Charges",
      paragraphs: [
        "If a competition includes gifts or prizes, the details will be announced for that competition. Rising Star Talent Club does not charge separate delivery fees for gifts or prizes unless a specific, legitimate charge is clearly disclosed in advance.",
        "If anyone asks you to pay extra money to release a gift, claim a prize, or arrange delivery without an official announcement from us, please do not make the payment. Contact us directly to verify the request.",
      ],
    },
    {
      title: "Payments Through Other Platforms",
      paragraphs: [
        "Our official website is https://www.risingstartalentclub.com/.",
        "Please rely only on payment instructions officially provided by Rising Star Talent Club. Do not send money to personal accounts, unknown payment links, or other platforms claiming to represent us unless the payment method has been verified through our official contact email.",
        "We are not responsible for payments made to unauthorised individuals or third parties, subject to applicable law.",
      ],
    },
    {
      title: "Cancellation by Rising Star Talent Club",
      paragraphs: [
        "If we cancel a paid competition, we will communicate the next steps to registered participants. Any refund or alternative arrangement will be handled in accordance with the announced competition terms and applicable law.",
      ],
    },
    {
      title: "Incorrect or Duplicate Payments",
      paragraphs: [
        "If you believe you have made an incorrect or duplicate payment, contact us with the transaction details. We will review the matter and respond appropriately.",
      ],
    },
    {
      title: "Contact Us",
      paragraphs: [
        "For questions about registration fees, refunds, gifts, delivery, or suspicious payment requests, contact Rising Star Talent Club at support@risingstartalentclub.com or visit https://www.risingstartalentclub.com/.",
        "Please include your registration details and payment reference, if applicable.",
      ],
    },
  ],
  closing:
    "Your safety matters to us. Never pay an unverified person or platform claiming to offer a prize or gift from Rising Star Talent Club.",
};
