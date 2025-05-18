const mongoose = require('mongoose');

   const connectDB = async () => {
     try {
       await mongoose.connect(process.env.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
     } catch (error) {
       console.error('MongoDB connection error:', error.message);
       throw error;
     }
   };

   module.exports = connectDB;