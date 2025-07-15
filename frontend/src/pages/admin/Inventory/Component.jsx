import React, { useEffect, useState } from 'react';
import { Table, Button, Image, Drawer, Popconfirm, message, Form, Input, InputNumber, Space, Descriptions, Dropdown, Menu } from 'antd';
// import { PlusOutlined } from '@ant-design/icons';
// import { MoreOutlined } from '@ant-design/icons';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';

import { useParams } from 'react-router-dom';
import { fetchComponents, addComponent, updateComponent, deleteComponent } from '../../../api';
import '../../../root.css';
import '../LeadTableCustom.css';

function sanitizeProductFields(product) {
  return {
    ...product,
    unit_price: product?.unit_price !== undefined && product?.unit_price !== null && !isNaN(Number(product.unit_price))
      ? Number(product.unit_price)
      : undefined,
    total_quantity: product?.total_quantity !== undefined && product?.total_quantity !== null && !isNaN(Number(product.total_quantity))
      ? Number(product.total_quantity)
      : undefined,
  };
}

const ComponentForm = ({ initialValues = {}, onFinish, loading, readOnly = false, formId }) => {
  const [form] = Form.useForm();
  useEffect(() => { form.setFieldsValue(initialValues); }, [initialValues, form]);
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish} disabled={loading || readOnly} id={formId}>
      <Form.Item name="product_name" label="Product Name" rules={[{ required: true, message: 'Product Name is required' }]}> 
        <Input /> 
        </Form.Item>
      <Form.Item name="model" label="Model"> <Input /> </Form.Item>
      <Form.Item name="img" label="Image URL"> <Input /> </Form.Item>
      <Form.Item name="unit_price" label="Unit Price" rules={[{ required: true, message: 'Unit Price is required' }]}> 
      <InputNumber style={{ width: '100%' }} min={0} /> 
      </Form.Item>
      <Form.Item name="availability" label="Availability" rules={[{ required: true, message: 'Availability is required' }]}> 
        <Input /> 
        </Form.Item>
      <Form.Item name="total_quantity" label="Total Quantity" rules={[{ required: true, message: 'Total Quantity is required' }]}>
         <InputNumber style={{ width: '100%' }} min={0} /> 
         </Form.Item>
      <Form.Item name="description" label="Description"> <Input /> </Form.Item>
    </Form>
  );
};

const ComponentPage = () => {
  const { id } = useParams(); // inventory id
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState({ open: false, mode: '', product: null });
  const [formLoading, setFormLoading] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { loadData(); }, [id]);
  const loadData = async () => {
    setLoading(true);
    const res = await fetchComponents();
    setProducts(res.data.filter((c) => String(c.inventory_id) === String(id)));
    setLoading(false);
  };

  const handleAdd = () => setDrawer({ open: true, mode: 'add', product: null });
  const handleEdit = (item) => setDrawer({ open: true, mode: 'edit', product: item });
  const handleDrawerClose = () => { setDrawer({ open: false, mode: '', product: null }); form.resetFields(); };

  const handleFormFinish = async (values) => {
    setFormLoading(true);
    try {
      if (drawer.mode === 'add') {
        await addComponent({ ...values, inventory_id: id });
        message.success('Product added');
      } else if (drawer.mode === 'edit') {
        await updateComponent(drawer.product.id, values);
        message.success('Product updated');
      }
      handleDrawerClose();
      loadData();
    } catch {
      message.error('Failed to submit');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    setLoading(true);
    try {
      await deleteComponent(productId);
      message.success('Product deleted');
      loadData();
    } catch {
      message.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr',
      key: 'sr',
      render: (_, __, idx) => idx + 1,
    },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Image', dataIndex: 'img', key: 'img', render: (img) => img ? <Image src={img} width={40} /> : 'N/A' },
    { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', width: 110, align: 'center' },
    { title: 'Availability', dataIndex: 'availability', key: 'availability' },
    { title: 'Total Quantity', dataIndex: 'total_quantity', key: 'total_quantity', width: 120, align: 'center' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view">
                <Button type="link" onClick={() => setViewProduct(record)} style={{ display: 'block', width: '100%', textAlign: 'left' }}>View</Button>
              </Menu.Item>
              <Menu.Item key="edit">
                <Button type="link" onClick={() => handleEdit(record)} style={{ display: 'block', width: '100%', textAlign: 'left' }}>Edit</Button>
              </Menu.Item>
              <Menu.Item key="delete">
                <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                  <Button type="link" danger style={{ display: 'block', width: '100%', textAlign: 'left' }}>Delete</Button>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} style={{ borderRadius: 6, background: 'var(--primary-100)', color: 'var(--primary-500)' }} />
        </Dropdown>
      ),
      width: 120,
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Products for Component</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Add Product</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        bordered
        className="hem-lead-table"
        style={{ background: 'var(--background-color)', borderRadius: 10, marginTop: 16 }}
      />
      <Drawer
        title={drawer.mode === 'add' ? 'Add Product' : 'Edit Product'}
        open={drawer.open && (drawer.mode === 'add' || drawer.mode === 'edit')}
        onClose={handleDrawerClose}
        width={400}
        destroyOnClose
        maskClosable={!formLoading}
        footer={
          <Button type="primary" htmlType="submit" form="product-form" block loading={formLoading}>
            Submit
          </Button>
        }
        placement="right"
        style={{ zIndex: 2000, background: 'var(--background-color)', height: '100vh' }}
        bodyStyle={{ paddingBottom: 24 }}
      >
        {(drawer.mode === 'add' || drawer.mode === 'edit') && (
          <ComponentForm
            initialValues={sanitizeProductFields(drawer.product || {})}
            onFinish={form.submit}
            loading={formLoading}
            readOnly={false}
            formId="product-form"
            form={form}
          />
        )}
        <Form form={form} onFinish={handleFormFinish} id="product-form" style={{ display: 'none' }} />
      </Drawer>
      <Drawer
        title={viewProduct ? viewProduct.product_name : ''}
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        width={500}
        destroyOnClose
        placement="right"
        style={{ zIndex: 2100, background: 'var(--background-color)', height: '100vh' }}
        bodyStyle={{ paddingBottom: 24 }}
      >
        {viewProduct && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Model">{viewProduct.model}</Descriptions.Item>
            <Descriptions.Item label="Image">
              {viewProduct.img ? <Image src={viewProduct.img} width={80} /> : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Unit Price">{viewProduct.unit_price}</Descriptions.Item>
            <Descriptions.Item label="Availability">{viewProduct.availability}</Descriptions.Item>
            <Descriptions.Item label="Total Quantity">{viewProduct.total_quantity}</Descriptions.Item>
            <Descriptions.Item label="Description">{viewProduct.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ComponentPage;
