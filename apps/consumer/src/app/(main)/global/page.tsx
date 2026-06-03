import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowLeft, ShoppingBag, Tag, MessageCircle, Package, Filter } from "lucide-react";
import ListProductModal from "@/components/ListProductModal";
import DelistProductButton from "@/components/DelistProductButton";

const CATEGORIES = ["All", "Handicrafts", "Food Products", "Textiles", "Agriculture", "Other"];

const categoryColors: Record<string, string> = {
  "Handicrafts": "bg-orange-100 text-orange-700 border-orange-200",
  "Food Products": "bg-green-100 text-green-700 border-green-200",
  "Textiles": "bg-purple-100 text-purple-700 border-purple-200",
  "Agriculture": "bg-teal-100 text-teal-700 border-teal-200",
  "Other": "bg-gray-100 text-gray-700 border-gray-200",
};

const categoryGradients: Record<string, string> = {
  "Handicrafts": "from-orange-100 to-amber-50",
  "Food Products": "from-green-100 to-emerald-50",
  "Textiles": "from-purple-100 to-violet-50",
  "Agriculture": "from-teal-100 to-green-50",
  "Other": "from-gray-100 to-gray-50",
};

export default async function GlobalMarketPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, shg_id, shgs(name)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  const selectedCat = sp?.cat || "All";

  let query = supabase
    .from("marketplace_products")
    .select("*, shgs(name), members(profiles(full_name, phone))")
    .eq("is_listed", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (selectedCat !== "All") query = query.eq("category", selectedCat);

  const { data: products } = await query;
  const allProducts = products || [];
  const myListings = allProducts.filter(p => p.shg_id === member.shg_id);
  const otherProducts = allProducts.filter(p => p.shg_id !== member.shg_id);

  // Count per category (unfiltered)
  const { data: allForCount } = await supabase
    .from("marketplace_products")
    .select("category")
    .eq("is_listed", true);
  const countByCat: Record<string, number> = { "All": allForCount?.length || 0 };
  (allForCount || []).forEach(p => {
    countByCat[p.category] = (countByCat[p.category] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-8 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-cyan-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">SHG Products · Rural Commerce</p>
          <h1 className="text-3xl font-extrabold">Global Marketplace</h1>
          <p className="text-cyan-100 text-sm mt-1 max-w-lg">Sell your SHG products to buyers across India. Connect with exporters and fair-trade networks.</p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="font-extrabold text-xl">{allForCount?.length || 0}</p>
              <p className="text-cyan-200 text-xs">Listed Products</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
              <p className="font-extrabold text-xl">{myListings.length}</p>
              <p className="text-cyan-200 text-xs">My Listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 space-y-8">
        {/* List product button */}
        <div>
          <ListProductModal shgId={member.shg_id} memberId={member.id} />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/global${cat === "All" ? "" : `?cat=${encodeURIComponent(cat)}`}`}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                selectedCat === cat
                  ? "bg-[#306e46] text-white border-[#306e46] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
              {countByCat[cat] !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${selectedCat === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {countByCat[cat] || 0}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* My Listings section */}
        {myListings.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> My Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map(product => (
                <ProductCard key={product.id} product={product} isOwner shgId={member.shg_id} />
              ))}
            </div>
          </section>
        )}

        {/* All other products */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" /> {selectedCat === "All" ? "All Products" : selectedCat}
            <span className="text-gray-300 font-normal">({otherProducts.length})</span>
          </h2>

          {otherProducts.length === 0 && myListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No products in this category yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to list your SHG products!</p>
            </div>
          ) : otherProducts.length === 0 ? null : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherProducts.map(product => (
                <ProductCard key={product.id} product={product} isOwner={false} shgId={member.shg_id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProductCard({ product, isOwner, shgId }: { product: any; isOwner: boolean; shgId: string }) {
  const sellerPhone = product.members?.profiles?.phone;
  const whatsapp = product.whatsapp_contact || sellerPhone;
  const gradient = categoryGradients[product.category] || "from-gray-100 to-gray-50";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Product image */}
      <div className={`h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="h-16 w-16 text-white/40" />
        )}
        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-[#f28c28] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            ⭐ FEATURED
          </div>
        )}
        {isOwner && (
          <div className="absolute top-2 right-2 bg-[#306e46] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
            MINE
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[product.category] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {product.category}
          </span>
          <span className="text-[10px] text-gray-400">{(product.shgs as any)?.name}</span>
        </div>

        <h3 className="font-bold text-gray-900 mb-1 leading-snug">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-extrabold text-[#306e46]">₹{Number(product.price_per_unit).toLocaleString("en-IN")}</div>
            <div className="text-[10px] text-gray-400">per {product.unit}</div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <div className="font-semibold text-gray-700">{product.quantity_available} {product.unit}</div>
            <div>in stock</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {whatsapp && !isOwner && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20am%20interested%20in%20your%20product%3A%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors border border-green-200"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Contact
            </a>
          )}
          {isOwner && (
            <DelistProductButton productId={product.id} />
          )}
        </div>
      </div>
    </div>
  );
}
