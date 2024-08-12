import axios from "axios";
import dayjs from "dayjs";

export const apiUrl = "https://api.tracket.info/v1/";

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getLocations = async () => {
  const response = await api.get("locations");
  return response.data.locations;
};

export const getLocation = async (id: string) => {
  const response = await api.get(`locations/${id}`);
  return response.data.locations[0];
};

export const getLocationNoiseData = async (id: string) => {
  let measurements = [];
  let page = 0;

  while (true) {
    const response = await api.get(`locations/${id}/noise`, {
      params: { page, start: dayjs().subtract(1, "month").toISOString() },
    });

    if (response.data.measurements.length > 0) {
      measurements = measurements.concat(response.data.measurements);
      page++;
    } else {
      break;
    }
  }

  return measurements;
};
