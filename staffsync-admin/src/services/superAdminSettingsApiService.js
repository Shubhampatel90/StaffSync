const API_BASE_URL = "https://staffsync-w6wn.onrender.com";

export const getSuperAdminSettings = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/super-admin/settings`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const contentType =
      response.headers.get("content-type") || "";

    let errorMessage = "";

    if (contentType.includes("application/json")) {
      const errorData =
        await response.json().catch(() => null);

      console.error("Get settings failed:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.details ||
        "";
    } else {
      errorMessage = await response
        .text()
        .catch(() => "");
    }

    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to access system settings."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "Settings API endpoint was not found."
      );
    }

    if (response.status >= 500) {
      throw new Error(
        errorMessage ||
          "Server error while loading settings."
      );
    }

    throw new Error(
      errorMessage ||
        `Failed to load settings (${response.status})`
    );
  }

  return await response.json();
};

export const updateSuperAdminSettings = async (
  settings
) => {
  const adminId = localStorage.getItem("adminId");

  let url =
    `${API_BASE_URL}/api/super-admin/settings`;

  if (adminId) {
    url += `?adminId=${encodeURIComponent(adminId)}`;
  }

  console.log("Updating StaffSync settings:", {
    url,
    adminId,
    settings,
  });

  const response = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const contentType =
      response.headers.get("content-type") || "";

    let errorMessage = "";

    if (contentType.includes("application/json")) {
      const errorData =
        await response.json().catch(() => null);

      console.error("Update settings failed:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });

      errorMessage =
        errorData?.message ||
        errorData?.error ||
        errorData?.details ||
        "";
    } else {
      errorMessage = await response
        .text()
        .catch(() => "");
    }

    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to update system settings."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "Settings API endpoint was not found."
      );
    }

    if (response.status >= 500) {
      throw new Error(
        errorMessage ||
          "Server error while saving settings."
      );
    }

    throw new Error(
      errorMessage ||
        `Failed to save settings (${response.status})`
    );
  }

  return await response.json();
};