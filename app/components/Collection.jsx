export default function Collection() {
  const {products, tags, paginationVariables} = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Extract unique tags from all products
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
          tagsQuery:
            tags.length > 0 ? tags.map((tag) => `tag:${tag}`).join(' OR ') : '',
          ...paginationVariables,
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
