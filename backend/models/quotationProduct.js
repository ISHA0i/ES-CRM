const { DataTypes } = require('sequelize');
const db = require('../config/db');

const QuotationProduct = db.define('quotation_product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quotation_id: { type: DataTypes.INTEGER, allowNull: false },
  component_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(10,2) },
}, {
  tableName: 'quotation_product',
  timestamps: false,
});

module.exports = QuotationProduct; 