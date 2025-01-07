// Questionary.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Questionary = ({ category, type }) => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('category', category)
                .eq('type', type);

            if (error) console.error('Error fetching questions:', error);
            else setQuestions(data);
        };

        fetchQuestions();
    }, [category, type]);

    const handleRandomQuestion = () => {
        if (questions.length > 0) {
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            setSelectedQuestion(randomQuestion.question);
        } else {
            setSelectedQuestion('No questions available for this selection.');
        }
    };

    return (
        <div className="mt-4">
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={handleRandomQuestion}
            >
                Get Random Question
            </button>
            {selectedQuestion && (
                <div className="border p-4 mt-2 rounded bg-gray-800 text-white">
                    {selectedQuestion}
                </div>
            )}
        </div>
    );
};

export default Questionary;