import { useParams, Link } from "react-router-dom";
import StoreLayout from "../../components/layout/StoreLayout";
import { useOrder } from "../../hooks/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  Mail,
  ArrowLeft,
  Download
} from "lucide-react";

function OrderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderError() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">❌</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
      <p className="text-muted-foreground mb-6">
        We couldn't find the order you're looking for.
      </p>
      <div className="space-x-4">
        <Button asChild variant="outline">
          <Link to="/account">
            View My Orders
          </Link>
        </Button>
        <Button asChild>
          <Link to="/products">
            Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  const { id: orderId } = useParams<{ id: string }>();
  const { data: orderData, isLoading, error } = useOrder(orderId!);
  
  const order = orderData?.order;

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <OrderSkeleton />
        </div>
      </StoreLayout>
    );
  }

  if (error || !order) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <OrderError />
        </div>
      </StoreLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Info */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Details Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.title || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">
                        {item.product?.title || 'Product'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant?.title || 'Variant'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${((item.variant?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(item.variant?.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Total */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {order.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${order.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    {order.shippingAddress.company && (
                      <p>{order.shippingAddress.company}</p>
                    )}
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p>{order.shippingAddress.address2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p>{order.shippingAddress.phone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.customerEmail}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button asChild>
              <Link to="/account?tab=orders">
                View All Orders
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <h3 className="font-medium mb-2">Need help with your order?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your order, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StoreLayout>
  );
}