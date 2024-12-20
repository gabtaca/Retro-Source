import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { AddToCartButton } from './AddToCartButton';
import { useAside } from './Aside';

export const ProductForm = forwardRef(function ProductForm(
  { productOptions, selectedVariant },
  ref
) {
  const navigate = useNavigate();
  const { open } = useAside();
  const [showParticles, setShowParticles] = useState(false);

  // Expose a `submit` method via the `ref`
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (selectedVariant?.availableForSale) {
        document.getElementById('add-to-cart-button').click();
        triggerCoinParticles();
      }
    },
  }));

  // Function to trigger particle effect
  const triggerCoinParticles = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000); // Remove particles after 1 second
  };

  return (
    <div className="product-form relative">
      {/* Render product options */}
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  return (
                    <button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}

      {/* Add to Cart Button */}
      <div className="addcart_btn flex flex-row justify-between items-center relative">
        <div className="flex flex-row">
          <div className="wishlist-btn mr-2"></div>
          <p className="font-bold text-xl">B</p>
        </div>
        <AddToCartButton
          id="add-to-cart-button"
          style={{
            paddingLeft: '10px',
            marginTop: '2rem',
            color: '#F43596',
          }}
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
            triggerCoinParticles();
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]
              : []
          }
        >
          🛒
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
        <img
          className="ml-8 h-4 w-4"
          src="/images/coin.png"
          alt="cartoon coin"
        />
      </div>

      {/* Particle Effect */}
      {showParticles && <CoinParticles />}
    </div>
  );
});

function ProductOptionSwatch({ swatch, name }) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

function CoinParticles() {
  const stars = Array.from({ length: 7 }, (_, i) => i); // Create an array of 7 particles
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <img
          key={star}
          src="/images/coin.png"
          alt="Coin Particle"
          className="particle-star absolute animate-pop"
          style={{
            width: `${Math.random() * 10 + 10}px`,
            height: `${Math.random() * 10 + 10}px`,
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
