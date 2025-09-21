import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import StoreLayout from "../../components/layout/StoreLayout";
import ProductCard from "../../components/storefront/ProductCard";
import { useProducts } from "../../hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import { ProductFilters } from "../../../shared/types";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 100]);
  
  // Extract filters from URL params
  const filters: ProductFilters & { page: number; pageSize: number; sort: string } = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    featured: searchParams.get('featured') === 'true',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: 24,
    sort: searchParams.get('sort') || 'newest'
  };

  const { data, isLoading, error } = useProducts(filters);

  const updateFilters = (newFilters: Partial<ProductFilters & { page: number; pageSize: number; sort: string }>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    if ('page' in newFilters === false) {
      params.set('page', '1');
    }
    
    setSearchParams(params);
  };

  const categories = [
    'Single Origin',
    'Blends',
    'Espresso',
    'Decaf',
    'Accessories'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium mb-2 block">Search</label>
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-medium mb-3 block">Categories</label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={filters.category === category.toLowerCase().replace(' ', '-')}
                onCheckedChange={(checked) => 
                  updateFilters({ 
                    category: checked ? category.toLowerCase().replace(' ', '-') : '' 
                  })
                }
              />
              <label htmlFor={category} className="text-sm">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={200}
          min={0}
          step={5}
          className="mb-2"
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => updateFilters({ 
            minPrice: priceRange[0], 
            maxPrice: priceRange[1] 
          })}
        >
          Apply Price Filter
        </Button>
      </div>

      {/* Featured */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={filters.featured}
          onCheckedChange={(checked) => updateFilters({ featured: !!checked })}
        />
        <label htmlFor="featured" className="text-sm">
          Featured Products Only
        </label>
      </div>
    </div>
  );

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Discover our carefully curated selection of premium coffee
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSection />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSection />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Results count */}
                {data && (
                  <span className="text-sm text-muted-foreground">
                    {data.pagination.total} products found
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.category || filters.featured) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary">
                      Search: {filters.search}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => updateFilters({ search: '' })}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge variant="secondary">
                      Category: {filters.category}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => updateFilters({ category: '' })}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                  {filters.featured && (
                    <Badge variant="secondary">
                      Featured
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => updateFilters({ featured: false })}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to load products. Please try again.</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : data?.products.length ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {data.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setSearchParams({})}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page <= 1}
                    onClick={() => updateFilters({ page: filters.page - 1 })}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, filters.page - 2);
                    return (
                      <Button
                        key={page}
                        variant={page === filters.page ? 'default' : 'outline'}
                        onClick={() => updateFilters({ page })}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={filters.page >= data.pagination.totalPages}
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}