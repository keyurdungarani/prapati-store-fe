import { apiSlice } from './baseApi';

export const returnOrderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addReturnOrder: builder.mutation({
            query: ({ date, product, qty, price, company, platforms, returnReason, returnBy }) => ({
                url: "/return-order/add-return-order",
                method: "POST",
                body: { date, product, qty, price, company, platforms, returnReason, returnBy },
            }),
        }),
        listReturnOrders: builder.query({
            query: ({ company, returnReason, returnBy, startDate, endDate } = {}) => ({
                url: "/return-order/list-return-orders",
                method: "GET",
                params: { company, returnReason, returnBy, startDate, endDate },
            }),
        }),
        updateReturnOrder: builder.mutation({
            query: ({ id, date, product, qty, price, company, platforms, returnReason, returnBy }) => ({
                url: `/return-order/update-return-order/${id}`,
                method: "PUT",
                body: { date, product, qty, price, company, platforms, returnReason, returnBy },
            }),
        }),
        deleteReturnOrder: builder.mutation({
            query: (id) => ({
                url: `/return-order/delete-return-order/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useAddReturnOrderMutation,
    useListReturnOrdersQuery,
    useUpdateReturnOrderMutation,
    useDeleteReturnOrderMutation,
} = returnOrderApiSlice;
