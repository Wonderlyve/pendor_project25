
CREATE TABLE public.mobile_money_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'orange_money',
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CDF',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.mobile_money_payments ENABLE ROW LEVEL SECURITY;

-- Users can create their own payment requests
CREATE POLICY "Users can create payment requests"
ON public.mobile_money_payments FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.mobile_money_payments FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Admin (Smart) can view all payments
CREATE POLICY "Admin can view all payments"
ON public.mobile_money_payments FOR SELECT
TO public
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND (profiles.username = 'smart' OR profiles.display_name = 'Smart')
));

-- Admin can update payments (approve/reject)
CREATE POLICY "Admin can update payments"
ON public.mobile_money_payments FOR UPDATE
TO public
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
  AND (profiles.username = 'smart' OR profiles.display_name = 'Smart')
));
