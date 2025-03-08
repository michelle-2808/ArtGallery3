import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TagIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Determine stock status for display
  const getStockStatus = () => {
    if (!product.isAvailable || product.stockQuantity <= 0) {
      return { text: "Out of Stock", className: "text-red-500" };
    } else if (product.stockQuantity <= 5) {
      return { text: `Only ${product.stockQuantity} left!`, className: "text-amber-500" };
    } else {
      return { text: `In Stock (${product.stockQuantity})`, className: "text-green-600" };
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  const stockStatus = getStockStatus();

  return (
    <div className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.title}</h3>
          <div className="text-sm text-gray-600 mb-2 flex items-center">
            <TagIcon className="inline w-3 h-3 mr-1" />
            <span className="capitalize">{product.category}</span>
          </div>
          <p className="font-bold text-lg mb-2">{formatPrice(product.price)}</p>
          <p className={`text-sm ${stockStatus.className}`}>
            {stockStatus.text}
          </p>
        </div>
      </Link>
      <div className="p-4 pt-0 mt-auto">
        <Link href={`/products/${product.id}`}>
          <Button 
            className="w-full" 
            variant={!product.isAvailable || product.stockQuantity <= 0 ? "outline" : "default"}
            disabled={!product.isAvailable || product.stockQuantity <= 0}
          >
            {!product.isAvailable || product.stockQuantity <= 0 ? "Out of Stock" : "View Details"}
          </Button>
        </Link>
      </div>
    </div>
  );
}