import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Link, Form, useTransition} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

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

  const criticalData = await loadCriticalData({context, params, request, tags});
  const deferredData = loadDeferredData(context);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs & { tags: string[] }}
 */
async function loadCriticalData({context, params, request, tags}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables, tags},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    products,
    tags, // Pass tags to the component for UI state
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products, tags} = useLoaderData();
  const transition = useTransition();
  const isSubmitting = transition.state === 'submitting';

  // Extract unique tags from all products in the collection
  const allTags = Array.from(
    new Set(products.nodes.flatMap((product) => product.tags)),
  );

  return (
    <div className="collection">
      <h1>Products</h1>

      {/* Filter Section */}
      <FilterSection allTags={allTags} selectedTags={tags} />

      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
        query={{
          tags,
          ...getPaginationVariables(request),
        }}
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
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

/**
 * @param {Object} props
 * @param {string[]} props.allTags
 * @param {string[]} props.selectedTags
 */
function FilterSection({allTags, selectedTags}) {
  const transition = useTransition();
  const isSubmitting = transition.state === 'submitting';

  // Handler to clear all filters
  const clearFilters = () => {
    window.location.href = '/collections/all'; // Adjust the path if necessary
  };

  if (allTags.length === 0) {
    return null; // No tags to display
  }

  return (
    <div className="filter-section">
      <h2>Filter by Tags</h2>
      <Form method="get" className="space-y-4">
        <div className="filter-options grid grid-cols-2 md:grid-cols-4 gap-2">
          {allTags.map((tag) => (
            <label
              key={tag}
              className="filter-option flex items-center space-x-2"
            >
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={selectedTags.includes(tag)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-indigo-600 text-white rounded ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Applying...' : 'Apply Filters'}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </Form>
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
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

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $tagsQuery: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      query: $tagsQuery
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
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
