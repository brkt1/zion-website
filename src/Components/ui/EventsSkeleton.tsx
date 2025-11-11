export const EventsSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-12 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-32 mb-3 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-3/4 max-w-2xl bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="max-w-4xl">
            {/* Search Bar Skeleton */}
            <div className="relative mb-6">
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Category Filters Skeleton */}
            <div className="flex flex-wrap gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Skeleton */}
      <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl md:rounded-3xl bg-white border border-gray-100 overflow-hidden animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="h-40 sm:h-48 bg-gray-200"></div>

                <div className="p-6 md:p-8">
                  {/* Decorative line */}
                  <div className="h-0.5 w-10 md:w-12 mb-4 md:mb-6 rounded-full bg-gray-200"></div>

                  {/* Title */}
                  <div className="h-6 md:h-8 w-3/4 mb-3 md:mb-4 bg-gray-200 rounded-lg"></div>

                  {/* Date and Location */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 mb-5 md:mb-6">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                  </div>

                  {/* CTA */}
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

