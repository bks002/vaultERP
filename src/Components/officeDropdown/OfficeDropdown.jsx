import * as React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setOfficeId, setOfficeName } from "../../Redux/userSlice.js";
import { getAllOffices } from "../../Services/OfficeService.js";

const OfficeDropdown = () => {
    const dispatch = useDispatch();
    const officeId = useSelector((state) => state.user.officeId);
    const [selected, setSelected] = React.useState(officeId || '');
    const [offices, setOffices] = React.useState([]);
    React.useEffect(() => {
        const fetchData = async () => {
            const data = await getAllOffices();
            setOffices(data);
        };
        fetchData();
    }, [officeId]);


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
                    const selectedId = event.target.value;
                    setSelected(selectedId);
                    dispatch(setOfficeId(selectedId));
                    const selectedOffice = offices.find((office) => office.officeId === selectedId);
                    if (selectedOffice) {
                        dispatch(setOfficeName(selectedOffice.officeName));
                    }
                }}
            >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {offices && offices.map((office) => (
                    <MenuItem key={office.officeId} value={office.officeId}>
                        {office.officeName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default OfficeDropdown;
