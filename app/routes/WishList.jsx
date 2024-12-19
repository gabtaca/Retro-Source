import {useState} from 'react';
import Cookies from 'js-cookie';
import {useLoaderData} from '@remix-run/react';
import {Money, Image} from '@shopify/hydrogen';
import AddToWishList from '~/components/AddToWishList';

export async function loader({context, request}) {
  const cookieHeader = request.headers.get('Cookie');
  let wishlisted = {};

  if (cookieHeader) {
    try {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((c) => c.split('=')),
      );
      if (cookies.wishlisted) {
        wishlisted = JSON.parse(decodeURIComponent(cookies.wishlisted));
      }
    } catch (error) {
      console.error('Failed to parse cookies:', error);
      wishlisted = {}; // Réinitialise si corrompu
    }
  }

  const productIds = Object.keys(wishlisted);
  if (productIds.length === 0) return {products: []};

  const data = await context.storefront.query(PRODUCTS_QUERY, {
    variables: {ids: productIds},
  });

  // Filtrez les produits supprimés ou invalides
  return {products: data.nodes.filter((product) => product !== null)};
}

export default function WishList() {
  const {products} = useLoaderData();
  const [favoriteProducts, setFavoriteProducts] = useState(products);

  function removeProductFromFavorites(productId) {
    const updatedFavorites = favoriteProducts.filter(
      (product) => product.id !== productId,
    );
    setFavoriteProducts(updatedFavorites);

    try {
      const cookie = Cookies.get('wishlisted');
      if (cookie) {
        const parsedCookie = JSON.parse(cookie);
        delete parsedCookie[productId];
        Cookies.set('wishlisted', JSON.stringify(parsedCookie), {expires: 7});
      }
    } catch (error) {
      console.error('Failed to update wishlist cookie:', error);
      Cookies.set('wishlisted', JSON.stringify({})); // Réinitialise si erreur
    }
  }

  return (
    <div className="py-8 flex flex-col gap-8">
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              removeProduct={removeProductFromFavorites}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <p>No favorites yet!</p>
        </div>
      )}
    </div>
  );
}

function ProductItem({product, removeProduct}) {
  return (
    <div className="bg-gray-100 rounded-md shadow-md p-4 flex flex-col items-center">
      {product.featuredImage && (
        <Image
          className="rounded-md"
          alt={product.featuredImage.altText || product.title}
          data={product.featuredImage}
          width={200}
          height={200}
        />
      )}
      <h4 className="text-center">{product.title}</h4>
      <Money data={product.priceRange.minVariantPrice} />
      <AddToWishList
        className="mt-2"
        productId={product.id}
        onToggleFavorite={removeProduct}
      />
    </div>
  );
}

const PRODUCTS_QUERY = `#graphql
  query GetProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
