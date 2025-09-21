import "dotenv/config";
import { connectToDatabase, disconnectFromDatabase } from "./config/db";
import { User } from "./models/User";
import { Product } from "./models/Product";
import { StockItem } from "./models/StockItem";
import { Invoice } from "./models/Invoice";
import { CostEntry } from "./models/CostEntry";

async function run() {
  await connectToDatabase();

  await User.deleteMany({});
  await Product.deleteMany({});
  await StockItem.deleteMany({});
  await Invoice.deleteMany({});
  await CostEntry.deleteMany({});

  const [admin, customer] = await User.create([
    { name: "Admin", email: "admin@example.com", password: "password123", role: "admin" },
    { name: "John Doe", email: "john@example.com", password: "password123", role: "customer" },
  ]);

  // Seed stock/ingredients
  const [beans, milk, sugar] = await StockItem.create([
    { name: "Coffee Beans", sku: "ING-BEANS", unit: "g", quantity: 100000 },
    { name: "Milk", sku: "ING-MILK", unit: "ml", quantity: 50000 },
    { name: "Sugar", sku: "ING-SUGAR", unit: "g", quantity: 20000 },
  ]);

  await Product.create([
    {
      title: "Coffee Beans",
      description: "Premium Arabica beans",
      slug: "coffee-beans",
      images: ["/images/coffee-beans.jpg"],
      categories: ["coffee"],
      variants: [
        { sku: "COF-BEAN-250", title: "250g", price: 9.99, cost: 6.0, stock: 100, images: [], recipe: [] },
        { sku: "COF-BEAN-1000", title: "1kg", price: 29.99, cost: 18.0, stock: 50, images: [], recipe: [] },
      ],
    },
    {
      title: "Latte",
      description: "Fresh latte beverage",
      slug: "latte",
      images: ["/images/latte.jpg"],
      categories: ["beverages"],
      variants: [
        {
          sku: "LATTE-REG",
          title: "Regular",
          price: 4.5,
          cost: 1.2,
          stock: 200,
          images: [],
          recipe: [
            { ingredientId: beans._id, amount: 18 },
            { ingredientId: milk._id, amount: 220 },
            { ingredientId: sugar._id, amount: 5 },
          ],
        },
      ],
    },
  ]);

  // Seed invoices
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  for (let d = 1; d <= 20; d++) {
    const date = new Date(y, m, d);
    for (let k = 0; k < 2; k++) {
      const items = [
        { name: "Latte", price: 4.5 },
        { name: "Coffee Beans 250g", price: 9.99 },
      ];
      const subtotal = items.reduce((a, b) => a + b.price, 0);
      const paid = subtotal - (k === 0 ? 0 : 1);
      await Invoice.create({
        date,
        time: `${String(9 + k * 3).padStart(2, "0")}:00`,
        customerName: k === 0 ? "Admin" : "John Doe",
        phone: "+1000000000",
        gender: k === 0 ? "Male" : "Female",
        items,
        subtotal,
        paid: Math.max(0, paid),
      });
    }
  }

  // Seed costs (cogs/tech/variable)
  for (let d = 1; d <= 20; d++) {
    const date = new Date(y, m, d);
    await CostEntry.create({ section: "cogs", date, amount: 120 + d, note: "Beans & Milk" });
    await CostEntry.create({ section: "tech", date, amount: 40 + (d % 3) * 10, note: "Cloud" });
    await CostEntry.create({ section: "variable", date, amount: 60 + (d % 5) * 5, note: "Misc" });
  }

  console.log("Seed complete:", { admin: admin.email, customer: customer.email });
  await disconnectFromDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


