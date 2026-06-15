-- 005_auction_punishments_and_otp.sql

-- Add trust score columns to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Add auction_id to orders to link auction purchases
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL;

-- Create table for OTP verification codes
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
