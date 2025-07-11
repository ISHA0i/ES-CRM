import axios from 'axios';
const API_URL = 'http://localhost:5000/api/leads';

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
