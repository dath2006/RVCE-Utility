import jsonData from "../data/folderHierarchy.json" with {type: "json"};

const searchFolderStructure = (query, data = jsonData) => {
  // Helper function to deep clone objects
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));
  
  const searchInTree = (nodes) => {
    let results = [];
    
    for (const node of nodes) {
      // If folder name matches, return entire subtree
      if (
        node.mimeType === "application/vnd.google-apps.folder" && 
        node.name.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push(deepClone(node));
        continue;
      }
      
      // If has children, search them
      if (node.children && node.children.length > 0) {
        const childResults = searchInTree(node.children);
        if (childResults.length > 0) {
          results = [...results, ...childResults];
        }
      }
    }
    
    return results;
  };

  return searchInTree(data);
};

export default searchFolderStructure;
