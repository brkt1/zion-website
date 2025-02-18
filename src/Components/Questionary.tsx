import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoadingSpinner from '../Components/LoadingSpinner';

interface Question {
  id: string;
  question: string;
  category: string;
  type: string;
}

interface QuestionaryProps {
  category: string;
  type: string;
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Questionary: React.FC<QuestionaryProps> = ({ category, type }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('category', category)
                .eq('type', type);

            if (error) {
                console.error('Error fetching questions:', error);
                setError('Failed to load questions');
            } else if (data) {
                setQuestions(data);
            }
            setLoading(false);
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

    if (loading) return <LoadingSpinner />;
    
    if (error) return (
        <div className="mt-4 text-red-500">
            {error}
        </div>
    );

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
