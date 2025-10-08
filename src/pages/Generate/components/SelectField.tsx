import { FormControl, Select, MenuItem } from '@mui/material';
import React from 'react';

interface SelectFieldProps {
    label?: string;
    margin?: boolean;
    value: string;
    options: { value: string; label: string }[];
    onChange: (arg0: string) => void;
    labelIcon?: React.ReactNode;
}

export const SelectField = (props: SelectFieldProps) => {
    return (
        <div>
            {props.labelIcon ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '8px', alignItems: 'center', display: 'flex' }}>
                        {props.labelIcon}
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '10px 0' }}>
                        {props.label}
                    </p>
                </div>
            ) : props.label && (
                <h4 style={{ margin: '10px 0', fontSize: '15px', lineHeight: '18px' }}>
                    {props.label}
                </h4>
            )}
            <FormControl
                fullWidth
                variant="outlined"
                sx={{
                    background: '#F3F3F5',
                    borderRadius: '7px',
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #ccc',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid #ccc',
                    },
                }}
            >
                <Select
                    value={props.value}
                    onChange={(e) => props.onChange(e.target.value as string)}
                    displayEmpty
                    name='select'
                    sx={{
                        borderRadius: '7px',
                        fontSize: '14px',
                        color: 'black',
                        background: '#F3F3F5',
                        height: '32px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        '&:hover, &:focus': {
                            outline: 'none',
                            boxShadow: 'none',
                            background: '#F3F3F5',
                        },
                        '&.MuiList-root.MuiList-padding.MuiMenu-list': {
                            padding: '0',
                        }
                    }}
                    MenuProps={{
                        sx: {
                            '& .MuiList-root': {
                                paddingTop: 0,
                                paddingBottom: 0,
                            }
                        }
                    }}
                >
                    {props.options.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{height: '32px', fontSize: '14px', paddingLeft: '14px'}}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};