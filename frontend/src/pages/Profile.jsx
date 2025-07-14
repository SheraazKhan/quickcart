import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css"; 
import API_BASE_URL from "../utils/api";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${user.id}`, form);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setMsg("Profile updated!");
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      setMsg("Failed to update profile.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setImageUploading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/users/${user.id}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
        }
      );

      const updatedUser = { ...user, profilePicture: res.data.image };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMsg("Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err);
      setMsg("Failed to upload profile picture.");
    } finally {
      setImageUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${user.id}/remove-picture`);
      const updatedUser = { ...user, profilePicture: "" };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMsg("Profile picture removed.");
    } catch (err) {
      console.error("Remove error:", err);
      setMsg("Failed to remove profile picture.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setMsg("All password fields are required.");
    }
    if (newPassword !== confirmPassword) {
      return setMsg("New passwords do not match.");
    }

    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${user.id}/change-password`, {
        oldPassword,
        newPassword
      });
      setMsg(res.data.message);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Password change failed:", err);
      setMsg(err.response?.data?.error || "Failed to change password.");
    }
  };

  if (!user) return <p className="text-center mt-10">Please log in to view your profile.</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md transition-all fade-in">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">Your Profile</h2>

        <div className="flex justify-center mb-4">
          <img
            src={user.profilePicture || "https://via.placeholder.com/96?text=Avatar"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imageUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {user.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 text-red-600 hover:underline text-sm"
                >
                  Remove picture
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-2">
              <span className="font-semibold">Name:</span> {user.name}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Email:</span> {user.email}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Edit Profile
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          {showPasswordForm ? "Cancel Password Change" : "Change Password"}
        </button>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 animate-fade-in">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Old Password</label>
              <input
                type="password"
                className="w-full border rounded p-2"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="w-full border rounded p-2"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                className="w-full border rounded p-2"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
            >
              Save Password
            </button>
          </form>
        )}

        {msg && <p className="text-center text-green-600 mt-4 font-medium">{msg}</p>}

        {/* Placeholder for Order History or Favorites */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Favorites (coming soon)</h3>
          <p className="text-sm text-gray-500">You haven't saved any favorites yet.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
