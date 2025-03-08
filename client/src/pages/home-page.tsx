import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/product/product-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ArrowRight } from "lucide-react"; // Added import
import { ShoppingBag } from "lucide-react"; // Added import
import { Tag } from "lucide-react"; // Added import
import { Badge } from "@/components/ui/badge"; // Added import


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Added state for search focus

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div id="hero-section" className="hero-section mb-12 transition-all duration-1000 ease-out opacity-0 translate-y-4">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
              Discover Amazing Products
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Find the perfect items for your collection
            </p>
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
              <Input
                className={`pl-12 py-6 text-lg rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 focus-visible:ring-white ${isSearchFocused ? 'pr-32' : 'pr-4'}`}
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {isSearchFocused && (
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-4" size="sm">
                  Search <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Tag className="mr-2 text-primary" />
            <h2 className="text-2xl font-playfair font-semibold">Categories</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All Products
            </Button>

            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingBag className="mr-2 text-primary" />
              <h2 className="text-2xl font-playfair font-semibold">Products</h2>
            </div>

            {filteredProducts && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {filteredProducts.length} products
              </Badge>
            )}
          </div>
        </div>

        <ProductGrid products={filteredProducts || []} isLoading={isLoading} />

        {filteredProducts?.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or category filters</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}