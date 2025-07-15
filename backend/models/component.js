const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Inventory = require('./inventory');

const Component = sequelize.define('Component', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  inventory_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Inventory, key: 'id' } },
  product_name: { type: DataTypes.STRING(100), allowNull: false },
  model: { type: DataTypes.STRING(100) },
  img: { type: DataTypes.STRING(255) },
  unit_price: { type: DataTypes.DECIMAL(10,2) },
  availability: { type: DataTypes.STRING(50) },
  total_quantity: { type: DataTypes.INTEGER },
  description: { type: DataTypes.TEXT },
  sr_no: { type: DataTypes.STRING(100) },
}, {
  tableName: 'component',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Component.belongsTo(Inventory, { foreignKey: 'inventory_id' });

module.exports = Component; 