import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Drawer, Form, Input, Space, Dropdown, Menu, Popconfirm, message, Tag, ConfigProvider,
  AutoComplete
} from 'antd';
import { PlusOutlined, MoreOutlined, PhoneOutlined, WhatsAppOutlined } from '@ant-design/icons';
import {
  fetchClients, fetchClient, addClient, updateClient, deleteClient
} from '../../api';
import '../../root.css';

// Custom styles for table header, row hover, and action buttons
import './LeadTableCustom.css';

const PAGE_SIZE = 10;

const ClientForm = ({ initialValues = {}, onFinish, loading, readOnly = false, formId }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      disabled={loading || readOnly}
      id={formId}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}> 
          <Input /> 
          </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}> 
          <Input /> 
          </Form.Item>
      <Form.Item name="phone" label="Phone No" rules={[{ required: true, message: 'Please enter phone number' }]}> 
          <Input />
       </Form.Item>
      <Form.Item name="whatsapp" label="WhatsApp No">
           <Input /> 
           </Form.Item>
      <Form.Item name="reference" label="Reference"> 
          <Input /> 
      </Form.Item>
      <Form.Item name="remark" label="Remark"> 
          <Input.TextArea rows={2} /> 
      </Form.Item>
      {/* {!readOnly && (
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Submit</Button>
        </Form.Item>
      )} */}
    </Form>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: '', client: null });
  const [page, setPage] = useState(1);
  const [formLoading, setFormLoading] = useState(false);

  const loadClients = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const { data } = await fetchClients(pageNum, PAGE_SIZE);
      setClients(data.clients);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadClients(page); }, [loadClients, page]);

  const handleAdd = () => setDrawer({ open: true, mode: 'add', client: null });
  const handleEdit = async (id) => {
    setDrawer({ open: true, mode: 'edit', client: null });
    setFormLoading(true);
    try {
      const { data } = await fetchClient(id);
      setDrawer({ open: true, mode: 'edit', client: data });
    } finally { setFormLoading(false); }
  };
  const handleView = async (id) => {
    setDrawer({ open: true, mode: 'view', client: null });
    setFormLoading(true);
    try {
      const { data } = await fetchClient(id);
      setDrawer({ open: true, mode: 'view', client: data });
    } finally { setFormLoading(false); }
  };
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteClient(id);
      message.success('Client deleted');
      loadClients(1);
      setPage(1);
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };
  const handleDrawerClose = () => setDrawer({ open: false, mode: '', client: null });

  const handleFormFinish = async (values) => {
    setFormLoading(true);
    try {
      if (drawer.mode === 'add') {
        await addClient({ ...values });
        message.success('Client added');
        loadClients(1);
        setPage(1);
      } else if (drawer.mode === 'edit') {
        await updateClient(drawer.client.id, { ...drawer.client, ...values });
        message.success('Client updated');
        loadClients(page);
      }
      handleDrawerClose();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || 'Failed to submit');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr No',
      dataIndex: 'srNo',
      key: 'srNo',
      render: (_, __, index) => (page - 1) * PAGE_SIZE + index + 1,
      width: 55,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', responsive: ['xs', 'sm', 'md', 'lg', 'xl'], width: AutoComplete },
    { title: 'Email', dataIndex: 'email', key: 'email', responsive: ['md', 'lg', 'xl'], width: AutoComplete },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div><PhoneOutlined style={{ color: '#1890ff', marginRight: 4 }} />{record.phone || '-'}</div>
          <div><WhatsAppOutlined style={{ color: '#25D366', marginRight: 4 }} />{record.whatsapp || '-'}</div>
        </div>
      ),
      responsive: ['sm', 'md', 'lg', 'xl'],
      width: AutoComplete,
    },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', responsive: ['lg', 'xl'], width: AutoComplete },
    { title: 'Remark', dataIndex: 'remark', key: 'remark', responsive: ['lg', 'xl'], width: AutoComplete },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view">
                <Button aria-label="View" className="ant-btn-view" size="small" onClick={() => handleView(record.id)} style={{ marginRight: 8 }}>View</Button>
              </Menu.Item>
              <Menu.Item key="edit">
                <Button aria-label="Edit" className="ant-btn-edit" size="small" onClick={() => handleEdit(record.id)} style={{ marginRight: 8 }}>Edit</Button>
              </Menu.Item>
              <Menu.Item key="delete">
                <Popconfirm
                  title="Are you sure to delete this client?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button aria-label="Delete" className="ant-btn-delete" size="small">Delete</Button>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} style={{ borderRadius: 6, background: 'var(--primary-100)', color: 'var(--primary-500)' }} />
        </Dropdown>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'var(--accent-500)',
          colorBgContainer: 'var(--background-color)',
          colorText: 'var(--primary-500)',
          colorBorder: 'var(--border-color)',
        },
      }}
    >
      <div className="hem-lead-table" style={{ width: '100%', background: 'var(--background-alt)', minHeight: '100vh' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Clients</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Add Client</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} clients`,
            showQuickJumper: true,
          }}
          scroll={{ x: 'max-content', y: 400 }}
          bordered
          size="middle"
          style={{ background: 'var(--background-color)', borderRadius: 10 }}
          title={() => null}
          className="hem-lead-table"
        />
        <Drawer
          title={drawer.mode === 'add' ? 'Add Client' : drawer.mode === 'edit' ? 'Edit Client' : 'View Client'}
          open={drawer.open}
          onClose={handleDrawerClose}
          width={400}
          destroyOnClose
          maskClosable={!formLoading}
          footer={drawer.mode === 'add' || drawer.mode === 'edit' ? (
            <Button type="primary" htmlType="submit" form="client-form" block loading={formLoading}>
              Submit
            </Button>
          ) : null}
          placement="right"
          style={{ zIndex: 2000, background: 'var(--background-color)', height: '100vh' }}
          bodyStyle={{ paddingBottom: 24 }}
        >
          {(drawer.mode === 'add' || drawer.mode === 'edit') && (
            <ClientForm
              initialValues={drawer.client || {}}
              onFinish={handleFormFinish}
              loading={formLoading}
              readOnly={false}
              formId="client-form"
            />
          )}
          {drawer.mode === 'view' && (
            <ClientForm
              initialValues={drawer.client || {}}
              loading={formLoading}
              readOnly={true}
              formId="client-form"
            />
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

export default ClientsPage;