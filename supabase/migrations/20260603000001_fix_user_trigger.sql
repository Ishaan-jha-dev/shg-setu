-- Fix the handle_new_user trigger to not require phone (it's optional from auth metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
