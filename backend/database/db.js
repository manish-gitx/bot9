const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
  });
  
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    lastInteraction: DataTypes.DATE
  });
  
  const Conversation = sequelize.define('Conversation', {
    userId: DataTypes.STRING,
    messages: DataTypes.TEXT
  });
  
  const Booking = sequelize.define('Booking', {
    bookingId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.STRING,
    roomId: DataTypes.INTEGER,
    checkInDate: DataTypes.DATE,
    checkOutDate: DataTypes.DATE,
    totalAmount: DataTypes.FLOAT
  });
  
  sequelize.sync();

  module.exports={User,Conversation,Booking}