import axios from 'axios';

// ✅ Get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};
const baseUrl = import.meta.env.VITE_API_URL;
// ✅ Enhanced fetchWithToken: supports GET (default), POST, PUT, DELETE
export const fetchWithToken = async (url, token, navigate, method = "GET", body = null) => {
  try {
    const headers = token ? { Authorization: `Token ${token}` } : {};
    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios({
      url,
      method,
      headers,
      data: body ? JSON.stringify(body) : null,
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Invalid token or expired:", error);
      localStorage.removeItem("authToken");
      if (navigate) navigate("/login");
    } else {
      console.warn("API request failed:", error.response?.data || error.message);
    }
    return null;
  }
  
};

// ✅ Token handler: login + fetch ID + redirect
export const handleToken = async (username, password, navigate) => {
  try {
    const res = await fetch(`${baseUrl}/users/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return false;
    }

    localStorage.setItem('authToken', data.token);

    const idRes = await fetch(`${baseUrl}/users/get-id/`, {
      headers: { Authorization: `Token ${data.token}` },
    });

    const idData = await idRes.json();

    if (!idRes.ok || !idData.profile_id) {
      return false;
    }

    navigate(`/profile/${idData.profile_id}`);
    return true;
  } catch (error) {
    console.error('Token handling error:', error);
    return false;
  }
};
