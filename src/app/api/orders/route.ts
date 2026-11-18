import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { notifyOwnerWhatsApp } from "@/lib/whatsapp";
const schema=z.object({customer_name:z.string().min(2).max(120),phone:z.string().min(8).max(25),whatsapp:z.string().min(8).max(25),city:z.string().min(2).max(80),address:z.string().min(8).max(500),payment_method:z.enum(["cod","bank_transfer","easypaisa","jazzcash"]),items:z.array(z.object({variant_id:z.string().uuid(),quantity:z.number().int().min(1).max(10)})).min(1)});
export async function POST(req:Request){let raw:unknown;try{raw=await req.json()}catch{return NextResponse.json({error:"Invalid request."},{status:400})}const parsed=schema.safeParse(raw);if(!parsed.success)return NextResponse.json({error:"Please check your checkout details."},{status:400});
 try{const db=getSupabaseAdmin();const payload={...parsed.data,idempotency_key:crypto.randomUUID()};const {data,error}=await db.rpc("create_customer_order",{payload});if(error)throw error;
 const order=Array.isArray(data)?data[0]:data;
 const notice=await notifyOwnerWhatsApp({order_number:order.order_number,customer_name:payload.customer_name,phone:payload.phone,city:payload.city,address:payload.address,total:Number(order.total),payment_method:payload.payment_method,items:[]});
 await db.from("whatsapp_notifications").insert({order_id:order.id,status:notice.ok?"sent":"failed",provider_message_id:notice.ok?notice.id:null,error:notice.ok?null:notice.error,attempts:1,sent_at:notice.ok?new Date().toISOString():null});
 return NextResponse.json({order},{status:201});
 }catch(e){console.error("Order creation failed",e);return NextResponse.json({error:"We could not place the order. Please try again or contact the store."},{status:503});}}
