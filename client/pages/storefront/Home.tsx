import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Coffee, Award, Truck, Shield } from "lucide-react";
import StoreLayout from "../../components/layout/StoreLayout";
import ProductCard from "../../components/storefront/ProductCard";
import { useProducts, useHomeContent } from "../../hooks/api";

export default function Home() {
  const { data: featuredProducts, isLoading: productsLoading } = useProducts({
    featured: true,
    pageSize: 8
  });

  const { data: content } = useHomeContent();

  return (
    <StoreLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-amber-50 to-orange-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 text-gray-900">
                {content?.hero.title || "Premium Coffee Experience"}
              </h1>
              <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
                {content?.hero.subtitle || "Discover our carefully curated selection of the world's finest coffee beans"}
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/products">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content?.categories.map((category, index) => (
                <Link
                  key={index}
                  to={`/products?category=${category.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-semibold">{category.name}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Button variant="outline" asChild>
                <Link to="/products?featured=true">View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsLoading ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : featuredProducts?.products?.length ? (
                featuredProducts.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Coffee className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No featured products available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content?.highlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-4">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                    <p className="text-gray-600">{highlight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get the latest updates on new products, special offers, and coffee brewing tips.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md text-gray-900"
              />
              <Button className="px-6">Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}