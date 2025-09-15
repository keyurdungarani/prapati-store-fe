import { apiSlice } from './baseApi';

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addOrder: builder.mutation({
            query: ({ date, product, qty, price, company, platforms }) => ({
                url: "/order/add-order",
                method: "POST",
                body: { date, product, qty, price, company, platforms },
            }),
        }),
        listOrders: builder.query({
            query: () => ({
                url: "/order/list-orders",
                method: "GET",
            }),
        }),
        updateOrder: builder.mutation({
            query: ({ id, date, product, qty, price, company, platforms }) => ({
                url: `/order/update-order/${id}`,
                method: "PUT",
                body: { date, product, qty, price, company, platforms },
            }),
        }),
        deleteOrder: builder.mutation({
            query: (id) => ({
                url: `/order/delete-order/${id}`,
                method: "DELETE",
            }),
        }),
        listOrdersByCompany: builder.query({
            query: ({ startDate, endDate } = {}) => ({
                url: "/order/list-orders-by-company",
                method: "GET",
                params: { startDate, endDate },
            }),
        }),
    }),
});

export const {
    useAddOrderMutation,
    useListOrdersQuery,
    useListOrdersByCompanyQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
} = orderApiSlice;