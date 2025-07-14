const db = require('../config/db');

exports.getClients = async (offset, limit) => {
  const [rows] = await db.query('SELECT * FROM clients ORDER BY id DESC LIMIT ?, ?', [offset, limit]);
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM clients');
  return { clients: rows, total: count };
};

exports.getClientById = async (id) => {
  const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  return rows[0];
};

exports.addClient = async (client) => {
  const { lead_id, name, email, phone, whatsapp, reference, remark } = client;
  const [result] = await db.query(
    'INSERT INTO clients (lead_id, name, email, phone, whatsapp, reference, remark) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [lead_id, name, email, phone, whatsapp, reference, remark]
  );
  return { id: result.insertId, ...client };
};

exports.updateClient = async (id, client) => {
  const { name, email, phone, whatsapp, reference, remark } = client;
  await db.query(
    'UPDATE clients SET name=?, email=?, phone=?, whatsapp=?, reference=?, remark=? WHERE id=?',
    [name, email, phone, whatsapp, reference, remark, id]
  );
};

exports.deleteClient = async (id) => {
  await db.query('DELETE FROM clients WHERE id=?', [id]);
}; 