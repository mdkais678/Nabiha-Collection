import Link from "next/link";
const categories = ["Lawn & Cotton","Formal Wear","Chiffon","Ready-to-Wear"];
export default function Home() {
 return <main>
  <section className="relative min-h-[590px] md:min-h-[690px] bg-[#e9e1d5] overflow-hidden">
   <div className="absolute inset-0 bg-gradient-to-r from-[#f8f5ef]/95 via-[#f8f5ef]/65 to-transparent"/>
   <div className="container relative min-h-[590px] md:min-h-[690px] flex items-center"><div className="max-w-xl py-20">
    <p className="eyebrow text-[#92784c] mb-6">The new season · 2026 collection</p>
    <h1 className="serif text-5xl md:text-7xl leading-[1.08] text-[#302a24]">A timeless expression of <i>you.</i></h1>
    <p className="mt-7 max-w-md leading-7 text-[#62594f]">Discover considered silhouettes, delicate details and the art of dressing beautifully.</p>
    <Link className="gold-button mt-9" href="/shop">Explore collection <span>→</span></Link>
   </div></div>
   <div className="absolute right-[8%] bottom-8 hidden md:block text-right"><span className="eyebrow">Nabiha Collection</span><p className="serif italic text-2xl">Elegance in Every Thread</p></div>
  </section>
  <section className="section-space container text-center"><p className="eyebrow text-[#a58b5c]">Curated for you</p><h2 className="serif text-4xl mt-3">Shop by category</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-10">{categories.map((c,i)=><Link href="/shop" key={c} className="group bg-[#F8F5EF] aspect-[4/5] flex items-end p-5 text-left"><div><span className="eyebrow text-[#a58b5c]">0{i+1}</span><h3 className="serif text-xl mt-2">{c}</h3><span className="text-xs underline underline-offset-4">Discover</span></div></Link>)}</div></section>
  <section id="story" className="bg-[#F8F5EF] section-space"><div className="container grid md:grid-cols-2 gap-12 items-center"><div className="aspect-[5/4] bg-[#e8dcc8] flex items-center justify-center"><span className="serif italic text-3xl text-[#8b7655]">The art of detail</span></div><div><p className="eyebrow text-[#a58b5c]">Our philosophy</p><h2 className="serif text-4xl md:text-5xl mt-4 leading-tight">Made for the moments that become memories.</h2><p className="leading-8 mt-6 text-[#71675d]">NABIHA COLLECTION celebrates the richness of Pakistani style through refined design, graceful fabrics and thoughtful finishing. Every piece is an invitation to feel beautifully yourself.</p><Link href="/shop" className="outline-button inline-block mt-8">Discover the collection</Link></div></div></section>
  <section className="section-space container text-center"><p className="eyebrow text-[#a58b5c]">A considered experience</p><h2 className="serif text-4xl mt-3">The details matter</h2><div className="grid md:grid-cols-3 gap-8 mt-12 text-sm"><div><h3 className="serif text-2xl">Thoughtful design</h3><p className="mt-3 text-[#776e64]">Elegant pieces selected with care.</p></div><div><h3 className="serif text-2xl">Made to delight</h3><p className="mt-3 text-[#776e64]">A premium experience from browse to delivery.</p></div><div><h3 className="serif text-2xl">Here for you</h3><p className="mt-3 text-[#776e64]">Personal assistance through WhatsApp.</p></div></div></section>
 </main>;
}
