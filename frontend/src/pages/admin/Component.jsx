import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Image,
  Drawer,
  Popconfirm,
  message,
  Form,
  Input,
  InputNumber,
  Space,
  Descriptions,
  Dropdown,
  Upload,
  Spin,
} from 'antd';
import { PlusOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import {
  fetchComponents,
  addComponent,
  updateComponent,
  deleteComponent,
} from '../../api';
import '../../root.css';
import './LeadTableCustom.css';

// Utility to ensure numeric fields are numbers
function sanitizeProductFields(product) {
  return {
    ...product,
    unit_price:
      product?.unit_price !== undefined &&
      product?.unit_price !== null &&
      !isNaN(Number(product.unit_price))
        ? Number(product.unit_price)
        : undefined,
    total_quantity:
      product?.total_quantity !== undefined &&
      product?.total_quantity !== null &&
      !isNaN(Number(product.total_quantity))
        ? Number(product.total_quantity)
        : undefined,
  };
}

const ProductForm = ({ initialValues = {}, onFinish, loading, form }) => {
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    form.setFieldsValue(initialValues);
    if (initialValues.img) {
      setFileList([
        {
          uid: '-1',
          name: initialValues.img.split('/').pop(),
          status: 'done',
          url: initialValues.img,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [initialValues, form]);

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      disabled={loading}
      id="product-form"
    >
      <Form.Item
        name="product_name"
        label="Product Name"
        rules={[{ required: true, message: 'Product Name is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="model" label="Model">
        <Input />
      </Form.Item>
      <Form.Item
        label="Image"
        name="img"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        extra="Upload product image"
      >
        <Upload
          listType="picture"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          maxCount={1}
          customRequest={({ onSuccess }) =>
            setTimeout(() => onSuccess && onSuccess('ok'), 0)
          }
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="unit_price"
        label="Unit Price"
        rules={[{ required: true, message: 'Unit Price is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item
        name="availability"
        label="Availability"
        rules={[{ required: true, message: 'Availability is required' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="total_quantity"
        label="Total Quantity"
        rules={[{ required: true, message: 'Total Quantity is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={loading}
        style={{ marginTop: 16, display: 'none' }}
      >
        Submit
      </Button>
    </Form>
  );
};

const ComponentPage = () => {
  const { id } = useParams(); // inventory id
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState({
    open: false,
    mode: '',
    product: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [form] = Form.useForm();
  // useForm(); // This line is removed as per the edit hint.

  // Fetch products for this inventory
  useEffect(() => {
    loadData();
  }, [id]);
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchComponents();
      setProducts(
        res.data.filter((c) => String(c.inventory_id) === String(id))
      );
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Drawer handlers
  const handleAdd = () => setDrawer({ open: true, mode: 'add', product: null });
  const handleEdit = (item) =>
    setDrawer({ open: true, mode: 'edit', product: item });
  const handleDrawerClose = () => {
    setDrawer({ open: false, mode: '', product: null });
    form.resetFields();
  };

  // Add/Edit submit handler
  const handleFormFinish = async (values) => {
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('product_name', values.product_name);
      formData.append('model', values.model || '');
      formData.append('unit_price', values.unit_price);
      formData.append('availability', values.availability);
      formData.append('total_quantity', values.total_quantity);
      formData.append('description', values.description || '');
      formData.append('inventory_id', Number(id));
      if (values.img && values.img.length && values.img[0].originFileObj) {
        formData.append('img', values.img[0].originFileObj);
      }
      if (drawer.mode === 'add') {
        await addComponent(formData);
        message.success('Product added');
      } else if (drawer.mode === 'edit') {
        await updateComponent(drawer.product.id, formData);
        message.success('Product updated');
      }
      handleDrawerClose();
      loadData();
    } catch (error) {
      message.error(
        error?.response?.data?.error || error.message || 'Failed to submit'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Delete handler
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

  // Dropdown menu items for each row
  const getMenuItems = (record) => [
    {
      key: 'view',
      label: (
        <Button
          type="link"
          onClick={() => setViewProduct(record)}
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
        >
          View
        </Button>
      ),
    },
    {
      key: 'edit',
      label: (
        <Button
          type="link"
          onClick={() => handleEdit(record)}
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
        >
          Edit
        </Button>
      ),
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Table columns
  const columns = [
    {
      title: 'Sr',
      key: 'sr',
      render: (_, __, idx) => idx + 1,
    },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    {
      title: 'Image',
      dataIndex: 'img',
      key: 'img',
      render: (img) => (img ? <Image src={img} width={40} /> : 'N/A'),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 110,
      align: 'center',
    },
    { title: 'Availability', dataIndex: 'availability', key: 'availability' },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'center',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button
            icon={<MoreOutlined />}
            style={{
              borderRadius: 6,
              background: 'var(--primary-100)',
              color: 'var(--primary-500)',
            }}
          />
        </Dropdown>
      ),
      width: 120,
      align: 'center',
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: 'var(--background-alt)',
        minHeight: '100vh',
      }}
    >
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'space-between',
          display: 'flex',
        }}
      >
        <h2
          style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}
        >
          Products for Component
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{
            background: 'var(--accent-500)',
            borderColor: 'var(--accent-500)',
            borderRadius: 6,
          }}
        >
          Add Product
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        bordered
        className="hem-lead-table"
        style={{
          background: 'var(--background-color)',
          borderRadius: 10,
          marginTop: 16,
        }}
      />
      <Drawer
        title={drawer.mode === 'add' ? 'Add Product' : 'Edit Product'}
        open={drawer.open && (drawer.mode === 'add' || drawer.mode === 'edit')}
        onClose={handleDrawerClose}
        width={400}
        destroyOnClose
        maskClosable={!formLoading}
        placement="right"
        styles={{ body: { paddingBottom: 24 } }}
        style={{
          zIndex: 2000,
          background: 'var(--background-color)',
          height: '100vh',
        }}
        footer={
          (drawer.mode === 'add' || drawer.mode === 'edit') ? (
            <Button type="primary" htmlType="submit" form="product-form" block loading={formLoading}>
              Submit
            </Button>
          ) : null
        }
      >
        {(drawer.mode === 'add' || drawer.mode === 'edit') && (
          <ProductForm
            initialValues={sanitizeProductFields(drawer.product || {})}
            onFinish={handleFormFinish}
            loading={formLoading}
            form={form}
          />
        )}
      </Drawer>
      <Drawer
        title={viewProduct ? viewProduct.product_name : ''}
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        width={500}
        destroyOnClose
        placement="right"
        styles={{ body: { paddingBottom: 24 } }}
        style={{
          zIndex: 2100,
          background: 'var(--background-color)',
          height: '100vh',
        }}
      >
        {viewProduct && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Model">
              {viewProduct.model}
            </Descriptions.Item>
            <Descriptions.Item label="Image">
              {viewProduct.img ? (
                <Image src={viewProduct.img} width={80} />
              ) : (
                'N/A'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Unit Price">
              {viewProduct.unit_price}
            </Descriptions.Item>
            <Descriptions.Item label="Availability">
              {viewProduct.availability}
            </Descriptions.Item>
            <Descriptions.Item label="Total Quantity">
              {viewProduct.total_quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {viewProduct.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ComponentPage;
