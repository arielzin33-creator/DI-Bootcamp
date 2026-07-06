import React from 'react';

function Contact() {
  return (
    <section id="contact" className="contact-section text-center">
      <div className="container">
        <h2>Contact Us</h2>
        <p>Reach out to us on social media or send us an email.</p>
        <div className="contact-icons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="mailto:contact@example.com" aria-label="Email">
            <i className="fa-solid fa-envelope"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
