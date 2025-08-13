// Mock implementation of spark vite plugins
export default function sparkPlugin() {
  return {
    name: 'mock-spark-plugin',
    configResolved() {
      console.log('Mock Spark plugin loaded');
    }
  };
}

export function createIconImportProxy() {
  return {
    name: 'mock-icon-proxy-plugin',
    configResolved() {
      console.log('Mock Icon proxy plugin loaded');
    }
  };
}