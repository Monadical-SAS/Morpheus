import axios from "./axiosClient";
import { ErrorResponse, SuccessResponse, User } from "@/lib/models";
import { signOutFirebase } from "./auth";

export const logout = () => {
  return signOutFirebase()
    .then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("results");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    })
    .catch((error) => {
      alert(error);
    });
};

export const getAdmins = async () => {
  try {
    const response = await axios.get(`users/admins`);
    if (response.status === 200 && response.data) {
      return response.data;
    }
    return ErrorResponse("No admins found");
  } catch (error) {
    return ErrorResponse(String(error));
  }
};

export const getAdminInfo = async (email: string) => {
  try {
    const response = await axios.get(`users/admin/email/${email}`);
    if (response.status === 200 && response.data.email) {
      return SuccessResponse(response.data);
    }
    return ErrorResponse("Admin not found");
  } catch (error) {
    return ErrorResponse(String(error));
  }
};

export const createNewAdmin = async (admin: User) => {
  try {
    const adminData: User = { ...admin, roles: [{ name: "admin" }] };
    const response = await axios.post(`users/admin`, adminData);
    if (response.status === 200 && response.data) {
      return SuccessResponse(response.data);
    }
    return ErrorResponse("Admin not found");
  } catch (error) {
    return ErrorResponse(String(error));
  }
};

export const deleteAdmin = async (email: string) => {
  try {
    const response = await axios.delete(`users/admin/${email}`);
    if (response.status === 200 && response.data) {
      return SuccessResponse(response.data);
    }
    return ErrorResponse("Admin not found");
  } catch (error) {
    return ErrorResponse(String(error));
  }
};
