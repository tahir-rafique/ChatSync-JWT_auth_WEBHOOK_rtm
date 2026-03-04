require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Exists' : 'MISSING');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Exists' : 'MISSING');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Exists' : 'MISSING');
