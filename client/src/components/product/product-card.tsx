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
      return { text: "Out of Stock", className: "stock-out" };
    } else if (product.stockQuantity <= 5) {
      return { text: `Only ${product.stockQuantity} left!`, className: "stock-low" };
    } else {
      return { text: `In Stock (${product.stockQuantity})`, className: "stock-available" };
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
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <div className="product-image-container">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="product-image"
          />
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <div className="product-category">
            <TagIcon className="inline w-3 h-3 mr-1" />
            {product.category}
          </div>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className={`product-stock ${stockStatus.className}`}>
            {stockStatus.text}
          </p>
        </div>
      </Link>
      <div className="p-3 pt-0 mt-auto">
        <Link href={`/product/${product.id}`} className="w-full">
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