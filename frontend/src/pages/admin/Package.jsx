import React, { useEffect, useState } from 'react';
import { Button, Drawer, Space, Select, message, Descriptions, Divider, Card, Tabs, Modal, Input, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { fetchInventory, fetchComponents, API_BASE } from '../../api';
import '../../root.css';
import './LeadTableCustom.css';
import './PackageCustomTabs.css';

const { Option } = Select;
const { TabPane } = Tabs;

const PackageBuilder = () => {
  const [inventory, setInventory] = useState([]); // Components (e.g., CPU, RAM)
  const [products, setProducts] = useState([]); // All products
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Store selected products and their quantities: { [componentId]: { product, quantity } }
  const [selectedProducts, setSelectedProducts] = useState({}); // { [componentId]: { product, quantity } }
  const [fixedPackages, setFixedPackages] = useState([]); // Array of {name, products}
  const [activeTab, setActiveTab] = useState('fixed');
  const [customizing, setCustomizing] = useState(null); // package being customized
  const [newPackageName, setNewPackageName] = useState('');
  // Track custom packages separately
  const [customPackages, setCustomPackages] = useState([]); // Array of {name, products, id}

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invRes, prodRes] = await Promise.all([
          fetchInventory(),
          fetchComponents(),
        ]);
        setInventory(invRes.data);
        setProducts(prodRes.data);
      } catch {
        message.error('Failed to load data');
      }
    };
    loadData();
  }, []);

  // Group products by inventory_id
  const productsByComponent = inventory.reduce((acc, comp) => {
    acc[comp.id] = products.filter(p => p.inventory_id === comp.id);
    return acc;
  }, {});

  // Handle product selection for a component
  const handleSelectProduct = (componentId, productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProducts(prev => ({
      ...prev,
      [componentId]: product ? { product, quantity: 1 } : undefined,
    }));
  };

  // Handle quantity change for a component
  const handleQuantityChange = (componentId, value) => {
    setSelectedProducts(prev => ({
      ...prev,
      [componentId]: prev[componentId] ? { ...prev[componentId], quantity: value } : { quantity: value },
    }));
  };

  // Prepare summary of selected products
  const selectedProductList = Object.entries(selectedProducts)
    .filter((entry) => entry[1] && entry[1].product)
    .map(([componentId, v]) => ({ ...v.product, quantity: v.quantity, componentId }));

  // Save a new fixed package
  const handleSavePackage = () => {
    if (!newPackageName.trim()) {
      message.error('Package name is required');
      return;
    }
    if (selectedProductList.length === 0) {
      message.error('Select at least one product');
      return;
    }
    setFixedPackages(prev => [
      ...prev,
      {
        name: newPackageName.trim(),
        products: selectedProductList,
        id: Date.now(),
      },
    ]);
    setDrawerOpen(false);
    setNewPackageName('');
    setSelectedProducts({});
    message.success('Package created!');
  };

  // Start customizing a fixed package
  const handleCustomize = (pkg) => {
    // Map products to componentId
    const map = {};
    pkg.products.forEach(p => {
      const comp = inventory.find(c => c.id === p.inventory_id);
      if (comp) map[comp.id] = p;
    });
    setSelectedProducts(map);
    setCustomizing(pkg);
    setActiveTab('custom');
    setDrawerOpen(true);
    setNewPackageName(getNextPackageName()); // Use default name for custom package
  };

  // Save a customized package
  const handleSaveCustomPackage = () => {
    if (!newPackageName.trim()) {
      message.error('Package name is required');
      return;
    }
    if (selectedProductList.length === 0) {
      message.error('Select at least one product');
      return;
    }
    setCustomPackages(prev => [
      ...prev,
      {
        name: newPackageName.trim(),
        products: selectedProductList,
        id: Date.now(),
      },
    ]);
    setDrawerOpen(false);
    setNewPackageName('');
    setSelectedProducts({});
    setCustomizing(null);
    message.success('Custom package created!');
  };

  // Helper to get next default package name
  const getNextPackageName = () => {
    const prefix = 'package';
    let maxNum = 0;
    fixedPackages.forEach(pkg => {
      const match = pkg.name.match(/^package(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `${prefix}${maxNum + 1}`;
  };

  // When opening drawer for new package, set default name
  const openDrawerForNewPackage = (tab = 'fixed') => {
    setDrawerOpen(true);
    setCustomizing(null);
    setSelectedProducts({});
    setActiveTab(tab);
    setNewPackageName(getNextPackageName());
  };

  // UI for package form (used for both create and customize)
  const renderPackageForm = () => (
    <>
      <Input
        placeholder="Package Name"
        value={newPackageName}
        onChange={e => setNewPackageName(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      {inventory.length === 0 && <div>No components found.</div>}
      {inventory.map(component => (
        <div key={component.id} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--primary-500)' }}>{component.component_name}</div>
          <Space style={{ width: '100%' }}>
            <Select
              showSearch
              style={{ width: 260 }}
              placeholder={`Select a product for ${component.component_name}`}
              optionFilterProp="children"
              value={selectedProducts[component.id]?.product?.id}
              onChange={productId => handleSelectProduct(component.id, productId)}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              allowClear
            >
              {productsByComponent[component.id] && productsByComponent[component.id].length > 0 ? (
                productsByComponent[component.id].map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.product_name} {product.model ? `(${product.model})` : ''}
                  </Option>
                ))
              ) : (
                <Option disabled key="none" value="">No products available</Option>
              )}
            </Select>
            <InputNumber
              min={1}
              max={selectedProducts[component.id]?.product?.total_quantity || 999}
              value={selectedProducts[component.id]?.quantity || 1}
              onChange={value => handleQuantityChange(component.id, value)}
              disabled={!selectedProducts[component.id]?.product}
              style={{ width: 100 }}
              placeholder="Quantity"
            />
          </Space>
          {component.description && (
            <div style={{ color: 'var(--text-light)', fontSize: 13, marginTop: 4 }}>{component.description}</div>
          )}
        </div>
      ))}
      {selectedProductList.length > 0 && <>
        <Divider />
        <h3 style={{ color: 'var(--primary-400)', marginBottom: 16 }}>Selected Products in This Package</h3>
        {selectedProductList.map(product => (
          <Descriptions key={product.id} column={2} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Product Name">{product.product_name}</Descriptions.Item>
            <Descriptions.Item label="Model">{product.model}</Descriptions.Item>
            <Descriptions.Item label="Unit Price">{product.unit_price}</Descriptions.Item>
            <Descriptions.Item label="Availability">{product.availability}</Descriptions.Item>
            <Descriptions.Item label="Total Quantity">{product.total_quantity}</Descriptions.Item>
            <Descriptions.Item label="Selected Quantity">{product.quantity}</Descriptions.Item>
            <Descriptions.Item label="Image" span={2}>
              {product.img ? (
                <img src={`${API_BASE}${product.img}`} alt={product.product_name} style={{ height: 40 }} />
              ) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        ))}
      </>}
    </>
  );

  // UI for fixed package cards
  const renderFixedPackages = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {fixedPackages.length === 0 ? (
        <Card style={{ width: 320, minHeight: 180, textAlign: 'center', color: '#888' }}>No fixed packages yet.</Card>
      ) : (
        fixedPackages.map(pkg => (
          <Card
            key={pkg.id}
            title={pkg.name}
            style={{ width: 320 }}
            actions={[
              <Button icon={<CopyOutlined />} onClick={() => handleCustomize(pkg)} key="customize">Customize</Button>,
              <Button icon={<EditOutlined />} onClick={() => { setCustomizing(pkg); setDrawerOpen(true); setActiveTab('fixed'); setSelectedProducts(pkg.products.reduce((acc, p) => { acc[p.inventory_id] = { product: p, quantity: p.quantity || 1 }; return acc; }, {})); setNewPackageName(pkg.name); }} key="edit">Edit</Button>
            ]}
          >
            {pkg.products.map(product => (
              <Descriptions key={product.id} column={1} size="small" bordered style={{ marginBottom: 8 }}>
                <Descriptions.Item label="Product">{product.product_name} {product.model ? `(${product.model})` : ''}</Descriptions.Item>
                <Descriptions.Item label="Unit Price">{product.unit_price}</Descriptions.Item>
                <Descriptions.Item label="Availability">{product.availability}</Descriptions.Item>
                <Descriptions.Item label="Selected Quantity">{product.quantity || 1}</Descriptions.Item>
              </Descriptions>
            ))}
          </Card>
        ))
      )}
    </div>
  );

  // Render custom packages as cards in Client Customization
  const renderCustomPackages = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {customPackages.length === 0 ? (
        <Card style={{ width: 320, minHeight: 180, textAlign: 'center', color: '#888' }}>No custom packages yet.</Card>
      ) : (
        customPackages.map(pkg => (
          <Card
            key={pkg.id}
            title={pkg.name}
            style={{ width: 320 }}
            actions={[
              <Button icon={<EditOutlined />} onClick={() => {
                setCustomizing(pkg);
                setDrawerOpen(true);
                setActiveTab('custom');
                setSelectedProducts(pkg.products.reduce((acc, p) => { acc[p.inventory_id] = { product: p, quantity: p.quantity || 1 }; return acc; }, {}));
                setNewPackageName(pkg.name);
              }} key="edit">Edit</Button>
            ]}
          >
            {pkg.products.map(product => (
              <Descriptions key={product.id} column={1} size="small" bordered style={{ marginBottom: 8 }}>
                <Descriptions.Item label="Product">{product.product_name} {product.model ? `(${product.model})` : ''}</Descriptions.Item>
                <Descriptions.Item label="Unit Price">{product.unit_price}</Descriptions.Item>
                <Descriptions.Item label="Availability">{product.availability}</Descriptions.Item>
                <Descriptions.Item label="Selected Quantity">{product.quantity || 1}</Descriptions.Item>
              </Descriptions>
            ))}
          </Card>
        ))
      )}
    </div>
  );

  // Update renderClientCustomization to match Add Package button style and position
  const renderClientCustomization = () => (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <h2 style={{ color: 'var(--primary-400)', letterSpacing: 2, margin: 0 }}>Client Customization</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawerForNewPackage('custom')}>
          Create New Custom Package
        </Button>
      </Space>
      {renderCustomPackages()}
    </div>
  );

  return (
    <div className="hem-lead-table" style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="package-custom-tabs"
        moreIcon={null}
      >
        <TabPane tab="Fixed Packages" key="fixed">
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Fixed Packages</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawerForNewPackage('fixed')}>
              Add Package
            </Button>
          </Space>
          {renderFixedPackages()}
        </TabPane>
        <TabPane tab="Client Customization" key="custom">
          {renderClientCustomization()}
        </TabPane>
      </Tabs>
      <Drawer
        title={customizing ? (activeTab === 'custom' ? 'Customize Package' : 'Edit Package') : (activeTab === 'custom' ? 'Create Custom Package' : 'Create Fixed Package')}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setCustomizing(null); setSelectedProducts({}); setNewPackageName(''); }}
        width={600}
        destroyOnClose
        placement="right"
        styles={{ body: { paddingBottom: 24 } }}
        style={{ zIndex: 2100, background: 'var(--background-color)', height: '100vh' }}
        footer={
          <Button
            type="primary"
            block
            onClick={activeTab === 'custom' ? handleSaveCustomPackage : handleSavePackage}
            disabled={selectedProductList.length === 0 || !newPackageName.trim()}
          >
            {customizing ? (activeTab === 'custom' ? 'Save Custom Package' : 'Save Changes') : (activeTab === 'custom' ? 'Create Custom Package' : 'Create Fixed Package')}
          </Button>
        }
      >
        {renderPackageForm()}
      </Drawer>
    </div>
  );
};

export default PackageBuilder;
