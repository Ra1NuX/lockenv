import { version as toolVersion } from '../../package.json'

export interface Version {
  isFirstTime: boolean,
  version?: string,
  toolVersion?: string,
  isOutdated?: boolean,
  environment?: string,
  project?: string,
}

const checkMetadata = (text: string): Version => {

  const line = text.split('\n')[0];
  if(!line.startsWith('# lockenv')) {
    return {
      isFirstTime: true,
    }
  }

  const version = line.split('·')[0].split('# lockenv')[1].trim();
  const [project, environment] = line.split('·')[1].split('&').map((e) => e.trim())

  return {
    version,
    toolVersion,
    project,
    environment,
    isFirstTime: false,
    isOutdated: version !== toolVersion
  }

}

export default checkMetadata;