import { apiSlice } from './baseApi';

export const tapeRollApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addTapeRoll: builder.mutation({
            query: ({ date, quantity, price, platform }) => ({
                url: "/taperoll/add-taproll",
                method: "POST",
                body: { date, quantity, price, platform },
            }),
        }),
        listTapeRolls: builder.query({
            query: () => ({
                url: "/taperoll/list-taprolls",
                method: "GET",
            }),
        }),
        updateTapeRoll: builder.mutation({
            query: ({ id, date, quantity, price, platform }) => ({
                url: `/taperoll/update-taproll/${id}`,
                method: "PUT",
                body: { date, quantity, price, platform },
            }),
        }),
        deleteTapeRoll: builder.mutation({
            query: (id) => ({
                url: `/taperoll/delete-taproll/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddTapeRollMutation,
    useListTapeRollsQuery,
    useUpdateTapeRollMutation,
    useDeleteTapeRollMutation,
} = tapeRollApiSlice;