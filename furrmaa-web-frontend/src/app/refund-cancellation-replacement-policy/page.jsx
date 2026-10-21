import React from 'react';
import Container from '@/components/Container';
import WhyChooseFurrmaa from '@/components/WhyChooseFurrmaa';

export const metadata = {
  title: 'Refund, Cancellation & Replacement Policy | FURRMAA',
  description: 'Understand FURRMAA\'s rules for service cancellations, product refunds and replacements — operated by Indienpets Private Limited.',
};

const sections = [
  {
    id: 1,
    title: 'Purpose',
    paragraphs: [
      'This policy explains the general rules for cancellations, refunds and replacements for FURRMAA services and products. Transaction-specific terms displayed during booking or checkout may also apply.',
    ],
  },
  {
    id: 2,
    title: 'Services — Customer Cancellation',
    subsections: [
      {
        subtitle: 'Before the permitted cancellation deadline',
        bullets: [
          'Where a customer cancels within the period stated for the relevant service, the customer may be eligible for a full or applicable refund.',
        ],
      },
      {
        subtitle: 'After the permitted cancellation deadline',
        bullets: [
          'A cancellation fee, partial refund or no refund may apply depending on the service-specific terms displayed at booking.',
        ],
      },
      {
        subtitle: 'After service commencement',
        bullets: [
          'Bookings may generally become non-refundable once the service has commenced, except where an exception applies.',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Service Provider Cancellation',
    paragraphs: [
      'If a service provider cancels a confirmed booking, FURRMAA may provide the customer with an applicable refund and, where available, an option to reschedule or select another provider.',
    ],
  },
  {
    id: 4,
    title: 'Customer No-Show',
    paragraphs: [
      'If a customer fails to attend or otherwise fails to make the pet available for a confirmed service without cancelling according to the applicable cancellation rules, the booking may be treated as a no-show and may be non-refundable or subject to the applicable fee.',
    ],
  },
  {
    id: 5,
    title: 'Service Quality Issues',
    paragraphs: [
      'If a customer believes a booked service was materially not delivered as described, the customer should contact FURRMAA support promptly and provide the booking details and relevant evidence. FURRMAA may investigate and determine an appropriate resolution consistent with the applicable terms and law.',
    ],
  },
  {
    id: 6,
    title: 'Product Order Cancellation',
    paragraphs: [
      'Product cancellation eligibility depends on the order status and applicable product rules. Orders may become non-cancellable once packed, shipped or otherwise committed to fulfilment, subject to applicable consumer rights and the final product-specific policy.',
    ],
  },
  {
    id: 7,
    title: 'Wrong, Damaged or Defective Products',
    bullets: [
      'If the wrong product is delivered, the customer should report it promptly and provide order details and evidence where requested.',
      'If a product arrives damaged or defective, the customer should report the issue within the applicable reporting period and provide evidence where reasonably required.',
      'FURRMAA may provide a replacement, refund or other remedy depending on the circumstances, product category, supplier rules and applicable law.',
    ],
  },
  {
    id: 8,
    title: 'Replacement',
    paragraphs: [
      'Where a product is eligible for replacement, FURRMAA may require the customer to submit the reason, relevant evidence and other information necessary to process the request.',
      'Replacement is subject to product availability. Where replacement is not possible, an applicable refund or alternative resolution may be offered.',
    ],
  },
  {
    id: 9,
    title: 'Product Returns and Exclusions',
    paragraphs: [
      'Certain product categories may be subject to special return or replacement conditions, including products that are consumable, opened, perishable, hygiene-sensitive or otherwise unsuitable for return after use, subject always to applicable law and disclosed product-specific terms.',
    ],
  },
  {
    id: 10,
    title: 'Refund Processing',
    paragraphs: [
      'Once a refund is approved, FURRMAA or its payment provider will initiate the refund to the applicable original payment method or another permitted method. The time for the amount to appear in the customer\'s account may depend on the payment provider, bank and payment method.',
    ],
  },
  {
    id: 11,
    title: 'Refund Status',
    paragraphs: [
      'Where supported, customers may track refunds through their FURRMAA account. Suggested statuses include: Refund Requested, Under Review, Approved, Refund Initiated, Refund Processed and Rejected.',
    ],
  },
  {
    id: 12,
    title: 'Refund Requests',
    paragraphs: [
      'Customers should submit refund requests through the FURRMAA app, website or customer support channel. The request should include the relevant booking/order number, reason, description and evidence where required.',
    ],
  },
  {
    id: 13,
    title: 'Duplicate or Abusive Claims',
    paragraphs: [
      'FURRMAA may investigate repeated, fraudulent, abusive or inconsistent refund/replacement claims and may restrict account functionality where reasonably necessary and permitted by applicable law.',
    ],
  },
  {
    id: 14,
    title: 'Policy and Transaction-Specific Terms',
    paragraphs: [
      'Where a service, product or promotion has specific cancellation, return or replacement terms displayed before purchase, those terms should be read together with this policy. Where legally permitted, the more specific transaction terms will govern the relevant transaction.',
    ],
  },
  {
    id: 15,
    title: 'Contact and Grievance Redressal',
    paragraphs: [
      'Customers should use the official FURRMAA support or grievance contact published on the website and application for refund, cancellation or replacement disputes.',
      'Email: support@furrmaa.com | Phone: +91-8829026003 | Address: Plot No. 91-92 Rimsha Enclave, Kasturba Nagar, Nirman Nagar, Jaipur, Rajasthan – 302019',
    ],
  },
  {
    id: 16,
    title: 'Final Commercial Rules to be Confirmed',
    paragraphs: [
      'Before launch, FURRMAA will define the exact service-specific cancellation windows, cancellation charges, refund percentages, no-show treatment, product-category exclusions, reporting windows and refund timelines.',
    ],
  },
];

export default function RefundCancellationPolicy() {
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
              Refund, Cancellation &amp; Replacement Policy
            </h1>
            {/* <p className="text-sm text-gray-500 font-medium">
              Version 1.0 &nbsp;·&nbsp; Effective Date: To be confirmed
            </p> */}
            <p className="mt-5 text-[15px] text-gray-600 leading-relaxed max-w-2xl">
              This policy provides the structure for service cancellations and refunds and product cancellations,
              returns and replacements. Exact commercial windows and percentages will be confirmed before
              publication.
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

                {sec.subsections?.map((sub, i) => (
                  <div key={i} className="space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
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
