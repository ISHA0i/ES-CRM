const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Package = sequelize.define('package', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('fixed', 'custom'), defaultValue: 'fixed' },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'package',
});

module.exports = Package; 