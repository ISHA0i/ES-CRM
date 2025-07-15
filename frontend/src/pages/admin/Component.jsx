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
import { PlusOutlined, MoreOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchComponents,
  addComponent,
  updateComponent,
  deleteComponent,
  API_BASE,
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
    let imgUrl = initialValues.img;
    if (typeof imgUrl === 'string' && imgUrl) {
      // If not absolute, prefix with API_BASE
      if (!/^https?:\/\//.test(imgUrl)) {
        imgUrl = API_BASE + imgUrl;
      }
      setFileList([{
        uid: '-1',
        name: imgUrl.split('/').pop(),
        status: 'done',
        url: imgUrl,
      }]);
    } else if (Array.isArray(initialValues.img)) {
      setFileList(initialValues.img.map((img, idx) => {
        let url = img;
        if (typeof img === 'string') {
          if (!/^https?:\/\//.test(img)) {
            url = API_BASE + img;
          }
          return { uid: String(idx), name: url.split('/').pop(), status: 'done', url };
        }
        // If already an object, ensure url is absolute
        if (img && img.url && !/^https?:\/\//.test(img.url)) {
          return { ...img, url: API_BASE + img.url };
        }
        return img;
      }));
    } else {
      setFileList([]);
    }
  }, [initialValues, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    if (e && Array.isArray(e.fileList)) return e.fileList;
    return [];
  };

  // Defensive fallback before rendering:
  let safeFileList = fileList;
  if (!Array.isArray(safeFileList)) {
    console.error('Upload fileList is not an array:', safeFileList, typeof safeFileList);
    safeFileList = [].concat(safeFileList || []).filter(Boolean);
    if (!Array.isArray(safeFileList)) safeFileList = [];
  }

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
        getValueProps={value => ({
          fileList: Array.isArray(value)
            ? value.map((file, idx) => {
                if (typeof file === 'string') {
                  let url = file;
                  if (!/^https?:\/\//.test(url)) url = API_BASE + url;
                  return { uid: String(idx), name: url.split('/').pop(), status: 'done', url };
                }
                if (file && file.url && !/^https?:\/\//.test(file.url)) {
                  return { ...file, url: API_BASE + file.url };
                }
                return file;
              })
            : value
            ? [{
                uid: '-1',
                name: value.split('/').pop(),
                status: 'done',
                url: !/^https?:\/\//.test(value) ? API_BASE + value : value
              }]
            : []
        })}
        extra="Upload product image"
      >
        <Upload
          listType="picture"
          beforeUpload={() => false}
          fileList={Array.isArray(fileList) ? fileList : []}
          onChange={({ fileList }) => setFileList(Array.isArray(fileList) ? fileList : [])}
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
        label="Availability"
        shouldUpdate={(prev, curr) => prev.total_quantity !== curr.total_quantity}
      >
        {({ getFieldValue, setFieldsValue }) => {
          const total = getFieldValue('total_quantity');
          const availability = total === 0 ? 'Out of Stock' : 'Available';
          setTimeout(() => setFieldsValue({ availability }), 0);
          return (
            <Input value={availability} readOnly />
          );
        }}
      </Form.Item>
      <Form.Item name="availability" style={{ display: 'none' }}>
        <Input />
      </Form.Item>
      <Form.Item
        name="total_quantity"
        label="Total Quantity"
        rules={[{ required: true, message: 'Total Quantity is required' }]}
      >
        <InputNumber style={{ width: '100%' }} min={0} />
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
  const navigate = useNavigate();
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
          aria-label="View"
          className="ant-btn-view"
          size="small"
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
          aria-label="Edit"
          className="ant-btn-edit"
          size="small"
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
            aria-label="Delete"
            className="ant-btn-delete"
            size="small"
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Inline update handler for table cells
  const handleInlineUpdate = async (record, field, value) => {
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('unit_price', field === 'unit_price' ? value : record.unit_price);
      formData.append('total_quantity', field === 'total_quantity' ? value : record.total_quantity);
      formData.append('availability', (field === 'total_quantity' ? value : record.total_quantity) === 0 ? 'Out of Stock' : 'Available');
      await updateComponent(record.id, formData);
      message.success('Updated');
      loadData();
    } catch {
      message.error('Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

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
      render: (img) => (img ? <Image src={`${API_BASE}${img}`} width={40} /> : 'N/A'),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 110,
      align: 'center',
      render: (text, record) => (
        <InputNumber
          min={0}
          value={record.unit_price}
          onChange={(val) => handleInlineUpdate(record, 'unit_price', val)}
          style={{ width: '100%' }}
          disabled={formLoading}
        />
      ),
    },
    {
      title: 'Availability', dataIndex: 'availability', key: 'availability' },
    {
      title: 'Total Quantity',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'center',
      render: (text, record) => (
        <InputNumber
          min={0}
          value={record.total_quantity}
          onChange={(val) => handleInlineUpdate(record, 'total_quantity', val)}
          style={{ width: '100%' }}
          disabled={formLoading}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
          <Button
            icon={<MoreOutlined />}
            className="hem-dropdown-button"
            disabled={formLoading}
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/inventory')}
            style={{ marginRight: 2, fontSize: 15 }}
          />
          <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>
            Products for Component
          </h2>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="hem-add-button"
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
        pagination={false}
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
                <Image src={`${API_BASE}${viewProduct.img}`} width={80} />
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
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ComponentPage;
