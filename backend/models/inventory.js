const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  component_name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Inventory; 