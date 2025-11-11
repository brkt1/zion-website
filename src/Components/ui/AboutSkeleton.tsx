export const AboutSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 sm:mb-6 md:mb-8">
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 w-3/4 mx-auto mb-4 sm:mb-6 md:mb-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 sm:h-8 md:h-10 lg:h-12 w-full max-w-3xl mx-auto bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Story Section Skeleton */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 lg:p-16 bg-gray-50 animate-pulse">
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 md:w-24 mb-4 sm:mb-6 md:mb-8 rounded-full bg-gray-200"></div>
              <div className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-2/3 mb-4 sm:mb-6 md:mb-8 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="h-4 sm:h-5 md:h-6 w-full bg-gray-200 rounded"></div>
                <div className="h-4 sm:h-5 md:h-6 w-full bg-gray-200 rounded"></div>
                <div className="h-4 sm:h-5 md:h-6 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 sm:h-5 md:h-6 w-full bg-gray-200 rounded"></div>
                <div className="h-4 sm:h-5 md:h-6 w-4/5 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section Skeleton */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block mb-3 sm:mb-4 md:mb-6">
              <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 w-1/3 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-10 bg-gray-50 animate-pulse"
              >
                <div className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 md:mb-8 rounded-full bg-gray-200"></div>
                <div className="h-6 sm:h-8 md:h-10 w-3/4 mb-3 sm:mb-4 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-4 sm:h-5 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 sm:h-5 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 sm:h-5 w-5/6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Skeleton */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 bg-white animate-pulse">
                  <div className="h-0.5 sm:h-1 w-10 sm:w-12 md:w-16 mb-4 sm:mb-6 rounded-full bg-gray-200"></div>
                  <div className="h-6 sm:h-8 md:h-10 w-2/3 mb-3 sm:mb-4 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="h-4 sm:h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 sm:h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 sm:h-5 w-4/5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Skeleton */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <div className="inline-block mb-3 sm:mb-4 md:mb-6">
              <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 w-1/3 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
                  <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                  <div className="flex-grow w-full rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-5 sm:p-6 md:p-10 bg-gray-50 animate-pulse">
                    <div className="h-5 sm:h-6 w-20 sm:w-24 mb-2 sm:mb-3 bg-gray-200 rounded-full"></div>
                    <div className="h-6 sm:h-8 md:h-10 w-3/4 mb-2 sm:mb-3 md:mb-4 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 sm:h-5 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 sm:h-5 w-5/6 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

