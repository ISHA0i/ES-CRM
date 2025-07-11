import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Drawer, Form, Input, Space, Dropdown, Menu, Popconfirm, message, Tag, ConfigProvider
} from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import {
  fetchLeads, fetchLead, addLead, updateLead, deleteLead
} from '../../api';
import '../../root.css';

// Custom styles for table header, row hover, and action buttons
import './LeadTableCustom.css';

const PAGE_SIZE = 10;

const statusColors = {
  New: 'var(--accent-400)',
  Contacted: 'var(--primary-300)',
  Converted: 'var(--accent-500)',
  Lost: 'var(--primary-200)',
};

const LeadForm = ({ initialValues = {}, onFinish, loading, readOnly = false }) => {
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
      style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}
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
      {!readOnly && (
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Submit</Button>
        </Form.Item>
      )}
    </Form>
  );
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: '', lead: null });
  const [page, setPage] = useState(1);
  const [formLoading, setFormLoading] = useState(false);

  const loadLeads = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const { data } = await fetchLeads(pageNum, PAGE_SIZE);
      setLeads(data.leads);
      setTotal(data.total);
    } catch {
      message.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadLeads(page); }, [loadLeads, page]);

  const handleAdd = () => setDrawer({ open: true, mode: 'add', lead: null });
  const handleEdit = async (id) => {
    setDrawer({ open: true, mode: 'edit', lead: null });
    setFormLoading(true);
    try {
      const { data } = await fetchLead(id);
      setDrawer({ open: true, mode: 'edit', lead: data });
    } finally { setFormLoading(false); }
  };
  const handleView = async (id) => {
    setDrawer({ open: true, mode: 'view', lead: null });
    setFormLoading(true);
    try {
      const { data } = await fetchLead(id);
      setDrawer({ open: true, mode: 'view', lead: data });
    } finally { setFormLoading(false); }
  };
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteLead(id);
      message.success('Lead deleted');
      loadLeads(1);
      setPage(1);
    } catch {
      message.error('Failed to delete lead');
    } finally {
      setLoading(false);
    }
  };
  const handleDrawerClose = () => setDrawer({ open: false, mode: '', lead: null });

  const handleFormFinish = async (values) => {
    setFormLoading(true);
    try {
      if (drawer.mode === 'add') {
        await addLead({ ...values });
        message.success('Lead added');
        loadLeads(1);
        setPage(1);
      } else if (drawer.mode === 'edit') {
        await updateLead(drawer.lead.id, { ...drawer.lead, ...values });
        message.success('Lead updated');
        loadLeads(page);
      }
      handleDrawerClose();
    } catch {
      message.error('Failed to submit');
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
      width: 70,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { title: 'Email', dataIndex: 'email', key: 'email', responsive: ['md', 'lg', 'xl'] },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', responsive: ['sm', 'md', 'lg', 'xl'] },
    { title: 'WhatsApp', dataIndex: 'whatsapp', key: 'whatsapp', responsive: ['md', 'lg', 'xl'] },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', responsive: ['lg', 'xl'] },
    { title: 'Remark', dataIndex: 'remark', key: 'remark', responsive: ['lg', 'xl'] },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status] || 'default'}>{status}</Tag>,
      responsive: ['sm', 'md', 'lg', 'xl']
    },
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
                  title="Are you sure to delete this lead?"
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
      <div style={{ width: '100%', background: 'var(--background-alt)', minHeight: '100vh' }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Leads</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Add Lead</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={leads}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} leads`,
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
          title={drawer.mode === 'add' ? 'Add Lead' : drawer.mode === 'edit' ? 'Edit Lead' : 'View Lead'}
          open={drawer.open}
          onClose={handleDrawerClose}
          width={400}
          destroyOnClose
          maskClosable={!formLoading}
          footer={null}
          placement="right"
          style={{ zIndex: 2000, background: 'var(--background-color)' }}
        >
          {(drawer.mode === 'add' || drawer.mode === 'edit') && (
            <LeadForm
              initialValues={drawer.lead || {}}
              onFinish={handleFormFinish}
              loading={formLoading}
              readOnly={false}
            />
          )}
          {drawer.mode === 'view' && (
            <LeadForm
              initialValues={drawer.lead || {}}
              loading={formLoading}
              readOnly={true}
            />
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

export default LeadsPage;