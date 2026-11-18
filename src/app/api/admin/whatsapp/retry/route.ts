import {NextResponse} from "next/server";
import {getSupabaseAdmin} from "@/lib/supabase/server";
import {notifyOwnerWhatsApp} from "@/lib/whatsapp";
export async function POST(req:Request){
 try{
  const {notification_id}=await req.json();if(!notification_id)return NextResponse.json({error:"notification_id required"},{status:400});
  const db=getSupabaseAdmin();
  const {data:n,error:ne}=await db.from("whatsapp_notifications").select("id,order_id").eq("id",notification_id).single();if(ne||!n)throw new Error("Notification not found");
  const {data:o,error:oe}=await db.from("orders").select("*,order_items(product_name,size,quantity,unit_price)").eq("id",n.order_id).single();if(oe||!o)throw new Error("Order not found");
  const result=await notifyOwnerWhatsApp({order_number:o.order_number,customer_name:o.customer_name,phone:o.phone,city:o.city,address:o.address,total:Number(o.total),payment_method:o.payment_method,items:o.order_items||[]});
  await db.from("whatsapp_notifications").update({status:result.ok?"sent":"failed",provider_message_id:result.ok?result.id:null,error:result.ok?null:result.error,attempts:1,sent_at:result.ok?new Date().toISOString():null}).eq("id",notification_id);
  return NextResponse.json(result,{status:result.ok?200:502});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Retry failed"},{status:400});}
}
