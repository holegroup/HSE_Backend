@echo off
echo ========================================
echo Creating .env file for local development
echo ========================================

echo PORT=5000 > .env
echo MONGO_URI=mongodb://localhost:27017/hse_buddy_local >> .env
echo JWT_SECRET=hse_buddy_local_jwt_secret_key_super_secure_12345 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # Cloudinary Configuration (Optional for local development) >> .env
echo CLOUD_NAME=your_cloudinary_cloud_name >> .env
echo CLOUDINARY_API_KEY=your_cloudinary_api_key >> .env
echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo Configuration:
echo - Server Port: 5000
echo - MongoDB: mongodb://localhost:27017/hse_buddy_local
echo - Environment: development
echo.
pause
