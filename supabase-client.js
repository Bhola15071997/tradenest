const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

const DEFAULT_PHONE = "919999999999";

window.TRADENEST_CONFIG = {
  phoneNumber: DEFAULT_PHONE,
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
};

window.tradenestSupabase = (() => {
  const hasConfig =
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("https://vvtjbcbxbwtgbixukjwd.supabase.co") &&
    !SUPABASE_ANON_KEY.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGpiY2J4Ynd0Z2JpeHVrandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzM3NzQsImV4cCI6MjA5MjU0OTc3NH0.pQqS-lEnqzCt3AnxqsuVxeT79VrNQKyZPb3yG2ZeHrg");

  const client = hasConfig && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const fetchProducts = async (category = "") => {
    if (!client) {
      console.warn("Supabase is not configured yet.");
      return [];
    }

    let query = client
      .from("products")
      .select("id, product_name, category, brand, image_url, description")
      .order("product_name", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Unable to load products", error.message);
      return [];
    }

    return data || [];
  };

  const createEnquiry = async (payload) => {
    if (!client) {
      return { data: null, error: new Error("Supabase is not configured yet.") };
    }

    const { data, error } = await client.from("enquiries").insert([payload]).select().single();
    return { data, error };
  };

  return {
    client,
    hasConfig,
    fetchProducts,
    createEnquiry,
  };
})();
