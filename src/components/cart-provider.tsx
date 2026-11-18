 "use client";
import { createContext,useContext,useEffect,useMemo,useState } from "react";
export type CartItem={variant_id:string;product_id:string;slug:string;name:string;size:string;color?:string;price:number;quantity:number;image?:string};
type CartCtx={items:CartItem[];add:(x:CartItem)=>void;remove:(id:string)=>void;qty:(id:string,n:number)=>void;clear:()=>void};
const C=createContext<CartCtx|null>(null);
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]);
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem("nabiha-cart")||"[]"));}catch{}},[]);
 useEffect(()=>{localStorage.setItem("nabiha-cart",JSON.stringify(items));},[items]);
 const value=useMemo(()=>({items,add:(x:CartItem)=>setItems(old=>{const found=old.find(i=>i.variant_id===x.variant_id);return found?old.map(i=>i.variant_id===x.variant_id?{...i,quantity:i.quantity+x.quantity}:i):[...old,x]}),remove:(id:string)=>setItems(old=>old.filter(i=>i.variant_id!==id)),qty:(id:string,n:number)=>setItems(old=>old.map(i=>i.variant_id===id?{...i,quantity:Math.max(1,Math.min(10,n))}:i)),clear:()=>setItems([])}),[items]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useCart(){const v=useContext(C);if(!v)throw new Error("CartProvider missing");return v;}
