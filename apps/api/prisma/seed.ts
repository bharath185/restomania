import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomBytes } from 'crypto';

const prisma = new PrismaClient();
const QR_SECRET = process.env.QR_HMAC_SECRET ?? 'changeme-qr-secret';

async function createRestaurant(data: {
  name: string;
  slug: string;
  email: string;
  password: string;
  branding: { primaryColor: string; secondaryColor: string; accentColor: string; welcomeText: string; tagline: string };
  tableCount: number;
  categories: Array<{ name: string; items: Array<{ name: string; price: number; dishType: string; description: string; tags: string[] }> }>;
}) {
  console.log(`Seeding ${data.name}...`);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: data.slug },
    update: {},
    create: {
      name: data.name,
      slug: data.slug,
      ownerEmail: data.email,
      currency: 'INR',
      taxRate: 5,
      serviceCharge: 2,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.restaurantBranding.upsert({
    where: { restaurantId: restaurant.id },
    update: data.branding,
    create: { restaurantId: restaurant.id, ...data.branding },
  });

  await prisma.restaurantHour.deleteMany({ where: { restaurantId: restaurant.id } });
  await prisma.restaurantHour.createMany({
    data: Array.from({ length: 7 }, (_, i) => ({
      restaurantId: restaurant.id,
      dayOfWeek: i,
      openTime: '09:00',
      closeTime: '22:00',
      isClosed: false,
    })),
  });

  const passwordHash = await bcrypt.hash(data.password, 12);
  const owner = await prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: { email: data.email, name: `${data.name} Owner`, passwordHash, role: 'owner' },
  });

  await prisma.userRestaurantRole.upsert({
    where: { userId_restaurantId: { userId: owner.id, restaurantId: restaurant.id } },
    update: {},
    create: { userId: owner.id, restaurantId: restaurant.id, role: 'owner' },
  });

  for (const cat of data.categories) {
    const category = await prisma.menuCategory.create({
      data: { restaurantId: restaurant.id, name: cat.name, isActive: true },
    });

    for (const item of cat.items) {
      await prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: item.name,
          description: item.description,
          dishType: item.dishType,
          basePrice: item.price,
          isActive: true,
          isInStock: true,
          tags: JSON.stringify(item.tags),
        },
      });
    }
  }

  for (let i = 1; i <= data.tableCount; i++) {
    let table = await prisma.restaurantTable.findFirst({
      where: { restaurantId: restaurant.id, tableNumber: String(i) },
    });

    if (!table) {
      table = await prisma.restaurantTable.create({
        data: { restaurantId: restaurant.id, tableNumber: String(i), capacity: 4 },
      });
    }

    const existing = await prisma.qrToken.findFirst({
      where: { restaurantId: restaurant.id, tableId: table.id, isActive: true },
    });

    if (!existing) {
      const nonce = randomBytes(8).toString('hex');
      const payload = `${restaurant.id}|${table.id}|${nonce}`;
      const token = createHmac('sha256', QR_SECRET).update(payload).digest('hex');
      await prisma.qrToken.create({
        data: { restaurantId: restaurant.id, tableId: table.id, token, tokenType: 'table' },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { restaurantId_code: { restaurantId: restaurant.id, code: 'WELCOME10' } },
    update: {},
    create: {
      restaurantId: restaurant.id,
      code: 'WELCOME10',
      description: '10% off on your first order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 100,
      maxDiscount: 50,
      isActive: true,
    },
  });

  console.log(`✓ ${data.name} seeded (${data.tableCount} tables, ${data.categories.reduce((s, c) => s + c.items.length, 0)} items)`);
  return restaurant;
}

async function main() {
  console.log('🌱 Seeding database...');

  const superAdminHash = await bcrypt.hash('superadmin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      name: 'Super Admin',
      passwordHash: superAdminHash,
      role: 'super_admin',
    },
  });
  console.log('✓ Super admin: admin@platform.com / superadmin123');

  await createRestaurant({
    name: 'Spice Garden',
    slug: 'spicegarden',
    email: 'owner@spicegarden.com',
    password: 'password123',
    branding: {
      primaryColor: '#FF6B35',
      secondaryColor: '#2D6A4F',
      accentColor: '#F7C59F',
      welcomeText: 'Welcome to Spice Garden! Authentic Indian Flavours.',
      tagline: 'Where Every Bite Tells a Story',
    },
    tableCount: 10,
    categories: [
      {
        name: 'Starters',
        items: [
          { name: 'Paneer Tikka', price: 280, dishType: 'veg', description: 'Grilled cottage cheese with spices', tags: ['popular', 'grilled'] },
          { name: 'Veg Seekh Kebab', price: 240, dishType: 'veg', description: 'Spiced vegetable skewers', tags: ['grilled'] },
          { name: 'Chicken Tikka', price: 340, dishType: 'non_veg', description: 'Marinated chicken pieces', tags: ['popular', 'spicy'] },
          { name: 'Samosa (2 pcs)', price: 80, dishType: 'veg', description: 'Crispy pastry with spiced filling', tags: ['crispy'] },
          { name: 'Onion Bhaji', price: 120, dishType: 'veg', description: 'Golden fried onion fritters', tags: [] },
        ],
      },
      {
        name: 'Main Course',
        items: [
          { name: 'Butter Chicken', price: 380, dishType: 'non_veg', description: 'Creamy tomato-based chicken curry', tags: ['bestseller', 'mild'] },
          { name: 'Dal Makhani', price: 280, dishType: 'veg', description: 'Slow-cooked black lentils in cream', tags: ['bestseller'] },
          { name: 'Palak Paneer', price: 300, dishType: 'veg', description: 'Fresh spinach with cottage cheese', tags: ['healthy'] },
          { name: 'Mutton Rogan Josh', price: 440, dishType: 'non_veg', description: 'Kashmiri-style slow-cooked mutton', tags: ['spicy', 'premium'] },
          { name: 'Kadai Chicken', price: 360, dishType: 'non_veg', description: 'Wok-tossed chicken with peppers', tags: ['spicy'] },
        ],
      },
      {
        name: 'Breads & Rice',
        items: [
          { name: 'Garlic Naan', price: 60, dishType: 'veg', description: 'Fluffy leavened bread with garlic butter', tags: [] },
          { name: 'Tandoori Roti', price: 40, dishType: 'veg', description: 'Whole wheat bread from tandoor', tags: ['healthy'] },
          { name: 'Jeera Rice', price: 160, dishType: 'veg', description: 'Basmati rice tempered with cumin', tags: [] },
          { name: 'Veg Biryani', price: 280, dishType: 'veg', description: 'Fragrant basmati with vegetables', tags: ['popular'] },
          { name: 'Chicken Biryani', price: 360, dishType: 'non_veg', description: 'Aromatic rice with tender chicken', tags: ['bestseller'] },
        ],
      },
      {
        name: 'Beverages',
        items: [
          { name: 'Mango Lassi', price: 120, dishType: 'veg', description: 'Chilled yogurt drink with mango', tags: ['refreshing'] },
          { name: 'Masala Chai', price: 60, dishType: 'veg', description: 'Spiced Indian tea', tags: ['hot'] },
          { name: 'Fresh Lime Soda', price: 80, dishType: 'veg', description: 'Fizzy lime with mint', tags: ['refreshing'] },
        ],
      },
    ],
  });

  await createRestaurant({
    name: 'The Burger Lab',
    slug: 'burgerlab',
    email: 'owner@burgerlab.com',
    password: 'password123',
    branding: {
      primaryColor: '#E63946',
      secondaryColor: '#1D3557',
      accentColor: '#FFD166',
      welcomeText: 'Science-Crafted Burgers. Pure Deliciousness.',
      tagline: 'Engineered for Taste',
    },
    tableCount: 8,
    categories: [
      {
        name: 'Signature Burgers',
        items: [
          { name: 'Classic Smash Burger', price: 280, dishType: 'non_veg', description: 'Double smash patty, American cheese, pickles', tags: ['bestseller', 'classic'] },
          { name: 'Crispy Chicken Burger', price: 260, dishType: 'non_veg', description: 'Southern fried chicken, coleslaw, sriracha', tags: ['popular', 'spicy'] },
          { name: 'BBQ Bacon Burger', price: 320, dishType: 'non_veg', description: 'Beef patty, crispy bacon, BBQ sauce', tags: ['premium'] },
          { name: 'Veggie Lab Burger', price: 220, dishType: 'veg', description: 'Plant-based patty with truffle mayo', tags: ['plant-based'] },
          { name: 'Mushroom Swiss Burger', price: 260, dishType: 'veg', description: 'Portobello, Swiss cheese, garlic aioli', tags: [] },
        ],
      },
      {
        name: 'Sides & Fries',
        items: [
          { name: 'Loaded Cheese Fries', price: 180, dishType: 'veg', description: 'Crispy fries with cheese sauce and jalapenos', tags: ['bestseller'] },
          { name: 'Onion Rings', price: 140, dishType: 'veg', description: 'Beer-battered crunchy onion rings', tags: [] },
          { name: 'Coleslaw', price: 80, dishType: 'veg', description: 'Creamy homemade coleslaw', tags: ['healthy'] },
          { name: 'Sweet Potato Fries', price: 160, dishType: 'veg', description: 'Oven-baked sweet potato fries', tags: ['healthy'] },
        ],
      },
      {
        name: 'Drinks & Shakes',
        items: [
          { name: 'Classic Cola', price: 60, dishType: 'veg', description: 'Chilled cola', tags: [] },
          { name: 'Oreo Milkshake', price: 180, dishType: 'veg', description: 'Thick shake with Oreo cookies', tags: ['popular'] },
          { name: 'Lemonade', price: 80, dishType: 'veg', description: 'Fresh squeezed lemonade', tags: ['refreshing'] },
        ],
      },
    ],
  });

  await createRestaurant({
    name: 'Zen Sushi',
    slug: 'zensushi',
    email: 'owner@zensushi.com',
    password: 'password123',
    branding: {
      primaryColor: '#2B2D42',
      secondaryColor: '#8D99AE',
      accentColor: '#EF233C',
      welcomeText: 'Experience the Art of Japanese Cuisine.',
      tagline: 'Harmony. Simplicity. Excellence.',
    },
    tableCount: 12,
    categories: [
      {
        name: 'Sushi Rolls',
        items: [
          { name: 'California Roll (8 pcs)', price: 320, dishType: 'non_veg', description: 'Crab, avocado, cucumber', tags: ['classic', 'popular'] },
          { name: 'Spicy Tuna Roll (8 pcs)', price: 380, dishType: 'non_veg', description: 'Fresh tuna, spicy mayo, cucumber', tags: ['spicy', 'popular'] },
          { name: 'Dragon Roll (8 pcs)', price: 420, dishType: 'non_veg', description: 'Shrimp tempura, avocado, eel sauce', tags: ['premium', 'bestseller'] },
          { name: 'Avocado Roll (8 pcs)', price: 260, dishType: 'veg', description: 'Creamy avocado with sesame', tags: ['vegan'] },
          { name: 'Vegetable Rainbow Roll', price: 300, dishType: 'veg', description: 'Colorful vegetables with tamari', tags: ['healthy', 'veg'] },
        ],
      },
      {
        name: 'Nigiri & Sashimi',
        items: [
          { name: 'Salmon Nigiri (2 pcs)', price: 220, dishType: 'non_veg', description: 'Fresh salmon over seasoned rice', tags: ['fresh'] },
          { name: 'Tuna Nigiri (2 pcs)', price: 240, dishType: 'non_veg', description: 'Premium tuna over rice', tags: ['premium'] },
          { name: 'Salmon Sashimi (5 pcs)', price: 380, dishType: 'non_veg', description: 'Pure fresh salmon slices', tags: ['premium', 'keto'] },
          { name: 'Mixed Sashimi (10 pcs)', price: 680, dishType: 'non_veg', description: 'Chef\'s selection of fresh fish', tags: ['premium'] },
        ],
      },
      {
        name: 'Hot Dishes',
        items: [
          { name: 'Miso Soup', price: 120, dishType: 'veg', description: 'Traditional Japanese miso with tofu', tags: ['classic'] },
          { name: 'Gyoza (6 pcs)', price: 240, dishType: 'non_veg', description: 'Pan-fried pork dumplings', tags: ['popular'] },
          { name: 'Edamame', price: 140, dishType: 'veg', description: 'Steamed salted soybeans', tags: ['healthy', 'vegan'] },
          { name: 'Chicken Teriyaki', price: 360, dishType: 'non_veg', description: 'Grilled chicken with teriyaki glaze', tags: ['bestseller'] },
          { name: 'Vegetable Tempura', price: 280, dishType: 'veg', description: 'Lightly battered seasonal vegetables', tags: ['crispy'] },
        ],
      },
      {
        name: 'Beverages',
        items: [
          { name: 'Green Tea', price: 80, dishType: 'veg', description: 'Traditional Japanese green tea', tags: ['hot'] },
          { name: 'Yuzu Lemonade', price: 160, dishType: 'veg', description: 'Japanese citrus refresher', tags: ['refreshing'] },
          { name: 'Sake (small carafe)', price: 480, dishType: 'veg', description: 'Traditional Japanese rice wine', tags: ['alcohol'] },
        ],
      },
    ],
  });

  console.log('\n✅ Seeding complete!');
  console.log('\nDemo Logins:');
  console.log('  Super Admin:     admin@platform.com / superadmin123');
  console.log('  Spice Garden:    owner@spicegarden.com / password123');
  console.log('  The Burger Lab:  owner@burgerlab.com / password123');
  console.log('  Zen Sushi:       owner@zensushi.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
