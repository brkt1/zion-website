import { useEffect, useState } from 'react';
import { FaEdit, FaSave, FaStickyNote, FaTimes } from 'react-icons/fa';
import { supabase } from '../../services/supabase';

interface StudentNotesProps {
  lessonId: string;
  userId: string;
}

const StudentNotes = ({ lessonId, userId }: StudentNotesProps) => {
  const [noteText, setNoteText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load notes from database
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('student_notes')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .single();

        if (!error && data) {
          setNoteText(data.note_text || '');
        }
      } catch (error: any) {
        // If no notes found, that's okay
        if (error.code !== 'PGRST116') {
          console.error('Error loading notes:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId && lessonId) {
      loadNotes();
    }
  }, [userId, lessonId]);

  // Save notes to database
  const saveNotes = async () => {
    if (!noteText.trim()) {
      // If note is empty, delete it
      try {
        await supabase
          .from('student_notes')
          .delete()
          .eq('user_id', userId)
          .eq('lesson_id', lessonId);
        setIsEditing(false);
        return;
      } catch (error) {
        console.error('Error deleting notes:', error);
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('student_notes')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          note_text: noteText.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 shadow-sm">
      <div className="p-4 border-b border-yellow-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaStickyNote className="text-yellow-600 text-lg" />
          <h5 className="font-bold text-gray-900">My Notes</h5>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FaEdit className="text-xs" />
            <span>{noteText ? 'Edit' : 'Add Notes'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={saveNotes}
              disabled={saving}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                // Reload original note text
                const loadNotes = async () => {
                  const { data } = await supabase
                    .from('student_notes')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('lesson_id', lessonId)
                    .single();
                  if (data) {
                    setNoteText(data.note_text || '');
                  } else {
                    setNoteText('');
                  }
                };
                loadNotes();
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FaTimes className="text-xs" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="p-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your notes here... You can add key points, reminders, questions, or anything that helps you learn!"
            rows={6}
            className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900 placeholder-gray-400 resize-none"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Your notes are saved automatically and private to you.
          </p>
        </div>
      ) : (
        <div className="p-4">
          {noteText ? (
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{noteText}</p>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FaStickyNote className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet. Click "Add Notes" to start taking notes!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentNotes;

