import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { CartItem, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CartDropdown() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: cartItems, isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  async function removeFromCart(productId: number) {
    try {
      await apiRequest("DELETE", `/api/cart/${productId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <ShoppingCart className="h-5 w-5" />
          <span className="ml-2">
            {isLoadingCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              cartItems?.length || 0
            )}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {cartItems?.length === 0 ? (
          <DropdownMenuItem disabled>Cart is empty</DropdownMenuItem>
        ) : (
          <>
            {cartItems?.map((item) => {
              const product = products?.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ${product.price}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(product.id)}
                  >
                    ×
                  </Button>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                className="w-full section-primary"
                onClick={() => setLocation("/checkout")}
                disabled={!cartItems?.length}
              >
                Proceed to Checkout
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}