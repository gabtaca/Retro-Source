// app/routes/products.$handle.jsx

import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate} from '@remix-run/react';
import {
  getSelectedProductOptions,
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
import {useState, useEffect} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  const allProductHandles = await fetchAllProductHandles(args);
  return defer({...deferredData, ...criticalData, allProductHandles});
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

function loadDeferredData({context, params}) {
  return {};
}

/**
 * Function to fetch all product handles from Shopify Storefront API
 * @param {LoaderFunctionArgs} args
 * @returns {Promise<string[]>} - Array of product handles
 */
async function fetchAllProductHandles({context}) {
  const {storefront} = context;

  const query = `
    query GetAllProductHandles($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            handle
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = {
    first: 250, // Adjust based on your store's product count
    after: null,
  };

  const allHandles = [];

  try {
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const response = await storefront.query(query, {
        variables: {...variables, after: cursor},
      });

      const products = response.products.edges;
      products.forEach((edge) => {
        allHandles.push(edge.node.handle);
      });

      hasNextPage = response.products.pageInfo.hasNextPage;
      cursor = response.products.pageInfo.endCursor;
    }

    return allHandles;
  } catch (error) {
    console.error('Error fetching product handles:', error);
    return [];
  }
}

export default function Product() {
  const {product, allProductHandles} = useLoaderData();
  const [activateWishlist, setActivateWishlist] = useState(false);
  const navigate = useNavigate(); // For navigation

  // Listen for Arcade Button A Press and Navigation
  useEffect(() => {
    const handleArcadePress = (event) => {
      if (event.detail === 'A') {
        setActivateWishlist(true); // Trigger wishlist toggle
      }
    };

    const handleNavigation = (event) => {
      const direction = event.detail;
      if (direction === 'LEFT' || direction === 'RIGHT') {
        navigateToAdjacentProduct(direction);
      }
    };

    window.addEventListener('arcadeButtonPress', handleArcadePress);
    window.addEventListener('arcadeNavigation', handleNavigation);

    return () => {
      window.removeEventListener('arcadeButtonPress', handleArcadePress);
      window.removeEventListener('arcadeNavigation', handleNavigation);
    };
  }, [product.id, allProductHandles]);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  /**
   * Function to handle wishlist toggle reset
   * @param {string} id - Product ID
   * @param {boolean} newState - New wishlist state
   */
  const handleToggleFavorite = (id, newState) => {
    if (activateWishlist) {
      setActivateWishlist(false); // Reset the trigger
    }
  };

  /**
   * Function to navigate to the next or previous product
   * @param {string} direction - 'LEFT' or 'RIGHT'
   */
  const navigateToAdjacentProduct = (direction) => {
    if (!allProductHandles || allProductHandles.length === 0) {
      console.error('No product handles available for navigation.');
      return;
    }

    const currentIndex = allProductHandles.indexOf(product.handle);

    if (currentIndex === -1) {
      console.error(`Current product handle "${product.handle}" not found.`);
      return;
    }

    let newIndex;
    if (direction === 'LEFT') {
      newIndex =
        currentIndex > 0 ? currentIndex - 1 : allProductHandles.length - 1;
    } else if (direction === 'RIGHT') {
      newIndex =
        currentIndex < allProductHandles.length - 1 ? currentIndex + 1 : 0;
    }

    const newHandle = allProductHandles[newIndex];
    if (newHandle) {
      navigate(`/products/${newHandle}`);
    } else {
      console.error(`Product handle "${newHandle}" not found.`);
    }
  };

  return (
    <div className="product flex flex-row justify-center pt-4">
      <div className="home_crt-products">
        <ProductImage image={selectedVariant?.image} />
        <div className="product-main">
          <h1>{product.title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <div className="products_btnCtrl flex flex-col gap-4 mt-4">
            {/* Wishlist Button */}
            <AddToWishList
              productId={product.id}
              activateWishlist={activateWishlist}
              onToggleFavorite={handleToggleFavorite}
              className="text-[1.5rem]"
            />
            {/* Add to Cart Form */}
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>
          <p>
            <strong>Description</strong>
          </p>
          <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
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
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;
