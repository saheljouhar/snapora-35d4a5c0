DROP POLICY IF EXISTS "Authenticated users can upload posters 1sk75qe_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update posters 1sk75qe_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete posters 1sk75qe_0" ON storage.objects;

CREATE POLICY "Admins can upload poster files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posters'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update poster files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posters'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'posters'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete poster files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'posters'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);