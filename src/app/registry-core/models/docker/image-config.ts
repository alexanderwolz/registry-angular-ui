export interface ImageConfig {
    Volumes: any
    ArgsEscaped: boolean
    Cmd: Array<string>
    Entrypoint: Array<string>
    Env: Array<string>
    ExposedPorts: any
    Labels: any
}