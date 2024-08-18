export type Config = CommonConfig & BasicConfig;

export interface CommonConfig {
  force?: true | false;
  silent?: boolean;
  route?: string;
}

export type BasicConfig = (ConfigByName | ConfigById)

export interface ConfigByName {
  environment: string;
  project: string;
}

interface ConfigById {
  id: number;
}

export interface LoggerConfig {
  silent?: boolean;
  force?: boolean;
  color?: string;
}
