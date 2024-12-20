// app/components/FilterSection.jsx
import {Form} from '@remix-run/react';

export default function FilterSection({
  allTags,
  selectedTags,
  allCollections,
  selectedCollections,
}) {
  // If no collections are selected, all collections are active by default
  const allSelected = selectedCollections.length === allCollections.length;

  return (
    <div className="filter-section text-lime-50">
      <Form method="get" className="space-y-4">
        {/* Tags Filter */}
        {allTags.length > 0 && (
          <>
            <h2>Filter by Tags</h2>
            <div className="filter-options grid grid-cols-2 md:grid-cols-4 gap-2">
              {allTags.map((tag) => (
                <label
                  key={tag}
                  htmlFor={`tag-${tag}`}
                  className="filter-option flex text-lime-50 items-center space-x-2"
                >
                  <input
                    id={`tag-${tag}`}
                    type="checkbox"
                    name="tags"
                    value={tag}
                    defaultChecked={selectedTags.includes(tag)}
                    className="form-checkbox bg-lime-400 h-4 w-4 text-red-600"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {/* Collections Filter */}
        {allCollections.length > 0 && (
          <>
            <h2>Filter by Collections</h2>
            <div className="filter-options grid grid-cols-2 md:grid-cols-4 gap-2">
              {allCollections.map((collection) => (
                <label
                  key={collection.handle}
                  htmlFor={`collection-${collection.handle}`}
                  className="filter-option flex text-lime-50 items-center space-x-2"
                >
                  <input
                    id={`collection-${collection.handle}`}
                    type="checkbox"
                    name="collections"
                    value={collection.handle}
                    defaultChecked={selectedCollections.includes(
                      collection.handle,
                    )}
                    className="form-checkbox bg-lime-400 h-4 w-4 text-red-600"
                  />
                  <span>{collection.title}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {/* Submit and Clear Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-gray-500 text-red-800 font-bold rounded-sm hover:bg-gray-700 hover:text-red-500 cursor-pointer shadow-md"
          >
            Apply Filters
          </button>
          <a
            href="/collections/all"
            className="px-4 py-2 bg-gray-300 text-red-600 font-bold rounded-sm hover:bg-gray-500 hover:text-red-200"
          >
            Clear Filters
          </a>
        </div>
      </Form>
    </div>
  );
}
