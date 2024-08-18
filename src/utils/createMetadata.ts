
import { version } from "../../package.json";

const createMetadata = (project: string, env: string) => {
  return `# lockenv ${version} · ${project!}&${env!} \n`;
}

export default createMetadata;
