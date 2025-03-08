import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/product/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Only show available products with stock to customers
  const availableProducts = products?.filter(p => p.isAvailable && p.stockQuantity > 0);

  const categories = availableProducts 
    ? [...new Set(availableProducts.map(p => p.category))]
    : [];

  const filteredProducts = availableProducts?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="hero-section mb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6">
              Amrutas Art Gallery
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Discover unique handcrafted artworks that tell stories and transform spaces
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "art-gradient" : ""}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "art-gradient" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <ProductGrid products={filteredProducts || []} isLoading={isLoading} />
      </div>
    </div>
  );
}