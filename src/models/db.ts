export interface Environments {
  id: number;
  project_id: number;
  key: string;
  value: string;
}

export interface Projects {
  id: number;
  name: string;
  environment: string;
}
