const db = require('../config/db');

exports.getLeads = async (offset, limit) => {
  const [rows] = await db.query('SELECT * FROM leads ORDER BY id DESC LIMIT ?, ?', [offset, limit]);
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM leads');
  return { leads: rows, total: count };
};

exports.getLeadById = async (id) => {
  const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
  return rows[0];
};

exports.addLead = async (lead) => {
  const { name, email, phone, whatsapp, reference, remark, status } = lead;
  const [result] = await db.query(
    'INSERT INTO leads (name, email, phone, whatsapp, reference, remark, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, whatsapp, reference, remark, status || 'New']
  );
  return { id: result.insertId, ...lead };
};

exports.updateLead = async (id, lead) => {
  const { name, email, phone, whatsapp, reference, remark, status } = lead;
  await db.query(
    'UPDATE leads SET name=?, email=?, phone=?, whatsapp=?, reference=?, remark=?, status=? WHERE id=?',
    [name, email, phone, whatsapp, reference, remark, status, id]
  );
};

exports.deleteLead = async (id) => {
  await db.query('DELETE FROM leads WHERE id=?', [id]);
};
