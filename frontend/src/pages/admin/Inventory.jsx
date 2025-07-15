import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Modal, message, Space, Dropdown, Menu, Popconfirm, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchInventory, fetchComponents, addInventory, updateInventory, deleteInventory } from '../../api';
import { PlusOutlined } from '@ant-design/icons';
import { MoreOutlined } from '@ant-design/icons';
import '../../root.css';
import './LeadTableCustom.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, mode: '', item: null });
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    const [invRes, compRes] = await Promise.all([
      fetchInventory(),
      fetchComponents(),
    ]);
    setInventory(invRes.data);
    setComponents(compRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTotalTypes = (inventoryId) =>
    components.filter((c) => c.inventory_id === inventoryId).length;

  const handleEdit = (item) => {
    setDrawer({ open: true, mode: 'edit', item });
    form.setFieldsValue(item);
  };
  const handleDrawerClose = () => {
    setDrawer({ open: false, mode: '', item: null });
    form.resetFields();
  };

  const handleDelete = async (item) => {
    setLoading(true);
    try {
      await deleteInventory(item.id);
      message.success('Component deleted');
      loadData();
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || error.message || 'Failed to delete component');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr No',
      key: 'sr_no',
      render: (_, __, idx) => idx + 1,
      width: 60,
      align: 'center',
    },
    {
      title: 'Component Name',
      dataIndex: 'component_name',
      key: 'component_name',
    },
    {
      title: 'Total Types',
      key: 'total_types',
      render: (_, record) => getTotalTypes(record.id),
      width: 100,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} style={{ borderRadius: 6, background: 'var(--primary-100)', color: 'var(--primary-500)' }} />
        </Dropdown>
      ),
      width: 120,
      align: 'center',
    },
  ];

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (drawer.mode === 'edit' && drawer.item) {
        await updateInventory(drawer.item.id, values);
        message.success('Component updated');
        handleDrawerClose();
      } else if (!drawer.mode) {
        await addInventory(values);
        message.success('Component added');
        setModalVisible(false);
      }
      loadData();
      form.resetFields();
    } catch {
      // validation error
    }
  };

  const handleAdd = () => {
    setDrawer({ open: false, mode: '', item: null });
    setModalVisible(true);
    form.resetFields();
  };

  // 1. Refactor Dropdown+Menu to use items array
  const getMenuItems = (record) => [
    {
      key: 'view',
      label: (
        <Button aria-label="View" className="ant-btn-view" size="small" onClick={() => navigate(`/admin/inventory/${record.id}`)} style={{ marginRight: 8 }}>View</Button>
      ),
    },
    {
      key: 'edit',
      label: (
        <Button aria-label="Edit" className="ant-btn-edit" size="small" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Are you sure to delete this component?"
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button aria-label="Delete" className="ant-btn-delete" size="small">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Inventory Components</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Add Component</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={inventory}
        rowKey="id"
        loading={loading}
        bordered
        className="hem-lead-table"
        style={{ background: 'var(--background-color)', borderRadius: 10, marginTop: 16 }}
      />

      <Modal
        open={modalVisible}
        title={'Add Component'}
        onOk={handleModalOk}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        destroyOnHidden
      >
        <Form form={form} initialValues={{}}>
          <Form.Item name="component_name" label="Component Name" rules={[{ required: true, message: 'Component Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title={'Edit Component'}
        open={drawer.open && drawer.mode === 'edit'}
        onClose={handleDrawerClose}
        width={400}
        destroyOnHidden
        placement="right"
        styles={{ body: { paddingBottom: 24 } }}
        style={{ zIndex: 2000, background: 'var(--background-color)', height: '100vh' }}
        footer={
          <Button type="primary" htmlType="submit" form="edit-inventory-form" block>
            Save
          </Button>
        }
      >
        <Form form={form} initialValues={drawer.item || {}} onFinish={handleModalOk} id="edit-inventory-form">
          <Form.Item name="component_name" label="Component Name" rules={[{ required: true, message: 'Component Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Inventory;
