import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProductPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  async function addToCart() {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/cart", {
        productId: Number(id),
        quantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-yellow-50">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-[500px] object-cover rounded-lg shadow-lg"
          />
        </Card>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-playfair font-bold mb-2 text-primary">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-accent">
              ${product.price}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-secondary">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-secondary">Category</h2>
            <p className="text-muted-foreground capitalize">{product.category}</p>
          </div>

          {!user?.isAdmin && (
            <Button
              onClick={addToCart}
              className="w-full art-gradient hover:opacity-90 transition-opacity"
              size="lg"
              disabled={!product.isAvailable || product.stockQuantity === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {!product.isAvailable 
                ? "Currently Unavailable"
                : product.stockQuantity === 0 
                  ? "Out of Stock" 
                  : "Add to Cart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}