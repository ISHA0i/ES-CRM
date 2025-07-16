const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Client = require('./client');
const Package = require('./package');

const Quotation = db.define('quotation', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  client_id: { type: DataTypes.INTEGER, allowNull: false },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  custom_name: { type: DataTypes.STRING(100) },
  custom_type: { type: DataTypes.ENUM('fixed', 'custom'), defaultValue: 'fixed' },
  total_price: { type: DataTypes.DECIMAL(12,2) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'quotation',
  timestamps: false,
});

Quotation.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });
Quotation.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

module.exports = Quotation; 