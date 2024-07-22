const{User,Conversation,Booking}=require('../database/db');
const nodemailer = require('nodemailer');
const axios = require('axios');
require("dotenv").config();



async function getRooms() {
    try {
      const response = await axios.get('https://bot9assignement.deno.dev/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  }
  
  async function bookRoom(roomId, fullName, email, nights, checkInDateString) {
    try {
      const response = await axios.post('https://bot9assignement.deno.dev/book', {
        roomId,
        fullName,
        email,
        nights
      });
      
      let checkInDate = new Date(checkInDateString);
      let checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + nights);
      checkInDate = checkInDate.toISOString().split('T')[0];
      checkOutDate = checkOutDate.toISOString().split('T')[0];

  
      await Booking.create({
        bookingId: response.data.bookingId,
        userId: email,
        roomId: roomId,
        checkInDate:checkInDate,
        checkOutDate: checkOutDate,
        totalAmount: response.data.totalPrice
      });
  
      response.data.checkInDate = checkInDate;
      response.data.checkOutDate = checkOutDate;
      
     await sendConfirmationEmail(email, fullName, response.data,roomId);
  
      return response.data;
    } catch (error) {
      console.error('Error booking room:', error);
      return null;
    }
  }


  async function sendConfirmationEmail(email, fullName, bookingData,roomId) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
       
        pass: process.env.EMAIL_PASS
      }
    });
    console.log(process.env.EMAIL_USER);
    console.log( process.env.EMAIL_PASS)

  
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${fullName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li>Booking ID: ${bookingData.bookingId}</li>
          <li>Room ID: ${roomId}</li>
          <li>Check-in Date: ${bookingData.checkInDate}</li>
          <li>Check-out Date: ${bookingData.checkOutDate}</li>
          <li>Total Price: INR ${bookingData.totalPrice}</li>
        </ul>
        <p>Thank you for choosing our hotel. We look forward to your stay!</p>
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }

  module.exports={
    getRooms,bookRoom
  }