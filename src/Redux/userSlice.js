import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userId: null,
    userRole: null,
    officeId: null,
    userName: null,
    email: null,
    userTypeId: 0,
    officeName: null,
    allowedpages: [],
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
            state.userTypeId = action.payload;
        },
        setOfficeName: (state, action) => {
            state.officeName = action.payload;
        },
        setallowedpages: (state, action) => {
            state.allowedpages = action.payload;
        },
        clearUserData: (state) => {
            state.userId = null;
            state.userRole = null;
            state.officeId = null;
            state.userName = null;
            state.email = null;
            state.userTypeId = 0;
            state.officeName= null;
            state.allowedpages = [];
        },
    },
});

export const { setUserId, setUserRole, setOfficeId, setUserName, setEmail, setUserTypeId, setOfficeName, clearUserData, setallowedpages } = userSlice.actions;

export default userSlice.reducer;
