export interface ImageConfig {
  Volumes: Record<string, object> | null;
  ArgsEscaped: boolean;
  Cmd: string[];
  Entrypoint: string[];
  Env: string[];
  ExposedPorts: Record<string, object> | null;
  Labels: Record<string, string> | null;
}
