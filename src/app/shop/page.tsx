import { getSupabaseAdmin } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Shop() {
 let products: any[] = [];
 try { const { data } = await getSupabaseAdmin().from("products").select("id,name,slug,price,sale_price,description,product_images(image_url,is_primary)").eq("is_published",true).order("created_at",{ascending:false}); products = data || []; } catch {}
 return <main className="container py-14 min-h-[55vh]"><p className="eyebrow text-[#a58b5c]">Nabiha collection</p><h1 className="serif text-5xl mt-3">The edit</h1><p className="text-sm text-[#7b7167] mt-3">Discover pieces designed to be treasured.</p>
 {products.length ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">{products.map(p=><Link key={p.id} href={`/product/${p.slug}`}><div className="aspect-[3/4] bg-[#F8F5EF]">{p.product_images?.[0]?.image_url && <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover"/>}</div><h2 className="serif text-lg mt-3">{p.name}</h2><p className="text-sm mt-1">{money(p.sale_price || p.price)}</p></Link>)}</div> : <div className="mt-12 bg-[#F8F5EF] p-10 text-center"><h2 className="serif text-2xl">The collection is being prepared</h2><p className="text-sm text-[#776e64] mt-3">Products added in the admin dashboard will appear here.</p></div>}
 </main>;
}
