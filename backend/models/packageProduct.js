const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PackageProduct = sequelize.define('package_product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  component_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
  timestamps: false,
  tableName: 'package_product',
});

module.exports = PackageProduct; 