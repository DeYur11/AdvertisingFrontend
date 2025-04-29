import { createSlice } from "@reduxjs/toolkit";

// Зчитуємо дані з localStorage при старті
const savedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
    name: "",
    surname: "",
    mainRole: "",
    isReviewer: false,
    workerId: 1
};


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login(state, action) {
            state.name = action.payload.name;
            state.surname = action.payload.surname;
            state.mainRole = action.payload.mainRole;

            if (action.payload.mainRole === "ProjectManager") {
                state.isReviewer = true;
            } else {
                state.isReviewer = action.payload.isReviewer || false;
            }

            localStorage.setItem("user", JSON.stringify(state));
        },
        logout(state) {
            state.name = "";
            state.surname = "";
            state.role = "";

            localStorage.removeItem("user");
        }
    }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
