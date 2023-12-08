const structureTMFolders = (folders, parentId = null) => {
  const tree = [];

  folders.forEach((item) => {
    if (item.ParentFolderId === parentId) {
      const children = structureTMFolders(folders, item.FolderId);

      if (children.length) {
        item.children = children;
      }

      tree.push(item);
    }
  });

  return tree;
};

export default structureTMFolders;
