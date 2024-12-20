export async function loader({context}) {
  const contactData = await context.storefront.query(CONTACT_QUERY);
  const faqData = {
    "What makes our indie games unique?": "All our games are crafted in-house...",
    // Other FAQs here
  };
  return {contact: contactData.metaobjects.nodes, faq: faqData};
}

export default function ContactInfos() {
  const {contact, faq} = useLoaderData();
  return (
    <div>
      <h1>Contact</h1>
      <p>If you have questions, feel free to reach out to us using the form below.</p>
      <FAQ faqs={faq} />
      <Contact
        adress={contact[0].street_adress.value}
        phone={contact[0].phone_number.value}
        mail={contact[0].e_mail.value}
      />
    </div>
  );
}

const CONTACT_QUERY = `#graphql
query contact {
  metaobjects(type: "contact", first: 10) {
    nodes {
      id
      street_adress: field(key:"street_adress") {value} 
      phone_number: field(key:"phone_number") {value} 
      e_mail: field(key:"e_mail") {value} 
    }
  }
}`;
