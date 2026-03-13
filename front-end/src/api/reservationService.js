// src/services/reservationService.js

const BASE_URL = '/api/reservations'; // swap with your actual base URL

// GET /reservations?search=&page=&limit=
export const fetchReservations = async ({ search = '', page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams({ search, page, limit });
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch reservations');
  return res.json(); // { data: [...], total: number }
};

// POST /reservations
export const createReservation = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create reservation');
  return res.json(); // created reservation object
};

// DELETE /reservations/:id
export const deleteReservation = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reservation');
  return res.json(); // { success: true } or 204 No Content
};
