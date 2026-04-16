import { vi } from 'vitest';

type IconProps = { size?: number; color?: string; className?: string };

const createMockIcon = (name: string) => {
  const MockIcon = ({ size, color, className }: IconProps) => (
    <svg data-testid={`icon-${name}`} data-size={size} data-color={color} className={className} />
  );
  MockIcon.displayName = name;
  return MockIcon;
};

const vscIcons = [
  'VscAccount',
  'VscAdd',
  'VscArchive',
  'VscBold',
  'VscBook',
  'VscDeviceCamera',
  'VscCheck',
  'VscChromeClose',
  'VscChromeMaximize',
  'VscChromeMinimize',
  'VscChromeRestore',
  'VscClippy',
  'VscClose',
  'VscCloud',
  'VscCode',
  'VscCopy',
  'VscDatabase',
  'VscDiscard',
  'VscEdit',
  'VscFile',
  'VscFileCode',
  'VscFileMedia',
  'VscFilePdf',
  'VscFiles',
  'VscFolder',
  'VscFolderOpened',
  'VscGame',
  'VscGear',
  'VscGitPullRequest',
  'VscGithub',
  'VscHeart',
  'VscHome',
  'VscHorizontalRule',
  'VscImages',
  'VscImport',
  'VscItalic',
  'VscJson',
  'VscLibrary',
  'VscListOrdered',
  'VscListUnordered',
  'VscLock',
  'VscMail',
  'VscMarkdown',
  'VscMusic',
  'VscNewFile',
  'VscNewFolder',
  'VscQuote',
  'VscRedo',
  'VscRemove',
  'VscSearch',
  'VscServer',
  'VscSettings',
  'VscSettingsGear',
  'VscStarFull',
  'VscSymbolClass',
  'VscSymbolMethod',
  'VscTerminal',
  'VscTrash',
];

const fcIcons = [
  'FcApproval',
  'FcBarChart',
  'FcBusinessContact',
  'FcCalendar',
  'FcCancel',
  'FcCheckmark',
  'FcCommandLine',
  'FcDataSheet',
  'FcDatabase',
  'FcDebian',
  'FcDeleteRow',
  'FcDocument',
  'FcDoNotInsert',
  'FcEditImage',
  'FcElectronics',
  'FcEngineering',
  'FcExtension',
  'FcFolder',
  'FcGamepad',
  'FcHome',
  'FcInfo',
  'FcList',
  'FcOpenedFolder',
  'FcPicture',
  'FcProcess',
  'FcReading',
  'FcSearch',
  'FcSettings',
  'FcSynchronize',
  'FcUpload',
  'FcVideoGame',
  'FcMinus',
];

const fiIcons = ['FiGithub', 'FiLinkedin', 'FiHome'];

vi.mock('react-icons/vsc', () => {
  const mocks: Record<string, ReturnType<typeof createMockIcon>> = {};
  vscIcons.forEach(name => {
    mocks[name] = createMockIcon(name);
  });
  return mocks;
});

vi.mock('react-icons/fc', () => {
  const mocks: Record<string, ReturnType<typeof createMockIcon>> = {};
  fcIcons.forEach(name => {
    mocks[name] = createMockIcon(name);
  });
  return mocks;
});

vi.mock('react-icons/fi', () => {
  const mocks: Record<string, ReturnType<typeof createMockIcon>> = {};
  fiIcons.forEach(name => {
    mocks[name] = createMockIcon(name);
  });
  return mocks;
});

vi.mock('react-icons/bi', () => ({
  BiStrikethrough: createMockIcon('BiStrikethrough'),
}));
