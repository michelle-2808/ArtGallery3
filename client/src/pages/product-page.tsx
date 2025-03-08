import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [addingToCart, setAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    queryFn: () => apiRequest(`/api/products/${id}`),
    enabled: !!id,
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  async function handleAddToCart() {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    try {
      setAddingToCart(true);
      await apiRequest("/api/cart", {
        method: "POST",
        body: {
          productId: Number(id),
          quantity: 1,
        }
      });

      toast({
        title: "Added to cart",
        description: "The item has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the item to your cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p>The product you're looking for doesn't exist or is no longer available.</p>
        <Button 
          className="mt-4" 
          onClick={() => setLocation("/")}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <img
            src={product.imageUrl || "https://placehold.co/600x600?text=Product"}
            alt={product.title}
            className="object-cover w-full h-full"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-xl font-semibold mb-6">{formatPrice(product.price)}</p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between">
              <span>Availability:</span>
              <span className="font-medium">
                {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Category:</span>
              <span className="font-medium capitalize">{product.category}</span>
            </div>
            {product.stockQuantity > 0 && (
              <div className="flex justify-between mt-2">
                <span>Stock:</span>
                <span className="font-medium">{product.stockQuantity} units</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p>{product.description}</p>
          </div>

          <Button 
            className="w-full" 
            disabled={addingToCart || !product.isAvailable || product.stockQuantity <= 0}
            onClick={handleAddToCart}
          >
            {addingToCart ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding to Cart...
              </>
            ) : (
              product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"
            )}
          </Button>

          {!product.isAvailable && (
            <p className="text-red-500 mt-2 text-center">
              This product is currently unavailable
            </p>
          )}
        </div>
      </div>
    </div>
  );
}