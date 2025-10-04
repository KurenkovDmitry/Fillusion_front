import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export const Generate = () => {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        <img  src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="Loading..." />
      </DialogContent>
    </Dialog>
  );
};
