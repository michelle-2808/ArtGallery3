import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

function OTPVerificationStep({ onSuccess }: { onSuccess: () => void }) {
  const [otp, setOtp] = useState("");
  const [displayOtp, setDisplayOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate and display OTP (simulating server response)
  useEffect(() => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDisplayOtp(generatedOtp);

    // Show OTP in alert
    alert(`Your OTP for checkout verification is: ${generatedOtp}`);
  }, []);

  async function handleVerify() {
    if (!otp || otp.length < 6) {
      toast({
        title: "Error",
        description: "Please enter a valid OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // For demo purposes, compare with displayed OTP
      if (otp === displayOtp) {
        toast({
          title: "Success",
          description: "OTP verified successfully",
        });
        onSuccess();
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
      <button onClick={handleVerify} disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}


export default function CheckoutPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const { data: cartItems, isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    queryFn: () => apiRequest("/api/cart"), //Corrected API call
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => apiRequest("/api/products") //Corrected API call
  });

  if (!user || user.isAdmin) {
    setLocation("/");
    return null;
  }

  const totalAmount = cartItems?.reduce((total, item) => {
    const product = products?.find(p => p.id === item.productId);
    return total + (Number(product?.price) || 0) * item.quantity;
  }, 0) || 0;

  async function handleCheckout() {
    if (!cartItems?.length) return;

    setIsProcessing(true);
    setShowOTPVerification(true);

    const handleOTPVerificationSuccess = async () => {
      try {
        await apiRequest("POST", "/api/orders", { totalAmount });
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Success",
          description: "Order placed successfully",
        });
        setLocation("/");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to place order",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setShowOTPVerification(false);
      }
    };


    // Removed redundant OTP generation and verification code
  }

  if (isLoadingCart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto art-gradient">
        <CardHeader>
          <CardTitle className="text-3xl font-playfair text-white">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="bg-white rounded-b-lg space-y-6">
          {cartItems?.map((item) => {
            const product = products?.find(p => p.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × ${product.price}
                  </p>
                </div>
                <p className="font-medium">
                  ${(Number(product.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            );
          })}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-lg font-bold">${totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            className="w-full section-primary"
            disabled={!cartItems?.length || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Purchase
              </>
            )}
          </Button>
          {showOTPVerification && <OTPVerificationStep onSuccess={handleOTPVerificationSuccess} />}
        </CardContent>
      </Card>
    </div>
  );
}