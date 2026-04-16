import { type FC, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@mantine/core';
import type { WindowContentProps } from '@fde-desktop/fde-core';
import type { FileNode } from '@fde-desktop/fde-core';
import { useJsDos } from '@presentation/Hooks/useJsDos';
import { useFiIconElement } from '@fde-desktop/fde-core';
import { FilePickerModal } from '@fde-desktop/fde-core';
import { AppEmptyState } from '@fde-desktop/fde-core';
import { DOS_BUNDLE_MIME_TYPES, DOS_BUNDLE_EXTENSIONS } from '@/Shared/Interfaces/IDosEmulator';
import classes from './DosEmulatorApp.module.css';

const ACCEPTED_TYPES = [...DOS_BUNDLE_MIME_TYPES, ...DOS_BUNDLE_EXTENSIONS];

const ICON_PROPS = { size: 16, style: { display: 'block' } };

export interface DosEmulatorAutoLoad {
  url: string;
  name?: string;
}

const DosEmulatorApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const { t } = useTranslation('apps');
  const [pickerOpen, setPickerOpen] = useState(false);

  const autoLoad = win?.contentData?.autoLoad as DosEmulatorAutoLoad | undefined;

  const {
    containerRef,
    isRunning,
    isPaused,
    isMuted,
    volume,
    isLoading,
    error,
    bundleName,
    loadBundle,
    restart,
    pause,
    resume,
    mute,
    unmute,
    setVolume,
  } = useJsDos(autoLoad ? { autoLoad } : undefined);

  const PauseIcon = useFiIconElement('FiPause', ICON_PROPS);
  const PlayIcon = useFiIconElement('FiPlay', ICON_PROPS);
  const VolumeIcon = useFiIconElement('FiVolume', ICON_PROPS);
  const MutedIcon = useFiIconElement('FiVolumeX', ICON_PROPS);
  const FolderIcon = useFiIconElement('FiFolder', ICON_PROPS);
  const RestartIcon = useFiIconElement('FiRefreshCw', ICON_PROPS);

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      setPickerOpen: () => setPickerOpen(true),
      isRunning,
      isPaused,
      isMuted,
      volume,
      actions: { restart, pause, resume, mute, unmute, setVolume },
    });
  }, [
    win,
    notifyReady,
    isRunning,
    isPaused,
    isMuted,
    volume,
    restart,
    pause,
    resume,
    mute,
    unmute,
    setVolume,
  ]);

  const handleFileSelected = useCallback(
    async (node: FileNode) => {
      const url = node.url ?? node.name;
      const name = node.name;

      setPickerOpen(false);
      await loadBundle(url, name);
    },
    [loadBundle],
  );

  const showEmptyState = !isRunning && !isLoading && !error && !autoLoad;
  const showHeader = !autoLoad || isRunning || isLoading || !!error;

  return (
    <div className={classes.wrapper} data-windowid={win?.id} data-mantine-color-scheme="dark">
      {isLoading && <div className={classes.loading}>{t('dosEmulator.loading')}</div>}
      {error && <div className={classes.error}>{error}</div>}
      {showEmptyState && <AppEmptyState label={t('dosEmulator.noBundle')} />}
      {showHeader && (
        <div className={classes.header}>
          <span className={classes.bundleName}>
            {bundleName || (autoLoad?.name ?? 'DOS Emulator')}
          </span>
          {isPaused && <span className={classes.status}>[{t('dosEmulator.controls.pause')}]</span>}
          <div className={classes.controls}>
            {!autoLoad && (
              <button
                className={classes.controlBtn}
                onClick={() => setPickerOpen(true)}
                title={t('dosEmulator.menu.open')}
              >
                {FolderIcon}
              </button>
            )}
            {isRunning && (
              <button
                className={classes.controlBtn}
                onClick={restart}
                title={t('dosEmulator.menu.restart')}
              >
                {RestartIcon}
              </button>
            )}
            {isRunning && (
              <>
                <button
                  className={`${classes.controlBtn} ${isPaused ? classes.active : ''}`}
                  onClick={isPaused ? resume : pause}
                  title={
                    isPaused ? t('dosEmulator.controls.resume') : t('dosEmulator.controls.pause')
                  }
                >
                  {isPaused ? PlayIcon : PauseIcon}
                </button>
                <div className={classes.volumeContainer}>
                  <button
                    className={`${classes.controlBtn} ${isMuted ? classes.active : ''}`}
                    onClick={isMuted ? unmute : mute}
                    title={
                      isMuted ? t('dosEmulator.controls.unmute') : t('dosEmulator.controls.mute')
                    }
                  >
                    {isMuted ? MutedIcon : VolumeIcon}
                  </button>
                  {!isMuted && (
                    <Slider
                      className={classes.volumeSlider}
                      size="sm"
                      min={0}
                      max={100}
                      step={1}
                      value={volume * 100}
                      onChange={v => setVolume(v / 100)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* js-dos renders its own Preact app inside containerRef — keep it separate
          from React-managed children to avoid DOM reconciliation conflicts. */}
      <div ref={containerRef} className={classes.container} />
      {!autoLoad && (
        <FilePickerModal
          opened={pickerOpen}
          acceptedMimeTypes={ACCEPTED_TYPES}
          onConfirm={handleFileSelected}
          onCancel={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

export default DosEmulatorApp;
