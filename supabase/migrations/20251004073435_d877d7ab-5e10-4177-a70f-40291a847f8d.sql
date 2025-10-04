-- Create storage bucket for job description files
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-descriptions', 'job-descriptions', false);

-- RLS policies for job-descriptions bucket
CREATE POLICY "Authenticated users can upload job descriptions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-descriptions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own job descriptions"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'job-descriptions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own job descriptions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'job-descriptions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);