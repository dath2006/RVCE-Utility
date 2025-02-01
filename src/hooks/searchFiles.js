import jsonData from "../data/folderHierarchy.json" with {type: "json"};

const searchFiles = (query, data = jsonData) => {
  const results = [];

  const traverse = (node, currentPath = []) => {
    // If node is a file and matches search
    if (
      (node.mimeType === "application/pdf" || node.mimeType === "text/plain") &&
      node.name.toLowerCase().includes(query.toLowerCase())
    ) {
      results.push({
        ...node,
        path: currentPath,
      });
    }

    // If node has children, recursively search them
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) =>
        traverse(child, [...currentPath, node.name])
      );
    }
  };

  // Start traversal for each root node
  data.forEach((node) => traverse(node, []));

  return results;
};

export default searchFiles;
