
"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  is_published: boolean;
  product_variants?: {
    size: string;
    stock_quantity: number;
  }[];
  product_images?: {
    image_url: string;
  }[];
};

const initialForm = {
  name: "",
  slug: "",
  price: "",
  description: "",
  fabric: "",
  size: "One Size",
  stock: "0",
  image_url: "",
  is_published: false,
};

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  async function load() {
    setLoading(true);

    try {
      const r = await fetch("/api/admin/products");
      const responseText = await r.text();

let d;
try {
  d = responseText ? JSON.parse(responseText) : {};
} catch {
  throw new Error(
    `Server returned invalid response. Status: ${r.status}. Response: ${responseText.slice(0, 500)}`
  );
}

      if (!r.ok) throw new Error(d.error || "Unable to load products");

      setItems(d.products || []);
      setMsg("");
    } catch (error) {
      setMsg(
        error instanceof Error ? error.message : "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function selectImage(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg("Image must be smaller than 5 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMsg("");
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, String(value));
      });

      if (image) {
        fd.append("image", image);
      }

      const r = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Failed to create product");
      }

      setForm(initialForm);
      setImage(null);
      setPreview("");

      setMsg("Product created successfully!");
      await load();
    } catch (error) {
      setMsg(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container py-12 min-h-[60vh]">
      <a href="/admin" className="text-xs underline">
        ← Dashboard
      </a>

      <h1 className="serif text-4xl mt-4">Products</h1>

      <form
        onSubmit={add}
        className="bg-[#F8F5EF] p-6 grid md:grid-cols-2 gap-4 mt-8"
      >
        <input
          required
          placeholder="Product name"
          className="p-3"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          required
          placeholder="URL slug (e.g. ivory-lawn-suit)"
          className="p-3"
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value })
          }
        />

        <input
          required
          type="number"
          min="0"
          placeholder="Price PKR"
          className="p-3"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
        />

        <input
          placeholder="Fabric (e.g. lawn)"
          className="p-3"
          value={form.fabric}
          onChange={(e) =>
            setForm({ ...form, fabric: e.target.value })
          }
        />

        <input
          placeholder="First size / variant"
          className="p-3"
          value={form.size}
          onChange={(e) =>
            setForm({ ...form, size: e.target.value })
          }
        />

        <input
          type="number"
          min="0"
          placeholder="Opening stock"
          className="p-3"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: e.target.value })
          }
        />

        {/* Product image upload */}
        <div className="md:col-span-2 space-y-3">
          <label className="block text-sm font-medium">
            Product Image
          </label>

          <label
            htmlFor="product-image"
            className="flex flex-col items-center justify-center min-h-40 p-6 border-2 border-dashed border-[#B9AFA2] bg-white cursor-pointer hover:bg-[#FAF8F4] transition"
          >
            <span className="text-3xl">＋</span>
            <span className="text-sm font-medium mt-2">
              Choose Product Image
            </span>
            <span className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP or GIF · Maximum 5 MB
            </span>

            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => selectImage(e.target.files?.[0])}
            />
          </label>

          {preview && (
            <div className="relative w-40">
              <img
                src={preview}
                alt="Product preview"
                className="w-40 h-40 object-cover border"
              />

              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setPreview("");
                  setImage(null);
                }}
                className="mt-2 text-xs underline"
              >
                Remove image
              </button>
            </div>
          )}

          <input
            placeholder="Or paste a public product image URL (optional)"
            className="p-3 w-full"
            value={form.image_url}
            onChange={(e) =>
              setForm({ ...form, image_url: e.target.value })
            }
          />
        </div>

        <textarea
          placeholder="Description"
          className="p-3 md:col-span-2"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <label className="text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) =>
              setForm({
                ...form,
                is_published: e.target.checked,
              })
            }
          />{" "}
          Publish immediately
        </label>

        <button
          disabled={saving}
          className="gold-button justify-center disabled:opacity-50"
        >
          {saving ? "Uploading..." : "Create Product"}
        </button>

        {msg && (
          <p className="text-sm md:col-span-2" role="status">
            {msg}
          </p>
        )}
      </form>

      <h2 className="serif text-2xl mt-10">
        Existing products
      </h2>

      <div className="mt-4 divide-y">
        {loading && <p className="py-4 text-sm">Loading products...</p>}

        {!loading && items.length === 0 && (
          <p className="py-4 text-sm text-gray-500">
            No products found.
          </p>
        )}

        {items.map((p) => (
          <div
            key={p.id}
            className="py-4 flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-4">
              {p.product_images?.[0]?.image_url && (
                <img
                  src={p.product_images[0].image_url}
                  alt={p.name}
                  className="w-16 h-16 object-cover"
                />
              )}

              <span>
                {p.name}
                <small className="text-gray-500 block">
                  /{p.slug}
                </small>
                <small className="block text-gray-500">
                  {(p.product_variants || [])
                    .map(
                      (v) => `${v.size}: ${v.stock_quantity}`
                    )
                    .join(" · ")}
                </small>
              </span>
            </div>

            <span className="text-right shrink-0">
              PKR {p.price}
              <small className="block text-gray-500">
                {p.is_published ? "Published" : "Draft"}
              </small>
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
