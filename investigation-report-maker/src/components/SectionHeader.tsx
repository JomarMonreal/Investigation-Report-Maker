import { Box, Divider, Typography } from "@mui/material";
import * as React from "react";
import css from "./CaseDetailsForm.module.css";

// ---------------------------------------------------------------------------
// Reusable section header
// ---------------------------------------------------------------------------

type SectionHeaderProps = {
  action?: React.ReactNode;
  title: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ action, title }) => (
  <Box className={css.sectionHeader}>
    <Box className={css.sectionHeaderTitle}>
      <Typography variant="h6">{title}</Typography>
      <Divider />
    </Box>
    {action && <Box className={css.sectionHeaderAction}>{action}</Box>}
  </Box>
);

export default SectionHeader;