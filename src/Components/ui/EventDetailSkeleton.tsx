export const EventDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header Skeleton */}
      <section className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-4 sm:pb-6 md:pb-8 lg:pb-12 relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 sm:h-10 md:h-12 lg:h-16 xl:h-20 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-12">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Image Skeleton */}
            <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 rounded-lg overflow-hidden bg-gray-200 h-40 sm:h-48 md:h-64 lg:h-80 xl:h-96 animate-pulse"></div>
            
            {/* Event Info Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10 lg:mb-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12 border-b border-gray-200">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4 sm:mb-0">
                  <div className="h-4 w-20 mb-2 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <div className="h-6 sm:h-8 md:h-10 w-48 mb-3 sm:mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Gallery Skeleton */}
            <div className="overflow-x-hidden">
              <div className="h-6 sm:h-8 md:h-10 w-40 mb-3 sm:mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-[30px] md:rounded-[40px] bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4 sm:top-6 lg:top-20 xl:top-24">
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6">
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <div className="h-8 sm:h-10 md:h-12 lg:h-16 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
                
                <div className="h-12 sm:h-14 md:h-16 w-full bg-gray-200 rounded-lg mb-3 sm:mb-4 md:mb-6 animate-pulse"></div>
                
                <div className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6">
                  <div className="h-4 w-24 mb-2 sm:mb-3 md:mb-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex gap-2 sm:gap-3">
                    <div className="flex-1 h-10 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 h-10 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

