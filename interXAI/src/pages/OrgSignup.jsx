"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import { getAuthToken } from "../utils/handleToken";
import ImageUploader from "../utils/ImageUploader";

export default function OrgSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    orgname: "",
    address: "",
    photo: "",
    Description: "",
  });

  const [loading, setLoading] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Step 1: Check if user is authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
    } else {
      setTokenChecked(true);
    }
  }, [navigate]);

  // ✅ Step 2: Handle form change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  
  // ✅ Step 3: Submit organization registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();

    try {
      // 🎯 POST to create organization
      const response = await fetch(`${API_URL}/organization/create-org/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  },
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Organization created successfully!");
        setError("");

        // 🔄 GET organization ID after registration
        const idRes = await fetch(`${API_URL}/organization/get-org-id/`, {
  method: "GET",
  headers: {
    Authorization: `Token ${token}`,
  },
});
        const idData = await idRes.json();

        if (idRes.ok && idData.organization_id) {
          // ✅ Redirect to OrgDashboard
          navigate(`/org-dashboard/${idData.organization_id}`);
        } else {
          setError("Organization created, but failed to retrieve ID.");
        }
      } else {
        setError(data.error || JSON.stringify(data));
        setMessage("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Show loading until token is validated
  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Verifying token...
      </div>
    );
  }

  // ✅ Render Org Signup Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header />

      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-purple-500/20 rounded-3xl shadow-2xl p-8 transition-all duration-300">
          <h1 className="text-3xl font-bold mb-6 text-center text-purple-300">
            Register Your Organization
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Organization Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400"
            />

            <input
              type="text"
              name="orgname"
              placeholder="Organization Name"
              value={formData.orgname}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400"
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400"
            />

            {/* ✅ Replaced Photo URL with ImageUploader */}
            <div>
              <label className="block text-sm mb-2">Organization Logo</label>
              <ImageUploader
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, photo: url }))}
              />
              {formData.photo && (
                <img
                  src={formData.photo}
                  alt="Organization Logo"
                  className="w-24 h-24 mt-3 rounded-lg border border-gray-600"
                />
              )}
            </div>

            <textarea
              name="Description"
              placeholder="Description"
              value={formData.Description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full p-3 rounded bg-gray-700 text-white placeholder-gray-400 resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 transition-colors p-3 rounded font-semibold text-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Submit"}
            </button>

            {message && <p className="text-green-400 text-center mt-4">{message}</p>}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
