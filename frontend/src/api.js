import axios from 'axios';
const API_URL = 'http://localhost:5000/api/leads';
const CLIENT_API_URL = 'http://localhost:5000/api/clients';
const INVENTORY_API_URL = 'http://localhost:5000/api/inventory';
const COMPONENT_API_URL = 'http://localhost:5000/api/components';

export const fetchLeads = (page, pageSize) =>
  axios.get(`${API_URL}?page=${page}&pageSize=${pageSize}`);

export const fetchLead = (id) =>
  axios.get(`${API_URL}/${id}`);

export const addLead = (data) =>
  axios.post(API_URL, data);

export const updateLead = (id, data) =>
  axios.put(`${API_URL}/${id}`, data);

export const deleteLead = (id) =>
  axios.delete(`${API_URL}/${id}`);

// Client APIs
export const fetchClients = (page, pageSize) =>
  axios.get(`${CLIENT_API_URL}?page=${page}&pageSize=${pageSize}`);

export const fetchClient = (id) =>
  axios.get(`${CLIENT_API_URL}/${id}`);

export const addClient = (data) =>
  axios.post(CLIENT_API_URL, data);

export const updateClient = (id, data) =>
  axios.put(`${CLIENT_API_URL}/${id}`, data);

export const deleteClient = (id) =>
  axios.delete(`${CLIENT_API_URL}/${id}`);

// Inventory APIs
export const fetchInventory = () => axios.get(INVENTORY_API_URL);
export const fetchInventoryById = (id) => axios.get(`${INVENTORY_API_URL}/${id}`);
export const addInventory = (data) => axios.post(INVENTORY_API_URL, data);
export const updateInventory = (id, data) => axios.put(`${INVENTORY_API_URL}/${id}`, data);
export const deleteInventory = (id) => axios.delete(`${INVENTORY_API_URL}/${id}`);

// Component APIs
export const fetchComponents = () => axios.get(COMPONENT_API_URL);
export const fetchComponentById = (id) => axios.get(`${COMPONENT_API_URL}/${id}`);
export const addComponent = (data) => {
  if (data instanceof FormData) {
    return axios.post(COMPONENT_API_URL, data);
  }
  return axios.post(COMPONENT_API_URL, data, { headers: { 'Content-Type': 'application/json' } });
};
export const updateComponent = (id, data) => {
  if (data instanceof FormData) {
    return axios.put(`${COMPONENT_API_URL}/${id}`, data);
  }
  return axios.put(`${COMPONENT_API_URL}/${id}`, data, { headers: { 'Content-Type': 'application/json' } });
};
export const deleteComponent = (id) => axios.delete(`${COMPONENT_API_URL}/${id}`);