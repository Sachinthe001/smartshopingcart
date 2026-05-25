const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB');

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password,
        role: 'admin'
    });
    console.log('Admin created');

    const cat1 = await Category.create({ name: 'Vegetables', description: 'Fresh veggies' });
    const cat2 = await Category.create({ name: 'Fruits', description: 'Fresh fruits' });
    const cat3 = await Category.create({ name: 'Cakes', description: 'Delicious cakes' });

    await Product.create([
        {
            name: 'Carrot',
            description: 'Organic carrots',
            price: 2.5,
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60',
            category: cat1._id
        },
        {
            name: 'Banana',
            description: 'Yellow bananas',
            price: 1.2,
            image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
            category: cat2._id
        },
        {
            name: 'Chocolate Cake',
            description: 'Rich chocolate cake',
            price: 15.0,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60',
            category: cat3._id
        }
    ]);
    console.log('Data seeded');

    process.exit();
}).catch(console.error);
