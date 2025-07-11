import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import LoadingSpinner from '../utility/LoadingSpinner';
import Error from '../utility/Error';

const ITEMS_PER_PAGE = 10;

const CertificatesTable = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        const { data, error, count } = await supabase
          .from('certificates')
          .select('*', { count: 'exact' })
          .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

        if (error) throw error;

        setCertificates(data);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [page]);

  const togglePaidStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('certificates')
      .update({ paid: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating paid status:', error);
    } else {
      setCertificates(certificates.map(cert => 
        cert.id === id ? { ...cert, paid: !currentStatus } : cert
      ));
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Error message={error} />;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-medium text-amber-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-medium text-amber-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-medium text-amber-400 uppercase tracking-wider">
                Game Type
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-medium text-amber-400 uppercase tracking-wider">
                Rewarded By
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-medium text-amber-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {certificates.map(cert => (
              <tr key={cert.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-300 font-medium whitespace-nowrap">
                  {cert.playerName}
                </td>
                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-400">
                  {cert.score}
                </td>
                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-400">
                  {cert.gameType}
                </td>
                <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm text-gray-400">
                  Cafe Owner Name
                </td>
                <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                  <button 
                    onClick={() => togglePaidStatus(cert.id, cert.paid)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      cert.paid 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {cert.paid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                </td>
              </tr>
            ))}
            {certificates.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                  No certificates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Showing <span className="font-medium">{page * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min((page + 1) * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE)}</span> of <span className="font-medium">{totalPages * ITEMS_PER_PAGE}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesTable;
