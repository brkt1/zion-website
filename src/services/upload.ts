import { logger } from '../utils/logger';
import { supabase } from './supabase';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'event-images')
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'event-images',
  folder: string = 'gallery'
): Promise<string> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to upload images. Please log in and try again.');
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    logger.log(`Attempting to upload to bucket: ${bucket}, path: ${fileName}`);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      const errorMessage = error.message || 'Unknown error';
      console.error('Upload error details:', {
        message: errorMessage,
        error: error,
      });

      // Check for specific error types
      if (errorMessage.includes('Bucket not found') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('404')) {
        throw new Error(
          `Storage bucket '${bucket}' not found.\n\n` +
          `To fix this:\n` +
          `1. Go to your Supabase Dashboard\n` +
          `2. Navigate to Storage\n` +
          `3. Create a new bucket named '${bucket}'\n` +
          `4. Set it to Public (so images can be accessed)\n` +
          `5. Run the SQL in setup-storage.sql to configure RLS policies`
        );
      }
      
      if (errorMessage.includes('new row violates row-level security') ||
          errorMessage.includes('row-level security') ||
          errorMessage.includes('RLS') ||
          errorMessage.includes('42501') ||
          errorMessage.includes('permission denied')) {
        throw new Error(
          `Permission denied by Row Level Security (RLS).\n\n` +
          `To fix this:\n` +
          `1. Go to Storage → Policies for '${bucket}' in Supabase Dashboard\n` +
          `2. Or run the SQL in setup-storage.sql file\n` +
          `3. The policy should allow authenticated users to INSERT files`
        );
      }

      if (errorMessage.includes('JWT') || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
        throw new Error(
          `Authentication error. Please log out and log back in, then try again.`
        );
      }

      // Generic error with full message
      throw new Error(
        `Upload failed: ${errorMessage}\n\n` +
        `Please check:\n` +
        `- The bucket '${bucket}' exists and is accessible\n` +
        `- Your RLS policies allow uploads (see setup-storage.sql)\n` +
        `- You are logged in as an admin\n` +
        `- Check the browser console for more details`
      );
    }

    if (!data) {
      throw new Error('Upload completed but no data returned. Please try again.');
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    logger.log('Upload successful, public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    // If it's already a formatted error message, throw it as is
    if (error.message && error.message.includes('\n')) {
      throw error;
    }
    throw new Error(error.message || 'Failed to upload image. Please check the console for details.');
  }
};

/**
 * Delete an image from Supabase Storage
 * @param filePath - The path of the file to delete
 * @param bucket - The storage bucket name (default: 'event-images')
 */
export const deleteImage = async (
  filePath: string,
  bucket: string = 'event-images'
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
};

