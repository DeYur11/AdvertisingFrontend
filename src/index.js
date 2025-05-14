// src/index.js
import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ApolloProvider } from '@apollo/client';
import client from './services/api';
import reportWebVitals from './reportWebVitals';
import {ToastContainer} from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <ToastContainer position="top-right" autoClose={3000} />
        <Provider store={store}>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </Provider>
    </StrictMode>

);