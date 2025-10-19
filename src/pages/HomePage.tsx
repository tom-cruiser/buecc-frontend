import React from 'react';
import Hero from '../components/Hero';
import FeaturedProperties from '../components/FeaturedProperties';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeaturedProperties />
    </div>
  );
};

export default HomePage;