const { app, Menu, ipcRenderer } = require('electron');
const { __DEV__ } = require('./util');

export const defaultMenu = [
  {
    label: '设置',
    submenu: [
      {
        label: '打印机',
        role: 'cut',
      },
      {
        label: '复制',
        role: 'copy',
      },
      {
        label: '粘贴',
        role: 'paste',
      },
      {
        label: '删除',
        role: 'delete',
      },
      {
        label: '全选',
        role: 'selectall',
      },
    ],
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '关于',
        click() {},
      },
    ],
  },
];
if (__DEV__) {
  defaultMenu[0].submenu.push({
    label: '开发者工具',
    role: 'toggledevtools',
  });
}

if (process.platform === 'darwin') {
  defaultMenu.unshift({
    label: app.getName(),
    submenu: [
      {
        label: '退出',
        role: 'quit',
      },
    ],
  });
}
export const setMenu = (options = []) => {
  const menus = [...defaultMenu, ...options];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};
