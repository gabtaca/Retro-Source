// app/components/AddToWishList.jsx

import {useState, useEffect} from 'react';
import Cookies from 'js-cookie';

/**
 * AddToWishList Component
 * Handles adding and removing products from the wishlist.
 */
export default function AddToWishList({
  productId,
  className = '',
  onToggleFavorite,
  activateWishlist, // Trigger from external component
}) {
  const [isActive, setIsActive] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Initialize wishlist state from cookies
    const wishlisted = getWishListed();
    setIsActive(wishlisted[productId] === true);
  }, [productId]);

  useEffect(() => {
    if (activateWishlist) {
      toggleWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activateWishlist]);

  const getWishListed = () => {
    try {
      return JSON.parse(Cookies.get('wishlisted') || '{}');
    } catch (error) {
      console.error('Failed to parse wishlist cookie:', error);
      Cookies.set('wishlisted', JSON.stringify({}));
      return {};
    }
  };

  const setWishListed = (wishlisted) => {
    Cookies.set('wishlisted', JSON.stringify(wishlisted), {
      expires: 7,
      sameSite: 'strict',
      secure: true,
    });
  };

  const toggleWishlist = () => {
    const wishlisted = getWishListed();
    if (isActive) {
      // Remove from wishlist
      delete wishlisted[productId];
      setWishListed(wishlisted);
      setIsActive(false);
      if (onToggleFavorite) {
        onToggleFavorite(productId, false);
      }
    } else {
      // Add to wishlist
      wishlisted[productId] = true;
      setWishListed(wishlisted);
      setIsActive(true);
      triggerParticles();
      if (onToggleFavorite) {
        onToggleFavorite(productId, true);
      }
    }
  };

  const triggerParticles = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000); // Hide particles after 1 second
  };

  return (
    <div className={`wishlist-btns ${className} flex flex-row justify-between items-center relative`}>
      {/* Static Arc Button Image */}
      <div className="flex flex-row items-center">
        <div className="wishlist-btn mr-2">
          {/* You can place an arc image here if needed */}
        </div>
        <p className="font-bold text-xl">A</p>
      </div>

      {/* Add to Wishlist Text */}
      <button
        onClick={toggleWishlist}
        className="wishlist-action cursor-pointer relative flex items-center gap-2 font-bold text-sm text-gray-800 hover:text-black"
        aria-label={isActive ? '🗑️from Wishlist' : 'Add to wishlist'}
      >
        {isActive ? '🗑️from Wishlist' : 'Add to Wishlist'}
        <img
          src={isActive ? '/images/star.png' : '/images/star.svg'}
          alt="Wishlist Star"
          className="w-6 h-6"
        />
      </button>

      {/* Particle Animation */}
      {showParticles && <StarParticles />}
    </div>
  );
}

/**
 * StarParticles Component
 * Renders small star particles for animation.
 */
function StarParticles() {
  const stars = Array.from({ length: 7 }, (_, i) => i); // Create an array of 7 particles
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <img
          key={star}
          src="/images/star.png" // Replace with the actual path to your star image
          alt="Star Particle"
          className="particle-star absolute animate-pop"
          style={{
            width: `${Math.random() * 10 + 10}px`, // Random size between 10px and 20px
            height: `${Math.random() * 10 + 10}px`,
            top: `${Math.random() * 50}%`, // Random vertical position
            left: `${Math.random() * 100}%`, // Random horizontal position
            animationDelay: `${Math.random() * 0.2}s`, // Random delay for animation
          }}
        />
      ))}
    </div>
  );
}
