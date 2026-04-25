const ADMIN_CATEGORIES = ["adhesives", "hardware", "tools", "plumbing", "tiles"];

let adminProducts = [];
let adminEnquiries = [];
let currentEditId = null;
let currentEnquiryId = null;

const getEnquiryStatus = (enquiry) => enquiry.status || "new";

const updateProductPreview = (imageUrl = "") => {
  const wrap = document.getElementById("product-image-preview-wrap");
  const img = document.getElementById("product-image-preview");

  if (!wrap || !img) {
    return;
  }

  if (imageUrl) {
    img.src = imageUrl;
    wrap.classList.remove("hidden");
  } else {
    img.src = "";
    wrap.classList.add("hidden");
  }
};

const adminStatus = (text, tone = "slate") => {
  const node = document.getElementById("admin-status");
  if (!node) {
    return;
  }

  const tones = {
    slate: "text-slate-600",
    success: "text-emerald-600",
    danger: "text-rose-600",
    warning: "text-amber-600",
  };

  node.textContent = text;
  node.className = `text-sm font-semibold ${tones[tone] || tones.slate}`;
};

const setAdminShell = (signedIn, email = "") => {
  const loginView = document.getElementById("admin-login-view");
  const dashboardView = document.getElementById("admin-dashboard-view");
  const emailNode = document.getElementById("admin-user-email");
  const logoutButton = document.getElementById("admin-logout");

  loginView?.classList.toggle("hidden", signedIn);
  dashboardView?.classList.toggle("hidden", !signedIn);
  logoutButton?.classList.toggle("hidden", !signedIn);

  if (emailNode) {
    emailNode.textContent = email;
  }
};

const resetProductForm = () => {
  const form = document.getElementById("product-form");
  const fileInput = document.getElementById("product-image-file");
  if (!form) {
    return;
  }

  form.reset();
  form.category.value = "adhesives";
  currentEditId = null;
  if (fileInput) {
    fileInput.value = "";
  }
  updateProductPreview("");
  document.getElementById("product-submit-text").textContent = "Save Product";
  document.getElementById("product-cancel-edit").classList.add("hidden");
};

const fillProductForm = (product) => {
  const form = document.getElementById("product-form");
  if (!form) {
    return;
  }

  form.product_name.value = product.product_name || "";
  form.category.value = product.category || "adhesives";
  form.brand.value = product.brand || "";
  form.image_url.value = product.image_url || "";
  form.description.value = product.description || "";
  updateProductPreview(product.image_url || "");
  currentEditId = product.id;
  document.getElementById("product-submit-text").textContent = "Update Product";
  document.getElementById("product-cancel-edit").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const renderDashboardStats = () => {
  const totalProducts = adminProducts.length;
  const totalEnquiries = adminEnquiries.length;
  const openEnquiries = adminEnquiries.filter((item) => ["new", "in_progress"].includes(getEnquiryStatus(item))).length;
  const districts = new Set(adminEnquiries.map((item) => item.district).filter(Boolean)).size;

  document.getElementById("stat-products").textContent = totalProducts;
  document.getElementById("stat-enquiries").textContent = totalEnquiries;
  document.getElementById("stat-open-enquiries").textContent = openEnquiries;
  document.getElementById("stat-districts").textContent = districts;
};

const renderAdminProducts = () => {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) {
    return;
  }

  if (!adminProducts.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-sm font-semibold text-slate-500">No products found. Add your first product from the form above.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminProducts.map((product) => `
    <tr class="border-b border-slate-100">
      <td class="px-4 py-4">
        <div class="flex items-center gap-3">
          <img src="${product.image_url || ""}" alt="${product.product_name}" class="h-12 w-12 rounded-2xl object-cover" onerror="this.style.display='none'" />
          <div>
            <p class="font-bold text-slate-900">${product.product_name}</p>
            <p class="text-xs text-slate-500">${product.id}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-4 text-sm font-semibold text-slate-700">${product.category}</td>
      <td class="px-4 py-4 text-sm font-semibold text-slate-700">${product.brand}</td>
      <td class="px-4 py-4 text-sm text-slate-500">${product.description || "-"}</td>
      <td class="px-4 py-4 text-sm text-slate-500">${product.image_url ? "Uploaded" : "No image"}</td>
      <td class="px-4 py-4 text-right">
        <button type="button" onclick="window.editAdminProduct('${product.id}')" class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">Edit</button>
      </td>
      <td class="px-4 py-4 text-right">
        <button type="button" onclick="window.deleteAdminProduct('${product.id}')" class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">Delete</button>
      </td>
    </tr>
  `).join("");
};

const renderAdminEnquiries = () => {
  const tbody = document.getElementById("enquiries-table-body");
  if (!tbody) {
    return;
  }

  if (!adminEnquiries.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-8 text-center text-sm font-semibold text-slate-500">No enquiries found yet.</td>
      </tr>
    `;
    return;
  }

  const statusClasses = {
    new: "bg-sky-50 text-sky-700",
    in_progress: "bg-amber-50 text-amber-700",
    quoted: "bg-violet-50 text-violet-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  };

  tbody.innerHTML = adminEnquiries.map((enquiry) => `
    <tr class="border-b border-slate-100">
      <td class="px-4 py-4 text-sm font-bold text-slate-900">${enquiry.name}</td>
      <td class="px-4 py-4 text-sm text-slate-700">${enquiry.phone}</td>
      <td class="px-4 py-4 text-sm text-slate-700">${enquiry.product}</td>
      <td class="px-4 py-4 text-sm text-slate-700">${enquiry.quantity}</td>
      <td class="px-4 py-4 text-sm text-slate-700">${enquiry.district}</td>
      <td class="px-4 py-4"><span class="rounded-full px-3 py-1 text-xs font-bold ${statusClasses[getEnquiryStatus(enquiry)] || "bg-slate-100 text-slate-700"}">${getEnquiryStatus(enquiry).replace("_", " ")}</span></td>
      <td class="px-4 py-4 text-sm text-slate-500">${new Date(enquiry.created_at).toLocaleString()}</td>
      <td class="px-4 py-4 text-right">
        <div class="flex justify-end gap-2">
          <button type="button" onclick="window.editAdminEnquiry('${enquiry.id}')" class="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">Edit</button>
          <button type="button" onclick="window.deleteAdminEnquiry('${enquiry.id}')" class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
};

const resetEnquiryForm = () => {
  const form = document.getElementById("enquiry-form");
  const pill = document.getElementById("selected-enquiry-pill");
  if (!form) {
    return;
  }

  currentEnquiryId = null;
  form.reset();
  form.status.value = "new";
  pill.textContent = "No enquiry selected";
};

const fillEnquiryForm = (enquiry) => {
  const form = document.getElementById("enquiry-form");
  const pill = document.getElementById("selected-enquiry-pill");
  if (!form) {
    return;
  }

  currentEnquiryId = enquiry.id;
  form.name.value = enquiry.name || "";
  form.phone.value = enquiry.phone || "";
  form.product.value = enquiry.product || "";
  form.quantity.value = enquiry.quantity || "";
  form.district.value = enquiry.district || "";
  form.status.value = getEnquiryStatus(enquiry);
  form.admin_notes.value = enquiry.admin_notes || "";
  pill.textContent = `Editing enquiry #${enquiry.id}`;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
};

const loadAdminData = async () => {
  adminStatus("Refreshing products and enquiries...");
  const [products, enquiries] = await Promise.all([
    window.tradenestSupabase.fetchProducts(),
    window.tradenestSupabase.fetchEnquiries(),
  ]);

  adminProducts = products;
  adminEnquiries = enquiries;
  renderDashboardStats();
  renderAdminProducts();
  renderAdminEnquiries();
  adminStatus("Admin dashboard is synced with Supabase.", "success");
};

const setupAdminLogin = () => {
  const loginForm = document.getElementById("admin-login-form");
  const logoutButton = document.getElementById("admin-logout");

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    adminStatus("Signing in...");
    const { data, error } = await window.tradenestSupabase.signInAdmin(email, password);

    if (error) {
      adminStatus(error.message || "Unable to sign in.", "danger");
      return;
    }

    setAdminShell(true, data.user?.email || email);
    loginForm.reset();
    await loadAdminData();
  });

  logoutButton?.addEventListener("click", async () => {
    await window.tradenestSupabase.signOutAdmin();
    setAdminShell(false);
    adminStatus("Signed out.");
  });
};

const setupProductForm = () => {
  const form = document.getElementById("product-form");
  const cancel = document.getElementById("product-cancel-edit");
  const imageFile = document.getElementById("product-image-file");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      product_name: form.product_name.value.trim(),
      category: form.category.value,
      brand: form.brand.value.trim(),
      image_url: form.image_url.value.trim(),
      description: form.description.value.trim(),
    };

    adminStatus(currentEditId ? "Updating product..." : "Creating product...");
    const { error } = await window.tradenestSupabase.saveProduct(payload, currentEditId);

    if (error) {
      adminStatus(error.message || "Product save failed.", "danger");
      return;
    }

    resetProductForm();
    await loadAdminData();
  });

  cancel?.addEventListener("click", resetProductForm);

  imageFile?.addEventListener("change", () => {
    const file = imageFile.files?.[0];
    if (!file) {
      updateProductPreview(form.image_url.value.trim());
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      form.image_url.value = dataUrl;
      updateProductPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  form?.image_url?.addEventListener("input", (event) => {
    updateProductPreview(event.target.value.trim());
  });
};

const setupEnquiryForm = () => {
  const form = document.getElementById("enquiry-form");
  const clearButton = document.getElementById("enquiry-cancel-edit");
  const deleteButton = document.getElementById("enquiry-delete-button");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentEnquiryId) {
      adminStatus("Select an enquiry first.", "warning");
      return;
    }

    const payload = {
      status: form.status.value,
      admin_notes: form.admin_notes.value.trim(),
    };

    adminStatus("Updating enquiry...");
    const { error } = await window.tradenestSupabase.saveEnquiry(payload, currentEnquiryId);
    if (error) {
      adminStatus(`${error.message || "Unable to update enquiry."} Add status/admin_notes columns in Supabase if needed.`, "danger");
      return;
    }

    resetEnquiryForm();
    await loadAdminData();
  });

  clearButton?.addEventListener("click", resetEnquiryForm);
  deleteButton?.addEventListener("click", async () => {
    if (!currentEnquiryId) {
      adminStatus("Select an enquiry first.", "warning");
      return;
    }

    const confirmed = window.confirm("Delete this enquiry?");
    if (!confirmed) {
      return;
    }

    adminStatus("Deleting enquiry...", "warning");
    const { error } = await window.tradenestSupabase.deleteEnquiry(currentEnquiryId);
    if (error) {
      adminStatus(error.message || "Unable to delete enquiry.", "danger");
      return;
    }

    resetEnquiryForm();
    await loadAdminData();
  });
};

window.editAdminProduct = (id) => {
  const product = adminProducts.find((item) => String(item.id) === String(id));
  if (product) {
    fillProductForm(product);
  }
};

window.deleteAdminProduct = async (id) => {
  const product = adminProducts.find((item) => String(item.id) === String(id));
  if (!product) {
    return;
  }

  const confirmed = window.confirm(`Delete "${product.product_name}"?`);
  if (!confirmed) {
    return;
  }

  adminStatus("Deleting product...", "warning");
  const { error } = await window.tradenestSupabase.deleteProduct(id);
  if (error) {
    adminStatus(error.message || "Unable to delete product.", "danger");
    return;
  }

  if (String(currentEditId) === String(id)) {
    resetProductForm();
  }

  await loadAdminData();
};

window.editAdminEnquiry = (id) => {
  const enquiry = adminEnquiries.find((item) => String(item.id) === String(id));
  if (enquiry) {
    fillEnquiryForm(enquiry);
  }
};

window.deleteAdminEnquiry = async (id) => {
  const enquiry = adminEnquiries.find((item) => String(item.id) === String(id));
  if (!enquiry) {
    return;
  }

  const confirmed = window.confirm(`Delete enquiry from "${enquiry.name}"?`);
  if (!confirmed) {
    return;
  }

  adminStatus("Deleting enquiry...", "warning");
  const { error } = await window.tradenestSupabase.deleteEnquiry(id);
  if (error) {
    adminStatus(error.message || "Unable to delete enquiry.", "danger");
    return;
  }

  if (String(currentEnquiryId) === String(id)) {
    resetEnquiryForm();
  }

  await loadAdminData();
};

const populateAdminCategories = () => {
  const select = document.getElementById("admin-category-select");
  if (!select) {
    return;
  }

  select.innerHTML = ADMIN_CATEGORIES.map((category) =>
    `<option value="${category}">${category[0].toUpperCase() + category.slice(1)}</option>`
  ).join("");
};

const setupQuickActions = () => {
  document.getElementById("jump-add-product")?.addEventListener("click", () => {
    document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("jump-enquiries")?.addEventListener("click", () => {
    document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  populateAdminCategories();
  setupAdminLogin();
  setupProductForm();
  setupEnquiryForm();
  setupQuickActions();
  resetProductForm();
  resetEnquiryForm();

  if (!window.tradenestSupabase.hasConfig) {
    adminStatus("Add your Supabase URL and anon key in supabase-client.js first.", "warning");
    return;
  }

  const { data } = await window.tradenestSupabase.getSession();
  const session = data?.session;

  if (session?.user) {
    setAdminShell(true, session.user.email || "");
    await loadAdminData();
  } else {
    setAdminShell(false);
    adminStatus("Sign in with your Supabase admin user to manage products.", "slate");
  }

  window.tradenestSupabase.onAuthStateChange(async (_event, sessionState) => {
    if (sessionState?.user) {
      setAdminShell(true, sessionState.user.email || "");
      await loadAdminData();
    } else {
      setAdminShell(false);
    }
  });
});
