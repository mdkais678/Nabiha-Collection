import Link from "next/link";
export function Footer() { return <footer id="contact" className="bg-[#242321] text-[#eee8df] pt-16 pb-8">
  <div className="container grid md:grid-cols-3 gap-10">
    <div><div className="serif text-2xl tracking-widest">NABIHA COLLECTION</div><p className="text-sm text-[#bdb5aa] mt-4 leading-7">Elegance in Every Thread. Thoughtful Pakistani fashion for moments that matter.</p></div>
    <div><div className="eyebrow text-[#B69A65] mb-4">Explore</div><div className="grid gap-3 text-sm text-[#d3ccc2]"><Link href="/shop">Shop all</Link><Link href="/#story">Our story</Link><Link href="/track-order">Track your order</Link><Link href="/policies">Policies</Link></div></div>
    <div><div className="eyebrow text-[#B69A65] mb-4">Get in touch</div><p className="text-sm mb-2">WhatsApp: 03133316526</p><p className="text-sm">kaiswebstudio@gmail.com</p><a className="inline-block mt-5 underline text-sm" href="https://wa.me/923133316526">Chat on WhatsApp</a></div>
  </div><div className="container border-t border-white/15 mt-12 pt-6 text-xs text-[#a9a197] flex justify-between"><span>© {new Date().getFullYear()} NABIHA COLLECTION</span><span>Pakistan · PKR</span></div>
</footer>; }
