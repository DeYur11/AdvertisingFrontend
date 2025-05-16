// src/services/api.js
import {
    ApolloClient,
    InMemoryCache,
    split,
    createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_API_URL || 'http://192.168.0.197:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    };
});

// 👇 WebSocket Link для підписок
const wsLink = new GraphQLWsLink(
    createClient({
        url: 'ws://192.168.0.197:8080/graphql',
        lazy: false,
        retryAttempts: 5,
        connectionParams: () => {
            const token = localStorage.getItem('token');
            return {
                ...(token && { Authorization: `Bearer ${token}` }),
            };
        },
    })
);

// 👇 Розділяємо — query/mutation через HTTP, subscription через WS
const splitLink = split(
    ({ query }) => {
        const def = getMainDefinition(query);
        return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    wsLink,
    authLink.concat(httpLink)
);

const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
});

export default client;
