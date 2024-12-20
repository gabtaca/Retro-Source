import { useLoaderData } from '@remix-run/react';
import Contact from '~/components/Contact';

export async function loader({ context }) {
  const [contactData] = await Promise.all([
    context.storefront.query(CONTACT_QUERY),
  ]);

  // Validate contact data
  if (!contactData?.metaobjects?.nodes || contactData.metaobjects.nodes.length === 0) {
    throw new Response('No contact data found', { status: 404 });
  }

  return { 
    contact: contactData.metaobjects.nodes,
  };
}

export default function ContactInfos() {
  const { contact} = useLoaderData();

  return (
    <div className='text-zinc-200'>
      <h1>Contact</h1>
      {contact.length > 0 ? (
        <Contact
          address={contact[0].street_adress.value}
          phone={contact[0].phone_number.value}
          email={contact[0].e_mail.value}
        />
      ) : (
        <p>Contact information is not available at the moment.</p>
      )}
    </div>
  );
}

const CONTACT_QUERY = `#graphql
query contact {
  metaobjects(type: "contact", first: 10) {
    nodes {
      id
      street_adress: field(key: "street_adress") { value }
      phone_number: field(key: "phone_number") { value }
      e_mail: field(key: "e_mail") { value }
    }
  }
}`;

