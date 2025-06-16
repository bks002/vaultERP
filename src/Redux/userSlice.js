import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userId: null,
    userRole: null,
    officeId: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
        setOfficeId: (state, action) => {
            state.officeId = action.payload;
        },
        clearUserData: (state) => {
            state.userId = null;
            state.userRole = null;
            state.officeId = null;
        },
    },
});

export const { setUserId, setUserRole, setOfficeId, clearUserData } = userSlice.actions;

export default userSlice.reducer;
