import React, { useEffect, useState } from 'react';
import { Button, Drawer, Space, Select, message, Descriptions, Divider, Card, Modal, Input, InputNumber, Popconfirm, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { fetchInventory, fetchComponents, fetchPackages, addPackage, updatePackage, deletePackage, API_BASE } from '../../api';
import '../../root.css';
import './LeadTableCustom.css';
import './PackageCustomTabs.css';

const { Option } = Select;

const PackageBuilder = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]); // Live packages from backend
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProducts, setSelectedProducts] = useState({});
  const [editingPackage, setEditingPackage] = useState(null);
  const [newPackageName, setNewPackageName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch inventory, products, and packages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invRes, prodRes, pkgRes] = await Promise.all([
          fetchInventory(),
          fetchComponents(),
          fetchPackages('fixed'),
        ]);
        setInventory(invRes.data);
        setProducts(prodRes.data);
        setPackages(pkgRes.data.packages || []);
      } catch {
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper: group products by inventory_id
  const productsByComponent = inventory.reduce((acc, comp) => {
    acc[comp.id] = products.filter(p => p.inventory_id === comp.id);
    return acc;
  }, {});

  // Helper: get next default package name
  const getNextPackageName = () => {
    const prefix = 'package';
    let maxNum = 0;
    packages.forEach(pkg => {
      const match = pkg.name.match(/^package(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `${prefix}${maxNum + 1}`;
  };

  // Prepare summary of selected products
  const selectedProductList = Object.entries(selectedProducts)
    .filter((entry) => entry[1] && entry[1].product)
    .map(([componentId, v]) => ({
      component_id: parseInt(componentId, 10),
      product_id: v.product.id,
      quantity: v.quantity,
      ...v.product,
    }));

  // Open drawer for add/edit/view
  const openDrawer = (mode, pkg = null) => {
    setDrawerMode(mode);
    setDrawerOpen(true);
    if (mode === 'add') {
      setEditingPackage(null);
      setSelectedProducts({});
      setNewPackageName(getNextPackageName());
    } else if (pkg) {
      setEditingPackage(pkg);
      setNewPackageName(pkg.name);
      // Map products to selectedProducts
      const map = {};
      (pkg.products || []).forEach(p => {
        map[p.component_id] = {
          product: products.find(prod => prod.id === p.product_id) || {},
          quantity: p.quantity || 1,
        };
      });
      setSelectedProducts(map);
    }
  };

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

  // Save a new package
  const handleSavePackage = async () => {
    if (!newPackageName.trim()) {
      message.error('Package name is required');
      return;
    }
    if (selectedProductList.length === 0) {
      message.error('Select at least one product');
      return;
    }
    try {
      setLoading(true);
      await addPackage({
        name: newPackageName.trim(),
        type: 'fixed',
        products: selectedProductList.map(p => ({
          component_id: p.component_id,
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      });
      message.success('Package created!');
      setDrawerOpen(false);
      refreshPackages();
    } catch {
      message.error('Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing package
  const handleUpdatePackage = async () => {
    if (!editingPackage) return;
    if (!newPackageName.trim()) {
      message.error('Package name is required');
      return;
    }
    if (selectedProductList.length === 0) {
      message.error('Select at least one product');
      return;
    }
    try {
      setLoading(true);
      await updatePackage(editingPackage.id, {
        name: newPackageName.trim(),
        type: 'fixed',
        products: selectedProductList.map(p => ({
          component_id: p.component_id,
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      });
      message.success('Package updated!');
      setDrawerOpen(false);
      refreshPackages();
    } catch {
      message.error('Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  // Delete a package
  const handleDeletePackage = async (pkg) => {
    try {
      setLoading(true);
      await deletePackage(pkg.id);
      message.success('Package deleted!');
      refreshPackages();
    } catch {
      message.error('Failed to delete package');
    } finally {
      setLoading(false);
    }
  };

  // Refresh packages from backend
  const refreshPackages = async () => {
    try {
      setLoading(true);
      const pkgRes = await fetchPackages('fixed');
      setPackages(pkgRes.data.packages || []);
    } catch {
      message.error('Failed to refresh packages');
    } finally {
      setLoading(false);
    }
  };

  // UI for package form (add/edit)
  const renderPackageForm = (readOnly = false) => (
    <>
      <Input
        placeholder="Package Name"
        value={newPackageName}
        onChange={e => setNewPackageName(e.target.value)}
        style={{ marginBottom: 16 }}
        disabled={readOnly}
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
              disabled={readOnly}
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
              disabled={!selectedProducts[component.id]?.product || readOnly}
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
        <h3 style={{ color: 'var(--primary-400)', marginBottom: 24, fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>Selected Products in This Package</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, background: 'var(--primary-100)', borderRadius: 12, padding: 24, marginBottom: 8 }}>
          {selectedProductList.map((product) => (
            <div key={product.product_id} style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 8px #e6eaf0',
              minWidth: 260,
              maxWidth: 320,
              flex: '1 1 260px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 20,
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ width: '100%', textAlign: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary-500)' }}>{product.product_name}</span>
                {product.model && <span style={{ color: 'var(--primary-400)', fontSize: 15, marginLeft: 8 }}>({product.model})</span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                {product.img ? (
                  <img src={`${API_BASE}${product.img}`} alt={product.product_name} style={{ height: 48, borderRadius: 6, boxShadow: '0 1px 4px #e6eaf0' }} />
                ) : (
                  <div style={{ height: 48, width: 48, background: 'var(--primary-200)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>N/A</div>
                )}
              </div>
              <div style={{ width: '100%', fontSize: 15, color: 'var(--primary-500)', marginBottom: 4 }}>
                <b>Unit Price:</b> {product.unit_price}
              </div>
              <div style={{ width: '100%', fontSize: 15, color: 'var(--primary-500)', marginBottom: 4 }}>
                <b>Availability:</b> {product.availability}
              </div>
              <div style={{ width: '100%', fontSize: 15, color: 'var(--primary-500)', marginBottom: 4 }}>
                <b>Total Quantity:</b> {product.total_quantity}
              </div>
              <div style={{ width: '100%', fontSize: 15, color: 'var(--accent-500)', fontWeight: 700 }}>
                <b>Selected Quantity:</b> {product.quantity}
              </div>
            </div>
          ))}
        </div>
      </>}
    </>
  );

  // UI for package cards
  const cardBgColors = [
    '#e6eaf0', // primary-100
    '#b3bed1', // primary-200
    '#8091b2', // primary-300
    '#4d6593', // primary-400
    '#ffe5d1', // accent-100
    '#ffc299', // accent-200
    '#ff9e61', // accent-300
    '#ff7a29', // accent-400
    '#f37021', // accent-500
    '#e0e6ed', // border-color
  ];
  const renderPackages = () => (
    <div className="package-card-list">
      {packages.length === 0 ? (
        <Card style={{ width: 320, minHeight: 180, textAlign: 'center', color: '#888' }}>No packages yet.</Card>
      ) : (
        packages.map((pkg, idx) => {
          const bgColor = cardBgColors[idx % cardBgColors.length];
          return (
            <div
              key={pkg.id}
              className="package-card"
            >
              <div className="package-card-title" style={{ background: bgColor }}>
                <span>{pkg.name}</span>
              </div>
              <div className="package-card-actions">
                <Button type="text" icon={<EditOutlined style={{ fontSize: 20 }} />} onClick={() => openDrawer('edit', pkg)} />
                <Button type="text" icon={<DeleteOutlined style={{ fontSize: 20 }} />} onClick={() => handleDeletePackage(pkg)} />
                <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} onClick={() => openDrawer('view', pkg)} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="hem-lead-table" style={{ padding: 24, background: 'var(--background-alt)', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', display: 'flex' }}>
        <h2 style={{ margin: 0, color: 'var(--primary-400)', letterSpacing: 2 }}>Packages</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer('add')}>
          Add Package
        </Button>
      </Space>
      {renderPackages()}
      <Drawer
        title={<span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-500)', letterSpacing: 1 }}>{drawerMode === 'add' ? 'Create Package' : drawerMode === 'edit' ? 'Edit Package' : 'View Package'}</span>}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingPackage(null); setSelectedProducts({}); setNewPackageName(''); }}
        width={900}
        destroyOnClose
        placement="right"
        styles={{
          header: {
            background: 'var(--primary-100)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: '0 2px 8px #e6eaf0',
            padding: '12px 32px 12px 32px',
            borderBottom: '1px solid var(--border-color)',
          },
          body: {
            background: 'var(--background-color)',
            padding: '32px 40px 24px 40px',
            minHeight: 'calc(100vh - 120px)',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          },
          footer: {
            background: 'var(--drawer-footer-bg)',
            borderTop: '1px solid var(--border-color)',
            padding: '20px 40px',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: '0 -2px 8px #e6eaf0',
          },
        }}
        style={{ zIndex: 2100, background: 'transparent', height: '100vh', borderRadius: 16, boxShadow: '0 4px 32px #bfc8d6' }}
        footer={drawerMode === 'view' ? null : (
          <Button
            type="primary"
            block
            onClick={drawerMode === 'add' ? handleSavePackage : handleUpdatePackage}
            disabled={selectedProductList.length === 0 || !newPackageName.trim()}
            loading={loading}
            style={{ fontSize: 16, fontWeight: 700, padding: '12px 0', borderRadius: 8 }}
          >
            {drawerMode === 'add' ? 'Create Package' : 'Save Changes'}
          </Button>
        )}
      >
        {renderPackageForm(drawerMode === 'view')}
      </Drawer>
    </div>
  );
};

export default PackageBuilder;
