/**
 * Skip to Main Content Link
 * 
 * Provides keyboard users with a way to skip navigation and go directly to main content.
 * This is an important accessibility feature (WCAG 2.1 Level A requirement).
 */
const SkipToContent = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Make main focusable temporarily for focus to work
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        mainContent.addEventListener('blur', () => {
          mainContent.removeAttribute('tabindex');
        }, { once: true });
      }
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;

