import { api } from "@/lib/api";

export const getConversations = async () => {
  const response = await api.get("/conversation/");
  return response.data;
};

export const createConversation = async (data) => {
  const response = await api.post(`/conversation/${data}`);
  return response.data;
};

export const createGroup = async (data) => {
  const response = await api.post("/conversation/group/create", data);
  return response.data;
};

export const getOtherUsers = async (id, params = {}) => {
  const response = await api.get(`/conversation/otherusers/${id}`, {
    params: buildParams(params),
  });
  return response.data;
};

export const updateGroupDetail = async (data) => {
  const response = await api.put("/conversation/update/group", data);
  return response.data;
};

export const updateMembers = async (data) => {
  const response = await api.put("/conversation/update/member", data);
  return response.data;
};

export const updateConBgimage = async (data) => {
  const response = await api.put("/conversation/settheme", data);
  return response.data;
};

export const contactDetail = async (id, params = {}) => {
  const response = await api.get(`/user/${id}`, {
    params: buildParams(params),
  });
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await api.delete(`/conversation/delete/${id}`);
  return response.data;
};

export const exitGroup = async (id) => {
  const response = await api.put(`/conversation/exitgroup/${id}`);
  return response.data;
};
