import React from 'react';

const shopifyUrl = 'https://retrosourcegames.myshopify.com/pages/contact';
const accessToken = '3b6031c8dc5beb9a7aa5862741a0f892'; // Replace with your actual access token

async function fetchFAQ() {
  try {
    const response = await fetch(shopifyUrl);
    const html = await response.text();

    // Parse the HTML to extract FAQ content
    const faqContent = extractFAQFromHTML(html);

    // Process and display the FAQ content
    console.log(faqContent); // Replace with your desired processing logic
  } catch (error) {
    console.error('Error fetching FAQ:', error);
  }
}

// Example function to extract FAQ content (replace with your specific logic)
function extractFAQFromHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Identify the element containing FAQ content (e.g., section with "FAQ" heading or specific class)
  const faqElement = doc.querySelector('section h2:contains("FAQ")'); // Adjust selector as needed
  if (!faqElement) {
    return null; // Handle case where no FAQ element is found
  }

  // Extract the content within the parent section
  const faqSection = faqElement.parentElement;
  let faqText = faqSection.textContent;

  // Optionally iterate over child elements for more structured data extraction
  const faqItems = faqSection.querySelectorAll('li'); // Adjust selector as needed
  if (faqItems.length > 0) {
    faqText = [...faqItems].map((item) => item.textContent).join('\n');
  }

  return faqText;
}

fetchFAQ();

return (
  <div className="faq-section">
    <h2>Frequently Asked Questions</h2>
    <ul>
      {Object.entries(faqs).map(([question, answer]) => (
        <li key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </li>
      ))}
    </ul>
  </div>
);
