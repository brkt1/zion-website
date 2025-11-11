export const ApplySkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4 md:mb-6">
              <div className="h-1 w-16 md:w-20 mx-auto mb-3 md:mb-4 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-64 mx-auto mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-3/4 max-w-2xl mx-auto bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Application Type Selection Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-200 bg-white animate-pulse">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-200 mb-4"></div>
                <div className="h-6 md:h-8 w-32 mb-2 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Form Skeleton */}
          <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 bg-white border border-gray-200 animate-pulse">
            <div className="h-1 w-16 md:w-20 mb-6 rounded-full bg-gray-200"></div>
            <div className="h-8 md:h-10 w-48 mb-6 md:mb-8 bg-gray-200 rounded-lg"></div>
            
            <div className="space-y-4 md:space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 mb-2 bg-gray-200 rounded"></div>
                  <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>

            <div className="mt-6 md:mt-8">
              <div className="h-12 md:h-14 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

