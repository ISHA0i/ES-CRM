import axios from 'axios';
const API_URL = 'http://localhost:5000/api/leads';
const CLIENT_API_URL = 'http://localhost:5000/api/clients';

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
