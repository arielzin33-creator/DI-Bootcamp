import React from 'react';
import Header from './Header';
import Card from './Card';
import Contact from './Contact';

const services = [
  {
    icon: 'fa-solid fa-rocket',
    title: 'Fast Performance',
    description:
      'Our solutions are optimized for speed, giving your users a smooth and responsive experience.',
  },
  {
    icon: 'fa-solid fa-mobile-screen',
    title: 'Fully Responsive',
    description:
      'The layout adapts seamlessly to desktops, tablets, and mobile screens of any size.',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Secure & Reliable',
    description:
      'Built with best practices in mind, keeping your data and your users protected.',
  },
];

function App() {
  return (
    <div>
      <Header />

      <section id="services" className="card-section">
        <div className="container">
          <h2 className="text-center mb-5">Our Services</h2>
          <div className="row">
            {services.map((service, index) => (
              <Card
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      <Contact />
    </div>
  );
}

export default App;
