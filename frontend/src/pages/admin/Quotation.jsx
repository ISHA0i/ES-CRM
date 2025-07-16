import React, { useEffect, useState } from 'react';
import { Button, Table, Drawer, Form, Select, Input, InputNumber, message, Space, Dropdown, Popconfirm, Card, Divider, Tooltip } from 'antd';
import { fetchQuotations, addQuotation, updateQuotation, deleteQuotation, fetchQuotationById, fetchQuotationClients, fetchQuotationPackages, fetchQuotationPackageProducts, fetchQuotationPDF } from '../../api';
import { DownloadOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../root.css';
import './LeadTableCustom.css';

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
    { title: 'ID', dataIndex: 'id' },
    { title: 'Client', dataIndex: 'client_name', render: (text, record) => text || record.client_id },
    { title: 'Package', dataIndex: 'package_name', render: (text, record) => text || record.package_id },
    { title: 'Total Price', dataIndex: 'total_price' },
    { title: 'Created At', dataIndex: 'created_at' },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
            <Button icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
          </Dropdown>
          <Button icon={<DownloadOutlined />} onClick={() => handleDownloadPDF(record.id)} style={{ borderRadius: 6 }} />
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
            { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
            { title: 'Model', dataIndex: 'model', key: 'model' },
            { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price' },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              render: (text, record, idx) => (
                readOnly ? record.quantity : <InputNumber min={1} value={editingProducts[idx]?.quantity} onChange={val => handleProductChange(idx, val)} style={{ width: 80 }} />
              ),
            },
            { title: 'Availability', dataIndex: 'availability', key: 'availability' },
          ]}
          style={{ marginTop: 8, marginBottom: 0 }}
        />
      </>}
    </>
  );

  // Helper: get selected client/package object
  const selectedClient = clients.find(c => c.id === form.getFieldValue('client_id'));
  const selectedPackage = packages.find(p => p.id === form.getFieldValue('package_id'));

  // Client summary card
  const renderClientSummary = () => (
    selectedClient ? (
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, boxShadow: '0 2px 8px #e6eaf0', border: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-500)' }}>{selectedClient.name}</div>
        <div style={{ color: 'var(--primary-400)' }}>Email: {selectedClient.email}</div>
        <div style={{ color: 'var(--primary-400)' }}>Phone: {selectedClient.phone}</div>
        {selectedClient.whatsapp && <div style={{ color: 'var(--primary-400)' }}>WhatsApp: {selectedClient.whatsapp}</div>}
        {selectedClient.reference && <div style={{ color: 'var(--primary-400)' }}>Reference: {selectedClient.reference}</div>}
        {selectedClient.remark && <div style={{ color: 'var(--primary-400)' }}>Remark: {selectedClient.remark}</div>}
      </Card>
    ) : null
  );

  // Package summary card (show all data)
  const renderPackageSummary = () => (
    selectedPackage ? (
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, boxShadow: '0 2px 8px #e6eaf0', border: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-500)' }}>{selectedPackage.name}</div>
        <div style={{ color: 'var(--primary-400)' }}>Type: {selectedPackage.type}</div>
        {selectedPackage.description && <div style={{ color: 'var(--primary-400)' }}>Description: {selectedPackage.description}</div>}
        {selectedPackage.created_at && <div style={{ color: 'var(--primary-400)' }}>Created: {new Date(selectedPackage.created_at).toLocaleString()}</div>}
        {selectedPackage.updated_at && <div style={{ color: 'var(--primary-400)' }}>Updated: {new Date(selectedPackage.updated_at).toLocaleString()}</div>}
        {/* Show all other fields if present */}
        {Object.keys(selectedPackage).map(key => (
          !['id','name','type','description','created_at','updated_at','products'].includes(key) && selectedPackage[key] ? (
            <div key={key} style={{ color: 'var(--primary-400)' }}>{key}: {String(selectedPackage[key])}</div>
          ) : null
        ))}
        {/* Detailed product table */}
        {packageProducts.length > 0 && <>
          <Divider />
          <h4 style={{ color: 'var(--primary-400)', fontWeight: 700, marginBottom: 8 }}>Products in this Package</h4>
          <Table
            dataSource={packageProducts}
            rowKey={row => row.product_id || row.id}
            pagination={false}
            size="small"
            columns={[
              { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
              { title: 'Model', dataIndex: 'model', key: 'model' },
              { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price' },
              { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Availability', dataIndex: 'availability', key: 'availability' },
            ]}
            style={{ marginTop: 8, marginBottom: 0 }}
          />
        </>}
      </Card>
    ) : null
  );

  return (
    <div className="hem-lead-table" style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
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
        bodyStyle={{ paddingBottom: 24 }}
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
        </Form>
        {renderClientSummary()}
        {renderPackageSummary()}
        {renderProductSummary(drawer.mode === 'view')}
      </Drawer>
    </div>
  );
};

export default Quotation;
