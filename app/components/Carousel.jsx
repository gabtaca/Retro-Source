// Carousel.jsx

import React, {useState, useEffect, useRef} from 'react';
import {useSwipeable} from 'react-swipeable';

/**
 * Carousel Component
 * @param {Object} props
 * @param {Array} props.items
 */
const Carousel = ({items}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  const delay = 5000;
  const pulseDelay = 4000;

  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const prevSmButtonRef = useRef(null);
  const nextSmButtonRef = useRef(null);
  const pulseTimeoutRef = useRef(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const resetPulseTimeout = () => {
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
  };

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1,
    );
  };

  useEffect(() => {
    // Auto-scroll setup
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      next();
    }, delay);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, items.length]);

  useEffect(() => {
    const pulsate = () => {
      if (
        prevButtonRef.current &&
        nextButtonRef.current &&
        prevSmButtonRef.current &&
        nextSmButtonRef.current
      ) {
        prevButtonRef.current.classList.add('animate-pulse-once');
        nextButtonRef.current.classList.add('animate-pulse-once');
        prevSmButtonRef.current.classList.add('animate-pulse-once');
        nextSmButtonRef.current.classList.add('animate-pulse-once');

        setTimeout(() => {
          prevButtonRef.current.classList.remove('animate-pulse-once');
          nextButtonRef.current.classList.remove('animate-pulse-once');
          prevSmButtonRef.current.classList.remove('animate-pulse-once');
          nextSmButtonRef.current.classList.remove('animate-pulse-once');
        }, 1000);
      }

      pulseTimeoutRef.current = setTimeout(pulsate, pulseDelay);
    };

    pulseTimeoutRef.current = setTimeout(pulsate, pulseDelay);

    return () => {
      resetPulseTimeout();
    };
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!items || items.length === 0) {
    return <div>No items to display</div>;
  }

  const currentItem = items[currentIndex];

  return (
    <div
      {...handlers}
      className="carousel-wrapper flex flex-col justify-center w-[90%] sm:items-center max-w-4xl mx-auto"
    >
      <h2 className="text-center">Top news</h2>
      {/* Carousel Item */}
      <div className="carousel-item flex flex-col sm:flex-row sm:justify-between items-center sm:items-start justify-center w-full rounded-md overflow-hidden">
        {/* Previous Button (sm) */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="prev-button w-[100px] sm:flex hidden z-1 p-5"
          ref={prevSmButtonRef}
        >
          <img
            src="/images/arrows_left.png"
            alt="Left arrow for previous news"
            className="h-12 w-12 min-w-[24px] object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/arrows_left_fallback.png';
            }}
          />
        </button>
        <img
          src={currentItem.imageUrl}
          alt={currentItem.title}
          className="h-20 sm:max-w-[50%] sm:h-[100px] object-cover rounded-md flex-shrink-0"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/image_fallback.png';
          }}
        />
        <div className="p-5 flex sm:max-w-[50%] flex-col justify-center">
          <h3 className="text-xl font-bold">{currentItem.title}</h3>
          <p className="text-sm text-gray-500">{currentItem.source}</p>
          <p className="text-sm text-gray-400">{currentItem.date}</p>
          <p className="mt-2 text-gray-700">{currentItem.description}</p>
          <a
            href={currentItem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2 self-start"
          >
            Read More →
          </a>
        </div>
        {/* Next Button (sm) */}
        <button
          onClick={next}
          aria-label="Next"
          className="next-button w-[100px] sm:flex hidden z-1 p-5"
          ref={nextSmButtonRef}
        >
          <img
            src="/images/arrows_right.png"
            alt="Right arrow for next news"
            className="h-12 w-12 min-w-[24px] object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/arrows_right_fallback.png';
            }}
          />
        </button>
      </div>
      {/* Indicators */}
      <div className="carousel-indicators flex justify-center mt-4 space-x-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full ${
              currentIndex === index ? 'bg-lime-950' : 'bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
      {/* Previous and Next Buttons (mobile) */}
      <div className="banner_btnCTRL sm:hidden flex flex-row justify-center p-5">
        {/* Previous Button */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="prev-button sm:hidden flex z-1 pr-5"
          ref={prevButtonRef}
        >
          <img
            src="/images/arrows_left.png"
            alt="Left arrow for previous news"
            className="h-12 w-12 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/arrows_left_fallback.png';
            }}
          />
        </button>
        {/* Next Button */}
        <button
          onClick={next}
          aria-label="Next"
          className="next-button sm:hidden flex z-1 pl-5"
          ref={nextButtonRef}
        >
          <img
            src="/images/arrows_right.png"
            alt="Right arrow for next news"
            className="h-12 w-12 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/arrows_right_fallback.png';
            }}
          />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
