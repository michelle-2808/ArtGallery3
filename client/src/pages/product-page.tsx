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
        <Card className="p-4">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-[500px] object-cover rounded-lg"
          />
        </Card>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-playfair font-bold mb-2">
              {product.title}
            </h1>
            <p className="text-2xl font-bold text-primary">
              ${product.price}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Category</h2>
            <p className="text-muted-foreground">{product.category}</p>
          </div>

          <Button
            onClick={addToCart}
            className="w-full"
            disabled={product.stockQuantity === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
