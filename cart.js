const TRADENEST_CART_KEY = "tradenest-enquiry-cart";

window.TradenestCart = (() => {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(TRADENEST_CART_KEY)) || [];
    } catch (error) {
      console.warn("Cart read failed", error);
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(TRADENEST_CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("tradenest:cart-updated", { detail: items }));
    return items;
  };

  const add = (product, quantity) => {
    const items = read();
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        product_name: product.product_name,
        brand: product.brand,
        image_url: product.image_url,
        category: product.category,
        quantity,
      });
    }

    return write(items);
  };

  const remove = (id) => write(read().filter((item) => item.id !== id));

  const update = (id, quantity) => {
    const items = read().map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item
    );
    return write(items);
  };

  const clear = () => write([]);

  const count = () => read().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const generateQuotationMessage = (district = "Other") => {
    const items = read();

    if (!items.length) {
      return "";
    }

    const lines = items.map((item) => `${item.product_name} - ${item.quantity} pcs`);
    return encodeURIComponent(`Hello, I want quotation for:\n\n${lines.join("\n")}\n\nDistrict: ${district}`);
  };

  return {
    read,
    write,
    add,
    remove,
    update,
    clear,
    count,
    generateQuotationMessage,
  };
})();
