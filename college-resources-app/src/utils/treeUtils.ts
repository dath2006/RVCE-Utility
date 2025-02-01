import { Folder } from '../types/folder';

export const findFolderById = (folders: Folder[], id: string): Folder | null => {
    for (const folder of folders) {
        if (folder.id === id) {
            return folder;
        }
        const found = findFolderById(folder.children || [], id);
        if (found) {
            return found;
        }
    }
    return null;
};

export const getAllFolderIds = (folders: Folder[]): string[] => {
    let ids: string[] = [];
    for (const folder of folders) {
        ids.push(folder.id);
        ids = ids.concat(getAllFolderIds(folder.children || []));
    }
    return ids;
};

export const getFolderHierarchy = (folders: Folder[], level: number = 0): string => {
    let hierarchy: string = '';
    for (const folder of folders) {
        hierarchy += `${'--'.repeat(level)} ${folder.name}\n`;
        hierarchy += getFolderHierarchy(folder.children || [], level + 1);
    }
    return hierarchy;
};