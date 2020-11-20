export type PortConfig = Array<{
  host: number;
  container: number;
  type?: "tcp" | "udp";
}>;

export type CreateContainerRequest = {
  name: string;
  readyRoute?: string;
  readyTimeoutMs?: number;
  image: string;
  ports?: PortConfig;
  env?: string[];
};
