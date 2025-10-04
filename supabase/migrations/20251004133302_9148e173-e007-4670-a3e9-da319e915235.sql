-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
);

-- Storage policies for resumes bucket
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can view resumes in their org"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can update their uploaded resumes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can delete resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');