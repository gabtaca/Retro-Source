import React from 'react';
import Carousel from './Carousel';
import {newsList} from '~/data/newsData';

const NewsCarousel = () => {
  return (
    <section className="news-carousel my-8">
      <h2 className="text-2xl font-bold text-center">Latest News</h2>
      <Carousel items={newsList} />
    </section>
  );
};

export default NewsCarousel;
