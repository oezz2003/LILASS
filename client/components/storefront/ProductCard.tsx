import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { Product } from "../../../shared/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  
  // Get the primary variant (first one or cheapest)
  const primaryVariant = product.variants?.length 
    ? product.variants.reduce((min, variant) => 
        variant.price < min.price ? variant : min
      )
    : null;

  // Get price range if multiple variants
  const priceRange = product.variants?.length > 1 
    ? {
        min: Math.min(...product.variants.map(v => v.price)),
        max: Math.max(...product.variants.map(v => v.price))
      }
    : null;

  const displayPrice = priceRange && priceRange.min !== priceRange.max
    ? `$${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`
    : primaryVariant
    ? `$${primaryVariant.price.toFixed(2)}`
    : "Price unavailable";

  // Check if any variant is in stock
  const isInStock = product.variants?.some(variant => variant.stock > 0) ?? false;

  // Get the main product image
  const mainImage = product.images?.[0] || primaryVariant?.images?.[0];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Product Image */}
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No image</div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Featured
            </Badge>
          )}
          {!isInStock && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary">
              <Heart className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" asChild>
              <Link to={`/products/${product.slug}`}>
                Quick View
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product title */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Categories */}
        {product.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.slice(0, 2).map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg">{displayPrice}</span>
          {primaryVariant && primaryVariant.stock <= 5 && primaryVariant.stock > 0 && (
            <span className="text-xs text-amber-600">
              Only {primaryVariant.stock} left
            </span>
          )}
        </div>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Add to cart button */}
        <Button 
          className="w-full" 
          size="sm"
          disabled={!isInStock || !primaryVariant}
          onClick={(e) => {
            e.preventDefault();
            if (primaryVariant) {
              addItem(product, primaryVariant, 1);
            }
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
}