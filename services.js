const{User,Conversation,Booking}=require('../bot9/db');
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
      
      const checkInDate = new Date(checkInDateString);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + nights);
  
      await Booking.create({
        bookingId: response.data.bookingId,
        userId: email,
        roomId: roomId,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        totalAmount: response.data.totalPrice
      });
  
      response.data.checkInDate = checkInDate.toISOString().split('T')[0];
      response.data.checkOutDate = checkOutDate.toISOString().split('T')[0];
  
      return response.data;
    } catch (error) {
      console.error('Error booking room:', error);
      return null;
    }
  }

  module.exports={
    getRooms,bookRoom
  }