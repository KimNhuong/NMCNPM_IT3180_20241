/**
 * API Documentation Reader Utility
 * Đọc và parse Swagger/OpenAPI documentation
 */

class ApiDocReader {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.apiSpec = null;
  }

  /**
   * Thử các URL phổ biến để tìm Swagger JSON spec
   */
  async fetchApiSpec() {
    const possibleUrls = [
      `${this.baseUrl}/api-docs.json`,
      `${this.baseUrl}/swagger.json`,
      `${this.baseUrl}/api-docs/swagger.json`,
      `${this.baseUrl}/docs/swagger.json`,
      `${this.baseUrl}/v1/api-docs`,
      `${this.baseUrl}/api/docs`,
    ];

    for (const url of possibleUrls) {
      try {
        console.log(`🔍 Trying to fetch API spec from: ${url}`);
        const response = await fetch(url);
        
        if (response.ok) {
          const spec = await response.json();
          console.log(`✅ Found API spec at: ${url}`);
          this.apiSpec = spec;
          return spec;
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${url}:`, error.message);
      }
    }

    throw new Error('Could not find API specification at any common endpoints');
  }

  /**
   * Parse và hiển thị thông tin API endpoints
   */
  parseEndpoints() {
    if (!this.apiSpec || !this.apiSpec.paths) {
      throw new Error('API specification not loaded or invalid');
    }

    const endpoints = [];
    
    Object.entries(this.apiSpec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        endpoints.push({
          method: method.toUpperCase(),
          path: path,
          summary: details.summary || 'No summary',
          description: details.description || 'No description',
          tags: details.tags || [],
          parameters: details.parameters || [],
          requestBody: details.requestBody || null,
          responses: details.responses || {}
        });
      });
    });

    return endpoints;
  }

  /**
   * Tìm kiếm endpoints theo tag hoặc path
   */
  searchEndpoints(query) {
    const endpoints = this.parseEndpoints();
    const lowerQuery = query.toLowerCase();
    
    return endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(lowerQuery) ||
      endpoint.summary.toLowerCase().includes(lowerQuery) ||
      endpoint.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Hiển thị thông tin chi tiết của một endpoint
   */
  getEndpointDetails(method, path) {
    if (!this.apiSpec || !this.apiSpec.paths[path] || !this.apiSpec.paths[path][method.toLowerCase()]) {
      return null;
    }

    const endpoint = this.apiSpec.paths[path][method.toLowerCase()];
    
    return {
      method: method.toUpperCase(),
      path: path,
      fullUrl: `${this.baseUrl}${path}`,
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      security: endpoint.security
    };
  }

  /**
   * Generate code example cho một endpoint
   */
  generateCodeExample(method, path, language = 'javascript') {
    const details = this.getEndpointDetails(method, path);
    if (!details) return null;

    if (language === 'javascript') {
      return this.generateJavaScriptExample(details);
    }
    
    return null;
  }

  /**
   * Generate JavaScript fetch example
   */
  generateJavaScriptExample(details) {
    const { method, fullUrl, requestBody, parameters } = details;
    
    let code = `// ${details.summary}\n`;
    code += `const response = await fetch("${fullUrl}"`;
    
    if (method !== 'GET') {
      code += `, {\n`;
      code += `  method: "${method}",\n`;
      code += `  headers: {\n`;
      code += `    "Content-Type": "application/json",\n`;
      code += `  },\n`;
      
      if (requestBody) {
        code += `  body: JSON.stringify({\n`;
        code += `    // Add your request data here\n`;
        code += `  }),\n`;
      }
      
      code += `}`;
    }
    
    code += `);\n\n`;
    code += `if (!response.ok) {\n`;
    code += `  throw new Error('Network response was not ok');\n`;
    code += `}\n\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;
    
    return code;
  }

  /**
   * Hiển thị tất cả endpoints theo nhóm tags
   */
  displayEndpointsByTags() {
    const endpoints = this.parseEndpoints();
    const groupedByTags = {};
    
    endpoints.forEach(endpoint => {
      const tags = endpoint.tags.length > 0 ? endpoint.tags : ['default'];
      
      tags.forEach(tag => {
        if (!groupedByTags[tag]) {
          groupedByTags[tag] = [];
        }
        groupedByTags[tag].push(endpoint);
      });
    });
    
    return groupedByTags;
  }

  /**
   * Export API documentation as markdown
   */
  exportAsMarkdown() {
    const groupedEndpoints = this.displayEndpointsByTags();
    let markdown = `# API Documentation\n\n`;
    
    if (this.apiSpec.info) {
      markdown += `**Title:** ${this.apiSpec.info.title}\n`;
      markdown += `**Version:** ${this.apiSpec.info.version}\n`;
      markdown += `**Description:** ${this.apiSpec.info.description || 'No description'}\n\n`;
    }
    
    Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
      markdown += `## ${tag}\n\n`;
      
      endpoints.forEach(endpoint => {
        markdown += `### ${endpoint.method} ${endpoint.path}\n`;
        markdown += `**Summary:** ${endpoint.summary}\n\n`;
        
        if (endpoint.description) {
          markdown += `**Description:** ${endpoint.description}\n\n`;
        }
        
        markdown += `**Example:**\n`;
        markdown += `\`\`\`javascript\n`;
        markdown += this.generateJavaScriptExample(endpoint);
        markdown += `\n\`\`\`\n\n`;
      });
    });
    
    return markdown;
  }
}

// Usage example:
export const useApiDocReader = () => {
  const reader = new ApiDocReader();
  
  const loadApiDocs = async () => {
    try {
      await reader.fetchApiSpec();
      return reader;
    } catch (error) {
      console.error('Failed to load API documentation:', error);
      return null;
    }
  };
  
  return { loadApiDocs, reader };
};

export default ApiDocReader;
