import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, LogOut, ShoppingBag, Tag, Plus } from "lucide-react";
import ListProductModal from "@/components/ListProductModal";

const categoryColors: Record<string, string> = {
  "Handicrafts": "bg-orange-100 text-orange-700",
  "Food Products": "bg-green-100 text-green-700",
  "Textiles": "bg-purple-100 text-purple-700",
  "Agriculture": "bg-teal-100 text-teal-700",
  "Other": "bg-gray-100 text-gray-700",
};

export default async function GlobalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, shg_id, shgs(name)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  const { data: products } = await supabase
    .from("marketplace_products")
    .select("*, shgs(name)")
    .eq("is_listed", true)
    .order("created_at", { ascending: false });

  const allProducts = products || [];
  const myProducts = allProducts.filter(p => p.shg_id === member.shg_id);

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Global Marketplace</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full hover:text-red-500">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Hero */}
        <div className="mb-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
            <Globe className="h-48 w-48" />
          </div>
          <p className="text-cyan-200 text-sm font-medium mb-1">SHG Products · Rural Commerce</p>
          <h1 className="text-3xl font-bold mb-2">Global Marketplace</h1>
          <p className="text-cyan-200 text-base max-w-lg">Sell your SHG products to buyers across India. Connect with exporters, retailers, and fair-trade networks.</p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{allProducts.length}</div>
              <div className="text-cyan-200 text-xs">Listed Products</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{myProducts.length}</div>
              <div className="text-cyan-200 text-xs">My Listings</div>
            </div>
          </div>
        </div>

        {/* List Product Button */}
        <div className="mb-8">
          <ListProductModal shgId={member.shg_id} memberId={member.id} />
        </div>

        {/* Products Grid */}
        {allProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No products listed yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to list your SHG products!</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-5">All Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[product.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {product.category ?? "Other"}
                      </span>
                      {product.shg_id === member.shg_id && (
                        <span className="text-xs text-[#306e46] font-semibold">My Listing</span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#1a1a1a] mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-[#306e46]">₹{Number(product.price_per_unit).toLocaleString("en-IN")}</div>
                        <div className="text-xs text-gray-400">per {product.unit}</div>
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        <div>{(product.shgs as any)?.name}</div>
                        <div>{product.quantity_available} in stock</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
