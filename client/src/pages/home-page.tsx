import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import HeroSection from "@/components/home/hero-section";
import FeaturedCategories from "@/components/home/featured-categories";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => await apiRequest("/api/products")
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Error loading products. Please try again later.</p>
      </div>
    );
  }

  // Only show available products
  const availableProducts = products?.filter(p => p.isAvailable && p.stockQuantity > 0) || [];

  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>

        {availableProducts.length === 0 ? (
          <p className="text-center">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableProducts.slice(0, 6).map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square relative">
                    <img
                      src={product.imageUrl || "https://placehold.co/400x400?text=Product"}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      <Button
                        asChild
                        variant="outline"
                      >
                        <span>View Details</span>
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {availableProducts.length > 6 && (
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Only show categories if we have products */}
      {availableProducts.length > 0 && (
        <FeaturedCategories />
      )}
    </div>
  );
}