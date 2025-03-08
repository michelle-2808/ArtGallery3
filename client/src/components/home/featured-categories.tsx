import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

export default function FeaturedCategories() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => await apiRequest("/api/products")
  });

  // Get unique categories from products
  const categories = React.useMemo(() => {
    if (!products) return [];

    const uniqueCategories = Array.from(
      new Set(products.filter(p => p.isAvailable).map(p => p.category))
    ).filter(Boolean);

    return uniqueCategories.slice(0, 4);
  }, [products]);

  if (!categories.length) {
    return null;
  }

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-3xl font-bold mb-12 text-center">Shop By Category</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Increased gap for better spacing */}
        {categories.map((category) => (
          <Card key={category} className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <h3 className="font-semibold text-xl mb-4 text-center">{category}</h3>
              <Button asChild variant="outline">
                <Link to={`/products?category=${category}`}>View Category</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}