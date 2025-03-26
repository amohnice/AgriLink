import axios from "axios";
import { api } from "./api/api";

export const getPredictedPrice = async (crop, supply, demand) => {
  try {
    const response = await api.post("/ai/predict", { crop, supply, demand });
    return response.data.predictedPrice;
  } catch (error) {
    console.error("Prediction Error:", error.response?.data || error.message);
    return null;
  }
};
