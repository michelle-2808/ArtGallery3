import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ShoppingCart, Package, Star, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    queryFn: () => apiRequest("GET", `/api/products/${id}`), //Retaining original method for robustness
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
      await apiRequest("/api/cart", "POST", {
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Error fetching product: {error.message}</h1>
      </div>
    );
  }

  if (!product || !product.isAvailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative group">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-auto object-cover rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl"
          />
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <span className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold font-playfair">{product.title}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 reviews)</span>
            </div>
          </div>

          <Card className="border-none shadow-none bg-muted/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
                <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {product.category}
                </span>
              </div>

              <div className="flex items-center gap-2 py-4">
                {product.stockQuantity > 0 ? (
                  <span className="flex items-center text-green-600 gap-1">
                    <CheckCircle className="h-4 w-4" />
                    In Stock 
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center ml-1 cursor-help">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{product.stockQuantity} items remaining</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Out of Stock
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="py-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Button
            className="w-full mt-4"
            size="lg"
            onClick={addToCart}
            disabled={product.stockQuantity === 0 || !product.isAvailable}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> 
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          <div className="text-xs text-center text-muted-foreground mt-2">
            Free shipping on orders over $50
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold font-playfair mb-6">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Handcrafted by skilled artisans</li>
              <li>Made with premium materials</li>
              <li>One-of-a-kind piece</li>
              <li>Certificate of authenticity included</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">Specifications</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Material</span>
                <span>Mixed Media</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Size</span>
                <span>Medium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}