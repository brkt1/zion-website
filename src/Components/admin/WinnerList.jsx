import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const WinnerList = () => {
    const [certificates, setCertificates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchCertificates = async () => {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('game_type', 'trivia'); // Example of filtering by game_type


            if (error) {
                console.error('Error fetching certificates:', error);
            } else {
                setCertificates(data);
            }
        };

        fetchCertificates();
    }, []);

    const filteredCertificates = certificates.filter(certificate =>
        certificate.playerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedCertificates = filteredCertificates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <h2>Certificates List</h2>
            <input
                type="text"
                placeholder="Search by player name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <table>
                <thead>
                    <tr>
                        <th>Player Name</th>
                        <th>Score</th>
                        <th>Paid</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCertificates.map(cert => (
                        <tr key={cert.id}>
                            <td>{cert.playerName}</td>
                            <td>{cert.game_type}</td> // Added game_type column

                            <td>{cert.score}</td>
                            <td>{cert.paid ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Pagination logic can be added here */}
        </div>
    );
};

export default WinnerList;
