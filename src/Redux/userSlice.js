import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userId: null,
    userRole: null,
    officeId: null,
    userName: null,
    email: null,
    userTypeId: 0,
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
        setUserName: (state, action) => {
            state.userName = action.payload;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        },
        setUserTypeId: (state, action) => {
            console.log("Setting userTypeId:", action.payload);
            state.userTypeId = action.payload;
        },
        clearUserData: (state) => {
            state.userId = null;
            state.userRole = null;
            state.officeId = null;
            state.userName = null;
            state.email = null;
            state.userTypeId = 0;
        },
    },
});

export const { setUserId, setUserRole, setOfficeId, setUserName, setEmail, setUserTypeId, clearUserData } = userSlice.actions;

export default userSlice.reducer;
