import { Product } from '../../shared/types';

// Mock products data for development
export const mockProducts: Product[] = [
  {
    _id: '1',
    title: 'Colombian Single Origin',
    description: 'Rich and full-bodied coffee with chocolate notes from the mountains of Colombia.',
    slug: 'colombian-single-origin',
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&h=500&fit=crop'],
    categories: ['single-origin', 'coffee'],
    featured: true,
    tags: ['chocolatey', 'full-body', 'medium-roast'],
    variants: [
      {
        _id: 'v1',
        sku: 'COL-SO-250',
        title: '250g',
        price: 18.99,
        cost: 12.00,
        stock: 45,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      },
      {
        _id: 'v2',
        sku: 'COL-SO-500',
        title: '500g',
        price: 34.99,
        cost: 22.00,
        stock: 32,
        attributes: { size: '500g' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    title: 'Ethiopian Yirgacheffe',
    description: 'Bright and floral coffee with citrus notes from the birthplace of coffee.',
    slug: 'ethiopian-yirgacheffe',
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&h=500&fit=crop'],
    categories: ['single-origin', 'coffee'],
    featured: true,
    tags: ['floral', 'citrus', 'light-roast'],
    variants: [
      {
        _id: 'v3',
        sku: 'ETH-YIR-250',
        title: '250g',
        price: 22.99,
        cost: 15.00,
        stock: 28,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    _id: '3',
    title: 'House Blend',
    description: 'Our signature blend combining beans from multiple origins for a balanced cup.',
    slug: 'house-blend',
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop'],
    categories: ['blends', 'coffee'],
    featured: false,
    tags: ['balanced', 'smooth', 'medium-roast'],
    variants: [
      {
        _id: 'v4',
        sku: 'HOUSE-BLD-250',
        title: '250g',
        price: 16.99,
        cost: 10.00,
        stock: 67,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      },
      {
        _id: 'v5',
        sku: 'HOUSE-BLD-1KG',
        title: '1kg',
        price: 59.99,
        cost: 35.00,
        stock: 23,
        attributes: { size: '1kg' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    _id: '4',
    title: 'Espresso Roast',
    description: 'Dark roasted beans perfect for espresso with rich, bold flavors.',
    slug: 'espresso-roast',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop'],
    categories: ['espresso', 'coffee'],
    featured: true,
    tags: ['bold', 'rich', 'dark-roast'],
    variants: [
      {
        _id: 'v6',
        sku: 'ESP-ROAST-250',
        title: '250g',
        price: 19.99,
        cost: 13.00,
        stock: 41,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    _id: '5',
    title: 'Decaf Colombian',
    description: 'All the flavor of our Colombian beans without the caffeine.',
    slug: 'decaf-colombian',
    images: ['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=500&fit=crop'],
    categories: ['decaf', 'coffee'],
    featured: false,
    tags: ['decaf', 'smooth', 'medium-roast'],
    variants: [
      {
        _id: 'v7',
        sku: 'DECAF-COL-250',
        title: '250g',
        price: 17.99,
        cost: 11.50,
        stock: 19,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    _id: '6',
    title: 'Coffee Grinder Pro',
    description: 'Professional burr grinder for the perfect coffee experience.',
    slug: 'coffee-grinder-pro',
    images: ['https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500&h=500&fit=crop'],
    categories: ['accessories', 'equipment'],
    featured: false,
    tags: ['grinder', 'equipment', 'burr'],
    variants: [
      {
        _id: 'v8',
        sku: 'GRINDER-PRO',
        title: 'Standard',
        price: 129.99,
        cost: 80.00,
        stock: 12,
        attributes: { type: 'burr grinder' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z'
  },
  {
    _id: '7',
    title: 'French Press',
    description: 'Classic French press for brewing rich, full-bodied coffee.',
    slug: 'french-press',
    images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=500&fit=crop'],
    categories: ['accessories', 'brewing'],
    featured: false,
    tags: ['french-press', 'brewing', 'glass'],
    variants: [
      {
        _id: 'v9',
        sku: 'FRENCH-PRESS-350',
        title: '350ml',
        price: 24.99,
        cost: 15.00,
        stock: 38,
        attributes: { size: '350ml' },
        images: [],
        active: true,
        recipe: []
      },
      {
        _id: 'v10',
        sku: 'FRENCH-PRESS-1L',
        title: '1L',
        price: 39.99,
        cost: 25.00,
        stock: 22,
        attributes: { size: '1L' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-09T10:00:00Z'
  },
  {
    _id: '8',
    title: 'Brazil Santos',
    description: 'Smooth and nutty coffee from the Santos region of Brazil.',
    slug: 'brazil-santos',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'],
    categories: ['single-origin', 'coffee'],
    featured: true,
    tags: ['nutty', 'smooth', 'medium-roast'],
    variants: [
      {
        _id: 'v11',
        sku: 'BRA-SAN-250',
        title: '250g',
        price: 17.99,
        cost: 11.00,
        stock: 55,
        attributes: { size: '250g' },
        images: [],
        active: true,
        recipe: []
      }
    ],
    active: true,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  }
];

export function getMockProducts(filters: {
  search?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: string;
} = {}) {
  let filteredProducts = [...mockProducts];

  // Apply filters
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }

  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => 
      p.categories.includes(filters.category!)
    );
  }

  if (filters.featured !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.featured === filters.featured);
  }

  if (filters.minPrice || filters.maxPrice) {
    filteredProducts = filteredProducts.filter(p => {
      const minVariantPrice = Math.min(...p.variants.map(v => v.price));
      const maxVariantPrice = Math.max(...p.variants.map(v => v.price));
      
      if (filters.minPrice && maxVariantPrice < filters.minPrice) return false;
      if (filters.maxPrice && minVariantPrice > filters.maxPrice) return false;
      return true;
    });
  }

  if (filters.tags?.length) {
    filteredProducts = filteredProducts.filter(p =>
      filters.tags!.some(tag => p.tags.includes(tag))
    );
  }

  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => {
          const aMin = Math.min(...a.variants.map(v => v.price));
          const bMin = Math.min(...b.variants.map(v => v.price));
          return aMin - bMin;
        });
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => {
          const aMax = Math.max(...a.variants.map(v => v.price));
          const bMax = Math.max(...b.variants.map(v => v.price));
          return bMax - aMax;
        });
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
  }

  // Apply pagination
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 24;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      pageSize,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / pageSize)
    }
  };
}

export function getMockProduct(slug: string): Product | null {
  return mockProducts.find(p => p.slug === slug) || null;
}

export function getMockRelatedProducts(productId: string): Product[] {
  const product = mockProducts.find(p => p._id === productId);
  if (!product) return [];

  return mockProducts
    .filter(p => 
      p._id !== productId && 
      (p.categories.some(cat => product.categories.includes(cat)) ||
       p.tags.some(tag => product.tags.includes(tag)))
    )
    .slice(0, 4);
}