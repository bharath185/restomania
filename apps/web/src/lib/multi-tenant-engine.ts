import { getDishImage } from './food-images';
import type { RestaurantBranding } from '@repo/shared';

export interface TenantDish {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  categoryId: string;
  dishType: 'veg' | 'non_veg' | 'vegan' | 'egg';
  isInStock: boolean;
  isFeatured?: boolean;
  spiceLevel?: number;
  imageUrl?: string;
}

export interface TenantCategory {
  id: string;
  name: string;
  sortOrder?: number;
  isActive: boolean;
}

export interface TenantOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber?: string;
  orderType: 'dine_in' | 'takeaway';
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';
  paymentMethod: 'cash' | 'upi_direct' | 'counter';
  paymentStatus: 'pending' | 'paid';
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  totalAmount: number;
  specialNotes?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export interface TenantRestaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  tableCount: number;
  taxRate: number;
  serviceCharge: number;
  currency: string;
  branding: RestaurantBranding;
  categories: TenantCategory[];
  dishes: TenantDish[];
  orders: TenantOrder[];
}

const DEFAULT_RESTAURANTS: TenantRestaurant[] = [
  {
    id: 'rest-spice-garden',
    name: 'Spice Garden',
    slug: 'spice-garden',
    cuisine: 'North Indian, Mughlai & Tandoor',
    ownerName: 'Chef Rajesh Sharma',
    ownerEmail: 'owner@spicegarden.com',
    phone: '+91 98765 43210',
    address: '42 Heritage Boulevard, Indiranagar',
    city: 'Bengaluru',
    isActive: true,
    tableCount: 12,
    taxRate: 5,
    serviceCharge: 2,
    currency: 'INR',
    branding: {
      id: 'brand-sg',
      restaurantId: 'rest-spice-garden',
      primaryColor: '#D97706',
      secondaryColor: '#1E293B',
      accentColor: '#FBBF24',
      fontFamily: 'Inter',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&h=160&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80',
      faviconUrl: null,
      customCss: null,
      welcomeText: 'Experience the royal culinary traditions of India',
      tagline: 'Authentic Tandoor & Royal Mughlai Fare',
      footerText: 'Freshly grounded spices & farm-fresh ingredients daily',
      language: 'en',
      theme: 'light',
    },
    categories: [
      { id: 'sg-cat-1', name: 'Tandoori Appetizers', sortOrder: 1, isActive: true },
      { id: 'sg-cat-2', name: 'Royal Curries', sortOrder: 2, isActive: true },
      { id: 'sg-cat-3', name: 'Dum Biryani', sortOrder: 3, isActive: true },
      { id: 'sg-cat-4', name: 'Artisanal Breads', sortOrder: 4, isActive: true },
      { id: 'sg-cat-5', name: 'Royal Desserts', sortOrder: 5, isActive: true },
    ],
    dishes: [
      {
        id: 'sg-dish-1',
        name: 'Hyderabadi Chicken Dum Biryani',
        description: 'Slow-cooked marinated chicken layered with aromatic aged basmati rice and saffron.',
        basePrice: 380,
        discountedPrice: 340,
        categoryId: 'sg-cat-3',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 2,
        imageUrl: getDishImage('Hyderabadi Chicken Dum Biryani'),
      },
      {
        id: 'sg-dish-2',
        name: 'Murgh Makhani (Butter Chicken)',
        description: 'Tandoor grilled chicken simmered in rich creamy tomato and cashew nut gravy.',
        basePrice: 360,
        categoryId: 'sg-cat-2',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 1,
        imageUrl: getDishImage('Murgh Makhani (Butter Chicken)'),
      },
      {
        id: 'sg-dish-3',
        name: 'Paneer Tikka Angara',
        description: 'Charcoal smoked cottage cheese chunks marinated with stone-ground spices and hung curd.',
        basePrice: 290,
        categoryId: 'sg-cat-1',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 2,
        imageUrl: getDishImage('Paneer Tikka Angara'),
      },
      {
        id: 'sg-dish-4',
        name: 'Dal Makhani Bukhara',
        description: 'Slow-simmered black lentils cooked overnight with country butter and roasted cumin.',
        basePrice: 280,
        categoryId: 'sg-cat-2',
        dishType: 'veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 1,
        imageUrl: getDishImage('Dal Makhani Bukhara'),
      },
      {
        id: 'sg-dish-5',
        name: 'Butter Garlic Naan',
        description: 'Crisp oven-fired leavened bread brushed with melted butter and fresh crushed garlic.',
        basePrice: 75,
        categoryId: 'sg-cat-4',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 0,
        imageUrl: getDishImage('Butter Garlic Naan'),
      },
      {
        id: 'sg-dish-6',
        name: 'Gulab Jamun with Pistachio',
        description: 'Warm golden milk dumplings soaked in cardamom and saffron infused sugar syrup.',
        basePrice: 140,
        categoryId: 'sg-cat-5',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 0,
        imageUrl: getDishImage('Gulab Jamun with Pistachio'),
      },
    ],
    orders: [
      {
        id: 'ord-sg-101',
        orderNumber: 'ORD-1042',
        restaurantId: 'rest-spice-garden',
        tableNumber: '4',
        orderType: 'dine_in',
        status: 'preparing',
        paymentMethod: 'counter',
        paymentStatus: 'pending',
        subtotal: 785,
        taxAmount: 39.25,
        serviceCharge: 15.7,
        discountAmount: 0,
        totalAmount: 840,
        specialNotes: 'Extra mint chutney and less oil please',
        items: [
          { itemId: 'sg-dish-1', itemName: 'Hyderabadi Chicken Dum Biryani', quantity: 1, price: 340 },
          { itemId: 'sg-dish-2', itemName: 'Murgh Makhani (Butter Chicken)', quantity: 1, price: 360 },
          { itemId: 'sg-dish-5', itemName: 'Butter Garlic Naan', quantity: 2, price: 75 },
        ],
        createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      },
      {
        id: 'ord-sg-102',
        orderNumber: 'ORD-1043',
        restaurantId: 'rest-spice-garden',
        tableNumber: '2',
        orderType: 'dine_in',
        status: 'accepted',
        paymentMethod: 'upi_direct',
        paymentStatus: 'paid',
        subtotal: 570,
        taxAmount: 28.5,
        serviceCharge: 11.4,
        discountAmount: 50,
        totalAmount: 560,
        specialNotes: 'Spicy for Paneer Tikka',
        items: [
          { itemId: 'sg-dish-3', itemName: 'Paneer Tikka Angara', quantity: 1, price: 290 },
          { itemId: 'sg-dish-4', itemName: 'Dal Makhani Bukhara', quantity: 1, price: 280 },
        ],
        createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
      },
    ],
  },
  {
    id: 'rest-burger-lab',
    name: 'The Burger Lab',
    slug: 'the-burger-lab',
    cuisine: 'Gourmet Smash Burgers, Shakes & Wings',
    ownerName: 'Alex Mercer',
    ownerEmail: 'owner@burgerlab.com',
    phone: '+91 91234 56789',
    address: '18 Fusion Lane, Bandra West',
    city: 'Mumbai',
    isActive: true,
    tableCount: 10,
    taxRate: 5,
    serviceCharge: 2,
    currency: 'INR',
    branding: {
      id: 'brand-bl',
      restaurantId: 'rest-burger-lab',
      primaryColor: '#E11D48',
      secondaryColor: '#0F172A',
      accentColor: '#F43F5E',
      fontFamily: 'Inter',
      logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=160&h=160&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&auto=format&fit=crop&q=80',
      faviconUrl: null,
      customCss: null,
      welcomeText: 'Craft burgers engineered for extraordinary flavor',
      tagline: 'Artisanal Brioche & 100% Prime Smashed Patties',
      footerText: 'House-made sauces & hand-spun shakes',
      language: 'en',
      theme: 'dark',
    },
    categories: [
      { id: 'bl-cat-1', name: 'Smash Burgers', sortOrder: 1, isActive: true },
      { id: 'bl-cat-2', name: 'Crispy Sides & Fries', sortOrder: 2, isActive: true },
      { id: 'bl-cat-3', name: 'Wings & Tenders', sortOrder: 3, isActive: true },
      { id: 'bl-cat-4', name: 'Thick Shakes', sortOrder: 4, isActive: true },
    ],
    dishes: [
      {
        id: 'bl-dish-1',
        name: 'The Lab Signature Truffle Smash',
        description: 'Double aged beef patties, black truffle mayo, smoked cheddar, and caramelized onions on toasted brioche.',
        basePrice: 399,
        discountedPrice: 349,
        categoryId: 'bl-cat-1',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 1,
        imageUrl: getDishImage('The Lab Signature Truffle Smash'),
      },
      {
        id: 'bl-dish-2',
        name: 'Crispy Peri-Peri Chicken Burger',
        description: 'Crispy golden fried chicken breast dipped in African bird eye chili glaze with cool garlic ranch.',
        basePrice: 329,
        categoryId: 'bl-cat-1',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 2,
        imageUrl: getDishImage('Crispy Peri-Peri Chicken Burger'),
      },
      {
        id: 'bl-dish-3',
        name: 'Loaded Truffle Parmesan Fries',
        description: 'Hand-cut russet fries tossed in white truffle oil, rosemary, and freshly grated aged Parmigiano.',
        basePrice: 219,
        categoryId: 'bl-cat-2',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 0,
        imageUrl: getDishImage('Loaded Truffle Parmesan Fries'),
      },
      {
        id: 'bl-dish-4',
        name: 'Salted Caramel Pretzel Shake',
        description: 'House-churned vanilla bean ice cream spun with salted caramel ribbon and crushed pretzel crumbs.',
        basePrice: 249,
        categoryId: 'bl-cat-4',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 0,
        imageUrl: getDishImage('Salted Caramel Pretzel Shake'),
      },
    ],
    orders: [
      {
        id: 'ord-bl-201',
        orderNumber: 'ORD-2081',
        restaurantId: 'rest-burger-lab',
        tableNumber: '7',
        orderType: 'takeaway',
        status: 'ready',
        paymentMethod: 'counter',
        paymentStatus: 'paid',
        subtotal: 568,
        taxAmount: 28.4,
        serviceCharge: 11.36,
        discountAmount: 0,
        totalAmount: 608,
        specialNotes: 'Pack ketchup & mayo extra packets',
        items: [
          { itemId: 'bl-dish-1', itemName: 'The Lab Signature Truffle Smash', quantity: 1, price: 349 },
          { itemId: 'bl-dish-3', itemName: 'Loaded Truffle Parmesan Fries', quantity: 1, price: 219 },
        ],
        createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
      },
    ],
  },
  {
    id: 'rest-zen-sushi',
    name: 'Zen Sushi Lounge',
    slug: 'zen-sushi',
    cuisine: 'Japanese Omakase, Nigiri & Ramen',
    ownerName: 'Kenji Sato',
    ownerEmail: 'owner@zensushi.com',
    phone: '+91 99887 76655',
    address: '77 Silicon Square, HSR Layout',
    city: 'Bengaluru',
    isActive: true,
    tableCount: 14,
    taxRate: 5,
    serviceCharge: 5,
    currency: 'INR',
    branding: {
      id: 'brand-zs',
      restaurantId: 'rest-zen-sushi',
      primaryColor: '#6366F1',
      secondaryColor: '#0F172A',
      accentColor: '#818CF8',
      fontFamily: 'Inter',
      logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=160&h=160&fit=crop&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1600&auto=format&fit=crop&q=80',
      faviconUrl: null,
      customCss: null,
      welcomeText: 'Masterful Japanese craft and pristine ocean delicacies',
      tagline: 'Artisanal Sushi, Sashimi & Handcrafted Ramen',
      footerText: 'Air-flown Japanese seafood prepared with centuries of heritage',
      language: 'en',
      theme: 'light',
    },
    categories: [
      { id: 'zs-cat-1', name: 'Nigiri & Sashimi', sortOrder: 1, isActive: true },
      { id: 'zs-cat-2', name: 'Specialty Maki Rolls', sortOrder: 2, isActive: true },
      { id: 'zs-cat-3', name: 'Artisanal Ramen', sortOrder: 3, isActive: true },
      { id: 'zs-cat-4', name: 'Appetizers & Gyoza', sortOrder: 4, isActive: true },
    ],
    dishes: [
      {
        id: 'zs-dish-1',
        name: 'Flame Torched Salmon Aburi Nigiri',
        description: 'Prime Atlantic salmon brushed with sweet soy tare, lightly torched and topped with tobiko caviar.',
        basePrice: 520,
        discountedPrice: 470,
        categoryId: 'zs-cat-1',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 0,
        imageUrl: getDishImage('Flame Torched Salmon Aburi Nigiri'),
      },
      {
        id: 'zs-dish-2',
        name: 'Tokyo Tonkotsu Black Garlic Ramen',
        description: 'Rich 18-hour simmered pork broth, springy artisan noodles, chashu pork, and ajitsuke tamago.',
        basePrice: 480,
        categoryId: 'zs-cat-3',
        dishType: 'non_veg',
        isInStock: true,
        isFeatured: true,
        spiceLevel: 1,
        imageUrl: getDishImage('Tokyo Tonkotsu Black Garlic Ramen'),
      },
      {
        id: 'zs-dish-3',
        name: 'Crispy Avocado Tempura Maki',
        description: 'Hass avocado and cucumber tempura rolled with roasted sesame seeds and spicy Japanese mayo.',
        basePrice: 340,
        categoryId: 'zs-cat-2',
        dishType: 'veg',
        isInStock: true,
        isFeatured: false,
        spiceLevel: 1,
        imageUrl: getDishImage('Crispy Avocado Tempura Maki'),
      },
    ],
    orders: [
      {
        id: 'ord-zs-301',
        orderNumber: 'ORD-3019',
        restaurantId: 'rest-zen-sushi',
        tableNumber: '3',
        orderType: 'dine_in',
        status: 'placed',
        paymentMethod: 'counter',
        paymentStatus: 'pending',
        subtotal: 810,
        taxAmount: 40.5,
        serviceCharge: 40.5,
        discountAmount: 0,
        totalAmount: 891,
        specialNotes: 'Extra wasabi and pickled ginger',
        items: [
          { itemId: 'zs-dish-1', itemName: 'Flame Torched Salmon Aburi Nigiri', quantity: 1, price: 470 },
          { itemId: 'zs-dish-3', itemName: 'Crispy Avocado Tempura Maki', quantity: 1, price: 340 },
        ],
        createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
    ],
  },
];

const STORAGE_KEY = 'restomania_multi_tenant_registry_v1';
const ACTIVE_TENANT_KEY = 'restomania_active_tenant_slug';

class MultiTenantEngine {
  private getStorage(): TenantRestaurant[] {
    if (typeof window === 'undefined') return DEFAULT_RESTAURANTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESTAURANTS));
        return DEFAULT_RESTAURANTS;
      }
      return JSON.parse(saved) as TenantRestaurant[];
    } catch {
      return DEFAULT_RESTAURANTS;
    }
  }

  private setStorage(data: TenantRestaurant[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event('tenant_state_updated'));
    } catch (e) {
      console.error('Failed to save multi-tenant state:', e);
    }
  }

  public getRestaurants(): TenantRestaurant[] {
    return this.getStorage();
  }

  public getActiveSlug(): string {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSlug = urlParams.get('restaurant') || urlParams.get('tenant');
      if (urlSlug) {
        localStorage.setItem(ACTIVE_TENANT_KEY, urlSlug);
        return urlSlug;
      }
      const saved = localStorage.getItem(ACTIVE_TENANT_KEY);
      if (saved) return saved;
    }
    return DEFAULT_RESTAURANTS[0]?.slug ?? 'spice-garden';
  }

  public setActiveSlug(slug: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_TENANT_KEY, slug);
      window.dispatchEvent(new Event('tenant_switched'));
    }
  }

  public getActiveRestaurant(): TenantRestaurant {
    const slug = this.getActiveSlug();
    const all = this.getStorage();
    const found = all.find((r) => r.slug === slug || r.id === slug);
    return found ?? all[0] ?? DEFAULT_RESTAURANTS[0]!;
  }

  public getRestaurantBySlug(slug: string): TenantRestaurant | undefined {
    return this.getStorage().find((r) => r.slug === slug || r.id === slug);
  }

  public onboardRestaurant(params: {
    name: string;
    slug: string;
    cuisine?: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    address?: string;
    city?: string;
    tableCount?: number;
    taxRate?: number;
    serviceCharge?: number;
    currency?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    tagline?: string;
    welcomeText?: string;
  }): TenantRestaurant {
    const all = this.getStorage();
    const id = `rest-${Date.now()}`;
    const cleanSlug = (params.slug || params.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/-+/g, '-').replace(/^-|-$/g, '');

    const primaryColor = params.primaryColor || '#FF6B35';
    const logoUrl = params.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&h=160&fit=crop&q=80';
    const coverImageUrl = params.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80';

    const newRestaurant: TenantRestaurant = {
      id,
      name: params.name,
      slug: cleanSlug,
      cuisine: params.cuisine || 'Multi-Cuisine & Chef Specials',
      ownerName: params.ownerName,
      ownerEmail: params.ownerEmail,
      phone: params.phone || '+91 98000 00000',
      address: params.address || 'Central Galleria',
      city: params.city || 'Bengaluru',
      isActive: true,
      tableCount: params.tableCount || 8,
      taxRate: params.taxRate ?? 5,
      serviceCharge: params.serviceCharge ?? 2,
      currency: params.currency || 'INR',
      branding: {
        id: `brand-${id}`,
        restaurantId: id,
        primaryColor,
        secondaryColor: params.secondaryColor || '#1E293B',
        accentColor: params.accentColor || primaryColor,
        fontFamily: 'Inter',
        logoUrl,
        coverImageUrl,
        faviconUrl: null,
        customCss: null,
        welcomeText: params.welcomeText || `Welcome to ${params.name}`,
        tagline: params.tagline || 'Exquisite Flavors & Fresh Ingredients',
        footerText: 'Order fresh from table or counter',
        language: 'en',
        theme: 'light',
      },
      categories: [
        { id: `cat-${id}-1`, name: 'Chef Specials', sortOrder: 1, isActive: true },
        { id: `cat-${id}-2`, name: 'Main Course', sortOrder: 2, isActive: true },
        { id: `cat-${id}-3`, name: 'Beverages & Coolers', sortOrder: 3, isActive: true },
      ],
      dishes: [
        {
          id: `dish-${id}-1`,
          name: `${params.name} Signature Platter`,
          description: 'House specialty crafted with select seasonal ingredients and authentic spices.',
          basePrice: 380,
          discountedPrice: 340,
          categoryId: `cat-${id}-1`,
          dishType: 'veg',
          isInStock: true,
          isFeatured: true,
          spiceLevel: 1,
          imageUrl: getDishImage(`${params.name} Platter`),
        },
        {
          id: `dish-${id}-2`,
          name: 'Classic Farmhouse Gourmet Special',
          description: 'Chef recommendation with rich gravy, aromatic herbs, and fresh condiments.',
          basePrice: 320,
          categoryId: `cat-${id}-2`,
          dishType: 'veg',
          isInStock: true,
          isFeatured: true,
          spiceLevel: 2,
          imageUrl: getDishImage('Classic Farmhouse'),
        },
      ],
      orders: [],
    };

    all.push(newRestaurant);
    this.setStorage(all);
    this.setActiveSlug(newRestaurant.slug);
    return newRestaurant;
  }

  public updateRestaurant(slug: string, updates: Partial<TenantRestaurant>): TenantRestaurant | undefined {
    const all = this.getStorage();
    const idx = all.findIndex((r) => r.slug === slug || r.id === slug);
    if (idx === -1) return undefined;
    const target = all[idx];
    if (!target) return undefined;
    const merged: TenantRestaurant = {
      ...target,
      ...updates,
      branding: { ...target.branding, ...(updates.branding ?? {}) },
    };
    all[idx] = merged;
    this.setStorage(all);
    return merged;
  }

  // --- Category & Dish Operations ---

  public getCategories(slug?: string): TenantCategory[] {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    return restaurant?.categories ?? [];
  }

  public createCategory(name: string, slug?: string): TenantCategory {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) throw new Error('Restaurant not found');
    const newCat: TenantCategory = {
      id: `cat-${Date.now()}`,
      name,
      sortOrder: (restaurant.categories.length || 0) + 1,
      isActive: true,
    };
    restaurant.categories.push(newCat);
    this.updateRestaurant(restaurant.slug, { categories: restaurant.categories });
    return newCat;
  }

  public getDishes(slug?: string, filter?: { categoryId?: string; search?: string; inStock?: boolean }): TenantDish[] {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) return [];
    let items = restaurant.dishes;
    if (filter?.categoryId) {
      items = items.filter((d) => d.categoryId === filter.categoryId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((d) => d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q)));
    }
    if (filter?.inStock !== undefined) {
      items = items.filter((d) => d.isInStock === filter.inStock);
    }
    return items;
  }

  public createDish(dish: Omit<TenantDish, 'id'>, slug?: string): TenantDish {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) throw new Error('Restaurant not found');
    const newDish: TenantDish = {
      ...dish,
      id: `dish-${Date.now()}`,
      imageUrl: dish.imageUrl || getDishImage(dish.name),
      isInStock: dish.isInStock ?? true,
    };
    restaurant.dishes.unshift(newDish);
    this.updateRestaurant(restaurant.slug, { dishes: restaurant.dishes });
    return newDish;
  }

  public toggleDishStock(dishId: string, isInStock: boolean, slug?: string): TenantDish | undefined {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) return undefined;
    const dish = restaurant.dishes.find((d) => d.id === dishId);
    if (!dish) return undefined;
    dish.isInStock = isInStock;
    this.updateRestaurant(restaurant.slug, { dishes: restaurant.dishes });
    return dish;
  }

  public deleteDish(dishId: string, slug?: string): boolean {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) return false;
    restaurant.dishes = restaurant.dishes.filter((d) => d.id !== dishId);
    this.updateRestaurant(restaurant.slug, { dishes: restaurant.dishes });
    return true;
  }

  // --- Order Operations (Zero Payment Gateway Required) ---

  public getOrders(slug?: string): TenantOrder[] {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    return restaurant?.orders ?? [];
  }

  public placeOrder(orderData: {
    orderType: 'dine_in' | 'takeaway';
    paymentMethod?: 'cash' | 'upi_direct' | 'counter';
    specialNotes?: string;
    couponCode?: string;
    tableNumber?: string;
    items: Array<{
      itemId: string;
      quantity: number;
    }>;
  }, slug?: string): TenantOrder {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) throw new Error('Restaurant not found');

    let subtotal = 0;
    const orderItems: TenantOrder['items'] = [];

    for (const item of orderData.items) {
      const dish = restaurant.dishes.find((d) => d.id === item.itemId);
      const price = dish ? Number(dish.discountedPrice ?? dish.basePrice) : 200;
      const itemName = dish ? dish.name : 'Chef Special';
      subtotal += price * item.quantity;
      orderItems.push({
        itemId: item.itemId,
        itemName,
        quantity: item.quantity,
        price,
      });
    }

    const discountAmount = orderData.couponCode ? 50 : 0;
    const taxAmount = Math.round(subtotal * (restaurant.taxRate / 100) * 100) / 100;
    const serviceCharge = Math.round(subtotal * (restaurant.serviceCharge / 100) * 100) / 100;
    const totalAmount = Math.max(0, subtotal + taxAmount + serviceCharge - discountAmount);

    const seq = (restaurant.orders.length || 0) + 1045;
    const newOrder: TenantOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${seq}`,
      restaurantId: restaurant.id,
      tableNumber: orderData.tableNumber || 'Table 1',
      orderType: orderData.orderType || 'dine_in',
      status: 'placed',
      paymentMethod: orderData.paymentMethod || 'counter',
      paymentStatus: 'pending',
      subtotal,
      taxAmount,
      serviceCharge,
      discountAmount,
      totalAmount,
      specialNotes: orderData.specialNotes,
      items: orderItems,
      createdAt: new Date().toISOString(),
    };

    restaurant.orders.unshift(newOrder);
    this.updateRestaurant(restaurant.slug, { orders: restaurant.orders });
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: TenantOrder['status'], note?: string, slug?: string): TenantOrder | undefined {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) return undefined;
    const order = restaurant.orders.find((o) => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    if (status === 'served') {
      order.paymentStatus = 'paid';
    }
    this.updateRestaurant(restaurant.slug, { orders: restaurant.orders });
    return order;
  }

  public getDashboardStats(slug?: string) {
    const restaurant = slug ? this.getRestaurantBySlug(slug) : this.getActiveRestaurant();
    if (!restaurant) return { todayRevenue: 0, todayOrders: 0, pendingOrders: 0, avgOrderValue: 0, topDishes: [] };

    const validOrders = restaurant.orders.filter((o) => o.status !== 'cancelled');
    const todayRevenue = validOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const todayOrders = validOrders.length;
    const pendingOrders = validOrders.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.status)).length;
    const avgOrderValue = todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0;

    // Top dishes calculation
    const dishCounts: Record<string, { count: number; revenue: number }> = {};
    for (const o of validOrders) {
      for (const item of o.items) {
        const entry = dishCounts[item.itemName] || { count: 0, revenue: 0 };
        entry.count += item.quantity;
        entry.revenue += item.price * item.quantity;
        dishCounts[item.itemName] = entry;
      }
    }

    const topDishes = Object.entries(dishCounts)
      .map(([name, data]) => ({ name, orderCount: data.count, revenue: data.revenue }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    return {
      todayRevenue,
      todayOrders,
      pendingOrders,
      avgOrderValue,
      topDishes,
    };
  }

  // --- Auth & Role Simulator ---
  public login(email: string, _password?: string) {
    const lower = email.toLowerCase().trim();
    if (lower === 'admin@platform.com') {
      return {
        accessToken: 'mock-super-admin-token-' + Date.now(),
        user: {
          id: 'user-super-admin',
          name: 'Super Administrator',
          email: 'admin@platform.com',
          role: 'super_admin',
          restaurantId: null,
        },
      };
    }

    const all = this.getStorage();
    const matched = all.find((r) => r.ownerEmail.toLowerCase() === lower);
    if (matched) {
      this.setActiveSlug(matched.slug);
      return {
        accessToken: `mock-owner-token-${matched.slug}-` + Date.now(),
        user: {
          id: `user-${matched.slug}`,
          name: matched.ownerName,
          email: matched.ownerEmail,
          role: 'owner',
          restaurantId: matched.id,
        },
      };
    }

    // Default fallback to active restaurant
    const active = this.getActiveRestaurant();
    return {
      accessToken: 'mock-user-token-' + Date.now(),
      user: {
        id: `user-guest`,
        name: active.ownerName,
        email: lower || active.ownerEmail,
        role: 'owner',
        restaurantId: active.id,
      },
    };
  }
}

export const multiTenantEngine = new MultiTenantEngine();
