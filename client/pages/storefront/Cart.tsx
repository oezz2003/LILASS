import { Link } from "react-router-dom";
import StoreLayout from "../../components/layout/StoreLayout";
import { useCart } from "../../contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

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
        className="h-8 w-8 rounded-none"
        onClick={() => onQuantityChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="h-8 w-12 flex items-center justify-center border-x text-sm">
        {quantity}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-none"
        onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  const handleQuantityChange = (productId: string, variantId: string, newQuantity: number) => {
    updateQuantity(productId, variantId, newQuantity);
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    removeItem(productId, variantId);
  };

  if (cart.items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild>
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const maxQuantity = Math.min(item.variant.stock, 99);
              
              return (
                <Card key={`${item.productId}-${item.variantId}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] || item.variant.images?.[0] ? (
                          <img
                            src={item.product.images?.[0] || item.variant.images?.[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link 
                              to={`/products/${item.product.slug}`}
                              className="font-medium hover:text-primary line-clamp-1"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.variant.title}
                            </p>
                            {item.product.categories.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.product.categories.slice(0, 2).map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId, item.variantId)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qty:</span>
                            <QuantityStepper
                              quantity={item.quantity}
                              onQuantityChange={(newQuantity) => 
                                handleQuantityChange(item.productId, item.variantId, newQuantity)
                              }
                              max={maxQuantity}
                            />
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${(item.variant.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${item.variant.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>

                        {/* Stock warning */}
                        {item.variant.stock <= 5 && item.variant.stock > 0 && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs text-amber-600">
                              Only {item.variant.stock} left in stock
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span>${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {cart.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${cart.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${cart.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {cart.subtotal < 50 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800">
                      Add ${(50 - cart.subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/products">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>

                {/* Security badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>🔒</span>
                    <span>Secure checkout with 256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}