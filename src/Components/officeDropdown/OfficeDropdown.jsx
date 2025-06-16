import * as React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setOfficeId } from "../../Redux/userSlice.js";

const OfficeDropdown = () => {
    const dispatch = useDispatch();
    const officeId = useSelector((state) => state.user.officeId);
    const [selected, setSelected] = React.useState(officeId || '');

    return (
        <FormControl sx={{ m: 1, minWidth: 180 }} size="small" color="black" variant="outlined">
            <InputLabel id="demo-select-small-label">Select Office *</InputLabel>
            <Select
                className="custom-select"
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selected}
                label="Select Office *"
                onChange={(event) => {
                    setSelected(event.target.value);
                    dispatch(setOfficeId(event.target.value));
                }}
            >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
            </Select>
        </FormControl>
    );
};

export default OfficeDropdown;
