// CertificatesTable.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import Error from '../../components/Error';

const CertificatesTable = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('certificates').select('*');
        if (error) throw error;
        setCertificates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Player Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Score</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Game Type</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Paid</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {certificates.map(cert => (
            <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cert.playerName}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{cert.score}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{cert.gameType}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${cert.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cert.paid ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => togglePaidStatus(cert.id, cert.paid)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${cert.paid 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {cert.paid ? 'Mark Unpaid' : 'Mark Paid'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificatesTable;