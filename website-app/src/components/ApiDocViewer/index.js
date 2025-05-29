import React, { useState, useEffect } from "react";
import { useApiDocReader } from "../../utils/apiDocReader";
import "./ApiDocViewer.css";

const ApiDocViewer = () => {
  const [apiReader, setApiReader] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [groupedEndpoints, setGroupedEndpoints] = useState({});
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { loadApiDocs } = useApiDocReader();

  useEffect(() => {
    loadApiDocumentation();
  }, []);

  const loadApiDocumentation = async () => {
    setLoading(true);
    setError(null);

    try {
      const reader = await loadApiDocs();
      if (reader) {
        setApiReader(reader);
        const allEndpoints = reader.parseEndpoints();
        setEndpoints(allEndpoints);
        setGroupedEndpoints(reader.displayEndpointsByTags());
      } else {
        setError("Could not load API documentation");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (apiReader && query.trim()) {
      const results = apiReader.searchEndpoints(query);
      setEndpoints(results);
    } else if (apiReader) {
      setEndpoints(apiReader.parseEndpoints());
    }
  };

  const selectEndpoint = (method, path) => {
    if (apiReader) {
      const details = apiReader.getEndpointDetails(method, path);
      setSelectedEndpoint(details);
    }
  };

  const generateExample = (method, path) => {
    if (apiReader) {
      return apiReader.generateCodeExample(method, path);
    }
    return null;
  };

  const exportMarkdown = () => {
    if (apiReader) {
      const markdown = apiReader.exportAsMarkdown();
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "api-documentation.md";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="api-doc-viewer">
        <div className="loading">
          <h3>🔄 Loading API Documentation...</h3>
          <p>Trying to fetch from various endpoints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="api-doc-viewer">
        <div className="error">
          <h3>❌ Error Loading API Documentation</h3>
          <p>{error}</p>
          <button onClick={loadApiDocumentation} className="retry-btn">
            🔄 Retry
          </button>

          <div className="fallback-info">
            <h4>📋 Known Endpoints (from code analysis):</h4>
            <div className="known-endpoints">
              <div className="endpoint-group">
                <h5>🔐 Authentication</h5>
                <ul>
                  <li>
                    <code>POST /api/auth/signup</code>
                  </li>
                  <li>
                    <code>POST /api/auth/login</code>
                  </li>
                  <li>
                    <code>POST /api/auth/google</code>
                  </li>
                  <li>
                    <code>POST /api/auth/reset_password</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>👥 Account Management</h5>
                <ul>
                  <li>
                    <code>GET /api/accounts/show?userId={userId}</code>
                  </li>
                  <li>
                    <code>POST /api/accounts/create</code>
                  </li>
                  <li>
                    <code>POST /api/accounts/send_again</code>
                  </li>
                  <li>
                    <code>PUT /api/accounts/edit/{accountId}</code>
                  </li>
                  <li>
                    <code>DELETE /api/accounts/delete/{accountId}</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>🛡️ Roles & Permissions</h5>
                <ul>
                  <li>
                    <code>GET /roles/show?userId={userId}</code>
                  </li>
                  <li>
                    <code>POST /roles/create</code>
                  </li>
                  <li>
                    <code>DELETE /roles/delete/{roleId}</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>🏠 Dashboard</h5>
                <ul>
                  <li>
                    <code>POST /api/home/total_revenue</code>
                  </li>
                  <li>
                    <code>POST /api/home/new_customer</code>
                  </li>
                  <li>
                    <code>POST /api/home/total_pending</code>
                  </li>
                  <li>
                    <code>POST /api/home/recent_activity</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>💬 Chat</h5>
                <ul>
                  <li>
                    <code>POST /api/chat/getMessages</code>
                  </li>
                  <li>
                    <code>Socket.IO: send_message, receive_message</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>🛒 Sales</h5>
                <ul>
                  <li>
                    <code>POST /api/sell/findcode</code>
                  </li>
                  <li>
                    <code>POST /api/sell/get_customer</code>
                  </li>
                  <li>
                    <code>POST /api/sell/get_history</code>
                  </li>
                </ul>
              </div>

              <div className="endpoint-group">
                <h5>📦 Products</h5>
                <ul>
                  <li>
                    <code>POST /api/products/show</code>
                  </li>
                  <li>
                    <code>POST /api/products/get_supplier</code>
                  </li>
                  <li>
                    <code>POST /api/products/history</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="api-doc-viewer">
      <div className="header">
        <h2>📚 API Documentation Viewer</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="🔍 Search endpoints..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={exportMarkdown} className="export-btn">
            📄 Export MD
          </button>
          <button onClick={loadApiDocumentation} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="content">
        <div className="sidebar">
          <h3>📋 Endpoints</h3>
          {Object.entries(groupedEndpoints).map(([tag, tagEndpoints]) => (
            <div key={tag} className="endpoint-group">
              <h4>{tag}</h4>
              {tagEndpoints.map((endpoint, index) => (
                <div
                  key={`${endpoint.method}-${endpoint.path}-${index}`}
                  className={`endpoint-item ${
                    selectedEndpoint?.method === endpoint.method &&
                    selectedEndpoint?.path === endpoint.path
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => selectEndpoint(endpoint.method, endpoint.path)}
                >
                  <span className={`method ${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <span className="path">{endpoint.path}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="main-content">
          {selectedEndpoint ? (
            <div className="endpoint-details">
              <div className="endpoint-header">
                <span
                  className={`method ${selectedEndpoint.method.toLowerCase()}`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="path">{selectedEndpoint.path}</span>
              </div>

              <div className="endpoint-info">
                <h4>📝 Summary</h4>
                <p>{selectedEndpoint.summary}</p>

                {selectedEndpoint.description && (
                  <>
                    <h4>📄 Description</h4>
                    <p>{selectedEndpoint.description}</p>
                  </>
                )}

                <h4>🔗 Full URL</h4>
                <code>{selectedEndpoint.fullUrl}</code>

                {selectedEndpoint.parameters &&
                  selectedEndpoint.parameters.length > 0 && (
                    <>
                      <h4>📥 Parameters</h4>
                      <ul>
                        {selectedEndpoint.parameters.map((param, index) => (
                          <li key={index}>
                            <strong>{param.name}</strong> ({param.in}) -{" "}
                            {param.description}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                <h4>💻 Code Example</h4>
                <pre className="code-example">
                  <code>
                    {generateExample(
                      selectedEndpoint.method,
                      selectedEndpoint.path
                    )}
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <h3>👈 Select an endpoint to view details</h3>
              <p>
                Choose an endpoint from the sidebar to see detailed information
                and code examples.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDocViewer;
