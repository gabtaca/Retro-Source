export default function Contact({ address, phone, email }) {
  return (
    <div className="contact-info">
      <h2>Contact Information</h2>
      <p>
        <strong>Address:</strong> {address || 'Not available'}
      </p>
      <p>
        <strong>Phone:</strong> 
        {phone ? <a href={`tel:${phone}`}>{phone}</a> : 'Not available'}
      </p>
      <p>
        <strong>Email:</strong> 
        {email ? <a href={`mailto:${email}`}>{email}</a> : 'Not available'}
      </p>
    </div>
  );
}