import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone } = await req.json();

    console.log('Received request for customer bookings:', { name, phone: phone ? '***' + phone.slice(-4) : 'missing' });

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('Invalid name provided');
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      console.error('Invalid phone provided');
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone format (10-digit Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      console.error('Invalid phone format');
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate name length
    if (name.trim().length > 100) {
      console.error('Name too long');
      return new Response(
        JSON.stringify({ error: 'Name must be less than 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Server-side filtering with case-insensitive name match and exact phone match
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('name', name.trim())
      .eq('phone', cleanPhone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch bookings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${data?.length || 0} bookings for customer`);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
