import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cafex Artisan Roastery database...');

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      cafeName: 'Cafex Artisan Roastery',
      tagline: 'Single-Origin Coffee, Slow Pour & Handcrafted Pastries',
      address: '42 Roaster Walk, Arts District, New Delhi, India 110001',
      phone: '+91 98101 23456',
      email: 'roastery@cafexartisan.com',
      currency: 'INR',
      currencySymbol: '₹',
      timezone: 'Asia/Kolkata',
      taxPercentage: 5.0,
      deliveryEnabled: true,
      openingHoursJson: {
        monday: '07:30 - 20:30',
        tuesday: '07:30 - 20:30',
        wednesday: '07:30 - 20:30',
        thursday: '07:30 - 20:30',
        friday: '07:30 - 22:00',
        saturday: '08:00 - 22:00',
        sunday: '08:00 - 21:00',
      },
    },
  });

  // 2. Initial Admin & Staff Accounts
  const adminPasswordHash = bcrypt.hashSync('CafexAdmin2026!', 10);
  const staffPasswordHash = bcrypt.hashSync('Barista2026!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@cafexartisan.com' },
    update: {},
    create: {
      email: 'admin@cafexartisan.com',
      name: 'Elena Vance (Owner)',
      passwordHash: adminPasswordHash,
      role: RoleType.ADMIN,
      phone: '+91 98101 23456',
    },
  });

  await prisma.user.upsert({
    where: { email: 'barista@cafexartisan.com' },
    update: {},
    create: {
      email: 'barista@cafexartisan.com',
      name: 'Devin K (Head Barista)',
      passwordHash: staffPasswordHash,
      role: RoleType.STAFF,
      phone: '+91 98101 23457',
    },
  });

  // 3. Categories
  const categoriesData = [
    {
      name: 'Signature Drinks',
      slug: 'signature-drinks',
      description: 'Exclusive house creations combining estate roasts with botanical infusions',
      sortOrder: 1,
    },
    {
      name: 'Espresso & Classics',
      slug: 'espresso-classics',
      description: 'Dialed-in double shots, velvety microfoam and time-tested Italian profiles',
      sortOrder: 2,
    },
    {
      name: 'Manual Brews',
      slug: 'manual-brews',
      description: 'Single-origin varietals prepared via V60, Chemex, and Aeropress',
      sortOrder: 3,
    },
    {
      name: 'Cold & Nitro',
      slug: 'cold-brews',
      description: '18-hour cold steeped extractions and pressurized nitro pours',
      sortOrder: 4,
    },
    {
      name: 'Artisan Bakery',
      slug: 'artisan-bakery',
      description: 'Laminated French viennoiserie and sourdough bakes made fresh every dawn',
      sortOrder: 5,
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = record.id;
  }

  // 4. Products with Options & 3D model links
  const productsData = [
    {
      name: 'Artisan Amber Latte',
      slug: 'artisan-amber-latte',
      categoryId: createdCategories['signature-drinks'],
      description: 'Double shot of Ethiopian Yirgacheffe, steamed oat milk, infused with raw cardamom honey and Madagascar vanilla bean.',
      basePriceMinor: 32000, // ₹320.00
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
      modelUrl: '/models/hero/coffee-cup.glb', // Connected to our optimized 3D model!
      dietaryNotes: ['Vegetarian', 'Cardamom Honey'],
      sortOrder: 1,
      options: [
        {
          groupName: 'Milk Choice',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Oat Milk (Barista Edition)', priceDeltaMinor: 0 },
            { name: 'Whole Dairy Milk', priceDeltaMinor: 0 },
            { name: 'Almond Milk', priceDeltaMinor: 4000 },
          ],
        },
        {
          groupName: 'Espresso Boost',
          minSelect: 0,
          maxSelect: 1,
          items: [
            { name: 'Extra Double Shot', priceDeltaMinor: 6000 },
          ],
        },
      ],
    },
    {
      name: 'Smoked Sea Salt Cortado',
      slug: 'smoked-sea-salt-cortado',
      categoryId: createdCategories['signature-drinks'],
      description: '1:1 ratio of intense ristretto and silky textured milk topped with Maldon smoked sea salt flake.',
      basePriceMinor: 26000, // ₹260.00
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      modelUrl: null,
      dietaryNotes: ['Vegetarian'],
      sortOrder: 2,
      options: [
        {
          groupName: 'Milk Choice',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Whole Milk', priceDeltaMinor: 0 },
            { name: 'Oat Milk', priceDeltaMinor: 3000 },
          ],
        },
      ],
    },
    {
      name: 'Classic Velvet Flat White',
      slug: 'classic-velvet-flat-white',
      categoryId: createdCategories['espresso-classics'],
      description: 'Precision extracted double ristretto coated in glossy, micro-textured whole milk.',
      basePriceMinor: 24000, // ₹240.00
      imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
      modelUrl: null,
      dietaryNotes: ['Classic'],
      sortOrder: 3,
      options: [
        {
          groupName: 'Milk Choice',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Standard Whole Milk', priceDeltaMinor: 0 },
            { name: 'Oat Milk', priceDeltaMinor: 4000 },
            { name: 'Almond Milk', priceDeltaMinor: 4000 },
          ],
        },
        {
          groupName: 'Temperature',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Hot (65°C Barista Standard)', priceDeltaMinor: 0 },
            { name: 'Extra Hot (72°C)', priceDeltaMinor: 0 },
          ],
        },
      ],
    },
    {
      name: 'Single-Origin Chemex V60',
      slug: 'single-origin-chemex-v60',
      categoryId: createdCategories['manual-brews'],
      description: 'Light roast washed Geisha with bright notes of jasmine, peach nectar, and bergamot.',
      basePriceMinor: 34000, // ₹340.00
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      modelUrl: null,
      dietaryNotes: ['Vegan', 'Single-Origin', 'Filter'],
      sortOrder: 4,
      options: [
        {
          groupName: 'Brew Method',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Hario V60 (Crisp & Clean)', priceDeltaMinor: 0 },
            { name: 'Chemex (Full Clarity)', priceDeltaMinor: 2000 },
            { name: 'Aeropress (Rich Body)', priceDeltaMinor: 0 },
          ],
        },
      ],
    },
    {
      name: 'Nitro Cascade Cold Brew',
      slug: 'nitro-cascade-cold-brew',
      categoryId: createdCategories['cold-brews'],
      description: 'Slow-steeped for 20 hours and infused with nitrogen for a Guinness-like silky head with dark chocolate notes.',
      basePriceMinor: 28000, // ₹280.00
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
      modelUrl: null,
      dietaryNotes: ['Vegan', 'Low Acidity'],
      sortOrder: 5,
      options: [
        {
          groupName: 'Sweetness',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Unsweetened Black', priceDeltaMinor: 0 },
            { name: 'Light Demerara Syrup', priceDeltaMinor: 2000 },
          ],
        },
      ],
    },
    {
      name: 'Golden Butter French Croissant',
      slug: 'golden-butter-french-croissant',
      categoryId: createdCategories['artisan-bakery'],
      description: 'Layered with pure French Isigny butter, baked to a honeycomb interior with shatteringly crisp flakiness.',
      basePriceMinor: 19000, // ₹190.00
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      modelUrl: null,
      dietaryNotes: ['Vegetarian', 'Fresh Daily'],
      sortOrder: 6,
      options: [
        {
          groupName: 'Serving Style',
          minSelect: 1,
          maxSelect: 1,
          items: [
            { name: 'Warmed Oven Crisp', priceDeltaMinor: 0 },
            { name: 'Room Temperature', priceDeltaMinor: 0 },
          ],
        },
      ],
    },
  ];

  for (const prod of productsData) {
    const { options, ...prodFields } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    let productId = existing?.id;

    if (!existing) {
      const created = await prisma.product.create({
        data: prodFields,
      });
      productId = created.id;
    }

    if (options && productId) {
      for (const grp of options) {
        const optionGroup = await prisma.productOptionGroup.create({
          data: {
            productId,
            name: grp.groupName,
            minSelect: grp.minSelect,
            maxSelect: grp.maxSelect,
            options: {
              create: grp.items.map((item) => ({
                name: item.name,
                priceDeltaMinor: item.priceDeltaMinor,
                isAvailable: true,
              })),
            },
          },
        });
      }
    }
  }

  // 5. Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpendMinor: 20000,
      maxDiscountMinor: 10000,
      usageLimit: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'ROAST50' },
    update: {},
    create: {
      code: 'ROAST50',
      discountType: 'FIXED',
      discountValue: 5000, // ₹50.00 off
      minSpendMinor: 30000,
      isActive: true,
    },
  });

  // 6. Reservation Capacity (Slots 08:00 to 20:00 every day)
  const slots = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];
  for (let day = 0; day <= 6; day++) {
    for (const slot of slots) {
      await prisma.reservationCapacity.upsert({
        where: {
          dayOfWeek_timeSlot: {
            dayOfWeek: day,
            timeSlot: slot,
          },
        },
        update: {},
        create: {
          dayOfWeek: day,
          timeSlot: slot,
          maxCovers: 24,
          maxParties: 8,
          isActive: true,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

