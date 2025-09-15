import { apiSlice } from './baseApi';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: ({ name, email, password, mobile }) => ({
                url: "/auth/register",
                method: "POST",
                body: { name, email, password, mobile },
            }),
        }),

        loginUser: builder.mutation({
            query: ({ email, password }) => ({
                url: "/auth/login",
                method: "POST",
                body: { email, password },
            }),
        }),
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
} = authApiSlice;