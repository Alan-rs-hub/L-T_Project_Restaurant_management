require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const { calculateBilling } = require('../utils/calculations');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_management';

async function seedDatabase(shouldDisconnect = true) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB at:', MONGO_URI);
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB successfully!');
    }

    // Clear existing collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Branch.deleteMany({}),
      Table.deleteMany({}),
      MenuItem.deleteMany({}),
      Reservation.deleteMany({}),
      Order.deleteMany({}),
      Feedback.deleteMany({})
    ]);

    // 1. Create Users
    console.log('Creating demo users...');
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@dineflow.com',
        passwordHash: 'admin123',
        role: 'admin'
      },
      {
        name: 'Branch Manager',
        email: 'manager@dineflow.com',
        passwordHash: 'manager123',
        role: 'manager'
      },
      {
        name: 'Head Chef',
        email: 'kitchen@dineflow.com',
        passwordHash: 'kitchen123',
        role: 'kitchen'
      },
      {
        name: 'Rahul Sharma',
        email: 'customer@dineflow.com',
        passwordHash: 'customer123',
        role: 'customer'
      },
      {
        name: 'Priya Patel',
        email: 'priya@dineflow.com',
        passwordHash: 'customer123',
        role: 'customer'
      }
    ]);

    const adminUser = users[0];
    const managerUser = users[1];
    const kitchenUser = users[2];
    const rahulUser = users[3];
    const priyaUser = users[4];

    // 2. Create Branches
    console.log('Creating branches...');
    const branches = await Branch.create([
      {
        name: 'DineFlow Downtown',
        address: '100 Feet Rd, 4th Block, Koramangala, Bengaluru',
        seatingCapacity: 60,
        isActive: true
      },
      {
        name: 'DineFlow Uptown',
        address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
        seatingCapacity: 45,
        isActive: true
      }
    ]);

    const downtown = branches[0];
    const uptown = branches[1];

    // 3. Create Tables
    console.log('Creating tables...');
    const tables = await Table.create([
      // Downtown Tables
      { branchId: downtown._id, tableNumber: 1, capacity: 2, isActive: true },
      { branchId: downtown._id, tableNumber: 2, capacity: 2, isActive: true },
      { branchId: downtown._id, tableNumber: 3, capacity: 4, isActive: true },
      { branchId: downtown._id, tableNumber: 4, capacity: 4, isActive: true },
      { branchId: downtown._id, tableNumber: 5, capacity: 6, isActive: true },
      { branchId: downtown._id, tableNumber: 6, capacity: 8, isActive: true },
      // Uptown Tables
      { branchId: uptown._id, tableNumber: 1, capacity: 2, isActive: true },
      { branchId: uptown._id, tableNumber: 2, capacity: 4, isActive: true },
      { branchId: uptown._id, tableNumber: 3, capacity: 4, isActive: true },
      { branchId: uptown._id, tableNumber: 4, capacity: 6, isActive: true },
      { branchId: uptown._id, tableNumber: 5, capacity: 6, isActive: true }
    ]);

    // 4. Create Menu Items
    console.log('Creating menu items...');
    const menuTemplate = [
      { name: 'Paneer Tikka', category: 'appetizer', price: 249, description: 'Cottage cheese marinated in rich spices and roasted in clay oven.', isAvailable: true },
      { name: 'Chicken 65', category: 'appetizer', price: 279, description: 'Crispy spicy deep fried chicken bites with curry leaves.', isAvailable: true },
      { name: 'Crispy Corn', category: 'appetizer', price: 189, description: 'Golden fried sweet corn tossed with peppers and scallions.', isAvailable: true },
      { name: 'Garlic Bread with Cheese', category: 'appetizer', price: 169, description: 'Toasted baguette with herb garlic butter and melted mozzarella.', isAvailable: true },
      { name: 'Butter Chicken', category: 'main_course', price: 349, description: 'Tender chicken simmered in rich creamy tomato and cashew gravy.', isAvailable: true },
      { name: 'Paneer Butter Masala', category: 'main_course', price: 299, description: 'Fresh paneer cubes in creamy, spiced onion tomato gravy.', isAvailable: true },
      { name: 'Dal Makhani', category: 'main_course', price: 249, description: 'Slow cooked black lentils with fresh cream and butter.', isAvailable: true },
      { name: 'Hyderabadi Biryani Royale', category: 'main_course', price: 329, description: 'Fragrant basmati rice layered with spiced marinated meat and herbs.', isAvailable: true },
      { name: 'Cream of Tomato Soup', category: 'soup', price: 149, description: 'Classic velvety tomato soup served with crispy herb croutons.', isAvailable: true },
      { name: 'Classic Caesar Salad', category: 'salad', price: 199, description: 'Crisp romaine lettuce, parmesan, croutons with Caesar dressing.', isAvailable: true },
      { name: 'Chocolate Brownie Sizzler', category: 'dessert', price: 199, description: 'Warm fudge brownie topped with vanilla ice cream and hot chocolate sauce.', isAvailable: true },
      { name: 'Gulab Jamun with Rabdi', category: 'dessert', price: 159, description: 'Warm golden milk dumplings served on a bed of thickened rabdi.', isAvailable: true },
      { name: 'Cold Coffee with Ice Cream', category: 'beverage', price: 129, description: 'Creamy blended coffee topped with a scoop of vanilla ice cream.', isAvailable: true },
      { name: 'Virgin Mojito', category: 'beverage', price: 149, description: 'Refreshing blend of crushed mint, lime juice, simple syrup and soda.', isAvailable: true },
      { name: 'Butter Naan', category: 'side', price: 49, description: 'Traditional tandoor baked flatbread brushed with butter.', isAvailable: true },
      { name: 'Chef Special Mixed Grill Platter', category: 'special', price: 499, description: 'Signature assortment of kebabs, grilled veggies, and dips.', isAvailable: true }
    ];

    const menuItems = [];
    for (const branch of branches) {
      for (const item of menuTemplate) {
        menuItems.push({
          ...item,
          branchId: branch._id
        });
      }
    }
    const createdMenuItems = await MenuItem.create(menuItems);

    // Filter items for Downtown
    const downtownItems = createdMenuItems.filter(i => i.branchId.toString() === downtown._id.toString());
    const dtButterChicken = downtownItems.find(i => i.name === 'Butter Chicken');
    const dtPaneerTikka = downtownItems.find(i => i.name === 'Paneer Tikka');
    const dtButterNaan = downtownItems.find(i => i.name === 'Butter Naan');
    const dtBrownie = downtownItems.find(i => i.name === 'Chocolate Brownie Sizzler');
    const dtMojito = downtownItems.find(i => i.name === 'Virgin Mojito');

    // 5. Create Reservations
    console.log('Creating sample reservations...');
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    futureDate1.setHours(19, 30, 0, 0);

    const futureDate2 = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Day after tomorrow
    futureDate2.setHours(20, 0, 0, 0);

    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
    pastDate.setHours(19, 0, 0, 0);

    const reservations = await Reservation.create([
      {
        customerId: rahulUser._id,
        branchId: downtown._id,
        tableId: tables[2]._id, // Table 3 (4 seats)
        dateTime: futureDate1,
        duration: 90,
        partySize: 3,
        status: 'confirmed',
        specialRequests: 'Window table preference, celebrating birthday.'
      },
      {
        customerId: priyaUser._id,
        branchId: uptown._id,
        tableId: tables[7]._id, // Table 2 (4 seats)
        dateTime: futureDate2,
        duration: 120,
        partySize: 4,
        status: 'confirmed',
        specialRequests: 'Quiet corner table.'
      },
      {
        customerId: rahulUser._id,
        branchId: downtown._id,
        tableId: tables[0]._id, // Table 1 (2 seats)
        dateTime: pastDate,
        duration: 60,
        partySize: 2,
        status: 'completed',
        specialRequests: ''
      }
    ]);

    // 6. Create Orders
    console.log('Creating sample orders...');
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.05;
    const serviceRate = parseFloat(process.env.SERVICE_CHARGE_RATE) || 0.10;

    // Helper to calculate billed order data
    const createBilledOrder = (customerId, branchId, orderType, rawItems, status, tableId = null) => {
      const { processedItems, billing } = calculateBilling(rawItems, taxRate, serviceRate);
      return {
        customerId,
        branchId,
        items: processedItems,
        orderType,
        tableId,
        billing,
        totalAmount: billing.grandTotal,
        status
      };
    };

    // Order 1: Served order for Rahul
    const order1Data = createBilledOrder(
      rahulUser._id,
      downtown._id,
      'dine_in',
      [
        { menuItemId: dtButterChicken._id, name: dtButterChicken.name, price: dtButterChicken.price, quantity: 2 },
        { menuItemId: dtButterNaan._id, name: dtButterNaan.name, price: dtButterNaan.price, quantity: 4 },
        { menuItemId: dtMojito._id, name: dtMojito.name, price: dtMojito.price, quantity: 2 }
      ],
      'served',
      tables[2]._id
    );

    // Order 2: Delivered takeaway order for Priya
    const order2Data = createBilledOrder(
      priyaUser._id,
      downtown._id,
      'takeaway',
      [
        { menuItemId: dtPaneerTikka._id, name: dtPaneerTikka.name, price: dtPaneerTikka.price, quantity: 1 },
        { menuItemId: dtBrownie._id, name: dtBrownie.name, price: dtBrownie.price, quantity: 2 }
      ],
      'delivered'
    );

    // Order 3: Ready order in Kitchen
    const order3Data = createBilledOrder(
      rahulUser._id,
      downtown._id,
      'dine_in',
      [
        { menuItemId: dtPaneerTikka._id, name: dtPaneerTikka.name, price: dtPaneerTikka.price, quantity: 2 },
        { menuItemId: dtMojito._id, name: dtMojito.name, price: dtMojito.price, quantity: 2 }
      ],
      'ready',
      tables[3]._id
    );

    // Order 4: Preparing order in Kitchen
    const order4Data = createBilledOrder(
      priyaUser._id,
      downtown._id,
      'takeaway',
      [
        { menuItemId: dtButterChicken._id, name: dtButterChicken.name, price: dtButterChicken.price, quantity: 1 },
        { menuItemId: dtButterNaan._id, name: dtButterNaan.name, price: dtButterNaan.price, quantity: 3 }
      ],
      'preparing'
    );

    // Order 5: Placed new order in Kitchen
    const order5Data = createBilledOrder(
      rahulUser._id,
      downtown._id,
      'dine_in',
      [
        { menuItemId: dtBrownie._id, name: dtBrownie.name, price: dtBrownie.price, quantity: 1 }
      ],
      'placed',
      tables[1]._id
    );

    const orders = await Order.create([order1Data, order2Data, order3Data, order4Data, order5Data]);

    // 7. Create Feedback for completed orders
    console.log('Creating sample feedback...');
    await Feedback.create([
      {
        orderId: orders[0]._id,
        customerId: rahulUser._id,
        rating: 5,
        comment: 'Exceptional food! The Butter Chicken was perfectly cooked and rich in flavour. Great ambience and attentive staff.'
      },
      {
        orderId: orders[1]._id,
        customerId: priyaUser._id,
        rating: 4,
        comment: 'Paneer Tikka was fresh and smoky. Loved the brownie as well. Quick packaging for takeaway.'
      }
    ]);

    console.log('\n=============================================');
    console.log('    DineFlow Database Seeded Successfully!   ');
    console.log('=============================================');
    console.log('Demo Accounts:');
    console.log('  • Admin:    admin@dineflow.com    / admin123');
    console.log('  • Manager:  manager@dineflow.com  / manager123');
    console.log('  • Kitchen:  kitchen@dineflow.com  / kitchen123');
    console.log('  • Customer: customer@dineflow.com / customer123');
    console.log('  • Customer: priya@dineflow.com    / customer123');
    console.log('=============================================\n');

    if (shouldDisconnect) {
      await mongoose.disconnect();
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    if (shouldDisconnect) {
      await mongoose.disconnect();
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
