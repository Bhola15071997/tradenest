const SUPABASE_URL = "https://vvtjbcbxbwtgbixukjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGpiY2J4Ynd0Z2JpeHVrandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzM3NzQsImV4cCI6MjA5MjU0OTc3NH0.pQqS-lEnqzCt3AnxqsuVxeT79VrNQKyZPb3yG2ZeHrg";
const DEFAULT_PHONE = "919999999999";

window.TRADENEST_CONFIG = {
  phoneNumber: DEFAULT_PHONE,
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
};

window.tradenestSupabase = (() => {
  const hasConfig =
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_URL.trim() !== "" &&
    SUPABASE_ANON_KEY.trim() !== "" &&
    !SUPABASE_URL.includes("PASTE_YOUR") &&
    !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

  const client =
    hasConfig && window.supabase
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

  const notConfiguredError = () =>
    new Error("Supabase is not configured yet. Add your project URL and anon key in supabase-client.js.");

  const ensureClient = () => {
    if (!client) {
      throw notConfiguredError();
    }
    return client;
  };

  const fetchProducts = async (category = "") => {
    try {
      const supabase = ensureClient();
      let query = supabase
        .from("products")
        .select("id, product_name, category, brand, image_url, description")
        .order("product_name", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Unable to load products:", error.message || error);
      return [];
    }
  };

  const createEnquiry = async (payload) => {
    try {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("enquiries")
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const fetchEnquiries = async () => {
    try {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("enquiries")
        .select("id, name, phone, product, quantity, district, enquiry_type, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Unable to load enquiries:", error.message || error);
      return [];
    }
  };

  const saveProduct = async (payload, id = null) => {
    try {
      const supabase = ensureClient();

      if (id) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { data, error: null };
      }

      const { data, error } = await supabase
        .from("products")
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const supabase = ensureClient();
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInAdmin = async (email, password) => {
    try {
      const supabase = ensureClient();
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOutAdmin = async () => {
    try {
      const supabase = ensureClient();
      return await supabase.auth.signOut();
    } catch (error) {
      return { error };
    }
  };

  const getSession = async () => {
    try {
      const supabase = ensureClient();
      return await supabase.auth.getSession();
    } catch (error) {
      return { data: { session: null }, error };
    }
  };

  const onAuthStateChange = (callback) => {
    if (!client) {
      return { data: { subscription: { unsubscribe() {} } } };
    }

    return client.auth.onAuthStateChange(callback);
  };

  return {
    client,
    hasConfig,
    fetchProducts,
    createEnquiry,
    fetchEnquiries,
    saveProduct,
    deleteProduct,
    signInAdmin,
    signOutAdmin,
    getSession,
    onAuthStateChange,
  };
})();
