import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/product/product-grid";
import HeroSection from "@/components/home/hero-section";
import FeaturedCategories from "@/components/home/featured-categories";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => apiRequest("GET", "/api/products"),
  });

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main>
      <HeroSection />

      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-playfair font-bold mb-8">Featured Categories</h2>
        <FeaturedCategories />
      </section>

      <section className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-playfair font-bold">Latest Products</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
        </div>
        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </section>
    </main>
  );
}