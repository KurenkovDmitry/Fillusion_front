import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export const Generate = () => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      //   fullScreen
      //   sx={{
      //     width: "1500px",
      //   }}
    >
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>Negr isasdas ready!</DialogContent>
    </Dialog>
  );
};
