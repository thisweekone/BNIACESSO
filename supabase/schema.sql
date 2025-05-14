-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE reference_type AS ENUM ('given', 'received');
CREATE TYPE reference_status AS ENUM ('pending', 'completed', 'in_progress');

-- Create members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    bio TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_services junction table
CREATE TABLE member_services (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, service_id)
);

-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_tags junction table
CREATE TABLE member_tags (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, tag_id)
);

-- Create member_references table
CREATE TABLE member_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type reference_type NOT NULL,
    status reference_status NOT NULL DEFAULT 'pending',
    description TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    giver_id UUID REFERENCES members(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_references ENABLE ROW LEVEL SECURITY;

-- Create policies for members
CREATE POLICY "Members are viewable by everyone"
    ON members FOR SELECT
    USING (true);

CREATE POLICY "Members can be created by authenticated users"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Members can be updated by themselves"
    ON members FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Create policies for references
CREATE POLICY "References are viewable by everyone"
    ON member_references FOR SELECT
    USING (true);

CREATE POLICY "References can be created by authenticated users"
    ON member_references FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = giver_id);

CREATE POLICY "References can be updated by the giver"
    ON member_references FOR UPDATE
    TO authenticated
    USING (auth.uid() = giver_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_references_updated_at
    BEFORE UPDATE ON member_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_city ON members(city);
CREATE INDEX idx_references_date ON member_references(date);
CREATE INDEX idx_references_giver_id ON member_references(giver_id);
CREATE INDEX idx_references_receiver_id ON member_references(receiver_id); 