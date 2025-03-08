
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async () => await apiRequest("/api/cart"),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="mb-4">You need to be logged in to access the checkout page.</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading cart items...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="mb-4">Add some products to your cart before checkout.</p>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (parseFloat(item.product.price) * item.quantity);
  }, 0);
  
  const shippingFee = 5.99;
  const total = subtotal + shippingFee;

  async function handleGenerateOTP() {
    try {
      setIsSubmitting(true);
      const response = await apiRequest("/api/generate-checkout-otp", "POST");
      
      setOtpSent(true);
      setShowOtpInput(true);
      
      toast({
        title: "OTP Generated",
        description: `Your OTP code is: ${response.code}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePlaceOrder() {
    try {
      setIsSubmitting(true);
      
      // Verify OTP
      const otpResponse = await apiRequest("/api/verify-otp", "POST", {
        code: otpCode,
        purpose: "checkout"
      });
      
      if (!otpResponse.success) {
        toast({
          title: "Invalid OTP",
          description: "The OTP code you entered is invalid",
          variant: "destructive",
        });
        return;
      }
      
      // Place order
      await apiRequest("/api/orders", "POST", {
        totalAmount: total
      });
      
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully",
      });
      
      navigate("/order-confirmation");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-2 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.product.imageUrl || "https://placehold.co/400x400?text=Product"}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.title}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {showOtpInput ? (
                <div className="mt-6">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="mt-1"
                    placeholder="Enter OTP"
                  />
                </div>
              ) : null}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              {!otpSent ? (
                <Button 
                  className="w-full" 
                  onClick={handleGenerateOTP}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Proceed with OTP Verification"}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !otpCode}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
