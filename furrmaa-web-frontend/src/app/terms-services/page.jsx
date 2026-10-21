import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

export const metadata = {
  title: 'Terms & Conditions | FURRMAA',
  description: 'Read the Terms & Conditions governing use of FURRMAA — operated by Indienpets Private Limited.',
};

const sections = [
  {
    id: 1,
    title: 'Acceptance',
    paragraphs: [
      'These Terms & Conditions govern access to and use of FURRMAA\'s website, mobile application and related services operated by Indienpets Private Limited.',
      'By creating an account, booking a service or purchasing a product, the user agrees to the applicable terms presented at the relevant stage of the transaction.',
    ],
  },
  {
    id: 2,
    title: 'FURRMAA Platform Role',
    paragraphs: [
      'FURRMAA provides technology and marketplace functionality for discovering, booking, managing and, where applicable, paying for pet-care services and products.',
      'Unless expressly stated otherwise, service providers may be independent businesses or professionals responsible for delivering their respective services. The exact legal relationship between FURRMAA and each provider is governed by the applicable provider agreement.',
    ],
  },
  {
    id: 3,
    title: 'Accounts',
    bullets: [
      'Users must provide accurate information and keep account credentials secure.',
      'Users are responsible for activity carried out through their account, subject to applicable law.',
      'FURRMAA may suspend or restrict accounts for fraud, misuse, material breach or other legitimate reasons, subject to applicable law.',
    ],
  },
  {
    id: 4,
    title: 'Pet Profiles',
    paragraphs: [
      'Users are responsible for the accuracy of information they provide about their pets. Users should not provide information that they are not authorized to provide.',
    ],
  },
  {
    id: 5,
    title: 'Service Bookings',
    paragraphs: [
      'Bookings are subject to provider availability, the information shown at checkout and the applicable cancellation and refund rules.',
      'FURRMAA may display provider information, reviews, availability and service details to facilitate booking. Service-specific terms may also apply.',
    ],
  },
  {
    id: 6,
    title: 'Product Purchases',
    paragraphs: [
      'Product orders are subject to availability, pricing, delivery information and the applicable Refund, Cancellation & Replacement Policy.',
      'Product descriptions, images and specifications should be reviewed by the customer before purchase.',
    ],
  },
  {
    id: 7,
    title: 'Payments',
    paragraphs: [
      'Users must pay the amount displayed at checkout using the payment methods made available by FURRMAA or its payment partners. Applicable taxes, fees and charges are disclosed at checkout where required.',
    ],
  },
  {
    id: 8,
    title: 'Cancellations, Refunds and Replacements',
    paragraphs: [
      'Cancellation, refund and replacement eligibility is governed by FURRMAA\'s Refund, Cancellation & Replacement Policy and any specific terms displayed for the relevant transaction.',
    ],
  },
  {
    id: 9,
    title: 'Service Provider Responsibilities',
    paragraphs: [
      'Service providers are responsible for delivering their services with appropriate professional care, qualifications, licences and compliance required for their business and applicable law.',
      'Providers must comply with FURRMAA\'s provider agreement and platform rules, including applicable customer-data, communication and anti-circumvention requirements.',
    ],
  },
  {
    id: 10,
    title: 'Customer Responsibilities',
    bullets: [
      'Provide accurate booking, contact, pet and service information.',
      'Follow reasonable instructions provided by the service provider.',
      'Attend scheduled services on time or follow the applicable cancellation process.',
      'Do not misuse the platform or attempt to interfere with platform operations.',
    ],
  },
  {
    id: 11,
    title: 'Anti-Circumvention',
    paragraphs: [
      'Users and service providers must not intentionally circumvent FURRMAA to avoid applicable platform charges or move a transaction originating through FURRMAA off-platform for the purpose of bypassing FURRMAA.',
      'Examples may include intentionally using FURRMAA-discovered provider information to arrange direct transactions, encouraging a provider or customer to bypass FURRMAA, or cancelling a platform booking solely to complete the same transaction outside the platform.',
      'Consequences may include cancellation, suspension, restriction or termination of platform access, and other remedies available under the applicable agreement and law. Any enforcement action will be proportionate and legally supportable.',
    ],
  },
  {
    id: 12,
    title: 'Customer and Provider Communication',
    paragraphs: [
      'FURRMAA may facilitate communications necessary to fulfil a booking. Contact details or location information supplied after booking are provided for operational fulfilment and do not by themselves authorize circumvention of the platform.',
    ],
  },
  {
    id: 13,
    title: 'Charlie AI and Veterinary Disclaimer',
    paragraphs: [
      'Charlie AI provides AI-generated general guidance and recommendations. It is not a veterinarian and does not replace professional veterinary advice, diagnosis or treatment.',
      'FURRMAA does not guarantee that an AI recommendation is suitable for every animal. For medical, diagnostic or emergency decisions, users should seek qualified professional assistance.',
    ],
  },
  {
    id: 14,
    title: 'Emergency Features',
    paragraphs: [
      'If FURRMAA offers emergency workflows, their availability, response time and scope will depend on the actual providers and integrations available. Any pre-authorized action must be based on an authorization recorded by the platform and must be implemented only as described in the relevant product feature.',
    ],
  },
  {
    id: 15,
    title: 'Reviews and User Content',
    paragraphs: [
      'Users must not submit unlawful, fraudulent, defamatory, abusive, misleading or infringing content. FURRMAA may moderate or remove content in accordance with its policies and applicable law.',
    ],
  },
  {
    id: 16,
    title: 'Intellectual Property',
    paragraphs: [
      'FURRMAA\'s software, branding, content, interfaces and other proprietary materials are owned by or licensed to FURRMAA and may not be copied, modified, reverse engineered, distributed or exploited except as permitted by law or written authorization.',
    ],
  },
  {
    id: 17,
    title: 'Suspension and Termination',
    paragraphs: [
      'FURRMAA may suspend or terminate access where reasonably necessary for security, fraud prevention, material breach, misuse or legal compliance, subject to applicable law and any rights the user may have.',
    ],
  },
  {
    id: 18,
    title: 'Limitation of Liability',
    paragraphs: [
      'FURRMAA\'s liability is limited to the extent permitted by applicable Indian law, reflecting FURRMAA\'s actual platform role. FURRMAA does not disclaim liabilities that cannot lawfully be excluded.',
    ],
  },
  {
    id: 19,
    title: 'Dispute Resolution and Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of India. The governing jurisdiction and dispute-resolution mechanism are as selected by Indienpets Private Limited and will be confirmed in the final production version.',
    ],
  },
  {
    id: 20,
    title: 'Changes to Terms',
    paragraphs: [
      'FURRMAA may update these Terms from time to time. Where required, users will be notified and asked to accept updated terms before continuing to use affected functionality.',
    ],
  },
  {
    id: 21,
    title: 'Contact',
    paragraphs: [
      'For support, grievances or enquiries, please contact FURRMAA through the official channels published on the website and application.',
      'Email: support@furrmaa.com | Phone: +91-8829026003 | Address: Plot No. 91-92 Rimsha Enclave, Kasturba Nagar, Nirman Nagar, Jaipur, Rajasthan – 302019',
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-[linear-gradient(135deg,#F3F8FF_0%,#E8F0FF_100%)] border-b border-gray-100">
        <Container>
          <div className="max-w-4xl py-14 md:py-20 px-4 md:px-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6FA5] mb-3">
              Legal · Indienpets Private Limited
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Terms &amp; Conditions
            </h1>
            {/* <p className="text-sm text-gray-500 font-medium">
              Version 1.0 &nbsp;·&nbsp; Effective Date: To be confirmed
            </p> */}
            <p className="mt-5 text-[15px] text-gray-600 leading-relaxed max-w-2xl">
              These terms are designed for FURRMAA&apos;s pet-care marketplace and commerce model, including
              customers, service providers, bookings, products, payments, Charlie AI and anti-circumvention.
            </p>
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div className="max-w-4xl mx-auto py-14 md:py-20 px-4 md:px-0 space-y-12">
          {sections.map((sec) => (
            <section key={sec.id} id={`section-${sec.id}`}>
              <div className="flex items-start gap-4 mb-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#EBF2FF] text-[#4A6FA5] text-sm font-bold flex items-center justify-center">
                  {sec.id}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug pt-0.5">
                  {sec.title}
                </h2>
              </div>

              <div className="pl-12 space-y-4">
                {sec.bullets && (
                  <ul className="space-y-2">
                    {sec.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-[15px] text-gray-700 leading-relaxed">
                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[#4A6FA5]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {sec.paragraphs?.map((p, i) => (
                  <p key={i} className="text-[15px] text-gray-700 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {sec.id < sections.length && (
                <div className="mt-10 border-b border-gray-100" />
              )}
            </section>
          ))}

          <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
            FURRMAA | Indienpets Private Limited
          </p>
        </div>
      </Container>

      <WhyChooseFurrmaa />
    </main>
  );
}
