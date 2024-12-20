import React, { useState } from 'react';

export default function FAQ({ faqs }) {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id); // Toggle open FAQ
  };

  return (
    <div className="faq-section">
      <h2>Frequently Asked Questions</h2>
      {faqs && faqs.length > 0 ? (
        <ul>
          {faqs.map((faq) => (
            <li key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openFAQ === faq.id ? 'active' : ''}`}
                onClick={() => toggleFAQ(faq.id)}
              >
                {faq.question}
                <span className={`arrow ${openFAQ === faq.id ? 'down' : 'right'}`}></span>
              </button>
              {openFAQ === faq.id && (
                <span className="faq-answer">{faq.answer}</span>
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
