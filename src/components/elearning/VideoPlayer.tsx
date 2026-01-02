import { useEffect, useState } from 'react';
import { FaCheckCircle, FaPlay, FaSpinner } from 'react-icons/fa';
import { supabase } from '../../services/supabase';

interface VideoPlayerProps {
  youtubeId: string;
  videoTopic: string;
  lessonId: string;
  videoIndex: number;
  userId: string;
}

const VideoPlayer = ({ youtubeId, videoTopic, lessonId, videoIndex, userId }: VideoPlayerProps) => {
  const [lastPosition, setLastPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Load video progress from database
  useEffect(() => {
    const loadVideoProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('video_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .eq('video_index', videoIndex)
          .single();

        if (!error && data) {
          setLastPosition(data.last_position_seconds || 0);
          setCompleted(data.completed || false);
          setHasStarted(data.last_position_seconds > 0 || data.completed);
        }
      } catch (error: any) {
        // If no progress found, that's okay
        if (error.code !== 'PGRST116') {
          console.error('Error loading video progress:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId && lessonId) {
      loadVideoProgress();
    }
  }, [userId, lessonId, videoIndex]);

  // Mark video as started when user clicks play
  const handleVideoStart = async () => {
    if (!hasStarted) {
      setHasStarted(true);
      try {
        await supabase
          .from('video_progress')
          .upsert({
            user_id: userId,
            lesson_id: lessonId,
            video_index: videoIndex,
            youtube_id: youtubeId,
            watch_time_seconds: 1,
            last_position_seconds: 0,
            completed: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id,video_index'
          });
      } catch (error) {
        console.error('Error saving video start:', error);
      }
    }
  };

  // Mark video as completed (called manually by user or can be enhanced with YouTube API)
  const handleVideoComplete = async () => {
    if (!completed) {
      setCompleted(true);
      try {
        await supabase
          .from('video_progress')
          .upsert({
            user_id: userId,
            lesson_id: lessonId,
            video_index: videoIndex,
            youtube_id: youtubeId,
            watch_time_seconds: lastPosition || 1,
            last_position_seconds: lastPosition || 0,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,lesson_id,video_index'
          });
      } catch (error) {
        console.error('Error marking video complete:', error);
      }
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Build YouTube embed URL with resume position
  const getYouTubeUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${youtubeId}`;
    const params = new URLSearchParams();
    
    // Enable API for future enhancements
    params.append('enablejsapi', '1');
    params.append('origin', window.location.origin);
    
    // Resume from last position if not completed
    if (lastPosition > 0 && !completed) {
      params.append('start', Math.floor(lastPosition).toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={getYouTubeUrl()}
          title={videoTopic}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleVideoStart}
        />
      </div>
      
      {/* Video Progress Info */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {completed ? (
              <div className="flex items-center space-x-2 text-green-600">
                <FaCheckCircle />
                <span className="font-semibold">Video Completed</span>
              </div>
            ) : lastPosition > 0 ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <FaPlay />
                <span>Will resume from {formatTime(lastPosition)}</span>
              </div>
            ) : hasStarted ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <FaPlay />
                <span>In Progress</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <FaPlay />
                <span>Click play to start</span>
              </div>
            )}
          </div>
          {!completed && (
            <button
              onClick={handleVideoComplete}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

