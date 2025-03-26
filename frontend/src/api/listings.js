import api from "./api";

export const getListings = async () => {
  try {
    const response = await api.get("/listings");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getListingById = async (id) => {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await api.post("/listings", listingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
