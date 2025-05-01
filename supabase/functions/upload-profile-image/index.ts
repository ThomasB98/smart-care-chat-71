
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Creates a Supabase client with the Auth context of the function
const createServerClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create supabase client
    const supabase = createServerClient();
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Content-type must be multipart/form-data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Create a storage bucket if it doesn't exist
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketName = 'profile-images';
    
    if (!existingBuckets?.some(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }
    
    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Create a filename from the user's ID and the current timestamp
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${timestamp}.${fileExt}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Error uploading file' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    // Update the user's profile with the new avatar URL
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatar_url: publicUrlData.publicUrl
      }, {
        onConflict: 'id'
      });
    
    if (profileError) {
      console.error('Profile update error:', profileError);
      return new Response(JSON.stringify({ error: 'Error updating profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Return the URL of the uploaded image
    return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
