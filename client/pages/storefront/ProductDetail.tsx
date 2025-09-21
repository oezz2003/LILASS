import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star,
  Truck,
  Shield,
  RotateCcw
} from "lucide-react";
import StoreLayout from "../../components/layout/StoreLayout";
import ProductCard from "../../components/storefront/ProductCard";
import { useProduct, useRelatedProducts } from "../../hooks/api";
import { useCart } from "../../contexts/CartContext";
import { Product, ProductVariant } from "../../../shared/types";

interface QuantityStepperProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

function QuantityStepper({ quantity, onQuantityChange, max = 99, min = 1 }: QuantityStepperProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 rounded-none"
        onClick={() => onQuantityChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="h-10 w-16 flex items-center justify-center border-x text-sm font-medium">
        {quantity}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 rounded-none"
        onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: productData, isLoading, error } = useProduct(slug!);
  const product = productData?.product;
  
  const { data: relatedData } = useRelatedProducts(product?._id || "");
  const relatedProducts = relatedData?.products || [];

  // Set default variant when product loads
  useState(() => {
    if (product?.variants?.length && !selectedVariantId) {
      setSelectedVariantId(product.variants[0]._id);
    }
  });

  const selectedVariant = product?.variants.find(v => v._id === selectedVariantId);
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 99) : 1;

  // Get all images (product + variant)
  const allImages = [
    ...(product?.images || []),
    ...(selectedVariant?.images || [])
  ].filter(Boolean);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    // Add to cart using context
    addItem(product, selectedVariant, quantity);
    
    toast({
      title: "Added to cart!",
      description: `${quantity}x ${product.title} (${selectedVariant.title}) added to your cart.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="aspect-square w-full mb-4" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/products" className="text-muted-foreground hover:text-primary">
            Products
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-2">📦</div>
                    <div>No image available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`h-4 w-4 ${
                      isWishlisted ? 'fill-current text-red-500' : ''
                    }`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Categories and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {category}
                  </Link>
                ))}
              </div>
              
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                ${selectedVariant?.price.toFixed(2) || '0.00'}
              </div>
              {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                <p className="text-sm text-amber-600">
                  Only {selectedVariant.stock} left in stock!
                </p>
              )}
            </div>

            {/* Variant Selection */}
            {product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Size/Variant</label>
                <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem key={variant._id} value={variant._id}>
                        {variant.title} - ${variant.price.toFixed(2)}
                        {variant.stock === 0 && ' (Out of stock)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <QuantityStepper
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    max={maxQuantity}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock || !selectedVariant}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <Truck className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <div className="text-xs text-muted-foreground">Free Shipping</div>
              </div>
              <div className="text-center">
                <Shield className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <div className="text-xs text-muted-foreground">Secure Payment</div>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <div className="text-xs text-muted-foreground">Easy Returns</div>
              </div>
            </div>

            <Separator />

            {/* Product Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </TabsContent>
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span className="text-muted-foreground">{selectedVariant?.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Stock:</span>
                    <span className="text-muted-foreground">
                      {selectedVariant?.stock || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span className="text-muted-foreground">
                      {product.categories.join(', ')}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}