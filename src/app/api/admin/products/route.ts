
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const { data, error } = await db
      .from("products")
      .select("*, product_variants(*), product_images(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("LOAD PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load products",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const db = getSupabaseAdmin();
  let uploadedPath: string | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";
    let b: Record<string, any>;
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();

      b = Object.fromEntries(
        [...fd.entries()].filter(([key]) => key !== "image")
      );

      const file = fd.get("image");
      if (file instanceof File && file.size > 0) {
        imageFile = file;
      }
    } else {
      b = await req.json();
    }

    if (
      !b.name ||
      !b.slug ||
      !Number.isFinite(Number(b.price)) ||
      Number(b.price) < 0
    ) {
      return NextResponse.json(
        { error: "Name, slug and valid price are required" },
        { status: 400 }
      );
    }

    let imageUrl = String(b.image_url || "");

    // Validate and upload the selected image.
    if (imageFile) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, WEBP and GIF images are allowed." },
          { status: 400 }
        );
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size must be less than 5 MB." },
          { status: 400 }
        );
      }

      const extension =
        imageFile.type === "image/jpeg"
          ? "jpg"
          : imageFile.type.split("/")[1];

      const fileName = `${crypto.randomUUID()}.${extension}`;
      uploadedPath = `products/${fileName}`;

      const { error: uploadError } = await db.storage
        .from("product-images")
        .upload(uploadedPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = db.storage
        .from("product-images")
        .getPublicUrl(uploadedPath);

      imageUrl = publicData.publicUrl;
    }

    const slug = String(b.slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: product, error: productError } = await db
      .from("products")
      .insert({
        name: String(b.name).slice(0, 160),
        slug,
        description: b.description || null,
        price: Number(b.price),
        fabric: b.fabric || null,
        is_published:
          b.is_published === true || b.is_published === "true",
      })
      .select()
      .single();

    if (productError) throw productError;

    if (b.size) {
      const { error: variantError } = await db
        .from("product_variants")
        .insert({
          product_id: product.id,
          size: String(b.size).slice(0, 40),
          stock_quantity: Math.max(
            0,
            Math.floor(Number(b.stock) || 0)
          ),
        });

      if (variantError) throw variantError;
    }

    if (imageUrl) {
      const { error: imageError } = await db
        .from("product_images")
        .insert({
          product_id: product.id,
          image_url: imageUrl,
          alt_text: product.name,
          is_primary: true,
          sort_order: 0,
        });

      if (imageError) throw imageError;
    }

    return NextResponse.json(
      { product, image_url: imageUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    // Remove an uploaded image if product creation fails.
    if (uploadedPath) {
      await db.storage
        .from("product-images")
        .remove([uploadedPath]);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create product",
      },
      { status: 400 }
    );
  }
}
