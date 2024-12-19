import Contact from '~/components/Contact';
import {useLoaderData} from '@remix-run/react';

export async function loader({context}) {
  const data = await context.storefront.query(CONTACT_QUERY);
  return {contact: data.metaobjects.nodes};
}
export default function ContactInfos() {
  const {contact} = useLoaderData();
  return (
    <div>
      <h1>Contact</h1>
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
