declare module "load-tsconfig" {
  export function loadTsConfig(
    dir: string,
    filename: string
  ): {
    data: {
      compilerOptions: {
        paths: Record<string, string[]>;
      };
    };
  };
}
