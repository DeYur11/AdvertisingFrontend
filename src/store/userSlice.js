import { createSlice } from "@reduxjs/toolkit";

const savedUser = JSON.parse(localStorage.getItem("user"));

const initialState = savedUser || {
    username: "",
    name: "",
    surname: "",
    mainRole: "",
    isReviewer: false,
    workerId: null,
    token: ""
};




const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login(state, action) {
            state.username = action.payload.username;
            state.name = action.payload.name;
            state.surname = action.payload.surname;
            state.mainRole = action.payload.mainRole;
            state.isReviewer = action.payload.isReviewer;
            state.workerId = action.payload.workerId;
            state.token = action.payload.token;

            localStorage.setItem("user", JSON.stringify(state));
        },
        logout(state) {
            state.username = "";
            state.name = "";
            state.surname = "";
            state.mainRole = "";
            state.isReviewer = false;
            state.workerId = null;
            state.token = "";

            localStorage.removeItem("user");
        }
    }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
