const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

// OAuth2 credentials from environment variables
const CLIENT_ID =
 
const CLIENT_SECRET = 
const REFRESH_TOKEN =
 

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

/**
 * Recursively get all files and folders under a specific parent folder
 */
async function getDriveFilesRecursive(parentId, files = []) {
  let nextPageToken = null;
  do {
    const response = await drive.files.list({
      q: `'${parentId}' in parents and trashed = false`,
      fields:
        "nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)",
      pageSize: 1000,
      pageToken: nextPageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const file of response.data.files) {
      files.push(file);
      if (file.mimeType === "application/vnd.google-apps.folder") {
        await getDriveFilesRecursive(file.id, files);
      }
    }
    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);
  return files;
}

/**
 * Build Folder Hierarchy
 */
function buildHierarchy(files) {
  const folderMap = {}; // Map to store folder hierarchy

  // Create nodes for all files and folders
  files.forEach((file) => {
    folderMap[file.id] = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      children: [],
    };

    if (file.mimeType !== "application/vnd.google-apps.folder") {
      folderMap[file.id].webViewLink = file.webViewLink.replace(
        "/view?usp=drivesdk",
        "/preview"
      );
      folderMap[file.id].webContentLink = file.webContentLink;
    }
  });

  // Organize files into their parent folders
  files.forEach((file) => {
    if (file.parents && file.parents.length > 0) {
      const parentId = file.parents[0];
      if (folderMap[parentId]) {
        folderMap[parentId].children.push(folderMap[file.id]);
      }
    }
  });

  // Extract root-level folders (those without parents in the list)
  const rootFolders = files
    .filter((file) => !file.parents)
    .map((file) => folderMap[file.id]);

  return rootFolders;
}

/**
 * Main Function
 */
async function main() {
  try {
    const ROOT_FOLDER_ID = "1HTXnomvzo7OdFvbnBxVjw5JpgrgvErRR";
    // Get root folder info
    const rootFolder = await drive.files.get({
      fileId: ROOT_FOLDER_ID,
      fields: "id, name, mimeType, parents",
      supportsAllDrives: true,
    });
    // Recursively get all descendants
    const files = [
      rootFolder.data,
      ...(await getDriveFilesRecursive(ROOT_FOLDER_ID)),
    ];
    const hierarchy = buildHierarchy(files);
    fs.writeFileSync(
      "folderHierarchy.json",
      JSON.stringify(hierarchy, null, 2)
    );
    console.log("Saved to file");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
