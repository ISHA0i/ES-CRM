const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Component = require('./component');

const ProductUsage = sequelize.define('ProductUsage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  component_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Component, key: 'id' } },
  product_id: { type: DataTypes.STRING(100), allowNull: false },
  version: { type: DataTypes.STRING(100) },
}, {
  tableName: 'product_usage',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

ProductUsage.belongsTo(Component, { foreignKey: 'component_id' });

module.exports = ProductUsage; 