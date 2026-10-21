import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

export const metadata = {
  title: 'Privacy Policy | FURRMAA',
  description: 'Learn how FURRMAA (Indienpets Private Limited) collects, uses, and protects your personal data.',
};

const sections = [
  {
    id: 1,
    title: 'Introduction',
    content: null,
    paragraphs: [
      'FURRMAA is a technology-enabled pet-care platform operated by Indienpets Private Limited. This Privacy Policy explains how FURRMAA collects, uses, stores, shares and otherwise processes information when users access or use the FURRMAA website, mobile application and related services.',
      'By using FURRMAA, users should review this Privacy Policy together with the FURRMAA Terms & Conditions and Refund, Cancellation & Replacement Policy.',
    ],
  },
  {
    id: 2,
    title: 'Information We May Collect',
    content: null,
    subsections: [
      {
        subtitle: 'Account and identity information',
        bullets: [
          'Name, mobile number, email address, authentication information and account details.',
        ],
      },
      {
        subtitle: 'Pet information',
        bullets: [
          'Pet name, species, breed, age, gender, weight, dietary information, allergies, vaccination and deworming information, routines, care preferences, products used and services booked.',
        ],
      },
      {
        subtitle: 'Booking and transaction information',
        bullets: [
          'Services or products selected, booking dates and times, service-provider information, order history, cancellation records, payment status, refund information and relevant transaction references.',
        ],
      },
      {
        subtitle: 'Location information',
        bullets: [
          'Location or address information where needed for service discovery, booking, delivery or service fulfilment. Where appropriate, users may be offered the ability to enter a location manually.',
        ],
      },
      {
        subtitle: 'Device and technical information',
        bullets: [
          'Information such as IP address, device type, operating system, app version, browser information, session information and technical logs, subject to the technologies used by FURRMAA.',
        ],
      },
      {
        subtitle: 'Communications',
        bullets: [
          'Information contained in support requests, feedback, reviews, communications and other information voluntarily provided to FURRMAA.',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'How We Use Information',
    bullets: [
      'Create and manage user accounts.',
      'Create and maintain pet profiles.',
      'Facilitate product purchases and service bookings.',
      'Connect customers with relevant pet-care providers.',
      'Process payments, cancellations, refunds and replacements.',
      'Provide customer support.',
      'Personalize pet-care recommendations and reminders.',
      'Operate, secure, troubleshoot and improve the platform.',
      'Detect fraud, abuse, misuse and attempts to circumvent platform processes.',
      'Comply with applicable legal obligations and respond to lawful requests.',
    ],
  },
  {
    id: 4,
    title: 'Charlie AI',
    paragraphs: [
      'Charlie AI is FURRMAA\'s AI-powered pet-care assistant. Depending on the product features used, Charlie AI may use information provided by the pet parent and information associated with the pet profile to provide personalized care guidance and recommendations.',
      'Charlie AI may assist with general pet-care guidance, product and service recommendations, vaccination and deworming reminders, food-cycle reminders, routines and service-provider matching.',
      'Charlie AI is not a veterinarian and does not replace professional veterinary advice, diagnosis or treatment. Users should contact an appropriately qualified veterinary professional for medical decisions, diagnosis, treatment or emergencies.',
    ],
  },
  {
    id: 5,
    title: 'Sharing of Information',
    paragraphs: [
      'FURRMAA may share information with service providers, payment processors, technology providers, delivery or fulfilment partners, customer-support providers, professional advisers, authorities where legally required, and other parties necessary to operate the requested service.',
      'FURRMAA limits sharing to information reasonably required for the relevant purpose and applies appropriate contractual and security controls to service providers where applicable.',
    ],
  },
  {
    id: 6,
    title: 'Service Provider Information',
    paragraphs: [
      'Where a customer books a service, FURRMAA may provide the service provider with information necessary to fulfil that booking, such as the customer\'s name, relevant contact information, booking details, pet information required for the service and service location.',
    ],
  },
  {
    id: 7,
    title: 'Payments',
    paragraphs: [
      'Payment transactions may be processed through third-party payment providers. FURRMAA avoids storing sensitive payment credentials unless required and appropriately secured by the applicable architecture and compliance controls.',
    ],
  },
  {
    id: 8,
    title: 'Communications and Marketing',
    paragraphs: [
      'FURRMAA may send operational communications necessary to provide services, including booking confirmations, order updates, cancellation information, refunds and support responses.',
      'Promotional communications are handled separately from mandatory service communications. Users are provided appropriate controls to opt out of promotional communications where applicable.',
    ],
  },
  {
    id: 9,
    title: 'Data Security',
    paragraphs: [
      'FURRMAA uses reasonable technical and organizational measures appropriate to the nature of the information and the risks involved. No internet-based service can guarantee absolute security.',
    ],
  },
  {
    id: 10,
    title: 'Data Retention',
    paragraphs: [
      'FURRMAA will retain information for as long as reasonably necessary for the purposes for which it was collected, to provide services, maintain business and transaction records, resolve disputes, prevent fraud, meet legal obligations and protect legitimate interests, subject to applicable law.',
    ],
  },
  {
    id: 11,
    title: 'User Rights and Privacy Requests',
    paragraphs: [
      'Subject to applicable law, users may have rights relating to access, correction, updating, deletion, withdrawal of consent where applicable, grievance redressal and other privacy requests. FURRMAA will process such requests in accordance with applicable legal requirements.',
    ],
  },
  {
    id: 12,
    title: 'Children',
    paragraphs: [
      'FURRMAA is not intended to knowingly collect personal information from children in violation of applicable law. Where age-related restrictions apply, users must comply with them.',
    ],
  },
  {
    id: 13,
    title: 'Policy Changes',
    paragraphs: [
      'FURRMAA may update this Privacy Policy from time to time. Material changes may require an updated notice or renewed acceptance where applicable. Previous versions are retained for appropriate records.',
    ],
  },
  {
    id: 14,
    title: 'Contact and Grievance Redressal',
    paragraphs: [
      'Privacy requests and grievances should be directed to the official FURRMAA support or grievance contact published on the website and application.',
      'Email: support@furrmaa.com | Phone: +91-8829026003 | Address: Plot No. 91-92 Rimsha Enclave, Kasturba Nagar, Nirman Nagar, Jaipur, Rajasthan – 302019',
    ],
  },
];

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            {/* <p className="text-sm text-gray-500 font-medium">
              Version 1.0 &nbsp;·&nbsp; Effective Date: To be confirmed
            </p> */}
            <p className="mt-5 text-[15px] text-gray-600 leading-relaxed max-w-2xl">
              This policy explains FURRMAA&apos;s approach to personal data and pet-related information across its
              website, app, AI features, bookings and commerce functionality.
            </p>
          </div>
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div className="max-w-4xl mx-auto py-14 md:py-20 px-4 md:px-0 space-y-12">
          {sections.map((sec) => (
            <section key={sec.id} id={`section-${sec.id}`}>
              {/* Section heading */}
              <div className="flex items-start gap-4 mb-5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#EBF2FF] text-[#4A6FA5] text-sm font-bold flex items-center justify-center">
                  {sec.id}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug pt-0.5">
                  {sec.title}
                </h2>
              </div>

              <div className="pl-12 space-y-4">
                {/* Simple bullet list */}
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

                {/* Paragraphs */}
                {sec.paragraphs?.map((p, i) => (
                  <p key={i} className="text-[15px] text-gray-700 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Subsections (for section 2) */}
                {sec.subsections?.map((sub, i) => (
                  <div key={i} className="space-y-1.5">
                    <h3 className="text-[14px] font-bold text-gray-800">{sub.subtitle}</h3>
                    <ul className="space-y-1">
                      {sub.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-[15px] text-gray-700 leading-relaxed">
                          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[#4A6FA5]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Divider except last */}
              {sec.id < sections.length && (
                <div className="mt-10 border-b border-gray-100" />
              )}
            </section>
          ))}

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
            FURRMAA | Indienpets Private Limited
          </p>
        </div>
      </Container>

      <WhyChooseFurrmaa />
    </main>
  );
}
