const{User,Conversation,Booking}=require('../database/db');
const axios = require('axios');

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
  
      return response.data;
    } catch (error) {
      console.error('Error booking room:', error);
      return null;
    }
  }

  module.exports={
    getRooms,bookRoom
  }