import Link from "next/link";
import { ShoppingBag, Search, Menu } from "lucide-react";
export function Header() {
  return <><div className="bg-[#242321] text-white text-center py-2 eyebrow">Complimentary delivery on orders above Rs. 8,000</div>
  <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#eee9e1]">
    <div className="container h-[78px] flex items-center justify-between">
      <Link href="/" className="serif text-[25px] tracking-[.12em]">NABIHA <span className="text-[#B69A65]">COLLECTION</span></Link>
      <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[.18em] uppercase">
        <Link href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/shop?sort=newest">New Arrivals</Link><Link href="/#story">Our Story</Link><Link href="/#contact">Contact</Link>
      </nav>
      <div className="flex gap-5 items-center"><Link href="/shop" aria-label="Search"><Search size={17}/></Link><Link href="/cart" aria-label="Shopping bag"><ShoppingBag size={18}/></Link><Link className="md:hidden" href="/shop" aria-label="Menu"><Menu size={20}/></Link></div>
    </div>
  </header></>;
}
