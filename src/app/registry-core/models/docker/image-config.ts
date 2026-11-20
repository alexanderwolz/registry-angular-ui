export interface ImageConfig {
  Volumes: any;
  ArgsEscaped: boolean;
  Cmd: string[];
  Entrypoint: string[];
  Env: string[];
  ExposedPorts: any;
  Labels: any;
}
