import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
dotenv.config()

cloudinary.v2.config({
    cloudinary_url: process.env.CLOUDINARY_URL
})