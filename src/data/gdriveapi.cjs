const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

// Load the Service Account credentials
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const KEY_FILE = path.join(__dirname, "credentials.json");

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE, // Path to your service account key file
  scopes: SCOPES,
});

// Drive API instance
const drive = google.drive({ version: "v3", auth });

/**
 * Get all files and folders in Google Drive
 */
async function getDriveFiles() {
  let files = [];
  let nextPageToken = null;

  do {
    const response = await drive.files.list({
      q: "trashed = false",
      fields:
        "nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)",
      pageSize: 1000,
      pageToken: nextPageToken,
    });
    // console.log(response.data.files);

    files = files.concat(response.data.files);
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
    const files = await getDriveFiles();
    const hierarchy = buildHierarchy(files);

    // Log or save the folder structure
    // console.log(JSON.stringify(hierarchy, null, 2));
    console.log("Saved to file");

    // Optional: Save to a JSON file
    fs.writeFileSync(
      "folderHierarchy.json",
      JSON.stringify(hierarchy, null, 2)
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
