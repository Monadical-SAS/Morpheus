import axios from "./httpClient";
import { User } from "@/models/models";
import { signOutFirebase } from "./auth";

export const logout = () => {
  return signOutFirebase()
    .then(() => {
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    })
    .catch((error) => {
      alert(error);
    });
};

export const getUserInfo = async (email: string) => {
  try {
    const response = await axios.get(`users/email/${email}`);
    if (response.status === 200 && response.data.email) {
      return { success: true, data: response.data };
    }
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const loadOrCreateUserInfo = async (user: User) => {
  try {
    const response = await axios.post(`users`, user);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const updateUserInfo = async (user: User) => {
  try {
    const response = await axios.put(`users`, user);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};

export const removeUserInfo = async (email: string) => {
  try {
    const response = await axios.delete(`users/${email}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error };
  }
};
