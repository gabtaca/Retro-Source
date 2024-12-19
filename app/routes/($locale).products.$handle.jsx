import {useLoaderData} from '@remix-run/react';
import {
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import AddToWishList from '~/components/AddToWishList';
import {useEffect, useState} from 'react';
import Cookies from 'js-cookie';

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const [wishlistedProducts, setWishlistedProducts] = useState({});

  // Initialize the wishlist state from cookies
  useEffect(() => {
    const wishlisted = Cookies.get('wishlisted');
    if (wishlisted) {
      try {
        setWishlistedProducts(JSON.parse(wishlisted));
      } catch (error) {
        console.error('Failed to parse wishlisted cookie:', error);
        Cookies.set('wishlisted', JSON.stringify({}));
      }
    }
  }, []);

  // Add or remove a product from the wishlist
  function toggleWishlist(productId) {
    const updatedWishlistedProducts = {...wishlistedProducts};

    if (updatedWishlistedProducts[productId]) {
      delete updatedWishlistedProducts[productId];
    } else {
      updatedWishlistedProducts[productId] = true;
    }

    Cookies.set('wishlisted', JSON.stringify(updatedWishlistedProducts), {
      expires: 7,
      secure: true,
      sameSite: 'strict',
    });

    setWishlistedProducts(updatedWishlistedProducts);
  }

  return (
    <div className="product home_crt">
      <ProductImage image={selectedVariant?.image} />
      <div className="product-main">
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <br />
        <div className="flex items-center gap-4">
          {/* Wishlist Button */}
          <AddToWishList
            productId={product.id}
            isWishlisted={!!wishlistedProducts[product.id]}
            onToggleFavorite={() => toggleWishlist(product.id)}
            className="text-[1.5rem]"
          />
          <span>
            {wishlistedProducts[product.id]
              ? 'Added to Wishlist'
              : 'Add to Wishlist'}
          </span>
        </div>
        <br />
        <br />
        <p>
          <strong>Description</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        <br />
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}
