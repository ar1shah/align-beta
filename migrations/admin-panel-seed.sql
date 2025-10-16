-- ==========================================
-- ALIGN - ADMIN PANEL SEED DATA (OPTIONAL)
-- ==========================================
-- Use this to create test data for development
-- ==========================================

-- Sample Realtors
INSERT INTO public.realtors(full_name, email, phone, active, capacity, msa_signed_at)
VALUES 
  ('Ava Lopez', 'ava.lopez@alignrealty.com', '+1-555-0101', TRUE, 25, now() - interval '30 days'),
  ('Max Chen', 'max.chen@alignrealty.com', '+1-555-0102', TRUE, 15, now() - interval '45 days'),
  ('Sarah Williams', 'sarah.williams@alignrealty.com', '+1-555-0103', TRUE, 20, now() - interval '20 days'),
  ('James Rodriguez', 'james.rodriguez@alignrealty.com', '+1-555-0104', FALSE, 30, NULL);

-- Sample Clients
INSERT INTO public.clients(full_name, email, phone, status, source, tags)
VALUES 
  ('John Smith', 'john.smith@example.com', '+1-555-1001', 'new', 'quiz', ARRAY['buyer', 'first-time']),
  ('Priya Patel', 'priya.patel@example.com', '+1-555-1002', 'new', 'quiz', ARRAY['buyer', 'luxury']),
  ('Michael Johnson', 'michael.johnson@example.com', '+1-555-1003', 'qualified', 'referral', ARRAY['seller']),
  ('Emily Chen', 'emily.chen@example.com', '+1-555-1004', 'new', 'quiz', ARRAY['buyer']),
  ('David Martinez', 'david.martinez@example.com', '+1-555-1005', 'contacted', 'manual', ARRAY['buyer', 'investor']),
  ('Lisa Anderson', 'lisa.anderson@example.com', '+1-555-1006', 'new', 'quiz', ARRAY['buyer']),
  ('Robert Taylor', 'robert.taylor@example.com', '+1-555-1007', 'qualified', 'quiz', ARRAY['seller', 'downsizing']),
  ('Jennifer Lee', 'jennifer.lee@example.com', '+1-555-1008', 'new', 'referral', ARRAY['buyer']);

-- ==========================================
-- ✅ SEED DATA COMPLETE!
-- ==========================================

