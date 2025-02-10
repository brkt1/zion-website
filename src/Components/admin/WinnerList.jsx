import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const WinnerList = () => {
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login'); // Redirect to login if not authenticated
            } else {
                fetchCertificates();
            }
        };

        checkUser();
    }, [navigate]);

    const fetchCertificates = async () => {
        const { data, error } = await supabase
            .from('certificates')
            .select('*');

        if (error) {
            setError('Error fetching certificates: ' + error.message);
        } else {
            setCertificates(data);
        }
    };

    return (
        <div>
            <h2>Winner List</h2>
            {error && <p>{error}</p>}
            <ul>
                {certificates.map(cert => (
                    <li key={cert.id}>{cert.playerName} - {cert.score}</li>
                ))}
            </ul>
        </div>
    );
};

export default WinnerList;