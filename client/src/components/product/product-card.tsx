import { Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

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
        productId: product.id,
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

  return (
    <Card className="overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-[300px] w-full object-cover transition-transform hover:scale-105"
        />
      </Link>
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-playfair text-xl font-semibold mb-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>
        <p className="text-lg font-semibold text-primary">
          ${product.price}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={addToCart}
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
