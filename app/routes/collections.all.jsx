// app/routes/collections.all.jsx

import {defer, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link, useNavigation} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import FilterSection from '~/components/FilterSection';
import ProductItem from '~/components/ProductItem';
import React, {useState, useEffect} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Hydrogen | Products`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, params, request}) {
  const url = new URL(request.url);
  const tags = url.searchParams.getAll('tags'); // Get all 'tags' query parameters
  let collections = url.searchParams.getAll('collections'); // Get all 'collections' query parameters

  // Debugging Logs
  console.log('Initial Tags:', tags);
  console.log('Initial Collections:', collections);

  // Construct the tags and collections query strings for GraphQL
  const tagsQuery =
    tags.length > 0 ? tags.map((tag) => `tag:${tag}`).join(' OR ') : '';
  const collectionsQuery =
    collections.length > 0
      ? collections.map((c) => `collection:${c}`).join(' OR ')
      : '';

  // Combine tags and collections query
  let combinedQuery = '';
  if (tagsQuery && collectionsQuery) {
    combinedQuery = `(${tagsQuery}) AND (${collectionsQuery})`;
  } else if (tagsQuery) {
    combinedQuery = tagsQuery;
  } else if (collectionsQuery) {
    combinedQuery = collectionsQuery;
  }

  // Debugging Logs
  console.log('Tags Query:', tagsQuery);
  console.log('Collections Query:', collectionsQuery);
  console.log('Combined Query:', combinedQuery);

  // Retrieve country and language from context for localization
  const country = context.storefront.i18n.country;
  const language = context.storefront.i18n.language;

  const criticalData = await loadCriticalData({
    context,
    params,
    request,
    combinedQuery,
    selectedTags: tags,
    selectedCollections: collections,
    country,
    language,
  });
  const deferredData = loadDeferredData(context);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold.
 */
async function loadCriticalData({
  context,
  params,
  request,
  combinedQuery,
  selectedTags,
  selectedCollections,
  country,
  language,
}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  // Ensure 'first' is provided
  if (!paginationVariables.first && !paginationVariables.last) {
    paginationVariables.first = 8; // Default value
  }

  const variables = {
    firstProducts: paginationVariables.first,
    lastProducts: paginationVariables.last,
    startCursor: paginationVariables.startCursor,
    endCursor: paginationVariables.endCursor,
    productQuery: combinedQuery, // Combined query
    firstCollections: 100, // Adjust as needed
    country: country, // Required by @inContext
    language: language, // Required by @inContext
  };

  console.log('Variables for CATALOG_AND_COLLECTIONS_QUERY:', variables);

  const PRODUCT_ITEM_FRAGMENT = `#graphql
    fragment MoneyProductItem on MoneyV2 {
      amount
      currencyCode
    }

    fragment ProductItem on Product {
      id
      handle
      title
      tags
      featuredImage {
        id
        altText
        url
        width
        height
      }
      priceRange {
        minVariantPrice {
          ...MoneyProductItem
        }
        maxVariantPrice {
          ...MoneyProductItem
        }
      }
    }
  `;

  const CATALOG_AND_COLLECTIONS_QUERY = `#graphql
    ${PRODUCT_ITEM_FRAGMENT}
    query CatalogAndCollections(
      $country: CountryCode
      $language: LanguageCode
      $firstProducts: Int
      $lastProducts: Int
      $startCursor: String
      $endCursor: String
      $productQuery: String
      $firstCollections: Int
    ) @inContext(country: $country, language: $language) {
      products(
        first: $firstProducts,
        last: $lastProducts,
        before: $startCursor,
        after: $endCursor,
        query: $productQuery
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
      collections(first: $firstCollections) {
        nodes {
          id
          handle
          title
        }
      }
    }
  `;

  try {
    const {products, collections} = await storefront.query(
      CATALOG_AND_COLLECTIONS_QUERY,
      {variables},
    );

    console.log('Fetched Products:', products);
    console.log('Fetched Collections:', collections);

    // If no collections were selected, set all collections as selected
    let finalSelectedCollections = selectedCollections;
    if (selectedCollections.length === 0) {
      finalSelectedCollections = collections.nodes.map((c) => c.handle);
    }

    return {
      products,
      allCollections: collections.nodes, // All available collections
      selectedCollections: finalSelectedCollections, // Selected collection handles
      selectedTags: selectedTags, // Selected tags
      paginationVariables, // Pass to component
    };
  } catch (error) {
    console.error('Error fetching products and collections:', error);
    throw new Response('Error fetching products and collections', {
      status: 500,
    });
  }
}

function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  const {
    products,
    allCollections,
    selectedCollections,
    selectedTags,
    paginationVariables,
  } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle drop-down visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close drop-down when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.collections_filters-dropdown')) {
      setIsDropdownOpen(false);
    }
  };

  // Add event listener for clicks outside
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Extract unique tags from all products in the collection
  const allTags = Array.from(
    new Set(products.nodes.flatMap((product) => product.tags)),
  );

  return (
    <div className="collection">
      <div className="collections_filters-dropdown relative">
        <button
          onClick={toggleDropdown}
          className="dropdown-button absolute cursor-pointer px-4 py-2 bg-gray-500 text-white font-bold rounded-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Filters ⇣
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content absolute left-0 mt-2 w-80 bg-zinc-800 border border-gray-200 rounded-md shadow-lg z-50 p-4">
            <FilterSection
              allTags={allTags}
              selectedTags={selectedTags}
              allCollections={allCollections}
              selectedCollections={selectedCollections}
            />
          </div>
        )}
      </div>

      <div className="home_crt-collections">
        <h1 className="text-center">Products</h1>
        {/* Product Grid */}
        <PaginatedResourceSection
          connection={products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      </div>
      {/* Analytics */}
      <Analytics.CollectionView
        data={{
          collection: {
            id: 'all-products',
            handle: 'all-products',
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;
