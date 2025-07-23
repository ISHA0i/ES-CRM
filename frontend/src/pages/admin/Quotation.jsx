import React, { useEffect, useState } from 'react';
import { Button, Table, Drawer, Form, Select, Input, InputNumber, message, Space, Dropdown, Popconfirm, Card, Divider, Tooltip } from 'antd';
import { fetchQuotations, addQuotation, updateQuotation, deleteQuotation, fetchQuotationById, fetchQuotationClients, fetchQuotationPackages, fetchQuotationPackageProducts, fetchQuotationPDF } from '../../api';
import { DownloadOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../root.css';
import './TableCustom.css';

const Quotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: '', quotation: null });
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [form] = Form.useForm();
  const [packageProducts, setPackageProducts] = useState([]); // for summary
  const [editingProducts, setEditingProducts] = useState([]); // for quantity
  const [formLoading, setFormLoading] = useState(false);
  const [subject, setSubject] = useState('SYSTEM QUOTATION');

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetchQuotations();
      setQuotations(res.data);
    } catch {
      message.error('Failed to load quotations');
    }
    setLoading(false);
  };

  const openDrawerAdd = async () => {
    setDrawer({ open: true, mode: 'add', quotation: null });
    setEditingProducts([]);
    setPackageProducts([]);
    setSubject('SYSTEM QUOTATION');
    form.resetFields();
    try {
      const [clientsRes, packagesRes] = await Promise.all([
        fetchQuotationClients(),
        fetchQuotationPackages(),
      ]);
      setClients(clientsRes.data);
      setPackages(packagesRes.data);
    } catch {
      message.error('Failed to load dropdown data');
    }
  };

  const openDrawerEdit = async (id) => {
    setDrawer({ open: true, mode: 'edit', quotation: null });
    setFormLoading(true);
    try {
      const [clientsRes, packagesRes, quotationRes] = await Promise.all([
        fetchQuotationClients(),
        fetchQuotationPackages(),
        fetchQuotationById(id),
      ]);
      setClients(clientsRes.data);
      setPackages(packagesRes.data);
      const q = quotationRes.data;
      form.setFieldsValue({
        client_id: q.client_id,
        package_id: q.package_id,
        custom_name: q.custom_name,
      });
      setSubject(q.subject || 'SYSTEM QUOTATION');
      setEditingProducts(q.products || []);
      setPackageProducts(q.products || []);
      setDrawer({ open: true, mode: 'edit', quotation: q });
    } catch {
      message.error('Failed to load quotation');
    }
    setFormLoading(false);
  };

  const openDrawerView = async (id) => {
    setDrawer({ open: true, mode: 'view', quotation: null });
    setFormLoading(true);
    try {
      const [clientsRes, packagesRes, quotationRes] = await Promise.all([
        fetchQuotationClients(),
        fetchQuotationPackages(),
        fetchQuotationById(id),
      ]);
      setClients(clientsRes.data);
      setPackages(packagesRes.data);
      const q = quotationRes.data;
      form.setFieldsValue({
        client_id: q.client_id,
        package_id: q.package_id,
        custom_name: q.custom_name,
      });
      setEditingProducts(q.products || []);
      setPackageProducts(q.products || []);
      setDrawer({ open: true, mode: 'view', quotation: q });
    } catch {
      message.error('Failed to load quotation');
    }
    setFormLoading(false);
  };

  const handleDrawerClose = () => {
    setDrawer({ open: false, mode: '', quotation: null });
    setEditingProducts([]);
    setPackageProducts([]);
    form.resetFields();
  };

  const handlePackageChange = async (packageId) => {
    try {
      const res = await fetchQuotationPackageProducts(packageId);
      // Show as summary, and allow quantity edit in add/edit
      setPackageProducts(res.data.map(p => ({ ...p, quantity: p.quantity || 1 })));
      setEditingProducts(res.data.map(p => ({ ...p, quantity: p.quantity || 1 })));
    } catch {
      message.error('Failed to load package products');
    }
  };

  const handleProductChange = (index, value) => {
    setEditingProducts(prev => {
      const updated = [...prev];
      updated[index].quantity = value;
      return updated;
    });
    setPackageProducts(prev => {
      const updated = [...prev];
      updated[index].quantity = value;
      return updated;
    });
  };

  const handleProductUnitPriceChange = (index, value) => {
    setEditingProducts(prev => {
      const updated = [...prev];
      updated[index].unit_price = value;
      return updated;
    });
    setPackageProducts(prev => {
      const updated = [...prev];
      updated[index].unit_price = value;
      return updated;
    });
  };

  const handleAddQuotation = async () => {
    try {
      const values = await form.validateFields();
      if (!editingProducts.length) {
        message.error('Please select a package.');
        return;
      }
      await addQuotation({
        client_id: values.client_id,
        package_id: values.package_id,
        custom_name: values.custom_name,
        custom_type: 'custom',
        subject,
        products: editingProducts,
      });
      message.success('Quotation added');
      handleDrawerClose();
      loadQuotations();
    } catch {
      message.error('Failed to add quotation');
    }
  };

  const handleEditQuotation = async () => {
    try {
      const values = await form.validateFields();
      if (!editingProducts.length) {
        message.error('Please edit products if needed.');
        return;
      }
      await updateQuotation(drawer.quotation.id, {
        custom_name: values.custom_name,
        custom_type: 'custom',
        subject,
        products: editingProducts,
      });
      message.success('Quotation updated');
      handleDrawerClose();
      loadQuotations();
    } catch {
      message.error('Failed to update quotation');
    }
  };

  const handleDeleteQuotation = async (id) => {
    setLoading(true);
    try {
      await deleteQuotation(id);
      message.success('Quotation deleted');
      loadQuotations();
    } catch {
      message.error('Failed to delete quotation');
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await fetchQuotationPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('PDF generation not implemented yet.');
    }
  };

  const getMenuItems = (record) => [
    {
      key: 'view',
      label: (
        <Button aria-label="View" className="ant-btn-view" size="small" onClick={() => openDrawerView(record.id)} style={{ marginRight: 8 }}>
          <EyeOutlined style={{ marginRight: 4 }} />View
        </Button>
      ),
    },
    {
      key: 'edit',
      label: (
        <Button aria-label="Edit" className="ant-btn-edit" size="small" onClick={() => openDrawerEdit(record.id)} style={{ marginRight: 8 }}>
          <EditOutlined style={{ marginRight: 4 }} />Edit
        </Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Are you sure to delete this quotation?"
          onConfirm={() => handleDeleteQuotation(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button aria-label="Delete" className="ant-btn-delete" size="small">
            <DeleteOutlined style={{ marginRight: 4 }} />Delete
          </Button>
        </Popconfirm>
      ),
    },
    // Removed download from dropdown
  ];

  const columns = [
    { 
      title: 'Sr No', 
      key: 'srNo',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <span style={{ 
          color: 'var(--primary-400)',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {index + 1}
        </span>
      )
    },
    { 
      title: 'Client', 
      dataIndex: 'client_name',
      render: (text, record) => (
        <div style={{ 
          fontWeight: 500,
          color: 'var(--primary-500)'
        }}>
          {text || record.client_id}
        </div>
      )
    },
    { 
      title: 'Package', 
      dataIndex: 'package_name',
      render: (text, record) => (
        <div style={{
          padding: '4px 12px',
          // background: 'var(--primary-100)',
          borderRadius: '6px',
          color: 'var(--primary-500)',
          fontWeight: 500,
          display: 'inline-block'
        }}>
          {text || record.package_id}
        </div>
      )
    },
    { 
      title: 'Total Price', 
      dataIndex: 'total_price',
      align: 'right',
      render: (price) => (
        <span style={{paddingRight: 18,
          color: 'var(--accent-500)',
          fontWeight: 700,
          fontSize: '1.0rem'
        }}>
          ₹{Number(price).toLocaleString('en-IN')}
        </span>
      )
    },
    { 
      title: 'Created At', 
      dataIndex: 'created_at',
      render: (date) => (
        <div style={{
          color: 'var(--primary-300)',
          fontSize: '0.9rem'
        }}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
            <Button 
              icon={<MoreOutlined />} 
              style={{ 
                borderRadius: '8px',
                // background: 'var(--primary-100)',
                color: 'var(--primary-500)',
                border: 'none',
                width: '36px',
                height: '36px'
              }} 
            />
          </Dropdown>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownloadPDF(record.id)} 
            style={{ 
              borderRadius: '8px',
              // background: 'var(--accent-100)',
              color: 'var(--accent-500)',
              border: 'none',
              width: '36px',
              height: '36px'
            }}
          />
        </Space>
      ),
    },
  ];

  // Product summary card UI (like Package.jsx), now always shows full product data
  const renderProductSummary = (readOnly = false) => (
    <>
      {packageProducts.length > 0 && <>
        <Divider />
        <h3 style={{ color: 'var(--primary-400)', marginBottom: 24, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>Products in this Quotation</h3>
        <Table
          dataSource={packageProducts}
          rowKey={row => row.product_id || row.id}
          pagination={false}
          size="small"
          columns={[
            { 
              title: 'Product Name', 
              dataIndex: 'product_name', 
              key: 'product_name',
              render: (text) => <span style={{ color: 'var(--primary-500)', fontWeight: 500 }}>{text}</span>
            },
            { title: 'Model', dataIndex: 'model', key: 'model' },
            { 
              title: 'Unit Price', 
              dataIndex: 'unit_price', 
              key: 'unit_price',
              render: (price) => (
                <span style={{ color: 'var(--accent-500)', fontWeight: 500 }}>
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
              )
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              render: (text, record, idx) => (
                readOnly ? (
                  <span style={{ fontWeight: 500 }}>{record.quantity}</span>
                ) : (
                  <InputNumber 
                    min={1} 
                    value={editingProducts[idx]?.quantity} 
                    onChange={val => handleProductChange(idx, val)} 
                    style={{ width: 80 }}
                  />
                )
              ),
            },
            { 
              title: 'Availability', 
              dataIndex: 'availability', 
              key: 'availability',
              render: (text) => (
                <Tag color={text > 0 ? 'success' : 'error'}>
                  {text > 0 ? 'In Stock' : 'Out of Stock'}
                </Tag>
              )
            },
          ]}
          className="hem-custom-table"
          style={{ marginTop: 16, marginBottom: 16 }}
        />
      </>}
    </>
  );

  return (
    <div className="hem-lead-table" style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
      <style>
        {`
          .custom-table .ant-table-thead > tr > th {
            background: var(--primary-100);
            color: var(--primary-500);
            font-weight: 600;
            border-bottom: 2px solid var(--primary-200);
            padding: 16px 12px;
          }
          .custom-table .ant-table-tbody > tr > td {
            padding: 16px 12px;
            border-bottom: 1px solid var(--primary-100);
          }
          .custom-table .ant-table-tbody > tr:hover > td {
            background: var(--primary-50) !important;
          }
          .custom-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }
          .custom-table .ant-table {
            border-radius: 12px;
            overflow: hidden;
          }
          .custom-table .ant-pagination-item {
            border-radius: 6px;
            border: 1px solid var(--primary-100);
          }
          .custom-table .ant-pagination-item-active {
            background: var(--accent-500);
            border-color: var(--accent-500);
          }
          .custom-table .ant-pagination-item-active a {
            color: white;
          }
          .custom-table .ant-table-cell {
            font-size: 0.95rem;
          }
        `}
      </style>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Quotations</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openDrawerAdd} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Add Quotation</Button>
      </Space>
      <Table columns={columns} dataSource={quotations} rowKey="id" loading={loading} />
      <Drawer
        title={drawer.mode === 'add' ? 'Add Quotation' : drawer.mode === 'edit' ? 'Edit Quotation' : 'View Quotation'}
        open={drawer.open}
        onClose={handleDrawerClose}
        width={900}
        destroyOnClose
        maskClosable={!formLoading}
        footer={drawer.mode === 'add' ? (
          <Button type="primary" onClick={handleAddQuotation} block loading={formLoading}>
            Add
          </Button>
        ) : drawer.mode === 'edit' ? (
          <Button type="primary" onClick={handleEditQuotation} block loading={formLoading}>
            Save
          </Button>
        ) : null}
        placement="right"
        style={{ zIndex: 2000, background: 'var(--background-color)', height: '100vh' }}
        styles={{ body: { paddingBottom: 24 } }}
      >
        <Form form={form} layout="vertical" disabled={drawer.mode === 'view'}>
          <Form.Item name="client_id" label="Client" rules={[{ required: true }]}> 
            <Select placeholder="Select client" disabled={drawer.mode === 'view'}>
              {clients.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="package_id" label="Package" rules={[{ required: true }]}> 
            <Select placeholder="Select package" onChange={handlePackageChange} disabled={drawer.mode === 'view'}>
              {packages.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="custom_name" label="Quotation Name">
            <Input placeholder="Optional custom name for this quotation" disabled={drawer.mode === 'view'} />
          </Form.Item>
          <Form.Item label="Subject">
            <Input value={subject} onChange={e => setSubject(e.target.value)} disabled={drawer.mode === 'view'} />
          </Form.Item>
        </Form>
        {/* Editable product table for add/edit */}
        {drawer.mode !== 'view' && editingProducts.length > 0 && (
          <Table
            dataSource={editingProducts}
            rowKey={row => row.product_id || row.id}
            pagination={false}
            size="small"
            columns={[
              { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
              { title: 'Model', dataIndex: 'model', key: 'model' },
              {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (text, record, idx) => (
                  <InputNumber min={1} value={editingProducts[idx]?.quantity} onChange={val => handleProductChange(idx, val)} style={{ width: 80 }} />
                ),
              },
              {
                title: 'Unit Price',
                dataIndex: 'unit_price',
                key: 'unit_price',
                render: (text, record, idx) => (
                  <InputNumber min={0} value={editingProducts[idx]?.unit_price} onChange={val => handleProductUnitPriceChange(idx, val)} style={{ width: 100 }} />
                ),
              },
            ]}
            style={{ marginTop: 8, marginBottom: 0 }}
          />
        )}
        {/* Product summary for view mode */}
        {drawer.mode === 'view' && renderProductSummary(true)}
      </Drawer>
    </div>
  );
};

export default Quotation;
