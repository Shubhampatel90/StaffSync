import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const superAdminDashboardApiService = {
  /**
   * Get complete Super Admin dashboard data
   *
   * Backend endpoint:
   * GET /api/super-admin/dashboard
   */
  getDashboardData: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/super-admin/dashboard`,
        {
          // IMPORTANT:
          // Sends JSESSIONID / Spring Security session
          // cookie with the request.
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      throw error;
    }
  },
};

export default superAdminDashboardApiService;

