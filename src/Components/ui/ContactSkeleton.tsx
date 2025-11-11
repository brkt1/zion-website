export const ContactSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Information Skeleton */}
          <div>
            <div className="mb-8 md:mb-12">
              <div className="h-10 sm:h-12 md:h-14 lg:h-16 w-48 mb-4 md:mb-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-5 w-full mb-6 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 bg-gray-50 animate-pulse">
                  <div className="flex items-start gap-4 md:gap-6 pt-6 md:pt-8">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-grow">
                      <div className="h-5 w-32 mb-2 bg-gray-200 rounded"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media Skeleton */}
            <div>
              <div className="h-6 w-24 mb-4 md:mb-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex gap-3 md:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Skeleton */}
          <div>
            <div className="rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 bg-white border border-gray-200 animate-pulse">
              <div className="h-1 w-16 md:w-20 mb-6 rounded-full bg-gray-200"></div>
              <div className="h-8 md:h-10 w-40 mb-6 md:mb-8 bg-gray-200 rounded-lg"></div>
              
              <div className="space-y-4 md:space-y-6">
                {[1, 2, 3, 4].map((i) => (
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
    </div>
  );
};

