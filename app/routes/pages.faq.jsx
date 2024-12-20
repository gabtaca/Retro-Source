import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';

export async function loader({ context }) {
  const faqData = await context.storefront.query(FAQ_QUERY);

  // Transform the data into a usable structure
  const faqs = faqData?.metaobjects?.nodes?.map((node) => {
    const question = node.fields.find((field) => field.key === 'question')?.value || '';
    const answer = node.fields.find((field) => field.key === 'answer')?.value || '';
    return { id: node.id, question, answer };
  }) || [];

  return { faqs };
}

export default function FAQPage() {
  const { faqs } = useLoaderData();
  const [openFAQ, setOpenFAQ] = useState(null); // Track the currently open FAQ

  const handleToggleFAQ = (index) => {
    setOpenFAQ((prevIndex) => (prevIndex === index ? null : index)); // Toggle the clicked FAQ
  };

  return (
    <div className="faq-section">
      <h1>Frequently Asked Questions</h1>
      {faqs && faqs.length > 0 ? (
        <ul>
          {faqs.map((faq, index) => (
            <li key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openFAQ === index ? 'open' : ''}`}
                onClick={() => handleToggleFAQ(index)}
              >
                {faq.question}
                <span className={`arrow ${openFAQ === index ? 'rotated' : ''}`}>&#x25BC;</span>
              </button>
              {openFAQ === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No FAQs available at the moment.</p>
      )}
    </div>
  );
}

// GraphQL Query to Fetch FAQs
const FAQ_QUERY = `#graphql
query GetFAQs {
  metaobjects(type: "faq", first: 10) {
    nodes {
      id
      fields {
        key
        value
      }
    }
  }
}`;
