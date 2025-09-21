import { apiSlice } from './baseApi';

export const kraftMailerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addKraftMailer: builder.mutation({
            query: ({ date, quantity, price, size }) => ({
                url: "/kraftmailer/add-kraftmailer",
                method: "POST",
                body: { date, quantity, price, size },
            }),
        }),
        listKraftMailers: builder.query({
            query: () => ({
                url: "/kraftmailer/list-kraftmailers",
                method: "GET",
            }),
        }),
        updateKraftMailer: builder.mutation({
            query: ({ id, date, quantity, price, size }) => ({
                url: `/kraftmailer/update-kraftmailer/${id}`,
                method: "PUT",
                body: { date, quantity, price, size },
            }),
        }),
        deleteKraftMailer: builder.mutation({
            query: (id) => ({
                url: `/kraftmailer/delete-kraftmailer/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddKraftMailerMutation,
    useListKraftMailersQuery,
    useUpdateKraftMailerMutation,
    useDeleteKraftMailerMutation,
} = kraftMailerApiSlice;