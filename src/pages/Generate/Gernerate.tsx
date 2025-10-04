import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { InputField } from "./components/InputField";
import TableIcon from '@assets/table.svg?react';

export const Generate = () => {
  const [open, _] = useState(true);
  return (
    <Dialog open={open} maxWidth="lg" fullWidth sx={{borderRadius: '12px'}}>
      <DialogTitle>Настройка генерации</DialogTitle>
      <DialogContent>
        <InputField label="Название таблицы" value="users"/>
        <InputField label="Название таблицы" value="users" inputIcon={<TableIcon/>}/>
        <InputField label="Название таблицы" value="users" labelIcon={<TableIcon/>}/>
        <InputField label="Название таблицы" value="users" labelIcon={<TableIcon/>} multiline/>
      </DialogContent>
    </Dialog>
  );
};
