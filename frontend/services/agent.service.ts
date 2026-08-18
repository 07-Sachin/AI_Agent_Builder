import api from "./api";

export interface CreateAgentData {
  name: string;
  description: string;
  provider: string;
  model: string;
  api_key: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  provider: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
}

export async function createAgent(
  data: CreateAgentData
): Promise<Agent> {
  const response = await api.post<Agent>(
    "/agents",
    data
  );

  return response.data;
}

export async function getAgents(): Promise<Agent[]> {
  const response = await api.get<Agent[]>("/agents");

  return response.data;
}
export async function getAgent(
  agentId: number
): Promise<Agent> {
  const response = await api.get<Agent>(
    `/agents/${agentId}`
  );

  return response.data;
}

export async function deleteAgent(
  id: number
): Promise<void> {
  await api.delete(`/agents/${id}`);
}
export interface ChatResponse {
  agent_id: number;
  message: string;
  response: string;
}

export async function updateAgent(
  agentId: number,
  data: {
    name: string;
    description: string;
    provider: string;
    model: string;
    api_key?: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
  }
): Promise<Agent> {
  const response = await api.put<Agent>(
    `/agents/${agentId}`,
    data
  );

  return response.data;
}

export async function sendMessage(
  agentId: number,
  message: string
): Promise<ChatResponse> {
  const response = await api.post<ChatResponse>(
    "/chat",
    {
      agent_id: agentId,
      message,
    }
  );

  return response.data;
}

export interface ChatAttachmentResponse {
  agent_id: number;
  message: string;
  filename: string;
  response: string;
}


export async function sendMessageWithAttachment(
  agentId: number,
  message: string,
  file: File,
): Promise<ChatAttachmentResponse> {
  const formData = new FormData();

  formData.append(
    "agent_id",
    String(agentId),
  );

  formData.append(
    "message",
    message,
  );

  formData.append(
    "file",
    file,
    file.name,
  );

  const response =
    await api.post<ChatAttachmentResponse>(
      "/chat/attachment",
      formData,
    );

  return response.data;
}

export interface Tool {
  id: number;
  agent_id: number;
  name: string;
  description: string;
  code: string;
  enabled: boolean;
  created_at: string;
}


export async function getTools(
  agentId: number,
): Promise<Tool[]> {
  const response = await api.get<Tool[]>(
    `/agents/${agentId}/tools`,
  );

  return response.data;
}


export async function createTool(
  agentId: number,
  data: {
    name: string;
    description: string;
    code: string;
    enabled: boolean;
  },
): Promise<Tool> {
  const response = await api.post<Tool>(
    `/agents/${agentId}/tools`,
    data,
  );

  return response.data;
}


export async function deleteTool(
  agentId: number,
  toolId: number,
): Promise<void> {
  await api.delete(
    `/agents/${agentId}/tools/${toolId}`,
  );
}
export interface KnowledgeFile {
  id: number;
  agent_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  created_at: string;
}


export async function getKnowledgeFiles(
  agentId: number,
): Promise<KnowledgeFile[]> {
  const response = await api.get<KnowledgeFile[]>(
    `/agents/${agentId}/knowledge`,
  );

  return response.data;
}

export async function uploadKnowledgeFile(
  agentId: number,
  file: File,
): Promise<KnowledgeFile> {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post<KnowledgeFile>(
    `/agents/${agentId}/knowledge/upload`,
    formData,
  );

  return response.data;
}



export async function deleteKnowledgeFile(
  agentId: number,
  fileId: number,
): Promise<void> {
  await api.delete(
    `/agents/${agentId}/knowledge/${fileId}`,
  );
}