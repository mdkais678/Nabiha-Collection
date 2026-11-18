import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import ProductBuy from "./product-buy";
export const dynamic="force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; let product:any=null;
 try{const {data}=await getSupabaseAdmin().from("products").select("*,product_images(*),product_variants(*)").eq("slug",slug).eq("is_published",true).single();product=data;}catch{}
 if(!product)return notFound();
 const images=(product.product_images||[]).sort((a:any,b:any)=>Number(b.is_primary)-Number(a.is_primary)||a.sort_order-b.sort_order);
 return <main className="container py-12"><div className="grid md:grid-cols-2 gap-10"><div className="grid grid-cols-2 gap-3">{images.map((im:any)=><img key={im.id} src={im.image_url} alt={im.alt_text||product.name} className="w-full aspect-[3/4] object-cover bg-[#F8F5EF]"/>)}{!images.length&&<div className="col-span-2 aspect-[4/5] bg-[#F8F5EF] flex items-center justify-center serif text-2xl">NABIHA COLLECTION</div>}</div><div className="md:sticky md:top-28 h-fit"><p className="eyebrow text-[#a58b5c]">Nabiha Collection</p><h1 className="serif text-4xl mt-3">{product.name}</h1><p className="text-xl mt-5">{money(product.sale_price||product.price)} {product.sale_price&&<del className="text-sm text-gray-400 ml-2">{money(product.price)}</del>}</p><p className="leading-7 text-[#776e64] mt-7 whitespace-pre-line">{product.description}</p><p className="text-sm mt-4">Fabric: {product.fabric||"Details available on request"}</p><ProductBuy product={{id:product.id,slug:product.slug,name:product.name,price:Number(product.sale_price||product.price),variants:product.product_variants||[],image:images[0]?.image_url}}/><div className="border-t mt-8 pt-5 text-sm leading-7 text-[#776e64]">Delivery across Pakistan. For sizing or product questions, contact us on WhatsApp at 03133316526.</div></div></div></main>;
}
