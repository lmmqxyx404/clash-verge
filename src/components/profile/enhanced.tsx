import useSWR from "swr";
import { useLockFn } from "ahooks";
import { Box, Grid, IconButton, Stack } from "@mui/material";
import { RestartAltRounded } from "@mui/icons-material";
import {
  getProfiles,
  deleteProfile,
  enhanceProfiles,
  changeProfileChain,
} from "../../services/cmds";
import { CmdType } from "../../services/types";
import Notice from "../base/base-notice";
import ProfileMore from "./profile-more";

interface Props {
  items: CmdType.ProfileItem[];
  chain: string[];
}

const EnhancedMode = (props: Props) => {
  const { items, chain } = props;

  const { mutate } = useSWR("getProfiles", getProfiles);

  // handler
  const onEnhance = useLockFn(async () => {
    try {
      await enhanceProfiles();
      Notice.success("Refresh clash config", 2000);
    } catch (err: any) {
      Notice.error(err.message || err.toString());
    }
  });

  const onEnhanceEnable = useLockFn(async (uid: string) => {
    if (chain.includes(uid)) return;

    const newChain = [...chain, uid];
    await changeProfileChain(newChain);
    mutate((conf = {}) => ({ ...conf, chain: newChain }), true);
  });

  const onEnhanceDisable = useLockFn(async (uid: string) => {
    if (!chain.includes(uid)) return;

    const newChain = chain.filter((i) => i !== uid);
    await changeProfileChain(newChain);
    mutate((conf = {}) => ({ ...conf, chain: newChain }), true);
  });

  const onEnhanceDelete = useLockFn(async (uid: string) => {
    try {
      await onEnhanceDisable(uid);
      await deleteProfile(uid);
      mutate();
    } catch (err: any) {
      Notice.error(err?.message || err.toString());
    }
  });

  const onMoveTop = useLockFn(async (uid: string) => {
    if (!chain.includes(uid)) return;

    const newChain = [uid].concat(chain.filter((i) => i !== uid));
    await changeProfileChain(newChain);
    mutate((conf = {}) => ({ ...conf, chain: newChain }), true);
  });

  const onMoveEnd = useLockFn(async (uid: string) => {
    if (!chain.includes(uid)) return;

    const newChain = chain.filter((i) => i !== uid).concat([uid]);
    await changeProfileChain(newChain);
    mutate((conf = {}) => ({ ...conf, chain: newChain }), true);
  });

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mb: 0.5 }}
      >
        <IconButton
          size="small"
          color="inherit"
          title="refresh enhanced profiles"
          onClick={onEnhance}
        >
          <RestartAltRounded />
        </IconButton>

        {/* <IconButton size="small" color="inherit">
          <MenuRounded />
        </IconButton> */}
      </Stack>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} key={item.file}>
            <ProfileMore
              selected={!!chain.includes(item.uid)}
              itemData={item}
              enableNum={chain.length}
              onEnable={() => onEnhanceEnable(item.uid)}
              onDisable={() => onEnhanceDisable(item.uid)}
              onDelete={() => onEnhanceDelete(item.uid)}
              onMoveTop={() => onMoveTop(item.uid)}
              onMoveEnd={() => onMoveEnd(item.uid)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EnhancedMode;
